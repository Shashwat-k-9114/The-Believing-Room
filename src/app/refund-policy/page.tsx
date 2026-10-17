import type { Metadata } from "next";
import { DraftNotice, PageShell, Prose } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Refund and cancellation policy", description: "When tickets can be refunded, and what happens if an event is changed or cancelled.", alternates: { canonical: "/refund-policy" } };

export default function Refunds() {
  return (
    <PageShell eyebrow="Legal" title={<>Refunds and <em>cancellations.</em></>} lede="A draft policy, published early so you can see the intent before any ticket is sold.">
      <DraftNotice>The specific windows below are proposals and must be confirmed by the organisers and reviewed by counsel before ticket sales open.</DraftNotice>
      <Prose>
        <h2>If we cancel</h2>
        <p>If the organisers cancel an event, every ticket for it is refunded in full to the original payment method.</p>
        <h2>If we reschedule</h2>
        <p>If the date changes materially, you may keep your ticket for the new date or request a full refund within 7 days of the announcement.</p>
        <h2>If you can’t attend</h2>
        <p>Proposed: refunds are available up to 7 days before the event; after that, tickets are non-refundable but may be transferred to another person by writing to us.</p>
        <h2>Student Pass</h2>
        <p>The Student Pass is requested only after shortlisting. If you decline a confirmed place within the window stated in your shortlisting email, it is refunded in full. A pass is not refunded because a panel or company did not offer an internship, since the pass never promised one.</p>
        <h2>Failed or duplicate payments</h2>
        <p>If a payment fails, you aren’t charged for tickets. Duplicate payments for the same order are refunded. Payment confirmation is verified with the payment provider before tickets are issued.</p>
        <h2>How to ask</h2>
        <p>Use the <a href="/contact">contact page</a> with your order reference.</p>
      </Prose>
    </PageShell>
  );
}
