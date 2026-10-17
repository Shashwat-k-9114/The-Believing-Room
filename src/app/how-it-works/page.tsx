import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "How it works",
  description: "From application to screening, live pitch, panel questions and hiring conversations: exactly what is confirmed and what is still planned.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  { t: "Apply", s: "Open now", d: "Complete the student application: who you are, your arena, your pitch summary, and optionally a PDF résumé and links. It is free and takes about ten minutes. You get a reference number straight away." },
  { t: "Screening", s: "Organiser-run", d: "Organisers read every application against the published criteria for the industry. Screening decides who is invited to prepare for a live slot. It is not a guarantee, and not everyone who applies will pitch." },
  { t: "Confirm your place", s: "Planned", d: `If shortlisted, you will be asked to confirm with the Student Pass (${formatINR(pricing.student.amount)}, food included). Nothing is charged at application. The exact payment moment is a proposal awaiting organiser confirmation.` },
  { t: "Preparation", s: "Planned", d: "You receive the running order, time limit, what the panel will probe, and technical needs (screen, audio, playback)." },
  { t: "Live pitch", s: "Planned", d: "A short, structured pitch on the arena floor in front of a panel and an audience. Format details are finalised per edition." },
  { t: "Panel questions", s: "Planned", d: "Panelists question the work. This is the part that separates a demo from understanding." },
  { t: "Hiring conversations", s: "Planned", d: "Companies that want to continue speak with candidates directly, during or after the event." },
  { t: "Possible internships", s: "Company decision", d: "Offers, if any, come from companies on their own terms, including stipend and duration. We never promise or announce one on a company’s behalf." },
];

export default function HowItWorks() {
  return (
    <PageShell
      eyebrow="The process"
      title={<>Registration, screening, stage, <em>hiring.</em></>}
      lede="Four different things that are easy to confuse. We keep them apart on purpose."
      actions={<LiquidButton href="/register/student" variant="primary" size="lg">Apply to pitch</LiquidButton>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key distinctions">
        {[
          ["Registration", "You tell us about yourself. Free."],
          ["Screening", "Organisers decide who is invited to pitch."],
          ["Participation", "You pitch, if you are invited and confirmed."],
          ["Hiring", "Entirely each company’s decision."],
        ].map(([t, d]) => (
          <div key={t} className="border-t border-[var(--fg)] pt-4">
            <p className="display text-2xl">{t}</p>
            <p className="mt-1 text-sm text-[var(--fg-dim)]">{d}</p>
          </div>
        ))}
      </div>

      <ol className="mt-20 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {steps.map((s, i) => (
          <li key={s.t} className="grid gap-3 py-8 md:grid-cols-[5rem_1fr_1.6fr] md:gap-8">
            <span className="mono pt-2 text-[var(--fg-faint)]">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="display text-3xl">{s.t}</h2>
              <p className="mono mt-2 text-[var(--accent)]">{s.s}</p>
            </div>
            <p className="text-[var(--fg-dim)]">{s.d}</p>
          </li>
        ))}
      </ol>

      <p className="mt-10 max-w-[64ch] text-sm text-[var(--fg-faint)]">
        “Planned” means a proposal that has not yet been confirmed by the organisers. It will be updated here as each edition is announced.
      </p>
    </PageShell>
  );
}
