import type { Metadata } from "next";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
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
      lede="No event has been held, so there are no participant journeys, placement figures or testimonials, and we won’t make any up."
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="prose-arena">
          <h2>What will appear here</h2>
          <p>Participant stories, told with their permission. Outcomes such as internship offers will be listed only when the student and the company have both confirmed them.</p>
          <h2>What will not</h2>
          <p>Aggregated claims like “X placements” unless every unit behind the number can be verified, and any quote the speaker hasn’t approved.</p>
        </div>
        <div className="glass glass-frost h-fit max-w-md p-8 [--r:1.6rem]">
          <p className="eyebrow mb-4">Hear when the first stories land</p>
          <WaitlistForm kind="updates" cta="Notify me" note="participant stories and event announcements" />
        </div>
      </div>
    </PageShell>
  );
}
