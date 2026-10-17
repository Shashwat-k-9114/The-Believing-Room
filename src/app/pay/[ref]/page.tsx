import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { formatINR, paymentsConfigured, pricing } from "@/config/site";
import { getDb, schema } from "@/db/client";
import { safeEqual } from "@/lib/security";
import { PayCandidate } from "@/components/forms/PayCandidate";
import { PageShell } from "@/components/layout/PageShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your candidate ticket", robots: { index: false, follow: false } };

export default async function PayPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ k?: string }> }) {
  const { ref } = await params;
  const { k } = await searchParams;
  const db = await getDb();
  const [app] = await db.select().from(schema.studentApplications).where(eq(schema.studentApplications.ref, ref));
  if (!app || app.deletedAt || !app.payToken || !k || !safeEqual(k, app.payToken))
    return <PageShell eyebrow="Candidate ticket" title="Link not valid." lede="Check the link in your email. This page is only available to the person who holds the private link." />;

  const [paid] = await db
    .select()
    .from(schema.audienceOrders)
    .where(and(eq(schema.audienceOrders.applicationId, app.id), eq(schema.audienceOrders.status, "paid")))
    .limit(1);
  if (paid)
    return (
      <PageShell eyebrow={`Application ${app.ref}`} title={<>Your place is <em>confirmed.</em></>} lede="Payment is verified. Your ticket is ready; show its QR code at entry. Selection for a live pitch and any offer remain the panel’s decision.">
        <Link className="link-u" href={`/tickets/${paid.ref}?k=${paid.accessToken}`}>Open your ticket</Link>
      </PageShell>
    );

  const canPay = pricing.candidatePaymentStage === "at_application" ? !["declined", "withdrawn"].includes(app.status) : app.status === "shortlisted";
  return (
    <PageShell
      eyebrow={`Application ${app.ref}`}
      title={canPay ? <>Confirm your <em>place.</em></> : <>Not yet <em>shortlisted.</em></>}
      lede={canPay ? `The candidate ticket is ${formatINR(pricing.candidate.amount)}, food included. It confirms your place; it does not guarantee a live slot outcome or an offer, which depend entirely on the panel’s decision.` : "Payment opens once your application is shortlisted. We will email you. Nothing is due now."}
    >
      {canPay && (paymentsConfigured() ? <PayCandidate appRef={app.ref} token={k} name={app.fullName} /> : <p className="max-w-[56ch] text-[var(--fg-dim)]">Online payment has not been switched on yet, so there is nothing to pay at the moment. You will be emailed when it opens. No payment is taken on this page until then.</p>)}
    </PageShell>
  );
}
