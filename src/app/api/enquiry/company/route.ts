import { getDb, schema } from "@/db/client";
import { guard, json, makeRef, readJson } from "@/lib/security";
import { companySchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = await guard(req, "company", 5);
  if (blocked) return blocked;
  const parsed = companySchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const ref = makeRef("TBR-R");
  const db = await getDb();
  await db.insert(schema.companyEnquiries).values({ ...parsed.data, ref });
  return json({ ok: true, ref }, 201);
}
