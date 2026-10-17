import type { Metadata } from "next";
import Image from "next/image";
import { brand } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Lines, Reveal } from "@/components/liquid/Reveal";
import { ListRows, PageShell, Prose, TwoCol } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Our belief",
  description: `Why ${brand.name} exists: real people, real opportunities and a fair chance to be heard.`,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <PageShell
      eyebrow="Our belief"
      title={<>Talent is everywhere. <em>Opportunity shouldn’t be hidden.</em></>}
      lede="Real people. Real opportunities. A fair chance to be heard."
      actions={<><LiquidButton href="/register/candidate" variant="primary" size="lg">Apply as a Candidate</LiquidButton><LiquidButton href="/how-it-works" size="lg">See How It Works</LiquidButton></>}
    >
      <TwoCol
        left={<><p className="eyebrow">Not another job portal</p><Lines as="h2" className="display h-lg mt-4" lines={["Put a face", <em key="e">to the opportunity.</em>]} /></>}
        right={
          <Prose>
            <p>Traditional recruitment happens behind closed doors. A résumé opens the door; it cannot show who is standing behind it. The Believing Room brings the conversation into one room, so candidates can demonstrate their skills, show their potential and receive honest feedback.</p>
            <p>Every candidate deserves a fair opportunity to be heard, and a constructive next step regardless of the result. Recruiters meet motivated early-career talent without weeks of screening. Viewers learn what hiring actually looks like.</p>
            <p>It is also a media project. The event is filmed for YouTube, with a podcast alongside it, always with participants’ permission. It is an independent project and is not affiliated with any television programme.</p>
          </Prose>
        }
      />
      <Reveal className="mx-auto my-24 max-w-3xl">
        <figure>
          <div className="img-reveal aspect-[21/9] w-full overflow-hidden rounded-[0.5rem]">
            <Image src="/images/concept-stage.jpg" alt="Conceptual image: a candidate facing a seated audience under stage lights" width={751} height={314} className="size-full object-cover" sizes="(min-width: 768px) 768px, 100vw" />
          </div>
          <figcaption className="eyebrow mt-3">Conceptual imagery · not footage from an event</figcaption>
        </figure>
      </Reveal>
      <p className="eyebrow mb-6">What we hold ourselves to</p>
      <ListRows
        items={[
          { title: "Say only what’s true", body: "No invented companies, panelists, testimonials or placement numbers. If something isn’t confirmed, the site says so." },
          { title: "Be clear about money", body: "Fixed, visible prices. Food included. A ticket is never presented as buying selection or an offer." },
          { title: "Respect the candidate", body: "Filming and publication are separate, optional choices. Saying no never counts against anyone." },
          { title: "Keep companies in charge of hiring", body: "Offers are the company’s decision. We introduce; we never promise outcomes on a company’s behalf." },
        ]}
      />
    </PageShell>
  );
}
