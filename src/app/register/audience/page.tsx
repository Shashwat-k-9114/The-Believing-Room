import type { Metadata } from "next";
import { formatINR, paymentsConfigured, pricing } from "@/config/site";
import { openAudienceEvent } from "@/lib/queries";
import { AudienceForm } from "@/components/forms/AudienceForm";
import { PageShell } from "@/components/layout/PageShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Audience tickets",
  description: `Audience ticket ${formatINR(pricing.audience.amount)}, food included. Watch live student pitches and industry panels.`,
  alternates: { canonical: "/register/audience" },
};

export default async function AudienceRegistration() {
  const event = await openAudienceEvent();
  const configured = paymentsConfigured();
  const available = Boolean(event) && configured;
  const reason = !event
    ? "There is no confirmed event with ticket sales open yet."
    : "Online payments haven’t been switched on for this event yet.";
  return (
    <PageShell
      eyebrow="Audience"
      title={<>Be in <em>the room.</em></>}
      lede={`${formatINR(pricing.audience.amount)} per ticket, food included. Watch students pitch live and see how industry panels question them. Entry and food only: a ticket is not a route to selection or an internship.`}
    >
      <AudienceForm available={available} unavailableReason={reason} />
    </PageShell>
  );
}
