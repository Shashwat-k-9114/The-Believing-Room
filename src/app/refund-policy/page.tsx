import type { Metadata } from "next";
import { registrationTerms } from "@/content/policies";
import { DraftNotice, PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Refunds and transfers",
  description: "When fees are refundable, how registrations can be transferred, and what happens if an event is cancelled or postponed.",
  alternates: { canonical: "/refund-policy" },
};

const IDS = ["no-refunds", "transfers", "candidate-transfers", "cancel-postpone", "arrival", "gateway"];

export default function Refunds() {
  const items = IDS.map((id) => registrationTerms.find((t) => t.id === id)!);
  return (
    <PageShell eyebrow="Legal" title={<>Refunds and <em>transfers.</em></>} lede="Stated plainly, before any ticket is sold.">
      <DraftNotice>This is the policy from the original registration page, unchanged. It has not been legally reviewed. No refund conditions have been added or softened in this redesign.</DraftNotice>
      <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((t) => (
          <li key={t.id} className="grid gap-2 py-7 md:grid-cols-[1fr_1.6fr] md:gap-12">
            <h2 className="display text-3xl">{t.title}</h2>
            <p className="max-w-[58ch] text-[var(--fg-dim)]">{t.body}</p>
          </li>
        ))}
      </ol>
      <div className="prose-arena mt-12">
        <h2>How to ask</h2>
        <p>Use the <a href="/contact">contact page</a> with your registration reference. Payments are verified with the payment provider before a registration is confirmed, so a failed payment does not create one, and a duplicate payment for the same order is returned.</p>
      </div>
    </PageShell>
  );
}
