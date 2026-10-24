import type { Metadata } from "next";
import { Eye, Handshake, Heart, Mic, Scale, ShieldCheck } from "lucide-react";
import { brand } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { Reveal } from "@/components/liquid/Reveal";
import { FactCards, HonestNote } from "@/components/layout/FactCards";
import { PageShell } from "@/components/layout/PageShell";

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
      lede="A résumé opens the door. The room shows who is behind it."
      art="about"
      longTitle
      actions={<><LiquidButton href="/register/candidate" variant="primary" size="lg">Apply as a Candidate</LiquidButton><LiquidButton href="/how-it-works" size="lg">See How It Works</LiquidButton></>}
    >
      <Reveal><p className="eyebrow mb-6">One room, three outcomes</p></Reveal>
      <FactCards
        items={[
          { icon: Mic, title: "Candidates are heard", body: "A fair chance, and honest feedback whatever the result." },
          { icon: Handshake, title: "Recruiters meet talent", body: "Early-career people, in person, without weeks of screening." },
          { icon: Eye, title: "Viewers see hiring", body: "What a real recruitment conversation looks like." },
        ]}
      />
      <div className="mt-8"><HonestNote title="Also a media project">Filmed for YouTube with a podcast alongside, always with participants’ permission. An independent project, not affiliated with any television programme.</HonestNote></div>

      <Reveal><p className="eyebrow mb-6 mt-24">What we hold ourselves to</p></Reveal>
      <FactCards
        cols={4}
        items={[
          { icon: ShieldCheck, title: "Say only what is true", body: "No invented companies, panelists, testimonials or placement numbers." },
          { icon: Scale, title: "Be clear about money", body: "Fixed prices, food and goodies included. A ticket never buys selection." },
          { icon: Heart, title: "Respect the candidate", body: "Filming and publishing are separate, optional choices." },
          { icon: Handshake, title: "Companies decide hiring", body: "Offers are theirs. We never promise outcomes for them." },
        ]}
      />
    </PageShell>
  );
}
