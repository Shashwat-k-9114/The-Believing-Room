import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { CONFIRMATION_STATES, LOGO_PERMISSIONS, ORDER_STATUSES, ORG_CATEGORIES, PUBLICATION_STATES, SPONSOR_ENQUIRY_STATUSES, STUDENT_STATUSES } from "@/db/schema";
import { ORG_CATEGORY_META, SEASON_PHASES, phaseMeta } from "@/config/ecosystem";
import { seasonPhase } from "@/lib/queries";
import { industries } from "@/content/industries";
import { formatINR } from "@/config/site";
import { PageShell } from "@/components/layout/PageShell";
import { LoginForm } from "./LoginForm";
import * as A from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Organiser", robots: { index: false, follow: false } };

const TABS = [
  ["overview", "Overview"], ["students", "Applications"], ["orders", "Audience orders"], ["enquiries", "Enquiries"],
  ["ecosystem", "Organisations"], ["sponsors", "Sponsorship"], ["events", "Events"], ["episodes", "Media"], ["people", "Panelists"], ["settings", "Season & settings"], ["audit", "Audit log"],
] as const;

const fmt = (d?: Date | null) => (d ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(d) : "—");
const ISTinput = (d?: Date | null) => (d ? new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 16) : "");

function StatusSelect({ action, id, value, options, extra }: { action: (f: FormData) => Promise<void>; id: string; value: string; options: readonly string[]; extra?: Record<string, string> }) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <select name="status" defaultValue={value} className="input !min-h-9 !py-1 text-sm" aria-label="Status">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <button className="rounded-full border border-[var(--line)] px-3 py-1 text-sm hover:bg-black/5">Save</button>
    </form>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => <th scope="col" className="px-3 py-2 text-left font-medium text-[var(--fg-faint)]">{children}</th>;
const Td = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => <td className={`px-3 py-3 align-top ${className}`}>{children}</td>;
const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-2xl border border-[var(--line)]"><table className="w-full min-w-[720px] text-sm"><thead className="bg-black/[0.03]"><tr>{head.map((h) => <Th key={h}>{h}</Th>)}</tr></thead><tbody className="divide-y divide-[var(--line)]">{children}</tbody></table></div>
);

export default async function Admin({ searchParams }: { searchParams: Promise<{ tab?: string; msg?: string }> }) {
  const { tab = "overview", msg } = await searchParams;

  if (!adminConfigured())
    return <PageShell eyebrow="Organiser" title="Admin isn’t configured." lede="Set ADMIN_PASSWORD (12+ characters) and SESSION_SECRET (32+ characters) in the server environment. There is no default account and no public sign-up." />;
  if (!(await isAdmin()))
    return (
      <PageShell eyebrow="Organiser" title={<>Sign <em>in.</em></>} lede="Restricted to event organisers.">
        <div className="glass glass-frost max-w-md p-8 [--r:1.6rem]"><LoginForm /></div>
      </PageShell>
    );

  const db = await getDb();
  const s = schema;
  const renderBody = async () => {
    if (tab === "students") {
      const rows = await db.select().from(s.studentApplications).orderBy(desc(s.studentApplications.createdAt)).limit(300);
      return (
        <Table head={["Ref / applicant", "Study", "Discipline & pitch", "Consents", "Status", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td><p className="mono">{r.ref}</p><p className="font-medium">{r.fullName}</p><p className="text-[var(--fg-faint)]">{r.email}<br />{r.phone}</p><p className="text-[var(--fg-faint)]">{fmt(r.createdAt)}</p></Td>
              <Td>{r.college}<br />{r.course} · {r.gradYear}</Td>
              <Td className="max-w-md"><p className="font-medium">{industries.find((i) => i.slug === r.industry)?.short}</p><p className="text-[var(--fg-faint)]">{r.skills}</p><p className="mt-1">{r.pitchSummary}</p>
                <p className="mt-1 flex flex-wrap gap-3">{[r.portfolioUrl, r.githubUrl, r.linkedinUrl].filter(Boolean).map((u) => <a key={u} className="underline" href={u!} target="_blank" rel="noopener noreferrer nofollow">{new URL(u!).hostname}</a>)}{r.resumeKey && <a className="underline" href={`/api/admin/resume/${r.id}`}>Résumé (PDF)</a>}</p></Td>
              <Td className="text-xs">{[["Record", r.consentFilming], ["Publish pitch", r.consentPublishPitch], ["Name+college", r.consentShowNameCollege], ["Promo clips", r.consentPromoClips]].map(([k, v]) => <p key={String(k)}>{v ? "✓" : "✗"} {k}</p>)}</Td>
              <Td><StatusSelect action={A.setStudentStatus} id={r.id} value={r.status} options={STUDENT_STATUSES} />{r.status === "shortlisted" && r.payToken && <p className="mt-2 text-xs"><a className="underline" href={`/pay/${r.ref}?k=${r.payToken}`}>Candidate payment link</a><br /><span className="text-[var(--fg-faint)]">Private. Share only with this candidate.</span></p>}</Td>
              <Td><form action={A.eraseStudent}><input type="hidden" name="id" value={r.id} /><button className="text-sm text-red-700 underline">Erase</button></form></Td>
            </tr>
          ))}
          {rows.length === 0 && <tr><Td>No applications yet.</Td><Td /><Td /><Td /><Td /><Td /></tr>}
        </Table>
      );
    }
    if (tab === "orders") {
      const rows = await db.select().from(s.audienceOrders).orderBy(desc(s.audienceOrders.createdAt)).limit(300);
      return (
        <Table head={["Order", "Buyer", "Qty / total", "Status", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td><p className="mono">{r.ref}</p><p className="text-[var(--fg-faint)]">{fmt(r.createdAt)}</p></Td>
              <Td>{r.name}<br /><span className="text-[var(--fg-faint)]">{r.email} · {r.phone}</span></Td>
              <Td>{r.quantity} × {formatINR(r.unitAmount)} = <strong>{formatINR(r.totalAmount)}</strong></Td>
              <Td><span className="mono">{r.status}</span>{r.paidAt && <p className="text-[var(--fg-faint)]">{fmt(r.paidAt)}</p>}</Td>
              <Td>{r.status !== "paid" && <StatusSelect action={A.setOrderStatus} id={r.id} value={r.status} options={ORDER_STATUSES.filter((o) => o !== "paid")} />}</Td>
            </tr>
          ))}
          {rows.length === 0 && <tr><Td>No orders yet.</Td><Td /><Td /><Td /><Td /></tr>}
        </Table>
      );
    }
    if (tab === "enquiries") {
      const [co, col, msgs, wl] = await Promise.all([
        db.select().from(s.companyEnquiries).orderBy(desc(s.companyEnquiries.createdAt)).limit(100),
        db.select().from(s.collegeEnquiries).orderBy(desc(s.collegeEnquiries.createdAt)).limit(100),
        db.select().from(s.contactMessages).orderBy(desc(s.contactMessages.createdAt)).limit(100),
        db.select().from(s.waitlist).orderBy(desc(s.waitlist.createdAt)).limit(200),
      ]);
      const ENQ = ["new", "contacted", "in_progress", "closed"] as const;
      return (
        <div className="grid gap-12">
          <section><h2 className="display mb-4 text-3xl">Companies ({co.length})</h2>
            <Table head={["Ref", "Organisation", "Hiring", "Status"]}>{co.map((r) => <tr key={r.id}><Td><span className="mono">{r.ref}</span><br />{fmt(r.createdAt)}</Td><Td><b>{r.organization}</b><br />{r.contactName}, {r.role}<br />{r.email}</Td><Td>{industries.find((i) => i.slug === r.industry)?.short} · {r.mode}<br />{r.functions}<br />{r.openings ?? "?"} openings · {r.compensation ?? "stipend n/a"}<br />{r.interests.join(", ")}<br />{r.message}</Td><Td><StatusSelect action={A.setEnquiryStatus} id={r.id} value={r.status} options={ENQ} extra={{ kind: "company" }} /></Td></tr>)}</Table></section>
          <section><h2 className="display mb-4 text-3xl">Colleges ({col.length})</h2>
            <Table head={["Ref", "Institution", "Interest", "Status"]}>{col.map((r) => <tr key={r.id}><Td><span className="mono">{r.ref}</span><br />{fmt(r.createdAt)}</Td><Td><b>{r.institution}</b>, {r.city}<br />{r.contactName}, {r.role}<br />{r.email} {r.phone}</Td><Td>{r.studentCount ?? "?"} students<br />{r.interests.join(", ")}<br />{r.message}</Td><Td><StatusSelect action={A.setEnquiryStatus} id={r.id} value={r.status} options={ENQ} extra={{ kind: "college" }} /></Td></tr>)}</Table></section>
          <section><h2 className="display mb-4 text-3xl">Contact messages ({msgs.length})</h2>
            <Table head={["When", "From", "Topic", "Message"]}>{msgs.map((r) => <tr key={r.id}><Td>{fmt(r.createdAt)}</Td><Td>{r.name}<br />{r.email}</Td><Td>{r.topic}</Td><Td className="max-w-lg whitespace-pre-wrap">{r.message}</Td></tr>)}</Table></section>
          <section><h2 className="display mb-4 text-3xl">Waitlists ({wl.length})</h2>
            <Table head={["When", "List", "Email"]}>{wl.map((r) => <tr key={r.id}><Td>{fmt(r.createdAt)}</Td><Td>{r.kind}</Td><Td>{r.email}</Td></tr>)}</Table></section>
        </div>
      );
    }
    if (tab === "events") {
      const rows = await db.select().from(s.events).orderBy(desc(s.events.createdAt));
      const EV = ["draft", "announced", "registration_open", "registration_closed", "upcoming", "live", "completed", "cancelled"];
      const ev = (r?: (typeof rows)[number]) => (
        <form action={A.saveEvent} className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Title</span><input className="input" name="title" required defaultValue={r?.title} /></label>
          <label className="field"><span className="label">Slug</span><input className="input" name="slug" required defaultValue={r?.slug} readOnly={!!r} /></label>
          <label className="field"><span className="label">Edition</span><input className="input" name="edition" defaultValue={r?.edition ?? ""} /></label>
          <label className="field"><span className="label">Status</span><select className="input" name="status" defaultValue={r?.status ?? "draft"}>{EV.map((o) => <option key={o}>{o}</option>)}</select></label>
          <label className="field"><span className="label">Starts (IST)</span><input className="input" type="datetime-local" name="startsAt" defaultValue={ISTinput(r?.startsAt)} /></label>
          <label className="field"><span className="label">Ends (IST)</span><input className="input" type="datetime-local" name="endsAt" defaultValue={ISTinput(r?.endsAt)} /></label>
          <label className="field"><span className="label">Venue</span><input className="input" name="venueName" defaultValue={r?.venueName ?? ""} /></label>
          <label className="field"><span className="label">Address</span><input className="input" name="venueAddress" defaultValue={r?.venueAddress ?? ""} /></label>
          <label className="field"><span className="label">Map link (https)</span><input className="input" name="mapUrl" defaultValue={r?.mapUrl ?? ""} /></label>
          <label className="field"><span className="label">Capacity</span><input className="input" type="number" name="capacity" defaultValue={r?.capacity ?? ""} /></label>
          <label className="field sm:col-span-2"><span className="label">Summary</span><textarea className="input" name="summary" defaultValue={r?.summary ?? ""} /></label>
          <label className="field"><span className="label">Agenda (one per line: 10:00 AM | Title)</span><textarea className="input" name="agenda" defaultValue={(r?.agenda ?? []).map((a) => `${a.time} | ${a.title}`).join("\n")} /></label>
          <label className="field"><span className="label">Rules (one per line)</span><textarea className="input" name="rules" defaultValue={(r?.rules ?? []).join("\n")} /></label>
          <div className="flex flex-wrap gap-5 sm:col-span-2">
            <label className="check"><input type="checkbox" name="showCapacity" defaultChecked={r?.showCapacity} /> Show capacity publicly</label>
            <label className="check"><input type="checkbox" name="studentTicketsOpen" defaultChecked={r?.studentTicketsOpen} /> Candidate tickets open</label>
            <label className="check"><input type="checkbox" name="audienceTicketsOpen" defaultChecked={r?.audienceTicketsOpen} /> Audience tickets open</label>
          </div>
          <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">{r ? "Update event" : "Create event"}</button></div>
        </form>
      );
      return (
        <div className="grid gap-10">
          {rows.map((r) => <details key={r.id} className="rounded-2xl border border-[var(--line)] p-5"><summary className="cursor-pointer text-lg font-medium">{r.title} <span className="mono ml-2 text-[var(--fg-faint)]">{r.status}</span></summary><div className="mt-5">{ev(r)}</div></details>)}
          <div className="rounded-2xl border border-[var(--line)] p-5"><h2 className="display mb-4 text-3xl">New event</h2>{ev()}</div>
        </div>
      );
    }
    if (tab === "episodes") {
      const rows = await db.select().from(s.episodes).orderBy(desc(s.episodes.createdAt));
      return (
        <div className="grid gap-10">
          <Table head={["Title", "Kind", "Industry", "Publication", ""]}>
            {rows.map((r) => <tr key={r.id}><Td><b>{r.title}</b><br /><span className="mono">{r.slug}</span></Td><Td>{r.kind}{r.season ? ` S${r.season}E${r.number}` : ""}</Td><Td>{r.industry ?? "—"}</Td><Td><StatusSelect action={A.setEpisodePublication} id={r.id} value={r.publication} options={PUBLICATION_STATES} /> {r.publishAt && <span className="text-xs">{fmt(r.publishAt)}</span>}</Td><Td>{r.publication === "published" && <Link className="underline" href={`/episodes/${r.slug}`}>View</Link>}</Td></tr>)}
            {rows.length === 0 && <tr><Td>No media yet.</Td><Td /><Td /><Td /><Td /></tr>}
          </Table>
          <form action={A.saveEpisode} className="grid gap-3 rounded-2xl border border-[var(--line)] p-5 sm:grid-cols-2">
            <h2 className="display text-3xl sm:col-span-2">Add or update media (matched by slug)</h2>
            <label className="field"><span className="label">Title</span><input className="input" name="title" required /></label>
            <label className="field"><span className="label">Slug</span><input className="input" name="slug" required placeholder="s1e1-opening-night" /></label>
            <label className="field"><span className="label">Kind</span><select className="input" name="kind"><option>episode</option><option>podcast</option><option>clip</option></select></label>
            <label className="field"><span className="label">Publication</span><select className="input" name="publication">{PUBLICATION_STATES.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="field sm:col-span-2"><span className="label">Summary</span><textarea className="input" name="summary" required /></label>
            <label className="field"><span className="label">YouTube video ID (11 chars)</span><input className="input" name="youtubeId" /></label>
            <label className="field"><span className="label">Spotify URL (https)</span><input className="input" name="spotifyUrl" /></label>
            <label className="field"><span className="label">Industry</span><select className="input" name="industry" defaultValue=""><option value="">—</option>{industries.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
            <label className="field"><span className="label">Duration (seconds)</span><input className="input" type="number" name="durationSec" /></label>
            <label className="field"><span className="label">Season</span><input className="input" type="number" name="season" /></label>
            <label className="field"><span className="label">Episode number</span><input className="input" type="number" name="number" /></label>
            <label className="field"><span className="label">Release date (IST)</span><input className="input" type="datetime-local" name="releaseDate" /></label>
            <label className="field"><span className="label">Publish at (for scheduled)</span><input className="input" type="datetime-local" name="publishAt" /></label>
            <label className="field sm:col-span-2"><span className="label">Tags (comma-separated)</span><input className="input" name="tags" /></label>
            <label className="field sm:col-span-2"><span className="label">Guests, only people who consented (one per line: Name | Role)</span><textarea className="input" name="guests" /></label>
            <label className="field sm:col-span-2"><span className="label">Transcript</span><textarea className="input" name="transcript" /></label>
            <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">Save</button></div>
          </form>
        </div>
      );
    }
    if (tab === "people") {
      const pn = await db.select().from(s.panelists);
      return (
        <section className="max-w-3xl"><h2 className="display mb-4 text-3xl">Panelists</h2>
          <ul className="mb-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">{pn.map((p) => <li key={p.id} className="flex items-center justify-between py-3"><span>{p.name}, {p.title} · {p.organization} <span className="mono ml-2">{p.confirmed ? "confirmed" : "unconfirmed"} · {p.publication}</span></span><form action={A.deletePerson}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="kind" value="panelist" /><button className="text-sm text-red-700 underline">Remove</button></form></li>)}{pn.length === 0 && <li className="py-3">None.</li>}</ul>
          <form action={A.savePerson} className="grid gap-3 rounded-2xl border border-[var(--line)] p-5 sm:grid-cols-2">
            <input type="hidden" name="kind" value="panelist" />
            <label className="field"><span className="label">Name</span><input className="input" name="name" required /></label>
            <label className="field"><span className="label">Title</span><input className="input" name="title" required /></label>
            <label className="field"><span className="label">Organisation</span><input className="input" name="organization" required /></label>
            <label className="field"><span className="label">Industry</span><select className="input" name="industry" defaultValue=""><option value="">—</option>{industries.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
            <label className="field"><span className="label">Publication</span><select className="input" name="publication">{PUBLICATION_STATES.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="check sm:col-span-2"><input type="checkbox" name="confirmed" /> Written confirmation received (required before it can appear publicly)</label>
            <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">Add panelist</button></div>
          </form>
        </section>
      );
    }
    if (tab === "ecosystem") {
      const [orgs, roles, edu] = await Promise.all([
        db.select().from(s.organizations).orderBy(s.organizations.category, s.organizations.sortOrder),
        db.select({ r: s.opportunities, org: s.organizations.name }).from(s.opportunities).innerJoin(s.organizations, eq(s.opportunities.organizationId, s.organizations.id)),
        db.select({ e: s.educationContributions, org: s.organizations.name }).from(s.educationContributions).innerJoin(s.organizations, eq(s.educationContributions.organizationId, s.organizations.id)),
      ]);
      const orgForm = (o?: (typeof orgs)[number]) => (
        <form action={A.saveOrganization} className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input className="input" name="name" required defaultValue={o?.name} /></label>
          <label className="field"><span className="label">Slug</span><input className="input" name="slug" required defaultValue={o?.slug} readOnly={!!o} /></label>
          <label className="field"><span className="label">Category</span><select className="input" name="category" defaultValue={o?.category ?? "recruitment"}>{ORG_CATEGORIES.map((c) => <option key={c} value={c}>{ORG_CATEGORY_META[c].label}</option>)}</select></label>
          <label className="field"><span className="label">Internship category (recruiters)</span><select className="input" name="industry" defaultValue={o?.industry ?? ""}><option value="">—</option>{industries.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
          <label className="field sm:col-span-2"><span className="label">Role: their confirmed contribution, in plain words (public)</span><input className="input" name="role" defaultValue={o?.role ?? ""} /></label>
          <label className="field sm:col-span-2"><span className="label">Short factual description (public; leave blank if unknown)</span><textarea className="input" name="description" defaultValue={o?.description ?? ""} /></label>
          <label className="field"><span className="label">Official website (https)</span><input className="input" name="websiteUrl" defaultValue={o?.websiteUrl ?? ""} /></label>
          <label className="field"><span className="label">Sort order</span><input className="input" type="number" name="sortOrder" defaultValue={o?.sortOrder ?? 100} /></label>
          <label className="field"><span className="label">Confirmation status</span><select className="input" name="confirmationStatus" defaultValue={o?.confirmationStatus ?? "pending"}>{CONFIRMATION_STATES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field"><span className="label">Evidence reference (internal, never public)</span><input className="input" name="evidenceRef" defaultValue={o?.evidenceRef ?? ""} /></label>
          <label className="field"><span className="label">Logo file (in public/partners, e.g. /partners/name.svg)</span><input className="input" name="logoPath" defaultValue={o?.logoPath ?? ""} /></label>
          <label className="field"><span className="label">Logo usage permission</span><select className="input" name="logoPermission" defaultValue={o?.logoPermission ?? "none"}>{LOGO_PERMISSIONS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="field"><span className="label">Publication</span><select className="input" name="publication" defaultValue={o?.publication ?? "draft"}>{PUBLICATION_STATES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="check"><input type="checkbox" name="announcementApproved" defaultChecked={o?.announcementApproved} /> The organisation has approved being named publicly</label>
          <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">{o ? "Update organisation" : "Add organisation"}</button></div>
        </form>
      );
      return (
        <div className="grid gap-12">
          <p className="max-w-[72ch] text-sm text-[var(--fg-dim)]">An organisation appears publicly only when it is <b>published</b> AND its <b>announcement is approved</b>. Its logo appears only when logo permission is <b>approved</b> and a file exists; otherwise its name is set in type.</p>
          <section><h2 className="display mb-4 text-3xl">Organisations ({orgs.length})</h2>
            <div className="grid gap-4">
              {orgs.map((o) => (
                <details key={o.id} className="rounded-2xl border border-[var(--line)] p-5">
                  <summary className="cursor-pointer text-lg font-medium">{o.name} <span className="mono ml-2 text-[var(--fg-faint)]">{o.category} · {o.publication}{o.announcementApproved ? "" : " · not approved to name"} · logo {o.logoPermission}</span></summary>
                  <div className="mt-5">{orgForm(o)}
                    <form action={A.deleteOrganization} className="mt-3"><input type="hidden" name="id" value={o.id} /><button className="text-sm text-red-700 underline">Remove organisation (and its roles)</button></form>
                  </div>
                </details>
              ))}
              <div className="rounded-2xl border border-[var(--line)] p-5"><h3 className="display mb-4 text-2xl">Add organisation</h3>{orgForm()}</div>
            </div>
          </section>
          <section><h2 className="display mb-4 text-3xl">Internship roles ({roles.length})</h2>
            <p className="mb-4 max-w-[72ch] text-sm text-[var(--fg-dim)]">Never entered on a company&rsquo;s behalf. A role is public only when published AND ticked as approved by the company.</p>
            <Table head={["Company", "Role", "Details", "State", ""]}>
              {roles.map(({ r, org }) => <tr key={r.id}><Td>{org}</Td><Td><b>{r.roleTitle}</b></Td><Td className="text-xs">{[r.industry, r.openings != null ? `${r.openings} openings` : null, r.stipend, r.duration, r.location, r.workMode].filter(Boolean).join(" · ") || "No details yet"}</Td><Td><span className="mono">{r.publication}{r.approvedByCompany ? " · approved" : " · not approved"}</span></Td><Td><form action={A.deleteOpportunity}><input type="hidden" name="id" value={r.id} /><button className="text-sm text-red-700 underline">Remove</button></form></Td></tr>)}
              {roles.length === 0 && <tr><Td>No roles yet.</Td><Td /><Td /><Td /><Td /></tr>}
            </Table>
            <form action={A.saveOpportunity} className="mt-6 grid gap-3 rounded-2xl border border-[var(--line)] p-5 sm:grid-cols-2">
              <h3 className="display text-2xl sm:col-span-2">Add a role</h3>
              <label className="field"><span className="label">Company</span><select className="input" name="organizationId" required defaultValue="">{[<option key="" value="" disabled>Choose…</option>, ...orgs.filter((o) => o.category === "recruitment").map((o) => <option key={o.id} value={o.id}>{o.name}</option>)]}</select></label>
              <label className="field"><span className="label">Role title</span><input className="input" name="roleTitle" required /></label>
              <label className="field"><span className="label">Industry</span><select className="input" name="industry" defaultValue=""><option value="">—</option>{industries.map((i) => <option key={i.slug} value={i.slug}>{i.name}</option>)}</select></label>
              <label className="field"><span className="label">Openings</span><input className="input" type="number" name="openings" /></label>
              <label className="field"><span className="label">Stipend</span><input className="input" name="stipend" /></label>
              <label className="field"><span className="label">Duration</span><input className="input" name="duration" /></label>
              <label className="field"><span className="label">Location</span><input className="input" name="location" /></label>
              <label className="field"><span className="label">Work mode</span><select className="input" name="workMode" defaultValue=""><option value="">—</option><option value="onsite">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select></label>
              <label className="field sm:col-span-2"><span className="label">Eligibility</span><input className="input" name="eligibility" /></label>
              <label className="field sm:col-span-2"><span className="label">Selection process</span><input className="input" name="selectionProcess" /></label>
              <label className="field"><span className="label">Publication</span><select className="input" name="publication">{PUBLICATION_STATES.map((o) => <option key={o}>{o}</option>)}</select></label>
              <label className="check"><input type="checkbox" name="approvedByCompany" /> The company has approved publishing these details</label>
              <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">Add role</button></div>
            </form>
          </section>
          <section><h2 className="display mb-4 text-3xl">Educational contributions ({edu.length})</h2>
            <p className="mb-4 max-w-[72ch] text-sm text-[var(--fg-dim)]">Course details are hidden publicly until you tick <b>Terms confirmed</b>. Until then the site says the details are to be published.</p>
            <div className="grid gap-4">
              {edu.map(({ e, org }) => (
                <form key={e.id} action={A.saveEducation} className="grid gap-3 rounded-2xl border border-[var(--line)] p-5 sm:grid-cols-2">
                  <input type="hidden" name="id" value={e.id} />
                  <h3 className="display text-2xl sm:col-span-2">{org}</h3>
                  <label className="field"><span className="label">Course</span><input className="input" name="course" defaultValue={e.course ?? ""} /></label>
                  <label className="field"><span className="label">Eligibility</span><input className="input" name="eligibility" defaultValue={e.eligibility ?? ""} /></label>
                  <label className="field"><span className="label">Access period</span><input className="input" name="accessPeriod" defaultValue={e.accessPeriod ?? ""} /></label>
                  <label className="field"><span className="label">Certificate terms</span><input className="input" name="certificateTerms" defaultValue={e.certificateTerms ?? ""} /></label>
                  <label className="field"><span className="label">Quantity / places</span><input className="input" name="quantity" defaultValue={e.quantity ?? ""} /></label>
                  <label className="field"><span className="label">Publication</span><select className="input" name="publication" defaultValue={e.publication}>{PUBLICATION_STATES.map((o) => <option key={o}>{o}</option>)}</select></label>
                  <label className="check sm:col-span-2"><input type="checkbox" name="termsConfirmed" defaultChecked={e.termsConfirmed} /> Terms confirmed with the provider (shows the details publicly)</label>
                  <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">Save</button></div>
                </form>
              ))}
            </div>
          </section>
        </div>
      );
    }
    if (tab === "sponsors") {
      const [pk, enq] = await Promise.all([
        db.select().from(s.sponsorshipPackages).orderBy(s.sponsorshipPackages.sortOrder),
        db.select().from(s.sponsorEnquiries).orderBy(desc(s.sponsorEnquiries.createdAt)).limit(200),
      ]);
      const pkForm = (r?: (typeof pk)[number]) => (
        <form action={A.savePackage} className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span className="label">Name</span><input className="input" name="name" required defaultValue={r?.name} /></label>
          <label className="field"><span className="label">Slug</span><input className="input" name="slug" required defaultValue={r?.slug} readOnly={!!r} /></label>
          <label className="field sm:col-span-2"><span className="label">Summary</span><textarea className="input" name="summary" required defaultValue={r?.summary} /></label>
          <label className="field sm:col-span-2"><span className="label">Proposed deliverables (one per line)</span><textarea className="input" name="deliverables" defaultValue={(r?.deliverables ?? []).join("\n")} /></label>
          <label className="field"><span className="label">Public price text (only shown if approved)</span><input className="input" name="publicPrice" defaultValue={r?.publicPrice ?? ""} /></label>
          <label className="field"><span className="label">Sort order</span><input className="input" type="number" name="sortOrder" defaultValue={r?.sortOrder ?? 100} /></label>
          <label className="field"><span className="label">Publication</span><select className="input" name="publication" defaultValue={r?.publication ?? "draft"}>{PUBLICATION_STATES.map((o) => <option key={o}>{o}</option>)}</select></label>
          <label className="check"><input type="checkbox" name="priceApproved" defaultChecked={r?.priceApproved} /> Price approved for public display</label>
          <div className="sm:col-span-2"><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">{r ? "Update" : "Add package"}</button></div>
        </form>
      );
      return (
        <div className="grid gap-12">
          <section><h2 className="display mb-4 text-3xl">Partnership enquiries ({enq.length})</h2>
            <Table head={["Ref", "Organisation", "Interest", "Status / notes"]}>
              {enq.map((r) => (
                <tr key={r.id}>
                  <Td><span className="mono">{r.ref}</span><br />{fmt(r.createdAt)}</Td>
                  <Td><b>{r.organization}</b><br />{r.contactName}, {r.role}<br />{r.email}{r.phone ? ` · ${r.phone}` : ""}</Td>
                  <Td className="max-w-md">{r.interest} · {r.category}<br />Budget: {r.budgetRange ?? "not given"}<br /><span className="whitespace-pre-wrap">{r.message}</span></Td>
                  <Td>
                    <form action={A.setSponsorEnquiry} className="grid gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} className="input !min-h-9 !py-1 text-sm" aria-label="Status">{SPONSOR_ENQUIRY_STATUSES.map((o) => <option key={o}>{o}</option>)}</select>
                      <textarea name="internalNotes" defaultValue={r.internalNotes ?? ""} placeholder="Internal notes" className="input !min-h-16 text-sm" aria-label="Internal notes" />
                      <button className="justify-self-start rounded-full border border-[var(--line)] px-3 py-1 text-sm hover:bg-black/5">Save</button>
                    </form>
                  </Td>
                </tr>
              ))}
              {enq.length === 0 && <tr><Td>No enquiries yet.</Td><Td /><Td /><Td /></tr>}
            </Table>
          </section>
          <section><h2 className="display mb-4 text-3xl">Proposed packages</h2>
            <p className="mb-4 max-w-[72ch] text-sm text-[var(--fg-dim)]">Public pages show these as proposals. A price appears only when approved. Do not enter negotiation floors, vendor costs or private budgets here.</p>
            <div className="grid gap-4">
              {pk.map((r) => <details key={r.id} className="rounded-2xl border border-[var(--line)] p-5"><summary className="cursor-pointer text-lg font-medium">{r.name} <span className="mono ml-2 text-[var(--fg-faint)]">{r.publication}{r.priceApproved ? " · price public" : ""}</span></summary><div className="mt-5">{pkForm(r)}</div></details>)}
              <div className="rounded-2xl border border-[var(--line)] p-5"><h3 className="display mb-4 text-2xl">Add package</h3>{pkForm()}</div>
            </div>
          </section>
        </div>
      );
    }
    if (tab === "settings") {
      const phase = await seasonPhase();
      const [note] = await db.select().from(s.settings).where(eq(s.settings.key, "internal.planning"));
      const internalWindow = ((note?.value as { window?: string } | undefined)?.window) ?? "";
      return (
        <form action={A.saveSeason} className="grid max-w-2xl gap-5">
          <p className="text-sm text-[var(--fg-dim)]">The season phase is shown on the homepage and Season 01 page. It never counts down and never shows a date; dates come only from published events. Current: <b>{phaseMeta(phase).label}</b>.</p>
          <label className="field"><span className="label">Season phase (public)</span><select className="input" name="phase" defaultValue={phase}>{SEASON_PHASES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
          <label className="field"><span className="label">Internal planning note (never shown publicly: e.g. target filming window)</span><input className="input" name="internalWindow" maxLength={300} defaultValue={internalWindow} /></label>
          <div><button className="rounded-full bg-[var(--fg)] px-6 py-3 text-[var(--bg)]">Save</button></div>
        </form>
      );
    }
    if (tab === "audit") {
      const rows = await db.select().from(s.auditLog).orderBy(desc(s.auditLog.createdAt)).limit(200);
      return <Table head={["When", "Action", "Entity", "Detail"]}>{rows.map((r) => <tr key={r.id}><Td>{fmt(r.createdAt)}</Td><Td className="mono">{r.action}</Td><Td>{r.entity} {r.entityId}</Td><Td className="font-mono text-xs">{r.meta ? JSON.stringify(r.meta) : ""}</Td></tr>)}</Table>;
    }
    const cnt = async (t: typeof s.studentApplications | typeof s.audienceOrders | typeof s.companyEnquiries | typeof s.collegeEnquiries | typeof s.waitlist | typeof s.episodes) =>
      (await db.select({ n: count() }).from(t))[0].n;
    const [stu, shortlisted, ord, paid, co, col, wl, ep] = await Promise.all([
      cnt(s.studentApplications),
      db.select({ n: count() }).from(s.studentApplications).where(eq(s.studentApplications.status, "shortlisted")).then((r) => r[0].n),
      cnt(s.audienceOrders),
      db.select({ n: count() }).from(s.audienceOrders).where(eq(s.audienceOrders.status, "paid")).then((r) => r[0].n),
      cnt(s.companyEnquiries), cnt(s.collegeEnquiries), cnt(s.waitlist), cnt(s.episodes),
    ]);
    return (
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
        {([["Applications", stu], ["Shortlisted", shortlisted], ["Audience orders", ord], ["Paid orders", paid], ["Company enquiries", co], ["College enquiries", col], ["Waitlist", wl], ["Media items", ep]] as const).map(([k, v]) => (
          <div key={k} className="bg-[var(--bg)] p-6"><dt className="eyebrow">{k}</dt><dd className="display mt-2 text-5xl">{v}</dd></div>
        ))}
      </dl>
    );
  };

  return (
    <PageShell eyebrow="Organiser" title={<>Control <em>room.</em></>}>
      <div className="-mt-10 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
          {TABS.map(([k, label]) => (
            <Link key={k} href={`/admin?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm ${tab === k ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-[var(--line)]"}`}>{label}</Link>
          ))}
        </nav>
        <form action={A.logout}><button className="text-sm underline">Sign out</button></form>
      </div>
      {msg && <p role="status" className="mt-6 rounded-xl border border-[var(--line)] bg-black/5 p-3 text-sm">{msg}</p>}
      <div className="mt-8">{await renderBody()}</div>
    </PageShell>
  );
}
