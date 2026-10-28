import { describe, expect, it } from "vitest";
import { publicEducation, publicOpportunities, publicOrganizations, publicSponsorshipPackages, seasonPhase } from "@/lib/content";
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
});

describe("ecosystem content (confirmed facts only)", () => {
  it("lists exactly the confirmed organisations under the right roles, with logos only for approved ones", () => {
    const orgs = publicOrganizations();
    const by = (c: string) => orgs.filter((o) => o.category === c).map((o) => o.name).sort();
    expect(by("recruitment")).toEqual(["CampusGarh", "EduRachna", "Galvanic", "Immverse AI", "Manacle", "Pinaqtech"]);
    expect(by("venue")).toEqual([]);
    expect(by("education")).toEqual(["Futured Innovation Studios"]);
    expect(by("outreach")).toEqual([]);
    expect(orgs.filter((o) => o.logoPath).map((o) => o.name).sort()).toEqual(["CampusGarh", "EduRachna", "Pinaqtech"]);
  });

  it("names no venue until one is confirmed", () => {
    expect(publicOrganizations("venue")).toEqual([]);
  });

  it("invents no roles, openings or stipends", () => {
    expect(publicOpportunities()).toEqual([]);
  });

  it("hides education terms until they are confirmed", () => {
    const [e] = publicEducation();
    expect(e.orgName).toBe("Futured Innovation Studios");
    expect(e.termsConfirmed).toBe(false);
    expect(e.course).toBeNull();
  });

  it("shows no sponsorship prices", () => {
    const pkgs = publicSponsorshipPackages();
    expect(pkgs.map((p) => p.name)).toContain("Presenting Partner");
    expect(pkgs.every((p) => p.price === null)).toBe(true);
  });
});

describe("season phase", () => {
  it("defaults to date-announcement-pending and never implies a date", () => {
    expect(seasonPhase()).toBe(DEFAULT_PHASE);
    expect(phaseMeta(DEFAULT_PHASE).copy).toMatch(/confirmed/);
    expect(phaseMeta("not-a-phase").key).toBe(DEFAULT_PHASE);
  });

  it("offers every state the organiser needs", () => {
    expect(SEASON_PHASES.map((p) => p.key)).toEqual([
      "preparation", "date_pending", "registration_soon", "applications_open", "shortlisting", "scheduled", "filming", "postproduction", "published", "completed",
    ]);
  });
});
