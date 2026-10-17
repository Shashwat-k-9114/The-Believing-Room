import Link from "next/link";
import { Suspense } from "react";
import { publicEpisodes, publicPanelists, publicPartners } from "@/lib/queries";
import { LiquidButton } from "../liquid/LiquidButton";
import { EpisodeCard } from "../media/EpisodeCard";

/** Only confirmed + published people and companies are ever shown. Otherwise: an honest invitation. */
async function People() {
  const [panelists, partners] = await Promise.all([publicPanelists(), publicPartners()]);
  if (panelists.length === 0 && partners.length === 0) {
    return (
      <div className="grid gap-8 border-t border-[var(--line)] pt-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="display text-3xl sm:text-4xl">Panelists and hiring companies will be named here once they have confirmed.</p>
          <p className="mt-4 max-w-[58ch] text-[var(--fg-dim)]">
            We don’t list logos or names in advance. If you hire, mentor or lead a team and want to meet students who can show you what they can do, we would like to hear from you.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <LiquidButton href="/for-companies" variant="primary" size="lg">Become a hiring partner</LiquidButton>
          <LiquidButton href="/for-colleges" variant="glass" size="lg">Bring your college</LiquidButton>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-10">
      {panelists.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {panelists.map((p) => (
            <li key={p.id} className="border-t border-[var(--line)] pt-4">
              <p className="display text-2xl">{p.name}</p>
              <p className="text-[var(--fg-dim)]">{p.title}, {p.organization}</p>
            </li>
          ))}
        </ul>
      )}
      {partners.length > 0 && (
        <ul className="flex flex-wrap gap-x-10 gap-y-4">
          {partners.map((p) => (
            <li key={p.id} className="display text-2xl">{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PeopleBlock() {
  return (
    <Suspense fallback={<div className="h-40" aria-hidden />}>
      <People />
    </Suspense>
  );
}

const FORMATS = ["Full episodes", "Student pitches", "Panel conversations", "Behind the scenes", "Podcast", "Short clips"];

async function Shelf() {
  const eps = (await publicEpisodes()).slice(0, 3);
  if (eps.length > 0)
    return (
      <div>
        <div className="grid gap-5 md:grid-cols-3">
          {eps.map((e) => (
            <EpisodeCard key={e.id} ep={e} />
          ))}
        </div>
        <div className="mt-8">
          <LiquidButton href="/episodes" variant="glass">All episodes</LiquidButton>
        </div>
      </div>
    );
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {FORMATS.map((f, i) => (
          <li key={f} className="flex items-baseline justify-between gap-4 py-5">
            <span className="display text-3xl sm:text-4xl">
              <span className="mono mr-4 align-middle text-[var(--fg-faint)]">{String(i + 1).padStart(2, "0")}</span>
              {f}
            </span>
            <span className="mono shrink-0 text-[var(--fg-faint)]">Prelaunch</span>
          </li>
        ))}
      </ul>
      <div className="glass glass-frost p-8 [--r:1.7rem]">
        <p className="eyebrow">Channel status</p>
        <p className="display mt-3 text-3xl">Nothing is published yet.</p>
        <p className="mt-3 text-[var(--fg-dim)]">
          The first episode follows the first event. No placeholder videos, no made-up viewer counts.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LiquidButton href="/the-show" variant="primary">About the show</LiquidButton>
          <LiquidButton href="/podcast" variant="glass">The podcast</LiquidButton>
        </div>
        <p className="mt-5 text-sm text-[var(--fg-faint)]">
          Want to be told at launch? Use <Link className="underline underline-offset-4" href="/the-show#notify">the notify form</Link>.
        </p>
      </div>
    </div>
  );
}

export function ShowShelf() {
  return (
    <Suspense fallback={<div className="h-64" aria-hidden />}>
      <Shelf />
    </Suspense>
  );
}
