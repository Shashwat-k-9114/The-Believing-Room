CREATE TABLE "education_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"course" text,
	"eligibility" text,
	"access_period" text,
	"certificate_terms" text,
	"quantity" text,
	"terms_confirmed" boolean DEFAULT false NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"industry" text,
	"role_title" text NOT NULL,
	"openings" integer,
	"stipend" text,
	"location" text,
	"duration" text,
	"work_mode" text,
	"eligibility" text,
	"selection_process" text,
	"approved_by_company" boolean DEFAULT false NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"role" text,
	"description" text,
	"website_url" text,
	"industry" text,
	"confirmation_status" text DEFAULT 'pending' NOT NULL,
	"evidence_ref" text,
	"announcement_approved" boolean DEFAULT false NOT NULL,
	"logo_path" text,
	"logo_permission" text DEFAULT 'none' NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref" text NOT NULL,
	"organization" text NOT NULL,
	"contact_name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"interest" text NOT NULL,
	"category" text NOT NULL,
	"budget_range" text,
	"message" text,
	"consent_contact" boolean NOT NULL,
	"consent_no_guarantee" boolean NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsor_enquiries_ref_unique" UNIQUE("ref")
);
--> statement-breakpoint
CREATE TABLE "sponsorship_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"public_price" text,
	"price_approved" boolean DEFAULT false NOT NULL,
	"publication" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsorship_packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "education_contributions" ADD CONSTRAINT "education_contributions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_category_idx" ON "organizations" USING btree ("category","publication");