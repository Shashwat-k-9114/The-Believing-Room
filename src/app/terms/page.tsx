import type { Metadata } from "next";
import { formatINR, pricing } from "@/config/site";
import { registrationTerms } from "@/content/policies";
import { DraftNotice, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Registration terms",
  description: "Registration terms for candidates and audience: seat lock, transfers, eligibility, conduct and what a ticket does and does not include.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <PageShell eyebrow="Legal" title={<>Registration <em>terms.</em></>} lede="Plain statements of what registration, screening and a ticket each mean.">
      <DraftNotice>{"These terms are being finalised before ticket sales open. Applying is free, and nothing is charged on this site today."}</DraftNotice>

      <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">Four things, kept apart</p>
          <dl className="mt-5 border-t border-[var(--fg)]">
            {[
              ["Registration", "You tell us about yourself."],
              ["Shortlisting", "The team selects candidates for panel fit."],
              ["Participation", "You pitch, if shortlisted and confirmed."],
              ["Hiring", "Entirely each company’s decision. No offer is guaranteed."],
            ].map(([t, d]) => (
              <div key={t} className="border-b border-[var(--line)] py-4"><dt className="display text-2xl">{t}</dt><dd className="mt-1 text-sm text-[var(--fg-dim)]">{d}</dd></div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-[var(--fg-dim)]">
            Candidate ticket {formatINR(pricing.candidate.amount)} · Audience ticket {formatINR(pricing.audience.amount)} · Food included. A ticket buys a place and a meal, not selection or an offer.
          </p>
        </aside>
        <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {registrationTerms.map((t, i) => (
            <li key={t.id} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
              <span className="eyebrow pt-2">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="display text-2xl">{t.title}</h2>
                <p className="mt-1 max-w-[60ch] text-[var(--fg-dim)]">{t.body}</p>
                {/* t.needsDecision is an internal drafting note for the organiser (see content/policies.ts). It is never rendered publicly. */}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PageShell>
  );
}
