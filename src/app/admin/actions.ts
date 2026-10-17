"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { destroySession, requireAdmin } from "@/lib/admin-auth";
import { audit } from "@/lib/audit";
import { brand } from "@/config/site";
import { sendMail, shortlistedMail } from "@/lib/email";
import { storage } from "@/lib/storage";
import { PUBLICATION_STATES, STUDENT_STATUSES, ORDER_STATUSES } from "@/db/schema";

/**
 * Every action re-checks the admin session on the server. Hiding a button is never
 * the authorisation: a forged request without the signed cookie fails here.
 */

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: lowercase letters, numbers and hyphens");
const ist = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s ? new Date(`${s}:00+05:30`) : null;
};
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const num = (f: FormData, k: string) => (str(f, k) ? Number(str(f, k)) : null);
function back(path: string, msg?: string): never {
  redirect(msg ? `${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}` : path);
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

export async function setStudentStatus(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const status = z.enum(STUDENT_STATUSES).parse(str(f, "status"));
  const db = await getDb();
  await db.update(schema.studentApplications).set({ status }).where(eq(schema.studentApplications.id, id));
  await audit("student.status", "student_application", id, { status });
  if (status === "shortlisted") {
    const [a] = await db.select().from(schema.studentApplications).where(eq(schema.studentApplications.id, id));
    // Best effort; if email is not configured the organiser shares the private pay link shown in the admin.
    if (a?.payToken) await sendMail(shortlistedMail(a.fullName, a.ref, `${brand.url}/pay/${a.ref}?k=${a.payToken}`, a.email));
  }
  revalidatePath("/admin");
  back("/admin?tab=students", "Status updated");
}

/** Permanent erasure of an application and its résumé (data-subject request). */
export async function eraseStudent(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const db = await getDb();
  const [row] = await db.select().from(schema.studentApplications).where(eq(schema.studentApplications.id, id));
  if (row?.resumeKey) await storage.remove(row.resumeKey);
  await db.delete(schema.studentApplications).where(eq(schema.studentApplications.id, id));
  await audit("student.erase", "student_application", id, { ref: row?.ref });
  back("/admin?tab=students", "Application erased");
}

export async function setOrderStatus(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const status = z.enum(ORDER_STATUSES).parse(str(f, "status"));
  // Marking an order "paid" by hand would bypass payment verification, so it is not allowed here.
  if (status === "paid") back("/admin?tab=orders", "Orders become paid only through verified payment");
  const db = await getDb();
  await db.update(schema.audienceOrders).set({ status }).where(eq(schema.audienceOrders.id, id));
  await audit("order.status", "audience_order", id, { status });
  back("/admin?tab=orders", "Order updated");
}

export async function setEnquiryStatus(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const kind = z.enum(["company", "college"]).parse(str(f, "kind"));
  const status = z.enum(["new", "contacted", "in_progress", "closed"]).parse(str(f, "status"));
  const db = await getDb();
  const t = kind === "company" ? schema.companyEnquiries : schema.collegeEnquiries;
  await db.update(t).set({ status }).where(eq(t.id, id));
  await audit("enquiry.status", `${kind}_enquiry`, id, { status });
  back("/admin?tab=enquiries", "Enquiry updated");
}

const episodeSchema = z.object({
  slug,
  kind: z.enum(["episode", "podcast", "clip"]),
  title: z.string().trim().min(2).max(160),
  summary: z.string().trim().min(10).max(1200),
  publication: z.enum(PUBLICATION_STATES),
});

export async function saveEpisode(f: FormData) {
  await requireAdmin();
  const p = episodeSchema.safeParse({ slug: str(f, "slug"), kind: str(f, "kind"), title: str(f, "title"), summary: str(f, "summary"), publication: str(f, "publication") });
  if (!p.success) back("/admin?tab=episodes", p.error.issues[0].message);
  const yt = opt(f, "youtubeId");
  if (yt && !/^[\w-]{11}$/.test(yt)) back("/admin?tab=episodes", "YouTube ID must be the 11-character video id");
  const spotify = opt(f, "spotifyUrl");
  if (spotify && !/^https:\/\//.test(spotify)) back("/admin?tab=episodes", "Spotify link must start with https://");
  const data = {
    ...p.data,
    season: num(f, "season"), number: num(f, "number"), industry: opt(f, "industry"),
    durationSec: num(f, "durationSec"), releaseDate: ist(f.get("releaseDate")), publishAt: ist(f.get("publishAt")),
    youtubeId: yt, spotifyUrl: spotify, thumbnailUrl: null,
    tags: str(f, "tags").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12),
    guests: str(f, "guests").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12).map((l) => { const [name, role] = l.split("|").map((s) => s.trim()); return { name, role }; }),
    transcript: opt(f, "transcript"),
    updatedAt: new Date(),
  };
  if (data.publication === "scheduled" && !data.publishAt) back("/admin?tab=episodes", "Scheduled needs a publish date");
  const db = await getDb();
  await db.insert(schema.episodes).values(data).onConflictDoUpdate({ target: schema.episodes.slug, set: data });
  await audit("episode.save", "episode", data.slug, { publication: data.publication });
  revalidatePath("/episodes"); revalidatePath("/podcast"); revalidatePath("/the-show");
  back("/admin?tab=episodes", "Saved");
}

export async function setEpisodePublication(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const publication = z.enum(PUBLICATION_STATES).parse(str(f, "publication"));
  const db = await getDb();
  await db.update(schema.episodes).set({ publication, updatedAt: new Date() }).where(eq(schema.episodes.id, id));
  await audit("episode.publication", "episode", id, { publication });
  back("/admin?tab=episodes", "Publication updated");
}

const eventSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(160),
  status: z.enum(["draft", "announced", "registration_open", "registration_closed", "upcoming", "live", "completed", "cancelled"]),
});

export async function saveEvent(f: FormData) {
  await requireAdmin();
  const p = eventSchema.safeParse({ slug: str(f, "slug"), title: str(f, "title"), status: str(f, "status") });
  if (!p.success) return back("/admin?tab=events", p.error.issues[0].message);
  const mapUrl = opt(f, "mapUrl");
  if (mapUrl && !/^https:\/\//.test(mapUrl)) return back("/admin?tab=events", "Map link must start with https://");
  const data = {
    ...p.data, edition: opt(f, "edition"), summary: opt(f, "summary"),
    startsAt: ist(f.get("startsAt")), endsAt: ist(f.get("endsAt")),
    venueName: opt(f, "venueName"), venueAddress: opt(f, "venueAddress"), mapUrl,
    capacity: num(f, "capacity"), showCapacity: f.get("showCapacity") === "on",
    studentTicketsOpen: f.get("studentTicketsOpen") === "on", audienceTicketsOpen: f.get("audienceTicketsOpen") === "on",
    agenda: str(f, "agenda").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [time, ...t] = l.split("|"); return { time: time.trim(), title: t.join("|").trim() }; }),
    rules: str(f, "rules").split("\n").map((l) => l.trim()).filter(Boolean),
    updatedAt: new Date(),
  };
  const db = await getDb();
  await db.insert(schema.events).values(data).onConflictDoUpdate({ target: schema.events.slug, set: data });
  await audit("event.save", "event", data.slug, { status: data.status });
  revalidatePath("/events");
  back("/admin?tab=events", "Saved");
}

export async function savePerson(f: FormData) {
  await requireAdmin();
  const kind = z.enum(["panelist", "partner"]).parse(str(f, "kind"));
  const db = await getDb();
  if (kind === "panelist") {
    const d = z.object({ name: z.string().min(2).max(120), title: z.string().min(2).max(120), organization: z.string().min(2).max(120) }).parse({ name: str(f, "name"), title: str(f, "title"), organization: str(f, "organization") });
    await db.insert(schema.panelists).values({ ...d, industry: opt(f, "industry"), confirmed: f.get("confirmed") === "on", publication: z.enum(PUBLICATION_STATES).parse(str(f, "publication")) });
  } else {
    const d = z.object({ name: z.string().min(2).max(120) }).parse({ name: str(f, "name") });
    await db.insert(schema.partners).values({ ...d, industry: opt(f, "industry"), verified: f.get("verified") === "on", publication: z.enum(PUBLICATION_STATES).parse(str(f, "publication")) });
  }
  await audit(`${kind}.create`, kind, str(f, "name"));
  back("/admin?tab=people", "Saved");
}

export async function deletePerson(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const kind = z.enum(["panelist", "partner"]).parse(str(f, "kind"));
  const db = await getDb();
  if (kind === "panelist") await db.delete(schema.panelists).where(eq(schema.panelists.id, id));
  else await db.delete(schema.partners).where(eq(schema.partners.id, id));
  await audit(`${kind}.delete`, kind, id);
  back("/admin?tab=people", "Removed");
}
