ALTER TABLE "audience_orders" ADD COLUMN "kind" text DEFAULT 'audience' NOT NULL;--> statement-breakpoint
ALTER TABLE "audience_orders" ADD COLUMN "application_id" uuid;--> statement-breakpoint
ALTER TABLE "student_applications" ADD COLUMN "pay_token" text;--> statement-breakpoint
ALTER TABLE "audience_orders" ADD CONSTRAINT "audience_orders_application_id_student_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."student_applications"("id") ON DELETE set null ON UPDATE no action;