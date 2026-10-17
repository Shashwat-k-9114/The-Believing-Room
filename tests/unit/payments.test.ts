import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { hmacHex } from "@/lib/security";
import {
  recordWebhookEvent,
  settleOrder,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "@/lib/payments";

async function seedOrder(providerOrderId: string, quantity = 2, total = 600) {
  const db = await getDb();
  const [o] = await db
    .insert(schema.audienceOrders)
    .values({
      ref: `T-${providerOrderId}`,
      name: "Test Buyer",
      email: "buyer@example.com",
      phone: "9876543210",
      quantity,
      attendeeNames: ["A One", "B Two"],
      unitAmount: 300,
      totalAmount: total,
      accessToken: "tok",
      providerOrderId,
      consentTerms: true,
      consentPrivacy: true,
      consentFilming: true,
    })
    .returning();
  return o;
}

describe("signatures", () => {
  it("accepts a correct checkout signature and rejects tampering", () => {
    const sig = hmacHex("unit_secret", "order_1|pay_1");
    expect(verifyCheckoutSignature("order_1", "pay_1", sig)).toBe(true);
    expect(verifyCheckoutSignature("order_1", "pay_2", sig)).toBe(false);
    expect(verifyCheckoutSignature("order_1", "pay_1", "deadbeef")).toBe(false);
  });

  it("verifies webhook signatures over the raw body", () => {
    const body = '{"event":"payment.captured"}';
    const sig = hmacHex("unit_webhook_secret", body);
    expect(verifyWebhookSignature(body, sig)).toBe(true);
    expect(verifyWebhookSignature(body + " ", sig)).toBe(false);
    expect(verifyWebhookSignature(body, "")).toBe(false);
  });
});

describe("settleOrder", () => {
  beforeAll(async () => {
    await getDb();
  });

  it("marks paid once and issues exactly one ticket per seat, even when delivered repeatedly", async () => {
    await seedOrder("order_idem");
    const input = { providerOrderId: "order_idem", providerPaymentId: "pay_idem", paidPaise: 60000 };
    expect(await settleOrder(input)).toBe("paid");
    expect(await settleOrder(input)).toBe("already_paid");
    expect(await Promise.all([settleOrder(input), settleOrder(input)])).toEqual(["already_paid", "already_paid"]);

    const db = await getDb();
    const [order] = await db.select().from(schema.audienceOrders).where(eq(schema.audienceOrders.providerOrderId, "order_idem"));
    const tix = await db.select().from(schema.tickets).where(eq(schema.tickets.orderId, order.id));
    expect(order.status).toBe("paid");
    expect(tix).toHaveLength(2);
    expect(new Set(tix.map((t) => t.code)).size).toBe(2);
    expect(tix.map((t) => t.holderName).sort()).toEqual(["A One", "B Two"]);
  });

  it("refuses to settle when the paid amount differs from the stored total", async () => {
    await seedOrder("order_short");
    expect(await settleOrder({ providerOrderId: "order_short", providerPaymentId: "pay_x", paidPaise: 100 })).toBe("amount_mismatch");
    const db = await getDb();
    const [o] = await db.select().from(schema.audienceOrders).where(eq(schema.audienceOrders.providerOrderId, "order_short"));
    expect(o.status).toBe("failed");
    const tix = await db.select().from(schema.tickets).where(eq(schema.tickets.orderId, o.id));
    expect(tix).toHaveLength(0);
  });

  it("ignores unknown orders", async () => {
    expect(await settleOrder({ providerOrderId: "nope", providerPaymentId: "p", paidPaise: 1 })).toBe("unknown_order");
  });
});

describe("webhook idempotency", () => {
  it("accepts an event id once and flags duplicates", async () => {
    expect(await recordWebhookEvent("evt_1", "payment.captured", { a: 1 })).toBe(true);
    expect(await recordWebhookEvent("evt_1", "payment.captured", { a: 1 })).toBe(false);
  });
});
