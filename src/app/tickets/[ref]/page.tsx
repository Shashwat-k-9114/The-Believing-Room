import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb, schema } from "@/db/client";
import { safeEqual } from "@/lib/security";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/config/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your tickets", robots: { index: false, follow: false } };

export default async function TicketPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ k?: string }> }) {
  const { ref } = await params;
  const { k } = await searchParams;
  const db = await getDb();
  const [order] = await db.select().from(schema.audienceOrders).where(eq(schema.audienceOrders.ref, ref));
  // Same response for unknown ref and wrong token: reveals nothing.
  if (!order || !k || !safeEqual(k, order.accessToken))
    return <PageShell eyebrow="Tickets" title="Ticket not found." lede="Check the link in your confirmation email. Tickets are only shown to someone holding the private link." />;

  if (order.status !== "paid")
    return (
      <PageShell eyebrow={`Order ${order.ref}`} title={order.status === "pending" ? <>Payment <em>not confirmed yet.</em></> : <>Payment <em>unsuccessful.</em></>} lede={order.status === "pending" ? "We haven’t received confirmation from the payment provider. If you paid, this page will update automatically once it arrives; there is no need to pay again. No tickets are issued until payment is verified." : "This order was not paid, so no tickets were issued. You can place a new order."} />
    );

  const tix = await db.select().from(schema.tickets).where(eq(schema.tickets.orderId, order.id));
  const svgs = await Promise.all(tix.map((t) => QRCode.toString(t.code, { type: "svg", margin: 1, width: 220, color: { dark: "#0d0f13", light: "#ffffff" } })));

  return (
    <PageShell eyebrow={`Order ${order.ref} · Paid`} title={<>You’re <em>in.</em></>} lede="Show a QR code at entry. Food is included. Keep this link private: anyone with it can see the tickets.">
      <ul className="grid gap-6 md:grid-cols-2">
        {tix.map((t, i) => (
          <li key={t.id} className="glass glass-frost flex items-center gap-6 p-6 [--r:1.6rem]">
            <div className="shrink-0 rounded-xl bg-white p-2" role="img" aria-label={`QR code for ticket ${t.code}`} dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <div>
              <p className="eyebrow">{brand.name}</p>
              <p className="display mt-2 text-3xl">{order.kind === "candidate" ? "Candidate ticket" : "Audience ticket"}</p>
              <p className="mt-1 text-[var(--fg-dim)]">{t.holderName}</p>
              <p className="mono mt-3">{t.code}</p>
              <p className="mt-1 text-xs text-[var(--fg-faint)]">Food included · Ticket {i + 1} of {tix.length}</p>
            </div>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
