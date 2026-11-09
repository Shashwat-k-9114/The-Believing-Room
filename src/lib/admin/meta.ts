import "server-only";
import { FORMS, type FormKey } from "@/lib/forms";

type Meta = { label: string; singular: string; description: string; defaults: string[] };

/** What each form's tab is called in the portal, and which columns are worth showing up front. */
const META: Record<FormKey, Meta> = {
  candidate: {
    label: "Candidates", singular: "candidate", description: "Students applying to pitch on the show.",
    defaults: ["fullName", "email", "phone", "college", "course", "gradYear", "industry"],
  },
  audience: {
    label: "Audience", singular: "audience booking", description: "Seat registrations for the live recording.",
    defaults: ["name", "email", "phone", "quantity"],
  },
  waitlist: {
    label: "Waitlist", singular: "waitlist sign-up", description: "People who asked to hear when the next season opens.",
    defaults: ["kind", "name", "email", "consentContact"],
  },
  company: {
    label: "Companies", singular: "company enquiry", description: "Hiring companies who want to meet early-career talent.",
    defaults: ["organization", "contactName", "email", "industry", "openings", "mode"],
  },
  college: {
    label: "Colleges", singular: "college enquiry", description: "Institutions bringing students to the show.",
    defaults: ["institution", "city", "contactName", "email", "studentCount"],
  },
  sponsor: {
    label: "Sponsors", singular: "sponsor enquiry", description: "Brands interested in backing the show.",
    defaults: ["organization", "contactName", "email", "category", "budgetRange"],
  },
  contact: {
    label: "Contact", singular: "message", description: "General messages from the contact page.",
    defaults: ["name", "email", "topic", "message"],
  },
};

export type TabSpec = Meta & {
  key: string;
  tab: string;
  /** Reference prefix for entries that get one (candidates, companies, ...). */
  prefix?: string;
  /** The headers the site writes, in order, so an empty tab still has a form to add an entry with. */
  headers: string[];
  defaultColumns: string[];
};

export const TAB_SPECS: TabSpec[] = (Object.keys(META) as FormKey[]).map((key) => {
  const spec = FORMS[key];
  const labels = spec.columns as Record<string, string>;
  const hasRef = "prefix" in spec && Boolean(spec.prefix);
  return {
    ...META[key],
    key,
    tab: spec.tab,
    prefix: hasRef ? (spec as { prefix: string }).prefix : undefined,
    headers: ["Submitted at", ...(hasRef ? ["Reference"] : []), ...Object.values(labels)],
    defaultColumns: META[key].defaults.map((d) => labels[d]).filter(Boolean),
  };
});
