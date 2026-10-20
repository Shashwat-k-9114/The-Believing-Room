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
import { PUBLICATION_STATES, STUDENT_STATUSES, ORDER_STATUSES, ORG_CATEGORIES, CONFIRMATION_STATES, LOGO_PERMISSIONS, SPONSOR_ENQUIRY_STATUSES } from "@/db/schema";
import { SEASON_PHASES } from "@/config/ecosystem";
import { industries } from "@/content/industries";

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

/* ------------------------ Ecosystem: organisations & contributions ------------------------ */

const LOGO_PATH = /^\/partners\/[\w.-]+\.(svg|png|webp)$/i;
const industryOrNull = (v: string | null) => (v && industries.some((i) => i.slug === v) ? v : null);

export async function saveOrganization(f: FormData) {
  await requireAdmin();
  const p = z
    .object({
      slug, name: z.string().trim().min(2).max(120), category: z.enum(ORG_CATEGORIES),
      confirmationStatus: z.enum(CONFIRMATION_STATES), logoPermission: z.enum(LOGO_PERMISSIONS), publication: z.enum(PUBLICATION_STATES),
    })
    .safeParse({ slug: str(f, "slug"), name: str(f, "name"), category: str(f, "category"), confirmationStatus: str(f, "confirmationStatus"), logoPermission: str(f, "logoPermission"), publication: str(f, "publication") });
  if (!p.success) return back("/admin?tab=ecosystem", p.error.issues[0].message);
  const website = opt(f, "websiteUrl");
  if (website && !/^https:\/\//.test(website)) return back("/admin?tab=ecosystem", "Website must start with https://");
  const logoPath = opt(f, "logoPath");
  if (logoPath && !LOGO_PATH.test(logoPath)) return back("/admin?tab=ecosystem", "Logo path must look like /partners/name.svg (svg, png or webp placed in public/partners)");
  if (p.data.logoPermission === "approved" && !logoPath) return back("/admin?tab=ecosystem", "Approved logo permission needs a logo path");
  const data = {
    ...p.data, role: opt(f, "role"), description: opt(f, "description"), websiteUrl: website, industry: industryOrNull(opt(f, "industry")),
    evidenceRef: opt(f, "evidenceRef"), announcementApproved: f.get("announcementApproved") === "on", logoPath,
    sortOrder: num(f, "sortOrder") ?? 100, updatedAt: new Date(),
  };
  const db = await getDb();
  await db.insert(schema.organizations).values(data).onConflictDoUpdate({ target: schema.organizations.slug, set: data });
  await audit("organization.save", "organization", data.slug, { publication: data.publication, announcementApproved: data.announcementApproved, logoPermission: data.logoPermission });
  revalidatePath("/", "layout");
  back("/admin?tab=ecosystem", data.publication === "published" && !data.announcementApproved ? "Saved. It will not appear publicly until announcement approval is ticked" : "Saved");
}

export async function deleteOrganization(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const db = await getDb();
  await db.delete(schema.organizations).where(eq(schema.organizations.id, id));
  await audit("organization.delete", "organization", id);
  revalidatePath("/", "layout");
  back("/admin?tab=ecosystem", "Removed");
}

export async function saveOpportunity(f: FormData) {
  await requireAdmin();
  const p = z.object({ organizationId: z.uuid(), roleTitle: z.string().trim().min(2).max(160), publication: z.enum(PUBLICATION_STATES) })
    .safeParse({ organizationId: str(f, "organizationId"), roleTitle: str(f, "roleTitle"), publication: str(f, "publication") });
  if (!p.success) return back("/admin?tab=ecosystem", p.error.issues[0].message);
  const mode = opt(f, "workMode");
  const data = {
    ...p.data, industry: industryOrNull(opt(f, "industry")), openings: num(f, "openings"), stipend: opt(f, "stipend"), location: opt(f, "location"),
    duration: opt(f, "duration"), workMode: mode && ["onsite", "remote", "hybrid"].includes(mode) ? mode : null,
    eligibility: opt(f, "eligibility"), selectionProcess: opt(f, "selectionProcess"), approvedByCompany: f.get("approvedByCompany") === "on",
  };
  const db = await getDb();
  await db.insert(schema.opportunities).values(data);
  await audit("opportunity.create", "opportunity", data.roleTitle, { publication: data.publication, approvedByCompany: data.approvedByCompany });
  revalidatePath("/partners");
  back("/admin?tab=ecosystem", "Role added. It is public only when published AND approved by the company");
}

export async function deleteOpportunity(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const db = await getDb();
  await db.delete(schema.opportunities).where(eq(schema.opportunities.id, id));
  await audit("opportunity.delete", "opportunity", id);
  revalidatePath("/partners");
  back("/admin?tab=ecosystem", "Removed");
}

export async function saveEducation(f: FormData) {
  await requireAdmin();
  const p = z.object({ id: z.uuid(), publication: z.enum(PUBLICATION_STATES) }).safeParse({ id: str(f, "id"), publication: str(f, "publication") });
  if (!p.success) return back("/admin?tab=ecosystem", p.error.issues[0].message);
  const data = {
    course: opt(f, "course"), eligibility: opt(f, "eligibility"), accessPeriod: opt(f, "accessPeriod"), certificateTerms: opt(f, "certificateTerms"),
    quantity: opt(f, "quantity"), termsConfirmed: f.get("termsConfirmed") === "on", publication: p.data.publication,
  };
  const db = await getDb();
  await db.update(schema.educationContributions).set(data).where(eq(schema.educationContributions.id, p.data.id));
  await audit("education.save", "education_contribution", p.data.id, { termsConfirmed: data.termsConfirmed });
  revalidatePath("/", "layout");
  back("/admin?tab=ecosystem", "Saved. Terms are public only when marked confirmed");
}

/* ------------------------------------ Sponsorship ----------------------------------- */

export async function savePackage(f: FormData) {
  await requireAdmin();
  const p = z.object({ slug, name: z.string().trim().min(2).max(120), summary: z.string().trim().min(10).max(600), publication: z.enum(PUBLICATION_STATES) })
    .safeParse({ slug: str(f, "slug"), name: str(f, "name"), summary: str(f, "summary"), publication: str(f, "publication") });
  if (!p.success) return back("/admin?tab=sponsors", p.error.issues[0].message);
  const data = {
    ...p.data, deliverables: str(f, "deliverables").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 12),
    publicPrice: opt(f, "publicPrice"), priceApproved: f.get("priceApproved") === "on", sortOrder: num(f, "sortOrder") ?? 100,
  };
  const db = await getDb();
  await db.insert(schema.sponsorshipPackages).values(data).onConflictDoUpdate({ target: schema.sponsorshipPackages.slug, set: data });
  await audit("package.save", "sponsorship_package", data.slug, { publication: data.publication, priceApproved: data.priceApproved });
  revalidatePath("/sponsors");
  back("/admin?tab=sponsors", "Saved. A price is public only when approved");
}

export async function setSponsorEnquiry(f: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(str(f, "id"));
  const status = z.enum(SPONSOR_ENQUIRY_STATUSES).parse(str(f, "status"));
  const db = await getDb();
  await db.update(schema.sponsorEnquiries).set({ status, internalNotes: opt(f, "internalNotes") }).where(eq(schema.sponsorEnquiries.id, id));
  await audit("sponsor_enquiry.update", "sponsor_enquiry", id, { status });
  back("/admin?tab=sponsors", "Enquiry updated");
}

/* ------------------------------------- Settings ------------------------------------- */

export async function saveSeason(f: FormData) {
  await requireAdmin();
  const phase = z.enum(SEASON_PHASES.map((p) => p.key) as [string, ...string[]]).parse(str(f, "phase"));
  const db = await getDb();
  await db.insert(schema.settings).values({ key: "season", value: { phase } }).onConflictDoUpdate({ target: schema.settings.key, set: { value: { phase }, updatedAt: new Date() } });
  // Internal-only planning note. Never rendered on public pages.
  const note = { window: str(f, "internalWindow").slice(0, 300) };
  await db.insert(schema.settings).values({ key: "internal.planning", value: note }).onConflictDoUpdate({ target: schema.settings.key, set: { value: note, updatedAt: new Date() } });
  await audit("season.save", "settings", "season", { phase });
  revalidatePath("/", "layout");
  back("/admin?tab=settings", "Saved");
}
