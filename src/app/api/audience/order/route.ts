import { paymentsConfigured, priceBreakdown, pricing } from "@/config/site";
import { getDb, schema } from "@/db/client";
import { createProviderOrder } from "@/lib/payments";
import { openAudienceEvent } from "@/lib/queries";
import { guard, json, makeRef, makeToken, readJson } from "@/lib/security";
import { audienceSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = guard(req, "order", 5);
  if (blocked) return blocked;

  // Truthful unavailability: never fabricate a purchase.
  const event = await openAudienceEvent();
  if (!paymentsConfigured() || !event) {
    return json(
      {
        error: "unavailable",
        message: !event
          ? "Audience tickets are not on sale yet. Join the waitlist and we will write to you."
          : "Online payment is not enabled yet. Join the waitlist and we will write to you.",
      },
      503,
    );
  }

  const raw = await readJson(req);
  const parsed = audienceSchema.safeParse(raw);
  if (!parsed.success) return json({ error: "validation", fields: fieldErrors(parsed.error) }, 422);
  const d = parsed.data;

  // Price is always computed on the server from config. Client amounts are ignored.
  const { total } = priceBreakdown("audience", d.quantity);
  const db = await getDb();
  const ref = makeRef("TBR-A");
  const accessToken = makeToken();

  let providerOrder;
  try {
    providerOrder = await createProviderOrder(total, ref);
  } catch (e) {
    console.error("[order] provider error", (e as Error).message);
    return json({ error: "provider", message: "Payment provider is unreachable. You have not been charged. Please try again shortly." }, 502);
  }

  await db.insert(schema.audienceOrders).values({
    ref,
    eventId: event.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    quantity: d.quantity,
    attendeeNames: d.attendeeNames,
    unitAmount: pricing.audience.amount,
    totalAmount: total,
    accessToken,
    providerOrderId: providerOrder.id,
    consentTerms: d.consentTerms,
    consentPrivacy: d.consentPrivacy,
    consentFilming: d.consentFilming,
  });

  return json({
    ok: true,
    ref,
    token: accessToken,
    providerOrderId: providerOrder.id,
    amountPaise: total * 100,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
