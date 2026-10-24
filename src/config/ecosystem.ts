/**
 * Presentation rules for the partner ecosystem. Facts about individual organisations live in
 * src/lib/content.ts; this file holds
 * only how categories are named and which claims each category may and may not make.
 */

export type OrgCategory = "recruitment" | "venue" | "education" | "outreach";

export const ORG_CATEGORY_META: Record<
  OrgCategory,
  { label: string; heading: string; blurb: string; /** What this relationship is NOT. Shown on /partners. */ notes: string }
> = {
  recruitment: {
    label: "Recruitment participants",
    heading: "Hiring in the room",
    blurb: "Organisations that have confirmed they are taking part as internship-recruiting participants.",
    notes: "Participation does not guarantee any offer. Roles, openings, stipends and terms are published only after each company confirms them. Employment decisions rest entirely with the employer.",
  },
  venue: {
    label: "Venue facilities",
    heading: "The place",
    blurb: "The spaces in which Season 01 is planned to be recorded.",
    notes: "A facilities arrangement. It is not financial sponsorship, co-production or an institutional endorsement.",
  },
  education: {
    label: "Educational contribution",
    heading: "Learning beyond the room",
    blurb: "Learning offered to candidates free of charge.",
    notes: "An educational contribution. Not a recruiter and not a cash sponsor. Entitlements are subject to final published terms.",
  },
  outreach: {
    label: "Student outreach",
    heading: "Reaching students",
    blurb: "Institutions that have agreed to let The Believing Room invite their students to take part.",
    notes: "Permission to invite students. Not co-hosting, sponsorship or endorsement, and no attendance or registration is guaranteed.",
  },
};

export const ORG_CATEGORY_ORDER: OrgCategory[] = ["recruitment", "venue", "outreach"];

/**
 * Season phase, set by hand (see seasonPhase in src/lib/content.ts). The website never infers a phase from the
 * calendar: nothing here counts down, and no date is shown unless an event record carries one.
 */
export const SEASON_PHASES = [
  { key: "preparation", label: "In preparation", copy: "Season 01 is being prepared. Nothing is scheduled publicly yet." },
  { key: "date_pending", label: "Date announcement pending", copy: "Season 01 is in preparation. The date and venue details will be published once they are confirmed." },
  { key: "registration_soon", label: "Registration opening soon", copy: "Registration is about to open. Leave your email to hear the moment it does." },
  { key: "applications_open", label: "Applications open", copy: "Candidate applications are open. Applying is free." },
  { key: "shortlisting", label: "Shortlisting", copy: "Applications are being reviewed and candidates are being shortlisted." },
  { key: "scheduled", label: "Event scheduled", copy: "The event date has been confirmed. See the event page for details." },
  { key: "filming", label: "Filming", copy: "Season 01 is being filmed." },
  { key: "postproduction", label: "Postproduction", copy: "Filming is complete. Episodes are being edited." },
  { key: "published", label: "Published", copy: "Season 01 episodes are being published." },
  { key: "completed", label: "Completed", copy: "Season 01 has concluded." },
] as const;

export type SeasonPhaseKey = (typeof SEASON_PHASES)[number]["key"];
export const DEFAULT_PHASE: SeasonPhaseKey = "date_pending";

export const phaseMeta = (key: string | null | undefined) =>
  SEASON_PHASES.find((p) => p.key === key) ?? SEASON_PHASES.find((p) => p.key === DEFAULT_PHASE)!;

/** Sponsorship enquiry options. */
export const SPONSOR_INTERESTS = [
  "Presenting Partner",
  "Industry Partner",
  "Community / Supporting Partner",
  "In-Kind Production Partner",
  "Advertising or brand visibility",
  "Not sure yet",
] as const;

export const BUDGET_RANGES = ["Prefer to discuss", "Under ₹50,000", "₹50,000 – ₹1,50,000", "₹1,50,000 – ₹3,00,000", "Above ₹3,00,000", "In-kind contribution only"] as const;

/** Public, clearly labelled target. Not an event date. Edit or clear it here. */
export const DEFAULT_TARGET_WINDOW = "First week of November";
