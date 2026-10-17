import { getDb, schema } from "@/db/client";
import { guard, json, readJson } from "@/lib/security";
import { fieldErrors, waitlistSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = guard(req, "waitlist", 6);
  if (blocked) return blocked;
  const parsed = waitlistSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const db = await getDb();
  // Same email + kind twice is fine: idempotent, and reveals nothing about who is on the list.
  await db.insert(schema.waitlist).values(parsed.data).onConflictDoNothing();
  return json({ ok: true }, 201);
}
