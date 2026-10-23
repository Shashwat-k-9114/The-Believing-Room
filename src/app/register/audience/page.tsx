import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { AudienceForm } from "@/components/forms/AudienceForm";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Audience tickets",
  description: `Audience ticket ${formatINR(pricing.audience.amount)}, food included. Watch live student pitches and industry panels.`,
  alternates: { canonical: "/register/audience" },
};

export default function AudienceRegistration() {
  return (
    <PageShell
      eyebrow="Audience"
      title={<>Be in <em>the room.</em></>}
      lede={`${formatINR(pricing.audience.amount)} per ticket, food included. Watch students pitch live and see how industry panels question them. Entry and food only: a ticket is not a route to selection or an internship.`}
    >
      <AudienceForm />
    </PageShell>
  );
}
