import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Reveal } from "@/components/liquid/Reveal";
import { EducationBenefit, OpportunityList } from "@/components/partners/Education";
import { PartnerProfiles } from "@/components/partners/Ecosystem";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Partners",
  description: "The organisations taking part in The Believing Room: recruitment participants, venue facilities, an educational contribution and student outreach, each described as far as it has been confirmed.",
  alternates: { canonical: "/partners" },
};

export default function Partners() {
  return (
    <PageShell
      eyebrow="Partners"
      title={<>The people and organisations <em>in the room.</em></>}
      lede="Each organisation is listed under the role it actually plays, and described only as far as it has been confirmed. Logos appear only where the organisation has approved their use."
      actions={
        <>
          <LiquidButton href="/sponsors" variant="primary" size="lg">Become a partner</LiquidButton>
          <LiquidButton href="/for-recruiters" variant="glass" size="lg">Hire with us</LiquidButton>
        </>
      }
    >
      <PartnerProfiles />

      <section aria-labelledby="edu" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">Educational contribution · details</p>
          <h2 id="edu" className="display h-lg mt-4 max-w-[18ch]">What candidates may receive</h2>
        </Reveal>
        <div className="mt-12"><EducationBenefit /></div>
      </section>

      <section aria-labelledby="roles" className="mt-28 border-t border-[var(--fg)] pt-16">
        <Reveal>
          <p className="eyebrow">Internship opportunities</p>
          <h2 id="roles" className="display h-lg mt-4 max-w-[18ch]">Roles, as companies confirm them</h2>
        </Reveal>
        <div className="mt-12"><OpportunityList /></div>
      </section>

      <p className="mt-24 max-w-[70ch] text-sm text-[var(--fg-faint)]">
        Naming an organisation here reflects its confirmed participation, not an endorsement of The Believing Room by it or of it by The Believing Room beyond the stated role. No guarantee of attendance, offers or outcomes is made on anyone&rsquo;s behalf.
      </p>
    </PageShell>
  );
}
