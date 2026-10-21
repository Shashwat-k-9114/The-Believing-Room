import { getDb, schema } from "@/db/client";
import { guard, json, readJson } from "@/lib/security";
import { contactSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = await guard(req, "contact", 5);
  if (blocked) return blocked;
  const parsed = contactSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const db = await getDb();
  await db.insert(schema.contactMessages).values(parsed.data);
  return json({ ok: true }, 201);
}
