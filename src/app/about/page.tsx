import type { Metadata } from "next";
import { brand } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { ListRows, PageShell, Prose, TwoCol } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${brand.name} exists: a stage where student talent is seen, heard and challenged by the people who hire.`,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <PageShell
      eyebrow="Vision"
      title={<>Talent deserves <em>an audience.</em></>}
      lede="Most internship applications end in silence. We think a student who can explain what they built, and defend it under questions, should get to do exactly that, in front of people with the power to say yes."
      actions={<><LiquidButton href="/register/student" variant="primary" size="lg">Enter the Arena</LiquidButton><LiquidButton href="/how-it-works" size="lg">How it works</LiquidButton></>}
    >
      <TwoCol
        left={<><p className="eyebrow">The idea</p><h2 className="display h-lg mt-4">Not just another application.</h2></>}
        right={
          <Prose>
            <p>The model is familiar from televised pitching shows: a candidate, a panel, a few minutes, real questions. We have taken that format and pointed it at something more useful than spectacle, the first rung of a career.</p>
            <p>The Internship Arena is two things at once. It is a live event where students pitch to industry panels across four fields. And it is a media project: selected sessions become episodes on YouTube, alongside a podcast of long-form conversations about how careers actually begin.</p>
            <p>It is an independent project. It is not affiliated with, licensed by or endorsed by any television programme, and it will never imply otherwise.</p>
          </Prose>
        }
      />
      <div className="mt-24">
        <p className="eyebrow mb-6">What we hold ourselves to</p>
        <ListRows
          items={[
            { title: "Say only what’s true", body: "No invented companies, panelists, testimonials or placement numbers. If something isn’t confirmed, the site says so." },
            { title: "Be clear about money", body: "Fixed, visible prices. Food included. A pass is never presented as buying selection or a job." },
            { title: "Respect the student", body: "Filming and publication are separate, optional choices. Saying no never counts against anyone." },
            { title: "Keep companies in charge of hiring", body: "Hiring decisions belong to the companies. We introduce; we do not promise outcomes for them." },
          ]}
        />
      </div>
    </PageShell>
  );
}
