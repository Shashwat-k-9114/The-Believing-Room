import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { hmacHex, makeRef, safeEqual } from "./security";

const API = "https://api.razorpay.com/v1";

const creds = () => ({
  keyId: process.env.RAZORPAY_KEY_ID!,
  keySecret: process.env.RAZORPAY_KEY_SECRET!,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
});

export async function createProviderOrder(amountRupees: number, receipt: string) {
  const { keyId, keySecret } = creds();
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({ amount: amountRupees * 100, currency: "INR", receipt }),
  });
  if (!res.ok) throw new Error(`provider_order_failed:${res.status}`);
  return (await res.json()) as { id: string; amount: number };
}

/** Checkout callback signature: HMAC_SHA256(order_id|payment_id, key_secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const { keySecret } = creds();
  if (!keySecret) return false;
  return safeEqual(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string, secret = creds().webhookSecret): boolean {
  if (!secret || !signature) return false;
  return safeEqual(hmacHex(secret, rawBody), signature);
}

/**
 * Idempotently marks an order paid and issues one ticket per seat.
 * Safe to call from both the checkout callback and the webhook, any number
 * of times: the first successful transition wins, later calls do nothing.
 * `paidPaise` must match the amount we stored, or the order is flagged failed.
 */
export async function settleOrder(input: {
  providerOrderId: string;
  providerPaymentId: string;
  paidPaise: number;
}): Promise<"paid" | "already_paid" | "unknown_order" | "amount_mismatch"> {
  const db = await getDb();
  const { audienceOrders, tickets } = schema;
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(audienceOrders)
      .where(eq(audienceOrders.providerOrderId, input.providerOrderId))
      .for("update");
    if (!order) return "unknown_order";
    if (order.status === "paid") return "already_paid";
    if (order.totalAmount * 100 !== input.paidPaise) {
      await tx.update(audienceOrders).set({ status: "failed" }).where(eq(audienceOrders.id, order.id));
      return "amount_mismatch";
    }
    await tx
      .update(audienceOrders)
      .set({ status: "paid", providerPaymentId: input.providerPaymentId, paidAt: new Date() })
      .where(eq(audienceOrders.id, order.id));
    const names = order.attendeeNames.length ? order.attendeeNames : [];
    const rows = Array.from({ length: order.quantity }, (_, i) => ({
      orderId: order.id,
      code: makeRef("TKT", 12),
      holderName: names[i] || order.name,
    }));
    await tx.insert(tickets).values(rows);
    return "paid";
  });
}

/** Records a webhook event id once. Returns false when it was already seen. */
export async function recordWebhookEvent(eventId: string, type: string, payload: unknown): Promise<boolean> {
  const db = await getDb();
  const inserted = await db
    .insert(schema.paymentEvents)
    .values({ id: eventId, type, payload: payload as object })
    .onConflictDoNothing()
    .returning({ id: schema.paymentEvents.id });
  return inserted.length > 0;
}
