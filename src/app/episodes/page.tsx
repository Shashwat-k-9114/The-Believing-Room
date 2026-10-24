import type { Metadata } from "next";
import Link from "next/link";
import { publicEpisodes } from "@/lib/content";
import { industries } from "@/content/industries";
import { EpisodeCard } from "@/components/media/EpisodeCard";
import { Prelaunch } from "@/components/media/Prelaunch";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Episodes",
  description: "The full archive of published episodes, filterable by season and industry.",
  alternates: { canonical: "/episodes" },
};

export default async function Episodes({ searchParams }: { searchParams: Promise<{ industry?: string; season?: string }> }) {
  const { industry, season } = await searchParams;
  const all = await publicEpisodes("episode");
  const seasons = [...new Set(all.map((e) => e.season).filter((s): s is number => !!s))].sort((a, b) => a - b);
  const list = all.filter((e) => (!industry || e.industry === industry) && (!season || String(e.season) === season));
  const q = (p: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ industry, season, ...p })) if (v) sp.set(k, v);
    const s = sp.toString();
    return `/episodes${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--fg)]" : "border-white/15 text-[var(--fg-dim)] hover:text-[var(--fg)]"}`;

  return (
    <PageShell eyebrow="Archive" art="show" title={<>All <em>episodes.</em></>} lede={all.length ? `${all.length} published.` : "The archive opens with the first edition."} body="dark">
      {all.length === 0 ? (
        <Prelaunch what="Episodes" />
      ) : (
        <>
          <nav aria-label="Filter episodes" className="mb-10 flex flex-wrap gap-2">
            <Link className={chip(!industry)} href={q({ industry: undefined })} aria-current={!industry ? "true" : undefined}>All industries</Link>
            {industries.map((i) => <Link key={i.slug} className={chip(industry === i.slug)} href={q({ industry: i.slug })} aria-current={industry === i.slug ? "true" : undefined}>{i.short}</Link>)}
            {seasons.length > 1 && seasons.map((s) => <Link key={s} className={chip(season === String(s))} href={q({ season: season === String(s) ? undefined : String(s) })}>Season {s}</Link>)}
          </nav>
          {list.length === 0 ? (
            <p className="text-[var(--fg-dim)]">No episodes match these filters. <Link className="underline" href="/episodes">Clear filters</Link>.</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((e) => <li key={e.id}><EpisodeCard ep={e} /></li>)}</ul>
          )}
        </>
      )}
    </PageShell>
  );
}
