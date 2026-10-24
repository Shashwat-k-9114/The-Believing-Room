import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { PageShell } from "@/components/layout/PageShell";
import { ShowFlow } from "@/components/sections/ShowFlow";

export const metadata: Metadata = {
  title: "How it works",
  description: "From application to opportunity: apply, shortlist, pitch, decision and result. What is confirmed and what is still planned.",
  alternates: { canonical: "/how-it-works" },
};

const afterShortlist = pricing.candidatePaymentStage === "after_shortlist";

// The full rules stay here, one tap away, so the page itself can be read in seconds.
const steps = [
  { t: "Apply", s: "Open now", d: "Tell us about your skills and ambitions: who you are, your discipline, a short description of your pitch, and optionally links and a PDF résumé. Applying is free and you receive a reference straight away." },
  { t: "Shortlist", s: "Team review", d: `Our team reviews applications and shortlists candidates for panel fit. Being shortlisted does not guarantee a live slot or an offer. ${afterShortlist ? `Shortlisted candidates are then asked to confirm their place with the candidate ticket (${formatINR(pricing.candidate.amount)}, food and goodies included).` : `The candidate ticket (${formatINR(pricing.candidate.amount)}, food and goodies included) is paid at registration.`}` },
  { t: "Pitch", s: "Planned", d: "Introduce yourself, present your abilities and answer the panel’s questions, live, in front of recruiters and an audience. Format and time limits are finalised per edition." },
  { t: "Decision", s: "Companies decide", d: "Companies evaluate candidates’ skills, communication and potential. Each company decides for itself." },
  { t: "The Result", s: "Company decision", d: "Selected candidates may receive an internship offer. Others receive constructive review guidance. No outcome is guaranteed by registration or payment." },
];

export default function HowItWorks() {
  return (
    <PageShell
      eyebrow="The process"
      title={<>From application <em>to opportunity.</em></>}
      lede="Four steps. A clear line between applying, being shortlisted, pitching and being hired."
      art="candidate"
      actions={<LiquidButton href="/register/candidate" variant="primary" size="lg">Apply as a Candidate</LiquidButton>}
    >
      <div className="mb-20 mt-4"><ShowFlow label="The four steps" /></div>
      <h2 className="eyebrow mb-4">The rules, stage by stage</h2>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {steps.map((s, i) => (
          <details key={s.t} className="group py-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-4">
              <span className="eyebrow w-8">{String(i + 1).padStart(2, "0")}</span>
              <span className="display flex-1 text-2xl">{s.t}</span>
              <span className="eyebrow hidden !text-[var(--accent)] sm:inline">{s.s}</span>
              <span aria-hidden className="text-2xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-[64ch] pl-12 text-[var(--fg-dim)]">{s.d}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 max-w-[64ch] text-sm text-[var(--fg-faint)]">“Planned” means a format not yet confirmed by the organisers. It will be updated here as Season 01 is announced.</p>
    </PageShell>
  );
}
