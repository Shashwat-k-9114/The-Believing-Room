import { getDb, schema } from "@/db/client";
import { guard, json, makeRef, readJson } from "@/lib/security";
import { collegeSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = guard(req, "college", 5);
  if (blocked) return blocked;
  const parsed = collegeSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const ref = makeRef("TBR-U");
  const db = await getDb();
  await db.insert(schema.collegeEnquiries).values({ ...parsed.data, ref });
  return json({ ok: true, ref }, 201);
}
