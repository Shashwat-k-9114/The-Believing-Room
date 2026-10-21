CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"window_start" bigint NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"expires_at" bigint NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
--> statement-breakpoint
CREATE TABLE "stored_files" (
	"key" text PRIMARY KEY NOT NULL,
	"bytes" "bytea" NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limits_expires_idx" ON "rate_limits" USING btree ("expires_at");