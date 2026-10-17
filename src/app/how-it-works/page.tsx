import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "How it works",
  description: "From application to opportunity: apply, shortlist, pitch, decision and result. What is confirmed and what is still planned.",
  alternates: { canonical: "/how-it-works" },
};

const afterShortlist = pricing.candidatePaymentStage === "after_shortlist";

const steps = [
  { t: "Apply", s: "Open now", d: "Tell us about your skills and ambitions: who you are, your discipline, a short description of your pitch, and optionally links and a PDF résumé. Applying is free and you receive a reference straight away." },
  { t: "Shortlist", s: "Team review", d: `Our team reviews applications and shortlists candidates for panel fit. Being shortlisted does not guarantee a live slot or an offer. ${afterShortlist ? `Shortlisted candidates are then asked to confirm their place with the candidate ticket (${formatINR(pricing.candidate.amount)}, food included).` : `The candidate ticket (${formatINR(pricing.candidate.amount)}, food included) is paid at registration.`}` },
  { t: "Pitch", s: "Planned", d: "Introduce yourself, present your abilities and answer the panel’s questions, live, in front of recruiters and an audience. Format and time limits are finalised per edition." },
  { t: "Decision", s: "Companies decide", d: "Companies evaluate candidates’ skills, communication and potential. Each company decides for itself." },
  { t: "The Result", s: "Company decision", d: "Selected candidates may receive an internship offer. Others receive constructive review guidance. No outcome is guaranteed by registration or payment." },
];

export default function HowItWorks() {
  return (
    <PageShell
      eyebrow="The process"
      title={<>From application <em>to opportunity.</em></>}
      lede="Five stages, and a clear line between registering, being shortlisted, taking part and being hired."
      actions={<LiquidButton href="/register/candidate" variant="primary" size="lg">Apply as a Candidate</LiquidButton>}
    >
      <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {steps.map((s, i) => (
          <li key={s.t} className="grid gap-3 py-9 md:grid-cols-[5rem_1fr_1.6fr] md:gap-10">
            <span className="eyebrow pt-3">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="display h-md">{s.t}</h2>
              <p className="eyebrow mt-2 !text-[var(--accent)]">{s.s}</p>
            </div>
            <p className="text-[var(--fg-dim)]">{s.d}</p>
          </li>
        ))}
      </ol>
      <p className="mt-10 max-w-[64ch] text-sm text-[var(--fg-faint)]">“Planned” means a format not yet confirmed by the organisers. It will be updated here as Season 01 is announced.</p>
    </PageShell>
  );
}
