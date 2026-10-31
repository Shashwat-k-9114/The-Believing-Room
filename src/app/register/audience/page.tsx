import type { Metadata } from "next";
import { AudienceForm } from "@/components/forms/AudienceForm";
import { PageShell } from "@/components/layout/PageShell";
import { registration } from "@/config/site";
import { ShowFlow, type FlowStep } from "@/components/sections/ShowFlow";

export const metadata: Metadata = {
  title: "Audience tickets",
  description: "Audience tickets are free, food and goodies included. Watch live student pitches and industry panels.",
  alternates: { canonical: "/register/audience" },
};

const STEPS: FlowStep[] = [
  { t: "Register interest", d: "Nothing is charged now.", icon: "ticket" },
  { t: "Get the details", d: "We email the date and venue.", icon: "mail" },
  { t: "Arrive and eat", d: "Food is included.", icon: "meal" },
  { t: "Watch live", d: "See how panels question.", icon: "watch" },
];

export default function AudienceRegistration() {
  return (
    <PageShell
      eyebrow="Audience"
      title={<>Be in <em>the room.</em></>}
      lede="Free tickets, food and goodies included. Entry, food and goodies only: a ticket is not a route to selection or an internship."
      art="audience"
    >
      {registration.audienceOpen ? (
        <>
          <div className="mb-16"><ShowFlow steps={STEPS} compact label="How audience tickets work" /></div>
          <AudienceForm />
        </>
      ) : (
        <div role="status" className="glass glass-frost mx-auto max-w-3xl p-8 sm:p-10 [--r:1.6rem]">
          <p className="eyebrow">Paused</p>
          <h2 className="display mt-3 text-4xl">Audience registration is paused.</h2>
          <p className="mt-4 text-[var(--fg-dim)]">We aren’t taking audience registrations right now. Follow our channels for when it reopens.</p>
        </div>
      )}
    </PageShell>
  );
}
