/**
 * Single source of truth for brand, pricing, season details and external links.
 * Anything `null` is UNCONFIRMED: the UI must show a truthful "to be announced"
 * state for it, never an invented value.
 */

export const brand = {
  name: "The Believing Room",
  shortName: "The Believing Room",
  tagline: "Where Opportunity Meets Belief.",
  description:
    "A live recruitment show where students pitch their abilities to industry professionals, and hiring companies meet early-career talent in person. Filmed for YouTube.",
  locale: "en-IN",
  /** Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "thebelievingroom@gmail.com",
  /** Owner-supplied channels. Edit here only. */
  social: {
    youtube: "https://youtube.com/@thebelievingroom",
    instagram: "https://www.instagram.com/the.believing.room/",
    linkedin: "https://www.linkedin.com/company/the-believing-room/",
    x: "https://x.com/thbelievingroom",
    reddit: "https://www.reddit.com/user/thebelievingroom/",
  },
  podcast: {
    /** The podcast identity has not been supplied; this is a working title. */
    name: "The Believing Room Podcast",
    youtubePlaylistUrl: process.env.NEXT_PUBLIC_PODCAST_PLAYLIST_URL ?? null,
    spotifyUrl: null as string | null,
    applePodcastsUrl: null as string | null,
  },
};

export const socialLinks = [
  { key: "youtube", label: "YouTube", handle: "@thebelievingroom", href: brand.social.youtube },
  { key: "instagram", label: "Instagram", handle: "@the.believing.room", href: brand.social.instagram },
  { key: "linkedin", label: "LinkedIn", handle: "The Believing Room", href: brand.social.linkedin },
  { key: "x", label: "X", handle: "@thbelievingroom", href: brand.social.x },
  { key: "reddit", label: "Reddit", handle: "u/thebelievingroom", href: brand.social.reddit },
] as const;

/** Owner-confirmed prices, whole rupees. Never hardcode a price anywhere else. */
export const pricing = {
  currency: "INR",
  candidate: { label: "Candidate ticket", amount: 1000 },
  audience: { label: "Audience ticket", amount: 300 },
  foodIncluded: true,
  /** Percentages applied on top of the base amount. */
  gstPercent: 0,
  platformFeePercent: 0,
  maxAudienceQuantity: 6,
  /**
   * OPEN OWNER DECISION. The reference page says registration is complete only
   * after payment, while its process lists Shortlist before Pitch. Default:
   * collect the candidate ticket only after shortlisting, so nobody pays for a
   * place that is not confirmed. Set to "at_application" to collect at sign-up.
   */
  candidatePaymentStage: "after_shortlist" as "after_shortlist" | "at_application",
};

export type PassKind = "candidate" | "audience";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function priceBreakdown(kind: PassKind, quantity = 1) {
  const unit = pricing[kind].amount;
  const subtotal = unit * quantity;
  const fee = Math.round((subtotal * pricing.platformFeePercent) / 100);
  const gst = Math.round(((subtotal + fee) * pricing.gstPercent) / 100);
  return { unit, quantity, subtotal, fee, gst, total: subtotal + fee + gst };
}

/**
 * Season 01 as described by the reference page. These are PLANNED numbers,
 * not bookings or confirmed participation. Real inventory comes from the
 * events table once ticketing is live.
 */
export const season = {
  label: "Season 01",
  planned: {
    candidatePlaces: 40,
    audiencePlaces: 20,
    candidatesPerEpisode: 10,
    /** Target set by the organiser; companies are named only once verified. */
    hiringCompanies: 16,
  },
  /** Not announced. Do not invent. */
  date: null as string | null,
  venue: null as string | null,
  /**
   * PROPOSED run of show for one candidate slot. Shown publicly only as "proposed"; keep configurable
   * until the final run of show is confirmed.
   */
  slot: { pitchMinutes: 3, panelMinutes: 5, transitionMinutes: 2 },
  /** Four industry blocks of roughly ten candidates is the broader plan; a smaller pilot is also under consideration. */
  industryBlocks: 4,
};

export type EventStatus =
  | "draft"
  | "announced"
  | "registration_open"
  | "registration_closed"
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled";

export const PUBLIC_EVENT_STATUSES: EventStatus[] = ["announced", "registration_open", "registration_closed", "upcoming", "live", "completed", "cancelled"];

/**
 * Inclusions are taken from the reference page's terms ("lunch and goodies for
 * all attendees"). FLAGGED: operational confirmation required before publishing
 * anything beyond food.
 */
export const inclusions = {
  both: ["Food included"],
  candidate: ["Panel review and guidance for every candidate"],
  /** Reference mentions goodies; unconfirmed, so it is not shown publicly. */
  unconfirmed: ["Goodies for all attendees"],
};

