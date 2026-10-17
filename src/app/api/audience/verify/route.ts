import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { sendMail, ticketMail } from "@/lib/email";
import { settleOrder, verifyCheckoutSignature } from "@/lib/payments";
import { brand } from "@/config/site";
import { guard, json, readJson } from "@/lib/security";
import { z } from "zod";

export const runtime = "nodejs";

const body = z.object({
  providerOrderId: z.string().min(5).max(80),
  providerPaymentId: z.string().min(5).max(80),
  signature: z.string().min(10).max(200),
});

/**
 * Called after Razorpay Checkout returns. The browser's claim is worthless on
 * its own: we recompute the HMAC with our secret. Only a valid signature
 * settles the order. The webhook is the independent second path.
 */
export async function POST(req: Request) {
  const blocked = guard(req, "verify", 10);
  if (blocked) return blocked;
  const parsed = body.safeParse(await readJson(req));
  if (!parsed.success) return json({ error: "bad_request" }, 400);
  const { providerOrderId, providerPaymentId, signature } = parsed.data;

  if (!verifyCheckoutSignature(providerOrderId, providerPaymentId, signature))
    return json({ error: "invalid_signature", message: "We could not verify this payment." }, 400);

  const db = await getDb();
  const [order] = await db.select().from(schema.audienceOrders).where(eq(schema.audienceOrders.providerOrderId, providerOrderId));
  if (!order) return json({ error: "unknown_order" }, 404);

  const result = await settleOrder({ providerOrderId, providerPaymentId, paidPaise: order.totalAmount * 100 });
  if (result === "paid") {
    void sendMail(ticketMail(order.name, order.ref, `${brand.url}/tickets/${order.ref}?k=${order.accessToken}`, order.email));
  }
  return json({ ok: true, ref: order.ref, token: order.accessToken });
}
