import { recordWebhookEvent, settleOrder, verifyWebhookSignature } from "@/lib/payments";
import { json } from "@/lib/security";

export const runtime = "nodejs";

interface RazorpayEvent {
  event: string;
  payload?: { payment?: { entity?: { id: string; order_id: string; amount: number; status: string } } };
}

/** Signed webhook. The raw body is verified before anything is parsed. */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) return json({ error: "invalid_signature" }, 400);

  let evt: RazorpayEvent;
  try {
    evt = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const eventId = req.headers.get("x-razorpay-event-id");
  if (!eventId) return json({ error: "missing_event_id" }, 400);

  // Duplicate delivery: acknowledge without reprocessing.
  const firstTime = await recordWebhookEvent(eventId, evt.event, evt);
  if (!firstTime) return json({ ok: true, duplicate: true });

  const p = evt.payload?.payment?.entity;
  if ((evt.event === "payment.captured" || evt.event === "order.paid") && p && p.status === "captured") {
    const result = await settleOrder({ providerOrderId: p.order_id, providerPaymentId: p.id, paidPaise: p.amount });
    if (result === "amount_mismatch") console.error("[webhook] amount mismatch for", p.order_id);
  }
  return json({ ok: true });
}
