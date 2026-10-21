import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { usesSharedStore } from "@/lib/rate-limit";
import { registrationMode } from "@/lib/registration-mode";
import { storageDriverName } from "@/lib/storage";
import { paymentsConfigured } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Smoke-test endpoint. Reports whether the database answers and which safety modes are on. It never reveals secrets,
 * connection strings, row counts or personal data.
 */
export async function GET() {
  let database: "ok" | "unavailable" = "ok";
  try {
    await (await getDb()).execute(sql`select 1`);
  } catch {
    database = "unavailable";
  }
  return Response.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      database,
      registrationMode: registrationMode(),
      paymentsCollecting: paymentsConfigured(),
      rateLimitStore: usesSharedStore() ? "postgres" : "memory",
      fileStorage: storageDriverName(),
    },
    { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
