import type { Metadata } from "next";
import Link from "next/link";
import { publicEpisodes } from "@/lib/queries";
import { industries } from "@/content/industries";
import { EpisodeCard, fmtDuration, thumbOf } from "@/components/media/EpisodeCard";
import { Prelaunch } from "@/components/media/Prelaunch";
import { PageShell } from "@/components/layout/PageShell";
import { LiquidButton } from "@/components/liquid/LiquidButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "The Show",
  description: "Full-length pitching episodes, standout pitches, panel conversations and behind-the-scenes films, published on YouTube with participants’ permission.",
  alternates: { canonical: "/the-show" },
};

const FORMATS = [
  ["Full episodes", "Candidate pitches, panel questions and hiring discussion from an event."],
  ["Best pitches", "A single standout pitch, cut for rewatching."],
  ["Industry highlights", "What each arena rewarded, in ten minutes."],
  ["Behind the scenes", "Preparation, nerves and the room before the doors open."],
  ["Panel conversations", "Panelists on what they look for, away from the stage."],
  ["Short clips", "Vertical highlights for the feed."],
];

export default async function TheShow() {
  const eps = (await publicEpisodes("episode")).filter((e) => e.kind === "episode");
  const feature = eps[0];
  const rest = eps.slice(1);
  return (
    <PageShell
      eyebrow="The Show"
      title={<>Every pitch is <em>a story.</em></>}
      lede="The event is filmed as a series. Full episodes live on YouTube; the best moments are cut into shorter films. Nothing is published without the participant’s separate permission."
      actions={<LiquidButton href="/episodes" variant="glass" size="lg">Browse episodes</LiquidButton>}
      body="dark"
    >
      {feature ? (
        <>
          <Link href={`/episodes/${feature.slug}`} className="group grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="relative aspect-video overflow-hidden rounded-[1.8rem] bg-graphite">
              {thumbOf(feature) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbOf(feature)!} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              )}
            </div>
            <div>
              <p className="eyebrow">Featured{feature.season && feature.number ? ` · S${feature.season} E${feature.number}` : ""}</p>
              <h2 className="display h-lg mt-3">{feature.title}</h2>
              <p className="mt-3 text-[var(--fg-dim)]">{feature.summary}</p>
              <p className="mono mt-4 text-[var(--fg-faint)]">{fmtDuration(feature.durationSec)}</p>
            </div>
          </Link>
          {rest.length > 0 && <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((e) => <EpisodeCard key={e.id} ep={e} />)}</div>}
        </>
      ) : (
        <Prelaunch what="Episodes" />
      )}

      <div className="mt-24">
        <p className="eyebrow mb-6">Planned formats</p>
        <ul className="grid gap-px overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATS.map(([t, d]) => (
            <li key={t} className="bg-[var(--bg)] p-7"><h3 className="display text-2xl">{t}</h3><p className="mt-2 text-sm text-[var(--fg-dim)]">{d}</p></li>
          ))}
        </ul>
        <p className="eyebrow mb-3 mt-12">By industry</p>
        <ul className="flex flex-wrap gap-3">{industries.map((i) => <li key={i.slug}><LiquidButton href={`/episodes?industry=${i.slug}`} variant="glass">{i.short}</LiquidButton></li>)}</ul>
      </div>
    </PageShell>
  );
}
