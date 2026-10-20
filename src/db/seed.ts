import { eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import * as schema from "./schema";

/**
 * One-time starting content, drawn only from what the organiser has confirmed.
 * Run once per database (guarded by a settings key) so later edits in /admin are never overwritten.
 * Deliberately blank: role names, openings, stipends, durations, locations, course names, values,
 * certificates, quantities, logos, websites. Those are added in /admin once supplied.
 */
const SEED_KEY = "seed.ecosystem.v1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = PgDatabase<any, typeof schema, any>;

export async function seedEcosystem(db: Db) {
  const [done] = await db.select().from(schema.settings).where(eq(schema.settings.key, SEED_KEY));
  if (done) return;

  const confirmed = { confirmationStatus: "owner_confirmed", announcementApproved: true, logoPermission: "none", publication: "published" } as const;
  const evidenceRef = "Organiser confirmation";
  await db.insert(schema.organizations).values([
    { slug: "manacle", name: "Manacle", category: "recruitment", role: "Confirmed internship-recruiting participant.", sortOrder: 10, evidenceRef, ...confirmed },
    { slug: "krvvy", name: "KRVVY", category: "recruitment", role: "Confirmed internship-recruiting participant.", sortOrder: 20, evidenceRef, ...confirmed },
    { slug: "immverse-ai", name: "Immverse AI", category: "recruitment", role: "Confirmed internship-recruiting participant.", sortOrder: 30, evidenceRef, ...confirmed },
    { slug: "galvanic", name: "Galvanic", category: "recruitment", role: "Confirmed internship-recruiting participant.", sortOrder: 40, evidenceRef, ...confirmed },
    {
      slug: "amity-greater-noida", name: "Amity Greater Noida", category: "venue", sortOrder: 10, evidenceRef,
      role: "Provides an auditorium and a podcast room at no charge.",
      description: "Facilities only. Cameras, lighting, microphones, recording equipment and crews are arranged separately by The Believing Room.",
      ...confirmed,
    },
    {
      slug: "futured-innovation-studios", name: "Futured Innovation Studios", category: "education", sortOrder: 10, evidenceRef,
      role: "Provides its courses to candidates free of charge.",
      ...confirmed,
    },
    {
      slug: "bit-noida", name: "BIT Noida", category: "outreach", sortOrder: 10, evidenceRef,
      role: "Has agreed to let The Believing Room reach its students to invite candidates and audience members.",
      ...confirmed,
    },
  ]);

  const [futured] = await db.select().from(schema.organizations).where(eq(schema.organizations.slug, "futured-innovation-studios"));
  await db.insert(schema.educationContributions).values({ organizationId: futured.id, termsConfirmed: false, publication: "published" });

  await db.insert(schema.sponsorshipPackages).values([
    {
      slug: "founding-presenting-partner", name: "Founding Presenting Partner", sortOrder: 10, publication: "published",
      summary: "The lead association with Season 01: a place at the front of the first season of an early-career hiring show.",
      deliverables: ["Presenting credit on published episodes, subject to agreement", "Acknowledgement across the website and show description", "Stage branding, subject to venue authorisation", "A sponsor message or segment agreed in advance", "Post-event reporting on agreed deliverables"],
    },
    {
      slug: "industry-partner", name: "Industry Partner", sortOrder: 20, publication: "published",
      summary: "Associate with one of the four industry blocks: IT & Technology, Finance & Accounting, Sales & Marketing, or Animation & Multimedia.",
      deliverables: ["Industry-block credit in the relevant episode(s)", "Acknowledgement on the industry page", "Employer-branding presence in the room, subject to agreement"],
    },
    {
      slug: "community-supporting-partner", name: "Community / Supporting Partner", sortOrder: 30, publication: "published",
      summary: "Back the initiative and be named among the organisations that helped make opportunity visible.",
      deliverables: ["Acknowledgement on the partners page", "Credit in the show description", "A thank-you in published material"],
    },
    {
      slug: "in-kind-production-partner", name: "In-Kind Production Partner", sortOrder: 40, publication: "published",
      summary: "Contribute equipment, services, hospitality or materials that make filming and the day itself possible.",
      deliverables: ["Credit matched to the contribution", "Acknowledgement in published episodes, subject to agreement", "Content deliverables agreed in advance"],
    },
    {
      slug: "educational-partner", name: "Educational Partner", sortOrder: 50, publication: "published",
      summary: "Offer learning to candidates, as an educational contribution rather than cash sponsorship.",
      deliverables: ["Dedicated educational-contribution feature on the website", "Acknowledgement in candidate communications, subject to agreement", "Eligibility and access terms published by agreement"],
    },
  ]);

  await db.insert(schema.settings).values({ key: "season", value: { phase: "date_pending" } }).onConflictDoNothing();
  await db.insert(schema.settings).values({ key: SEED_KEY, value: { at: new Date().toISOString() } }).onConflictDoNothing();
}
