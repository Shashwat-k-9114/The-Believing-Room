/**
 * Single source of truth for brand, pricing, event state and external links.
 * Anything `null` is UNCONFIRMED. UI must render a truthful "coming soon"
 * state for it, never an invented value.
 */

export const brand = {
  /** Provisional name. Change here to rebrand. */
  name: "The Internship Arena",
  shortName: "The Arena",
  wordmark: ["THE INTERNSHIP", "ARENA"] as const,
  tagline: "Your potential. In full view.",
  description:
    "A live pitching stage where ambitious students present their abilities to industry panels and compete for real internship conversations. Four industries. One stage.",
  locale: "en-IN",
  /** Set NEXT_PUBLIC_SITE_URL in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
  social: {
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL ?? null,
  },
  podcast: {
    /** Provisional series title. Not a confirmed identity. */
    name: "Before the Offer",
    youtubePlaylistUrl: process.env.NEXT_PUBLIC_PODCAST_PLAYLIST_URL ?? null,
    spotifyUrl: null as string | null,
    applePodcastsUrl: null as string | null,
  },
};

/** Whole-rupee prices. Never hardcode a price anywhere else. */
export const pricing = {
  currency: "INR",
  student: { label: "Student Pass", amount: 500 },
  audience: { label: "Audience Pass", amount: 300 },
  foodIncluded: true,
  /** Percentages applied on top of the base amount. */
  gstPercent: 0,
  platformFeePercent: 0,
  maxAudienceQuantity: 6,
  /**
   * Business rule awaiting organiser confirmation: the Student Pass is
   * collected only after a student is shortlisted, so nobody pays for a
   * stage that has not been confirmed. Applying is free.
   */
  studentPaymentStage: "after_shortlist" as "after_shortlist" | "at_application",
};

export type PassKind = "student" | "audience";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceBreakdown(kind: PassKind, quantity = 1) {
  const unit = pricing[kind].amount;
  const subtotal = unit * quantity;
  const fee = Math.round((subtotal * pricing.platformFeePercent) / 100);
  const gst = Math.round(((subtotal + fee) * pricing.gstPercent) / 100);
  return { unit, quantity, subtotal, fee, gst, total: subtotal + fee + gst };
}

export type EventStatus =
  | "draft"
  | "announced"
  | "registration_open"
  | "registration_closed"
  | "upcoming"
  | "live"
  | "completed"
  | "cancelled";

/** Statuses visible on the public site. Others stay hidden. */
export const PUBLIC_EVENT_STATUSES: EventStatus[] = [
  "announced",
  "registration_open",
  "registration_closed",
  "upcoming",
  "live",
  "completed",
  "cancelled",
];

export function paymentsConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export const inclusions = [
  "Meals included",
  "Entry to the live pitching floor",
  "A seat for every panel round",
];

export const studentApplicationsOpen = true;
