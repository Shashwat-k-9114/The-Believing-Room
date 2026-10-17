import type { Metadata } from "next";
import { faqs } from "@/content/faq";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers on pricing, selection, filming, internships and partnerships.",
  alternates: { canonical: "/faq" },
};

export default function Faq() {
  const groups = [...new Set(faqs.map((f) => f.group))];
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <PageShell eyebrow="FAQ" title={<>Straight <em>answers.</em></>} lede="If something isn’t covered, write to us from the contact page.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-16">
        {groups.map((g) => (
          <section key={g} aria-labelledby={`faq-${g}`} className="grid gap-6 lg:grid-cols-[0.5fr_1.5fr]">
            <h2 id={`faq-${g}`} className="display h-lg">{g}</h2>
            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {faqs.filter((f) => f.group === g).map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                    {f.q}
                    <span aria-hidden className="text-2xl transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-[64ch] text-[var(--fg-dim)]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
