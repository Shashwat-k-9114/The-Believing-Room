import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { paymentsConfigured, priceBreakdown, pricing } from "@/config/site";
import { getDb, schema } from "@/db/client";
import { createProviderOrder } from "@/lib/payments";
import { guard, json, makeRef, makeToken, readJson, safeEqual } from "@/lib/security";

export const runtime = "nodejs";

const body = z.object({ ref: z.string().min(5).max(30), token: z.string().min(10).max(80) });

/**
 * Starts payment of the candidate ticket for ONE application. Authorised by the private
 * pay token. The amount is always computed here from config, and the order is only created
 * for a candidate who is allowed to pay (shortlisted, or any open application if the owner
 * has chosen to collect at registration). Payment is confirmed solely by the verified
 * checkout callback or the signed webhook.
 */
export async function POST(req: Request) {
  const blocked = await guard(req, "cand-pay", 6);
  if (blocked) return blocked;
  if (!paymentsConfigured())
    return json({ error: "unavailable", message: "Online payment is not enabled yet. Nothing has been charged. We will email you when it opens." }, 503);

  const parsed = body.safeParse(await readJson(req, 2000));
  if (!parsed.success) return json({ error: "bad_request" }, 400);
  const { ref, token } = parsed.data;

  const db = await getDb();
  const [app] = await db.select().from(schema.studentApplications).where(eq(schema.studentApplications.ref, ref));
  // One answer for unknown ref and wrong token.
  if (!app || app.deletedAt || !app.payToken || !safeEqual(token, app.payToken)) return json({ error: "not_found", message: "This payment link is not valid." }, 404);

  const allowed = pricing.candidatePaymentStage === "at_application" ? !["declined", "withdrawn"].includes(app.status) : app.status === "shortlisted";
  if (!allowed) return json({ error: "not_allowed", message: "You can pay once your application has been shortlisted." }, 403);

  const existing = await db
    .select({ id: schema.audienceOrders.id })
    .from(schema.audienceOrders)
    .where(and(eq(schema.audienceOrders.applicationId, app.id), eq(schema.audienceOrders.status, "paid")));
  if (existing.length) return json({ error: "already_paid", message: "Your candidate ticket is already paid." }, 409);

  const { total } = priceBreakdown("candidate", 1);
  const orderRef = makeRef("TBR-P");
  let providerOrder;
  try {
    providerOrder = await createProviderOrder(total, orderRef);
  } catch (e) {
    console.error("[candidate-pay] provider error", (e as Error).message);
    return json({ error: "provider", message: "The payment provider is unreachable. You have not been charged. Please try again shortly." }, 502);
  }

  const accessToken = makeToken();
  await db.insert(schema.audienceOrders).values({
    ref: orderRef,
    kind: "candidate",
    applicationId: app.id,
    name: app.fullName,
    email: app.email,
    phone: app.phone,
    quantity: 1,
    attendeeNames: [app.fullName],
    unitAmount: pricing.candidate.amount,
    totalAmount: total,
    accessToken,
    providerOrderId: providerOrder.id,
    consentTerms: app.consentTerms,
    consentPrivacy: app.consentPrivacy,
    consentFilming: app.consentFilming,
  });

  return json({ ok: true, ref: orderRef, token: accessToken, providerOrderId: providerOrder.id, amountPaise: total * 100, keyId: process.env.RAZORPAY_KEY_ID });
}
