import { getDb, schema } from "@/db/client";
import { REGISTRATION_CLOSED_MESSAGE, registrationAccepting } from "@/lib/registration-mode";
import { guard, json, readJson } from "@/lib/security";
import { fieldErrors, waitlistSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = await guard(req, "waitlist", 6);
  if (blocked) return blocked;
  if (!registrationAccepting()) return json({ error: "closed", message: REGISTRATION_CLOSED_MESSAGE }, 403);
  const parsed = waitlistSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const db = await getDb();
  // Same email + kind twice is fine: idempotent, and reveals nothing about who is on the list.
  await db.insert(schema.waitlist).values(parsed.data).onConflictDoNothing();
  return json({ ok: true }, 201);
}
