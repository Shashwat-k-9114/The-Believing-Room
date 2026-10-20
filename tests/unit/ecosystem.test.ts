import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { logoFor, publicEducation, publicOpportunities, publicOrganizations, publicSponsorshipPackages, seasonPhase } from "@/lib/queries";
import { fieldErrors, sponsorSchema } from "@/lib/validation";
import { DEFAULT_PHASE, phaseMeta, SEASON_PHASES } from "@/config/ecosystem";

const validEnquiry = {
  organization: "Example Brand Pvt Ltd",
  contactName: "Priya Sharma",
  role: "Marketing Director",
  email: "Priya@Example.com",
  phone: "",
  interest: "Industry Partner",
  category: "business",
  budgetRange: "",
  message: "We would like to learn more.",
  consentContact: true,
  consentNoGuarantee: true,
};

describe("sponsor enquiry validation", () => {
  it("accepts a complete enquiry, normalises email and treats blank optionals as absent", () => {
    const r = sponsorSchema.safeParse(validEnquiry);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("priya@example.com");
      expect(r.data.phone).toBeUndefined();
      expect(r.data.budgetRange).toBeUndefined();
    }
  });

  it("requires both acknowledgements, a real email and a known interest", () => {
    const r = sponsorSchema.safeParse({ ...validEnquiry, email: "nope", interest: "Free stuff", consentContact: false, consentNoGuarantee: false });
    expect(r.success).toBe(false);
    if (!r.success) {
      const f = fieldErrors(r.error);
      expect(f.email).toBeTruthy();
      expect(f.interest).toBeTruthy();
      expect(f.consentContact).toBeTruthy();
      expect(f.consentNoGuarantee).toBeTruthy();
    }
  });

  it("validates an optional phone when given", () => {
    expect(sponsorSchema.safeParse({ ...validEnquiry, phone: "12345" }).success).toBe(false);
    expect(sponsorSchema.safeParse({ ...validEnquiry, phone: "+91 98765 43210" }).success).toBe(true);
  });

  it("persists an enquiry", async () => {
    const db = await getDb();
    const parsed = sponsorSchema.parse(validEnquiry);
    await db.insert(schema.sponsorEnquiries).values({ ...parsed, ref: "TBR-S-TEST01" });
    const [row] = await db.select().from(schema.sponsorEnquiries).where(eq(schema.sponsorEnquiries.ref, "TBR-S-TEST01"));
    expect(row.status).toBe("new");
    expect(row.consentNoGuarantee).toBe(true);
  });
});

describe("logo rule", () => {
  it("shows a logo only with approved permission and a local partner path", () => {
    expect(logoFor({ logoPath: "/partners/acme.svg", logoPermission: "approved" })).toBe("/partners/acme.svg");
    expect(logoFor({ logoPath: "/partners/acme.svg", logoPermission: "pending" })).toBeNull();
    expect(logoFor({ logoPath: "/partners/acme.svg", logoPermission: "none" })).toBeNull();
    expect(logoFor({ logoPath: null, logoPermission: "approved" })).toBeNull();
    expect(logoFor({ logoPath: "https://evil.example/logo.svg", logoPermission: "approved" })).toBeNull();
    expect(logoFor({ logoPath: "/partners/../secret.svg", logoPermission: "approved" })).toBeNull();
    expect(logoFor({ logoPath: "/partners/a.svg?x=1", logoPermission: "approved" })).toBeNull();
  });
});

describe("seeded ecosystem (confirmed facts only)", () => {
  it("publishes exactly the confirmed organisations under the right roles, without logos", async () => {
    const orgs = await publicOrganizations();
    const by = (c: string) => orgs.filter((o) => o.category === c).map((o) => o.name).sort();
    expect(by("recruitment")).toEqual(["Galvanic", "Immverse AI", "KRVVY", "Manacle"]);
    expect(by("venue")).toEqual(["Amity Greater Noida"]);
    expect(by("education")).toEqual(["Futured Innovation Studios"]);
    expect(by("outreach")).toEqual(["BIT Noida"]);
    expect(orgs.every((o) => o.logoPath === null)).toBe(true);
  });

  it("never exposes the internal evidence reference", async () => {
    const orgs = await publicOrganizations();
    for (const o of orgs) expect(Object.keys(o)).not.toContain("evidenceRef");
    expect(JSON.stringify(orgs)).not.toMatch(/Organiser confirmation/);
  });

  it("describes the venue as facilities only, not sponsorship or production", async () => {
    const [venue] = await publicOrganizations("venue");
    expect(venue.role).toMatch(/no charge/i);
    expect(venue.description).toMatch(/arranged separately/i);
    expect(JSON.stringify(venue)).not.toMatch(/sponsor/i);
  });

  it("invents no roles, openings or stipends", async () => {
    expect(await publicOpportunities()).toEqual([]);
  });

  it("hides education terms until they are confirmed", async () => {
    const db = await getDb();
    const [e] = await publicEducation();
    expect(e.orgName).toBe("Futured Innovation Studios");
    expect(e.termsConfirmed).toBe(false);
    expect(e.course).toBeNull();
    // Even if terms are entered, they stay hidden until marked confirmed.
    await db.update(schema.educationContributions).set({ course: "Secret Course", quantity: "99" });
    const [still] = await publicEducation();
    expect(still.course).toBeNull();
    expect(still.quantity).toBeNull();
    await db.update(schema.educationContributions).set({ termsConfirmed: true });
    const [shown] = await publicEducation();
    expect(shown.course).toBe("Secret Course");
    await db.update(schema.educationContributions).set({ termsConfirmed: false, course: null, quantity: null });
  });
});

describe("publication gates", () => {
  it("hides organisations that are unpublished or not approved to be named", async () => {
    const db = await getDb();
    const [m] = await db.select().from(schema.organizations).where(eq(schema.organizations.slug, "manacle"));
    await db.update(schema.organizations).set({ announcementApproved: false }).where(eq(schema.organizations.id, m.id));
    expect((await publicOrganizations()).map((o) => o.name)).not.toContain("Manacle");
    await db.update(schema.organizations).set({ announcementApproved: true, publication: "draft" }).where(eq(schema.organizations.id, m.id));
    expect((await publicOrganizations()).map((o) => o.name)).not.toContain("Manacle");
    await db.update(schema.organizations).set({ publication: "published" }).where(eq(schema.organizations.id, m.id));
    expect((await publicOrganizations()).map((o) => o.name)).toContain("Manacle");
  });

  it("exposes a logo only after permission is approved, and falls back when permission is withdrawn", async () => {
    const db = await getDb();
    const k = eq(schema.organizations.slug, "krvvy");
    await db.update(schema.organizations).set({ logoPath: "/partners/krvvy.svg", logoPermission: "pending" }).where(k);
    expect((await publicOrganizations("recruitment")).find((o) => o.slug === "krvvy")?.logoPath).toBeNull();
    await db.update(schema.organizations).set({ logoPermission: "approved" }).where(k);
    expect((await publicOrganizations("recruitment")).find((o) => o.slug === "krvvy")?.logoPath).toBe("/partners/krvvy.svg");
    await db.update(schema.organizations).set({ logoPermission: "none", logoPath: null }).where(k);
    expect((await publicOrganizations("recruitment")).find((o) => o.slug === "krvvy")?.logoPath).toBeNull();
  });

  it("lists a role only when published AND approved by the company", async () => {
    const db = await getDb();
    const [g] = await db.select().from(schema.organizations).where(eq(schema.organizations.slug, "galvanic"));
    const [role] = await db.insert(schema.opportunities).values({ organizationId: g.id, roleTitle: "Test role", publication: "published", approvedByCompany: false }).returning();
    expect(await publicOpportunities()).toEqual([]);
    await db.update(schema.opportunities).set({ approvedByCompany: true, publication: "draft" }).where(eq(schema.opportunities.id, role.id));
    expect(await publicOpportunities()).toEqual([]);
    await db.update(schema.opportunities).set({ publication: "published" }).where(eq(schema.opportunities.id, role.id));
    expect((await publicOpportunities()).map((r) => r.roleTitle)).toEqual(["Test role"]);
    await db.delete(schema.opportunities).where(eq(schema.opportunities.id, role.id));
  });

  it("shows sponsorship prices only when approved, and omits drafts", async () => {
    const db = await getDb();
    const pkgs = await publicSponsorshipPackages();
    expect(pkgs.map((p) => p.name)).toContain("Founding Presenting Partner");
    expect(pkgs.every((p) => p.price === null)).toBe(true);
    const slug = eq(schema.sponsorshipPackages.slug, "industry-partner");
    await db.update(schema.sponsorshipPackages).set({ publicPrice: "₹X", priceApproved: false }).where(slug);
    expect((await publicSponsorshipPackages()).find((p) => p.slug === "industry-partner")?.price).toBeNull();
    await db.update(schema.sponsorshipPackages).set({ priceApproved: true }).where(slug);
    expect((await publicSponsorshipPackages()).find((p) => p.slug === "industry-partner")?.price).toBe("₹X");
    await db.update(schema.sponsorshipPackages).set({ publication: "draft" }).where(slug);
    expect((await publicSponsorshipPackages()).map((p) => p.slug)).not.toContain("industry-partner");
  });
});

describe("season phase", () => {
  it("defaults to date-announcement-pending and never implies a date", async () => {
    expect(await seasonPhase()).toBe(DEFAULT_PHASE);
    expect(phaseMeta(DEFAULT_PHASE).copy).toMatch(/confirmed/);
    expect(phaseMeta("not-a-phase").key).toBe(DEFAULT_PHASE);
  });

  it("offers every state the organiser needs", () => {
    expect(SEASON_PHASES.map((p) => p.key)).toEqual([
      "preparation", "date_pending", "registration_soon", "applications_open", "shortlisting", "scheduled", "filming", "postproduction", "published", "completed",
    ]);
  });
});
