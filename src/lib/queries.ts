import "server-only";
import { and, asc, desc, eq, inArray, lte, or, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { PUBLIC_EVENT_STATUSES } from "@/config/site";
import { DEFAULT_PHASE, DEFAULT_TARGET_WINDOW, type OrgCategory } from "@/config/ecosystem";

/** Public visibility rule, defined once: published, or scheduled and due. */
function visible() {
  const { episodes } = schema;
  return or(
    eq(episodes.publication, "published"),
    and(eq(episodes.publication, "scheduled"), lte(episodes.publishAt, new Date())),
  );
}

export async function publicEpisodes(kind?: "episode" | "podcast" | "clip") {
  const db = await getDb();
  const { episodes } = schema;
  return db
    .select()
    .from(episodes)
    .where(kind ? and(visible(), eq(episodes.kind, kind)) : visible())
    .orderBy(desc(episodes.releaseDate), desc(episodes.createdAt));
}

export async function publicEpisode(slug: string) {
  const db = await getDb();
  const { episodes } = schema;
  const [row] = await db.select().from(episodes).where(and(eq(episodes.slug, slug), visible())).limit(1);
  return row ?? null;
}

export async function publicEvents() {
  const db = await getDb();
  const { events } = schema;
  return db
    .select()
    .from(events)
    .where(inArray(events.status, PUBLIC_EVENT_STATUSES))
    .orderBy(asc(events.startsAt));
}

export async function publicEvent(slug: string) {
  const db = await getDb();
  const { events } = schema;
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), inArray(events.status, PUBLIC_EVENT_STATUSES)))
    .limit(1);
  return row ?? null;
}

/** The event currently selling audience tickets, if any. */
export async function openAudienceEvent() {
  const db = await getDb();
  const { events } = schema;
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.status, "registration_open"), eq(events.audienceTicketsOpen, true)))
    .orderBy(asc(events.startsAt))
    .limit(1);
  return row ?? null;
}

/** Only panelists/partners that are confirmed AND published. */
export async function publicPanelists() {
  const db = await getDb();
  const { panelists } = schema;
  return db.select().from(panelists).where(and(eq(panelists.confirmed, true), eq(panelists.publication, "published")));
}

export async function publicPartners() {
  const db = await getDb();
  const { partners } = schema;
  return db.select().from(partners).where(and(eq(partners.verified, true), eq(partners.publication, "published")));
}

/* ------------------------------ Ecosystem ------------------------------ */

export type PublicOrganization = {
  id: string;
  slug: string;
  name: string;
  category: OrgCategory;
  role: string | null;
  description: string | null;
  websiteUrl: string | null;
  industry: string | null;
  /** Set only when the logo is permitted AND a file path exists. Otherwise null: render the name in type. */
  logoPath: string | null;
};

/** Pure rule, exported for tests: a logo is exposed only with recorded permission and a local path. */
export function logoFor(o: { logoPath: string | null; logoPermission: string }): string | null {
  return o.logoPermission === "approved" && o.logoPath && /^\/partners\/[\w.-]+\.(svg|png|webp)$/i.test(o.logoPath) ? o.logoPath : null;
}

/** Organisations that are published AND have approved being named. Internal fields (evidence) never leave the server. */
export async function publicOrganizations(category?: OrgCategory): Promise<PublicOrganization[]> {
  const db = await getDb();
  const { organizations: o } = schema;
  const base = and(eq(o.publication, "published"), eq(o.announcementApproved, true));
  const rows = await db.select().from(o).where(category ? and(base, eq(o.category, category)) : base).orderBy(asc(o.sortOrder), asc(o.name));
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, category: r.category as OrgCategory, role: r.role, description: r.description,
    websiteUrl: r.websiteUrl && /^https:\/\//.test(r.websiteUrl) ? r.websiteUrl : null, industry: r.industry, logoPath: logoFor(r),
  }));
}

/** Only roles the company has approved, attached to organisations that are themselves public. */
export async function publicOpportunities() {
  const db = await getDb();
  const { opportunities: p, organizations: o } = schema;
  const rows = await db
    .select({ p, orgName: o.name, orgSlug: o.slug })
    .from(p)
    .innerJoin(o, eq(p.organizationId, o.id))
    .where(and(eq(p.publication, "published"), eq(p.approvedByCompany, true), eq(o.publication, "published"), eq(o.announcementApproved, true)))
    .orderBy(asc(o.sortOrder), asc(p.roleTitle));
  return rows.map(({ p: r, orgName, orgSlug }) => ({
    id: r.id, orgName, orgSlug, industry: r.industry, roleTitle: r.roleTitle, openings: r.openings, stipend: r.stipend,
    location: r.location, duration: r.duration, workMode: r.workMode, eligibility: r.eligibility, selectionProcess: r.selectionProcess,
  }));
}

export async function publicEducation() {
  const db = await getDb();
  const { educationContributions: e, organizations: o } = schema;
  const rows = await db
    .select({ e, orgName: o.name, orgSlug: o.slug })
    .from(e)
    .innerJoin(o, eq(e.organizationId, o.id))
    .where(and(eq(e.publication, "published"), eq(o.publication, "published"), eq(o.announcementApproved, true)))
    .orderBy(asc(o.sortOrder));
  return rows.map(({ e: r, orgName, orgSlug }) => ({
    id: r.id, orgName, orgSlug,
    // Terms are exposed only once the organiser confirmed them.
    course: r.termsConfirmed ? r.course : null,
    eligibility: r.termsConfirmed ? r.eligibility : null,
    accessPeriod: r.termsConfirmed ? r.accessPeriod : null,
    certificateTerms: r.termsConfirmed ? r.certificateTerms : null,
    quantity: r.termsConfirmed ? r.quantity : null,
    termsConfirmed: r.termsConfirmed,
  }));
}

export async function publicSponsorshipPackages() {
  const db = await getDb();
  const { sponsorshipPackages: p } = schema;
  const rows = await db.select().from(p).where(eq(p.publication, "published")).orderBy(asc(p.sortOrder));
  return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, summary: r.summary, deliverables: r.deliverables, price: r.priceApproved ? r.publicPrice : null }));
}

export async function seasonPhase(): Promise<string> {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "season"));
  const v = row?.value as { phase?: string } | undefined;
  return v?.phase ?? DEFAULT_PHASE;
}

/** Public target production window. A saved empty value hides it; no saved value falls back to the default. */
export async function targetWindow(): Promise<string> {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "public.targetWindow"));
  const v = row?.value as { text?: string } | undefined;
  return (v?.text ?? DEFAULT_TARGET_WINDOW).trim();
}

/** True only after the organiser has recorded that the PDF is reviewed and externally approved for release. */
export async function prospectusApproved(): Promise<boolean> {
  const db = await getDb();
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, "public.prospectus"));
  return (row?.value as { approved?: boolean } | undefined)?.approved === true;
}

export { isNull };
