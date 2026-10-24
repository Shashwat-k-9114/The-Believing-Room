import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { FactCards } from "@/components/layout/FactCards";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Stories",
  description: "Participant journeys and verified outcomes, published only when they exist and with permission.",
  alternates: { canonical: "/stories" },
};

export default function Stories() {
  return (
    <PageShell
      eyebrow="Stories"
      title={<>Outcomes, <em>once there are any.</em></>}
      lede="No event has been held yet, so there are no stories, placement figures or testimonials. We won’t make any up."
      art="stories"
    >
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="grid gap-4">
          <FactCards
            cols={2}
            items={[
              { icon: Check, title: "Will appear", body: "Participant stories, with permission. Offers only once the student and the company both confirm." },
              { icon: X, title: "Will not appear", body: "Placement totals we cannot verify, or any quote the speaker has not approved." },
            ]}
          />
        </div>
        <div className="glass glass-frost h-fit max-w-md p-8 [--r:1.6rem]">
          <p className="eyebrow mb-4">Hear when the first stories land</p>
          <WaitlistForm kind="updates" cta="Notify me" note="participant stories and event announcements" />
        </div>
      </div>
    </PageShell>
  );
}
