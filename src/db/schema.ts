import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/* -------------------------------- Events -------------------------------- */

export const events = pgTable("events", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  edition: text("edition"),
  /** draft | announced | registration_open | registration_closed | upcoming | live | completed | cancelled */
  status: text("status").notNull().default("draft"),
  summary: text("summary"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  venueName: text("venue_name"),
  venueAddress: text("venue_address"),
  mapUrl: text("map_url"),
  capacity: integer("capacity"),
  showCapacity: boolean("show_capacity").notNull().default(false),
  agenda: jsonb("agenda").$type<{ time: string; title: string }[]>().default([]),
  rules: jsonb("rules").$type<string[]>().default([]),
  studentTicketsOpen: boolean("student_tickets_open").notNull().default(false),
  audienceTicketsOpen: boolean("audience_tickets_open").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------- Student applications -------------------------- */

export const studentApplications = pgTable(
  "student_applications",
  {
    id: id(),
    ref: text("ref").notNull().unique(),
    eventId: uuid("event_id").references(() => events.id),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    college: text("college").notNull(),
    course: text("course").notNull(),
    gradYear: integer("grad_year").notNull(),
    industry: text("industry").notNull(),
    skills: text("skills").notNull(),
    portfolioUrl: text("portfolio_url"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    pitchSummary: text("pitch_summary").notNull(),
    experience: text("experience"),
    resumeKey: text("resume_key"),
    resumeName: text("resume_name"),
    /** submitted | screening | shortlisted | waitlisted | declined | withdrawn */
    status: text("status").notNull().default("submitted"),
    adminNotes: text("admin_notes"),
    // Consents are separate and individually recorded.
    consentTerms: boolean("consent_terms").notNull(),
    consentPrivacy: boolean("consent_privacy").notNull(),
    consentFilming: boolean("consent_filming").notNull().default(false),
    consentPublishPitch: boolean("consent_publish_pitch").notNull().default(false),
    consentShowNameCollege: boolean("consent_show_name_college").notNull().default(false),
    consentPromoClips: boolean("consent_promo_clips").notNull().default(false),
    consentRecordedAt: timestamp("consent_recorded_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("student_email_idx").on(t.email), index("student_status_idx").on(t.status)],
);

/* ------------------------------ Audience --------------------------------- */

export const audienceOrders = pgTable(
  "audience_orders",
  {
    id: id(),
    ref: text("ref").notNull().unique(),
    eventId: uuid("event_id").references(() => events.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    quantity: integer("quantity").notNull(),
    attendeeNames: jsonb("attendee_names").$type<string[]>().notNull().default([]),
    unitAmount: integer("unit_amount").notNull(),
    totalAmount: integer("total_amount").notNull(),
    currency: text("currency").notNull().default("INR"),
    /** pending | paid | failed | cancelled | refunded */
    status: text("status").notNull().default("pending"),
    /** Unguessable token that gates the public ticket page. */
    accessToken: text("access_token").notNull(),
    providerOrderId: text("provider_order_id").unique(),
    providerPaymentId: text("provider_payment_id"),
    consentTerms: boolean("consent_terms").notNull(),
    consentPrivacy: boolean("consent_privacy").notNull(),
    consentFilming: boolean("consent_filming").notNull().default(false),
    createdAt: createdAt(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("order_email_idx").on(t.email)],
);

export const tickets = pgTable("tickets", {
  id: id(),
  code: text("code").notNull().unique(),
  orderId: uuid("order_id").notNull().references(() => audienceOrders.id, { onDelete: "cascade" }),
  holderName: text("holder_name").notNull(),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** One row per provider webhook event id: duplicate deliveries are no-ops. */
export const paymentEvents = pgTable("payment_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  payload: jsonb("payload").notNull(),
  receivedAt: createdAt(),
});

/* -------------------------- Waitlists & enquiries ------------------------ */

export const waitlist = pgTable(
  "waitlist",
  {
    id: id(),
    kind: text("kind").notNull(), // audience | student | updates
    name: text("name"),
    email: text("email").notNull(),
    phone: text("phone"),
    consentContact: boolean("consent_contact").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("waitlist_email_kind").on(t.email, t.kind)],
);

export const companyEnquiries = pgTable("company_enquiries", {
  id: id(),
  ref: text("ref").notNull().unique(),
  organization: text("organization").notNull(),
  contactName: text("contact_name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  industry: text("industry").notNull(),
  functions: text("functions").notNull(),
  openings: integer("openings"),
  mode: text("mode").notNull(), // onsite | remote | hybrid
  compensation: text("compensation"),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: createdAt(),
});

export const collegeEnquiries = pgTable("college_enquiries", {
  id: id(),
  ref: text("ref").notNull().unique(),
  institution: text("institution").notNull(),
  city: text("city").notNull(),
  contactName: text("contact_name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  studentCount: integer("student_count"),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: createdAt(),
});

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: createdAt(),
});

/* ----------------------------- Media & people ---------------------------- */

export const episodes = pgTable(
  "episodes",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    /** episode (show) | podcast | clip */
    kind: text("kind").notNull().default("episode"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    season: integer("season"),
    number: integer("number"),
    industry: text("industry"),
    durationSec: integer("duration_sec"),
    releaseDate: timestamp("release_date", { withTimezone: true }),
    youtubeId: text("youtube_id"),
    spotifyUrl: text("spotify_url"),
    thumbnailUrl: text("thumbnail_url"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    /** Only people who have given publication consent. */
    guests: jsonb("guests").$type<{ name: string; role?: string }[]>().notNull().default([]),
    transcript: text("transcript"),
    relatedSlugs: jsonb("related_slugs").$type<string[]>().notNull().default([]),
    /** draft | scheduled | published | archived */
    publication: text("publication").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("episodes_pub_idx").on(t.publication, t.kind)],
);

export const panelists = pgTable("panelists", {
  id: id(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  industry: text("industry"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  /** Must be true (written confirmation) before anything shows publicly. */
  confirmed: boolean("confirmed").notNull().default(false),
  publication: text("publication").notNull().default("draft"),
  createdAt: createdAt(),
});

export const partners = pgTable("partners", {
  id: id(),
  name: text("name").notNull(),
  industry: text("industry"),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  verified: boolean("verified").notNull().default(false),
  publication: text("publication").notNull().default("draft"),
  createdAt: createdAt(),
});

export const auditLog = pgTable("audit_log", {
  id: id(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  meta: jsonb("meta"),
  createdAt: createdAt(),
});

export const STUDENT_STATUSES = ["submitted", "screening", "shortlisted", "waitlisted", "declined", "withdrawn"] as const;
export const ORDER_STATUSES = ["pending", "paid", "failed", "cancelled", "refunded"] as const;
export const PUBLICATION_STATES = ["draft", "scheduled", "published", "archived"] as const;
