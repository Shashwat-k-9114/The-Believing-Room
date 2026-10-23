import type { ZodType } from "zod";
import {
  audienceSchema, collegeSchema, companySchema, contactSchema, sponsorSchema, studentSchema, waitlistSchema,
} from "./validation";

type Spec = {
  /** Sheet tab the rows land in. Created on first submission. */
  tab: string;
  /** Reference prefix; omitted for forms where a reference means nothing to the sender. */
  prefix?: string;
  schema: ZodType<Record<string, unknown>>;
  /** Column header for each validated field, in sheet order. */
  columns: Record<string, string>;
};

export const FORMS = {
  candidate: {
    tab: "Candidates", prefix: "TBR-C", schema: studentSchema,
    columns: {
      fullName: "Full name", email: "Email", phone: "Phone", college: "College", course: "Course", gradYear: "Graduation year",
      industry: "Industry", skills: "Skills", portfolioUrl: "Portfolio", githubUrl: "GitHub", linkedinUrl: "LinkedIn", resumeUrl: "Résumé link",
      pitchSummary: "Pitch summary", experience: "Experience",
      consentTerms: "Accepted terms", consentPrivacy: "Accepted privacy notice", consentFilming: "OK to film",
      consentPublishPitch: "OK to publish pitch", consentShowNameCollege: "OK to show name and college", consentPromoClips: "OK for promo clips",
    },
  },
  audience: {
    tab: "Audience", prefix: "TBR-A", schema: audienceSchema,
    columns: {
      name: "Name", email: "Email", phone: "Phone", quantity: "Tickets", attendeeNames: "Attendee names",
      consentTerms: "Accepted terms", consentPrivacy: "Accepted privacy notice", consentFilming: "Acknowledged filming",
    },
  },
  waitlist: {
    tab: "Waitlist", schema: waitlistSchema,
    columns: { kind: "List", name: "Name", email: "Email", consentContact: "OK to contact" },
  },
  company: {
    tab: "Companies", prefix: "TBR-R", schema: companySchema,
    columns: {
      organization: "Organisation", contactName: "Contact", role: "Role", email: "Email", industry: "Industry", functions: "Functions",
      openings: "Openings", mode: "Mode", compensation: "Compensation", interests: "Interests", message: "Message",
    },
  },
  college: {
    tab: "Colleges", prefix: "TBR-U", schema: collegeSchema,
    columns: {
      institution: "Institution", city: "City", contactName: "Contact", role: "Role", email: "Email", phone: "Phone",
      studentCount: "Students", interests: "Interests", message: "Message",
    },
  },
  sponsor: {
    tab: "Sponsors", prefix: "TBR-S", schema: sponsorSchema,
    columns: {
      organization: "Organisation", contactName: "Contact", role: "Role", email: "Email", phone: "Phone", category: "Category",
      interest: "Interest", budgetRange: "Budget", message: "Message", consentContact: "OK to contact", consentNoGuarantee: "Acknowledged no guarantee",
    },
  },
  contact: {
    tab: "Contact", schema: contactSchema,
    columns: { name: "Name", email: "Email", topic: "Topic", message: "Message" },
  },
} satisfies Record<string, Spec>;

export type FormKey = keyof typeof FORMS;
export const isFormKey = (k: string): k is FormKey => Object.hasOwn(FORMS, k);

/** Spreadsheet-friendly cell: booleans as Yes/No, lists joined, empty as blank. A leading = + - @ is neutralised against formula injection. */
export function cell(v: unknown): string | number {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v;
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
