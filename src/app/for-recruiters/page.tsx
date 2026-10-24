import type { Metadata } from "next";
import { Layers, MessageSquare, Presentation, Sparkles } from "lucide-react";
import { CompanyForm } from "@/components/forms/EnquiryForms";
import { FactCards, HonestNote } from "@/components/layout/FactCards";
import { PageShell } from "@/components/layout/PageShell";
import { ShowFlow, type FlowStep } from "@/components/sections/ShowFlow";

export const metadata: Metadata = {
  title: "For recruiters",
  description: "Meet shortlisted early-career talent, watch candidates present live and decide on your own terms. Apply as a recruiter for Season 01.",
  alternates: { canonical: "/for-recruiters" },
};

const STEPS: FlowStep[] = [
  { t: "Apply", d: "Tell us what you hire for.", icon: "apply" },
  { t: "Get confirmed", d: "Named only once you confirm.", icon: "confirm" },
  { t: "Watch pitches", d: "Ask your own questions.", icon: "watch" },
  { t: "Reach out", d: "Connect with the candidates who stood out.", icon: "handshake" },
];

export default function ForRecruiters() {
  return (
    <PageShell
      eyebrow="For recruiters"
      title={<>See talent <em>in action.</em></>}
      lede="Watch shortlisted candidates pitch live. Decide on your own terms."
      art="recruiter"
    >
      <ShowFlow steps={STEPS} compact label="How recruiting works" />

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div className="grid content-start gap-8">
          <FactCards
            cols={2}
            items={[
              { icon: Sparkles, title: "Early-career talent", body: "Candidates who want to be heard, shortlisted for panel fit." },
              { icon: Layers, title: "Multiple disciplines", body: "IT, Finance, Sales and Marketing, Animation and Multimedia." },
              { icon: Presentation, title: "Work and presence", body: "See the work, hear the thinking, judge the delivery." },
              { icon: MessageSquare, title: "Direct conversations", body: "Speak with the candidates you choose, during or after." },
            ]}
          />
          <HonestNote title="What we won’t promise">No number or quality of candidates, no hiring outcome and no audience size. Offers, stipends and terms are yours. Any filming or branding is agreed individually, and companies are named only once confirmed.</HonestNote>
        </div>
        <div className="glass glass-frost p-7 sm:p-10 [--r:1.2rem]">
          <h2 className="display text-4xl">Apply as a recruiter</h2>
          <p className="mb-8 mt-2 text-[var(--fg-dim)]">Tell us what you are hiring for. We reply by email.</p>
          <CompanyForm />
        </div>
      </div>
    </PageShell>
  );
}
