CREATE TABLE "audience_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"event_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"quantity" integer NOT NULL,
	"attendee_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"unit_amount" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"access_token" text NOT NULL,
	"provider_order_id" text,
	"provider_payment_id" text,
	"consent_terms" boolean NOT NULL,
	"consent_privacy" boolean NOT NULL,
	"consent_filming" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "audience_orders_ref_unique" UNIQUE("ref"),
	CONSTRAINT "audience_orders_provider_order_id_unique" UNIQUE("provider_order_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "college_enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"institution" text NOT NULL,
	"city" text NOT NULL,
	"contact_name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"student_count" integer,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "college_enquiries_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "company_enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"organization" text NOT NULL,
	"contact_name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"industry" text NOT NULL,
	"functions" text NOT NULL,
	"openings" integer,
	"mode" text NOT NULL,
	"compensation" text,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_enquiries_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"kind" text DEFAULT 'episode' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"season" integer,
	"number" integer,
	"industry" text,
	"duration_sec" integer,
	"release_date" timestamp with time zone,
	"youtube_id" text,
	"spotify_url" text,
	"thumbnail_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"guests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transcript" text,
	"related_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "episodes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"edition" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"summary" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"venue_name" text,
	"venue_address" text,
	"map_url" text,
	"capacity" integer,
	"show_capacity" boolean DEFAULT false NOT NULL,
	"agenda" jsonb DEFAULT '[]'::jsonb,
	"rules" jsonb DEFAULT '[]'::jsonb,
	"student_tickets_open" boolean DEFAULT false NOT NULL,
	"audience_tickets_open" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "panelists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"industry" text,
	"bio" text,
	"photo_url" text,
	"confirmed" boolean DEFAULT false NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"website_url" text,
	"logo_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"event_id" uuid,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"college" text NOT NULL,
	"course" text NOT NULL,
	"grad_year" integer NOT NULL,
	"industry" text NOT NULL,
	"skills" text NOT NULL,
	"portfolio_url" text,
	"github_url" text,
	"linkedin_url" text,
	"pitch_summary" text NOT NULL,
	"experience" text,
	"resume_key" text,
	"resume_name" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"admin_notes" text,
	"consent_terms" boolean NOT NULL,
	"consent_privacy" boolean NOT NULL,
	"consent_filming" boolean DEFAULT false NOT NULL,
	"consent_publish_pitch" boolean DEFAULT false NOT NULL,
	"consent_show_name_college" boolean DEFAULT false NOT NULL,
	"consent_promo_clips" boolean DEFAULT false NOT NULL,
	"consent_recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "student_applications_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"order_id" uuid NOT NULL,
	"holder_name" text NOT NULL,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"phone" text,
	"consent_contact" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audience_orders" ADD CONSTRAINT "audience_orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_audience_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."audience_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_email_idx" ON "audience_orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "episodes_pub_idx" ON "episodes" USING btree ("publication","kind");--> statement-breakpoint
CREATE INDEX "student_email_idx" ON "student_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "student_status_idx" ON "student_applications" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_email_kind" ON "waitlist" USING btree ("email","kind");