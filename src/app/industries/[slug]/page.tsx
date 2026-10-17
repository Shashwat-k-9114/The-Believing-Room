import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustry, industries } from "@/content/industries";
import { LiquidButton } from "@/components/liquid/LiquidButton";
import { PageShell } from "@/components/layout/PageShell";
import { DisciplineMark } from "@/components/sections/DisciplineMark";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ind = getIndustry((await params).slug);
  if (!ind) return {};
  return {
    title: ind.name,
    description: `${ind.name} internships: ${ind.blurb} Who should apply, how to pitch and what panelists look for.`,
    alternates: { canonical: `/industries/${ind.slug}` },
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-[var(--line)] py-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
      <h2 className="display h-lg">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="grid gap-3 text-[var(--fg-dim)]">
    {items.map((s) => (
      <li key={s} className="flex gap-3"><span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />{s}</li>
    ))}
  </ul>
);

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const ind = getIndustry((await params).slug);
  if (!ind) notFound();
  const others = industries.filter((i) => i.slug !== ind.slug);

  return (
    <PageShell
      eyebrow={`${ind.index} / ${ind.motif}`}
      title={ind.name}
      accent={ind.accent}
      lede={<><span className="display block text-3xl italic text-white sm:text-4xl">{ind.tagline}</span><span className="mt-4 block">{ind.represents}</span></>}
      actions={<LiquidButton href={`/register/candidate?industry=${ind.slug}`} variant="primary" size="lg">Apply in this discipline</LiquidButton>}
    >
      <div style={{ ["--accent" as string]: "#8a6d3b", ["--ia" as string]: ind.accent }}>
        <div aria-hidden className="mb-12 rounded-[2rem] bg-graphite p-6 sm:p-10" style={{ background: `radial-gradient(70% 90% at 70% 10%, color-mix(in srgb, ${ind.accent} 28%, #0d0f13), #0d0f13)` }}>
          <DisciplineMark slug={ind.slug} className="mx-auto w-full max-w-[420px] text-[#cbae76]" />
        </div>
        <Block title="Who should apply"><Bullets items={ind.whoShouldApply} /></Block>
        <Block title="Skills on show">
          <ul className="flex flex-wrap gap-2">{ind.skills.map((s) => <li key={s} className="rounded-full border border-[var(--line)] px-4 py-1.5 text-sm">{s}</li>)}</ul>
        </Block>
        <Block title="Pitch formats">
          <ul className="divide-y divide-[var(--line)]">{ind.pitchFormats.map((f) => <li key={f.title} className="py-4"><h3 className="display text-2xl">{f.title}</h3><p className="mt-1 text-[var(--fg-dim)]">{f.detail}</p></li>)}</ul>
          <p className="mt-4 text-sm text-[var(--fg-faint)]">Suggested formats. Final formats and time limits are confirmed per edition.</p>
        </Block>
        <Block title="What to bring"><Bullets items={ind.portfolio} /></Block>
        <Block title="What panelists may evaluate"><Bullets items={ind.panelLooksFor} /></Block>
        <Block title="Possible internship functions">
          <Bullets items={ind.possibleFunctions} />
          <p className="mt-4 text-sm text-[var(--fg-faint)]">Illustrative of the industry. These are <strong>not</strong> confirmed vacancies; openings are listed only once a company has confirmed them.</p>
        </Block>
        <Block title="Questions">
          <dl className="grid gap-6">{ind.faqs.map((f) => <div key={f.q}><dt className="font-medium">{f.q}</dt><dd className="mt-1 text-[var(--fg-dim)]">{f.a}</dd></div>)}</dl>
        </Block>
        <Block title="Ready?">
          <div className="flex flex-wrap gap-3">
            <LiquidButton href={`/register/candidate?industry=${ind.slug}`} variant="primary" size="lg">Apply to pitch</LiquidButton>
            <LiquidButton href="/register/audience" size="lg">Attend as audience</LiquidButton>
          </div>
          <p className="mt-10 eyebrow">Other disciplines</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">{others.map((o) => <li key={o.slug}><LiquidButton href={`/industries/${o.slug}`} variant="quiet">{o.name}</LiquidButton></li>)}</ul>
        </Block>
      </div>
    </PageShell>
  );
}
