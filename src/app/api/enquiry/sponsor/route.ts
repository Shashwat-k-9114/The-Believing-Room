import { brand } from "@/config/site";
import { getDb, schema } from "@/db/client";
import { sendMail, sponsorEnquiryOrganiserMail, sponsorEnquiryReceiptMail } from "@/lib/email";
import { guard, json, makeRef, readJson } from "@/lib/security";
import { fieldErrors, sponsorSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = await guard(req, "sponsor", 5);
  if (blocked) return blocked;
  const parsed = sponsorSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);

  const ref = makeRef("TBR-S");
  const db = await getDb();
  await db.insert(schema.sponsorEnquiries).values({ ...parsed.data, ref });

  // The enquiry is saved first; mail is best-effort and reported honestly.
  const [toTeam, toSender] = await Promise.all([
    sendMail(sponsorEnquiryOrganiserMail(parsed.data, ref, brand.contactEmail)),
    sendMail(sponsorEnquiryReceiptMail(parsed.data.contactName, ref, parsed.data.email)),
  ]);
  return json({ ok: true, ref, receiptEmailed: toSender.sent, teamNotified: toTeam.sent }, 201);
}
