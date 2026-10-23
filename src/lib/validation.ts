import { z } from "zod";
import { industries } from "@/content/industries";
import { pricing } from "@/config/site";
import { BUDGET_RANGES, SPONSOR_INTERESTS } from "@/config/ecosystem";

/** Strip control characters and collapse stray whitespace. React escapes on output. */
export const clean = (s: string) =>
  s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, min === 1 ? `${label} is required` : `${label} needs at least ${min} characters`)
        .max(max, `${label} must be ${max} characters or fewer`),
    );

const optionalText = (max: number, label: string) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer`))
    .optional()
    .transform((v) => (v ? v : undefined));

const email = z
  .string({ error: "Email is required" })
  .transform((s) => clean(s).toLowerCase())
  .pipe(z.email("Enter a valid email address").max(200));

/** Indian mobile: optional +91/0 prefix, 10 digits starting 6-9. Normalised to 10 digits. */
export const phone = z
  .string({ error: "Phone number is required" })
  .transform((s) => s.replace(/[\s\-()]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"));

const httpUrl = (label: string) =>
  z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .max(300)
        .refine((v) => v === "" || /^https?:\/\//i.test(v), `${label} must start with http:// or https://`)
        .refine((v) => {
          if (v === "") return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        }, `${label} is not a valid link`),
    )
    .optional()
    .transform((v) => (v ? v : undefined));

const industrySlug = z.enum(industries.map((i) => i.slug) as [string, ...string[]], {
  error: "Choose an industry",
});

const mustAgree = (msg: string) => z.literal(true, { error: msg });
const thisYear = new Date().getFullYear();

export const studentSchema = z.object({
  fullName: text(2, 120, "Full name"),
  email,
  phone,
  college: text(2, 200, "College or university"),
  course: text(2, 160, "Course or degree"),
  gradYear: z.coerce
    .number({ error: "Graduation year is required" })
    .int()
    .min(thisYear - 1, "Graduation year looks too early")
    .max(thisYear + 8, "Graduation year looks too far ahead"),
  industry: industrySlug,
  skills: text(2, 400, "Skills"),
  portfolioUrl: httpUrl("Portfolio link"),
  githubUrl: httpUrl("GitHub link"),
  linkedinUrl: httpUrl("LinkedIn link"),
  resumeUrl: httpUrl("Résumé link"),
  pitchSummary: text(40, 1200, "Pitch summary"),
  experience: optionalText(1500, "Experience"),
  consentTerms: mustAgree("You must accept the participation terms"),
  consentPrivacy: mustAgree("You must accept the privacy notice"),
  consentFilming: z.boolean().default(false),
  consentPublishPitch: z.boolean().default(false),
  consentShowNameCollege: z.boolean().default(false),
  consentPromoClips: z.boolean().default(false),
});
export type StudentInput = z.infer<typeof studentSchema>;

export const audienceSchema = z.object({
  name: text(2, 120, "Your name"),
  email,
  phone,
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Choose at least one ticket")
    .max(pricing.audienceTickets.maxPerOrder, `You can request up to ${pricing.audienceTickets.maxPerOrder} tickets at once`),
  attendeeNames: z.array(text(2, 120, "Attendee name")).max(pricing.audienceTickets.maxPerOrder).default([]),
  consentTerms: mustAgree("You must accept the ticket terms"),
  consentPrivacy: mustAgree("You must accept the privacy notice"),
  consentFilming: mustAgree("You must acknowledge that the event is filmed"),
});
export type AudienceInput = z.infer<typeof audienceSchema>;

export const waitlistSchema = z.object({
  kind: z.enum(["audience", "student", "updates"]),
  name: optionalText(120, "Name"),
  email,
  consentContact: mustAgree("Please agree to be contacted"),
});

export const companySchema = z.object({
  organization: text(2, 160, "Organisation"),
  contactName: text(2, 120, "Contact person"),
  role: text(2, 120, "Your role"),
  email,
  industry: industrySlug,
  functions: text(3, 400, "Internship functions"),
  openings: z
    .union([z.coerce.number().int().min(0).max(5000), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" ? v : undefined)),
  mode: z.enum(["onsite", "remote", "hybrid"], { error: "Choose an internship mode" }),
  compensation: optionalText(300, "Compensation details"),
  interests: z.array(z.string().max(60)).max(8).default([]),
  message: optionalText(2000, "Message"),
});

export const collegeSchema = z.object({
  institution: text(2, 200, "Institution"),
  city: text(2, 100, "City"),
  contactName: text(2, 120, "Contact person"),
  role: text(2, 120, "Your role"),
  email,
  phone: phone.optional().or(z.literal("").transform(() => undefined)),
  studentCount: z
    .union([z.coerce.number().int().min(0).max(100000), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" ? v : undefined)),
  interests: z.array(z.string().max(60)).max(8).default([]),
  message: optionalText(2000, "Message"),
});

export const sponsorSchema = z.object({
  organization: text(2, 160, "Organisation"),
  contactName: text(2, 120, "Contact person"),
  role: optionalText(120, "Your role"),
  email,
  phone: phone.optional().or(z.literal("").transform(() => undefined)),
  interest: z.enum(SPONSOR_INTERESTS, { error: "Choose the kind of partnership you are interested in" }),
  category: z.enum(["business", "recruitment_company", "education", "media_brand", "individual", "other"], { error: "Choose the option that describes you" }),
  budgetRange: z
    .enum(BUDGET_RANGES)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: optionalText(3000, "Message"),
  consentContact: mustAgree("Please agree to be contacted about this enquiry"),
  consentNoGuarantee: mustAgree("Please acknowledge that no reach or outcome is guaranteed"),
});

export const contactSchema = z.object({
  name: text(2, 120, "Name"),
  email,
  topic: z.enum(["students", "audience", "companies", "colleges", "media", "other"]),
  message: text(10, 3000, "Message"),
});

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    out[key] ??= issue.message;
  }
  return out;
}
