import { DEFAULT_PHASE, DEFAULT_TARGET_WINDOW, type OrgCategory } from "@/config/ecosystem";

/**
 * Site content, edited here and deployed. Nothing is fetched from a database.
 * Everything below is drawn only from what the organiser has confirmed; leave a list empty until there is something real to show.
 */

export type Episode = {
  id: string;
  slug: string;
  /** episode (show) | podcast | clip */
  kind: "episode" | "podcast" | "clip";
  title: string;
  summary: string;
  season: number | null;
  number: number | null;
  industry: string | null;
  durationSec: number | null;
  releaseDate: Date | null;
  youtubeId: string | null;
  spotifyUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  guests: { name: string; role?: string }[];
  transcript: string | null;
  relatedSlugs: string[];
};

export type SiteEvent = {
  id: string;
  slug: string;
  title: string;
  edition: string | null;
  status: string;
  summary: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  venueName: string | null;
  venueAddress: string | null;
  mapUrl: string | null;
  capacity: number | null;
  showCapacity: boolean;
  agenda: { time: string; title: string }[];
  rules: string[];
  studentTicketsOpen: boolean;
  audienceTicketsOpen: boolean;
};

export type Panelist = { id: string; name: string; title: string; organization: string };

/** Add published episodes, podcasts and clips here (newest first). */
const episodes: Episode[] = [];
/** Add confirmed events here. */
const events: SiteEvent[] = [];
/** Add confirmed panelists here. */
const panelists: Panelist[] = [];

export const publicEpisodes = (kind?: Episode["kind"]) => (kind ? episodes.filter((e) => e.kind === kind) : episodes);
export const publicEpisode = (slug: string) => episodes.find((e) => e.slug === slug) ?? null;
export const publicEvents = () => events;
export const publicEvent = (slug: string) => events.find((e) => e.slug === slug) ?? null;
export const publicPanelists = () => panelists;

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
  /** Local path under /public/partners, set only once the organisation has approved its logo. Otherwise null: the name is set in type. */
  logoPath: string | null;
  /** True when the artwork has white lettering and needs a dark plate. */
  logoOnDark?: boolean;
};

const org = (o: Omit<PublicOrganization, "id" | "description" | "websiteUrl" | "industry" | "logoPath"> & Partial<PublicOrganization>): PublicOrganization => ({
  id: o.slug, description: null, websiteUrl: null, industry: null, logoPath: null, ...o,
});

const RECRUITING = "Confirmed internship-recruiting participant.";
const organizations: PublicOrganization[] = [
  // Manacle, Immverse AI and Galvanic are confirmed but not listed until their logos arrive: add each here with its logoPath.
  org({ slug: "edurachna", name: "EduRachna", category: "recruitment", role: RECRUITING, logoPath: "/partners/edurachna.png" }),
  org({ slug: "pinaqtech", name: "Pinaqtech", category: "recruitment", role: RECRUITING, logoPath: "/partners/pinaqtech.png" }),
  org({ slug: "campusgarh", name: "CampusGarh", category: "recruitment", role: RECRUITING, logoPath: "/partners/campusgarh.png", logoOnDark: true }),
  org({ slug: "kashti-educare", name: "Kashti Educare", category: "recruitment", role: RECRUITING, logoPath: "/partners/kashti-educare.png" }),
  org({ slug: "kashti-adventures", name: "Kashti Adventures", category: "recruitment", role: RECRUITING, logoPath: "/partners/kashti-adventures.png" }),
  org({ slug: "futured-innovation-studios", name: "Futured Innovation Studios", category: "education", role: "Provides its courses to candidates free of charge." }),
];

export const publicOrganizations = (category?: OrgCategory) => (category ? organizations.filter((o) => o.category === category) : organizations);

/** Roles a company has approved for publication. Empty until then. */
export const publicOpportunities = (): {
  id: string; orgName: string; orgSlug: string; industry: string | null; roleTitle: string; openings: number | null; stipend: string | null;
  location: string | null; duration: string | null; workMode: string | null; eligibility: string | null; selectionProcess: string | null;
}[] => [];

/** Course terms appear only once `termsConfirmed` is true and the fields below are filled in. */
export const publicEducation = () =>
  organizations
    .filter((o) => o.category === "education")
    .map((o) => ({
      id: o.id, orgName: o.name, orgSlug: o.slug, termsConfirmed: false,
      course: null as string | null, eligibility: null as string | null, accessPeriod: null as string | null,
      certificateTerms: null as string | null, quantity: null as string | null,
    }));

export const publicSponsorshipPackages = (): { id: string; slug: string; name: string; summary: string; deliverables: string[]; price: string | null }[] => [
  {
    id: "presenting-partner", slug: "presenting-partner", name: "Presenting Partner", price: null,
    summary: "The lead association with Season 01: a place at the front of the first season of an early-career hiring show.",
    deliverables: ["Presenting credit on published episodes, subject to agreement", "Acknowledgement across the website and show description", "Stage branding, subject to venue authorisation", "A sponsor message or segment agreed in advance", "Post-event reporting on agreed deliverables"],
  },
  {
    id: "industry-partner", slug: "industry-partner", name: "Industry Partner", price: null,
    summary: "Associate with one of the four industry blocks: IT & Technology, Finance & Accounting, Sales & Marketing, or Animation & Multimedia.",
    deliverables: ["Industry-block credit in the relevant episode(s)", "Acknowledgement on the industry page", "Employer-branding presence in the room, subject to agreement"],
  },
  {
    id: "community-supporting-partner", slug: "community-supporting-partner", name: "Community / Supporting Partner", price: null,
    summary: "Back the initiative and be named among the organisations that helped make opportunity visible.",
    deliverables: ["Acknowledgement on the partners page", "Credit in the show description", "A thank-you in published material"],
  },
  {
    id: "in-kind-production-partner", slug: "in-kind-production-partner", name: "In-Kind Production Partner", price: null,
    summary: "Contribute equipment, services, hospitality or materials that make filming and the day itself possible.",
    deliverables: ["Credit matched to the contribution", "Acknowledgement in published episodes, subject to agreement", "Content deliverables agreed in advance"],
  },
];

/** Where the season stands. Change by hand; the site never infers a phase from the calendar. See SEASON_PHASES in config/ecosystem. */
export const seasonPhase = (): string => DEFAULT_PHASE;

/** Public target production window. Empty string hides it. */
export const targetWindow = (): string => DEFAULT_TARGET_WINDOW.trim();
