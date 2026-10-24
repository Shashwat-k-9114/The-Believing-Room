import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { industries } from "@/content/industries";
import { PageShell } from "@/components/layout/PageShell";
import { DisciplineMark } from "@/components/sections/DisciplineMark";

export const metadata: Metadata = {
  title: "Four industries",
  description: "IT & Technology, Finance, Sales & Marketing, and Animation & Multimedia: the four launch disciplines for student pitching and internship hiring.",
  alternates: { canonical: "/industries" },
};

export default function Industries() {
  return (
    <PageShell eyebrow="Multiple disciplines" title={<>One stage. <em>Four industries.</em></>} lede="Four panels. Pick the one where you can show, not just tell."
      art="candidate">
      <ul className="grid gap-px overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
        {industries.map((i) => (
          <li key={i.slug} className="bg-[var(--bg)]">
            <Link href={`/industries/${i.slug}`} className="group relative block h-full overflow-hidden p-8 sm:p-12" style={{ ["--ia" as string]: i.accent }}>
              <p className="mono text-[var(--fg-faint)]">{i.index} / {i.motif}</p>
              <h2 className="display h-lg mt-4">{i.name}</h2>
              <p className="mt-3 max-w-[34ch] text-[var(--fg-dim)]">{i.blurb}</p>
              <span className="mt-8 inline-flex items-center gap-1 text-sm underline-offset-4 group-hover:underline">Explore the discipline <ArrowUpRight size={16} aria-hidden /></span>
              <div aria-hidden className="pointer-events-none absolute -bottom-6 -right-6 w-56 opacity-30 transition-opacity duration-500 group-hover:opacity-70 sm:w-72" style={{ filter: "invert(0.85)" }}>
                <DisciplineMark slug={i.slug} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 max-w-[64ch] text-sm text-[var(--fg-faint)]">Roles listed on each discipline page are illustrations of what that industry typically offers, not vacancies confirmed by any employer.</p>
    </PageShell>
  );
}
