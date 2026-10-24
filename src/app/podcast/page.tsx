import type { Metadata } from "next";
import { brand } from "@/config/site";
import { publicEpisodes } from "@/lib/content";
import { EpisodeCard } from "@/components/media/EpisodeCard";
import { Prelaunch } from "@/components/media/Prelaunch";
import { PageShell } from "@/components/layout/PageShell";
import { LiquidButton } from "@/components/liquid/LiquidButton";

export const metadata: Metadata = {
  title: "Podcast",
  description: "Long-form conversations with founders, hiring managers, interns and mentors about how careers actually begin.",
  alternates: { canonical: "/podcast" },
};

const THEMES = [
  "How careers begin",
  "What recruiters actually evaluate",
  "Skill versus credentials",
  "Early professional mistakes",
  "Founders and their first hires",
  "The evolving internship market",
];

export default async function Podcast() {
  const eps = await publicEpisodes("podcast");
  const p = brand.podcast;
  return (
    <PageShell
      eyebrow="Podcast · provisional title"
      title={<>{p.name}<em>.</em></>}
      lede="Founders, hiring managers, interns and mentors on how careers really start."
      art="podcast"
      body="dark"
      actions={
        <>
          {p.youtubePlaylistUrl && <LiquidButton href={p.youtubePlaylistUrl} external variant="primary" size="lg">YouTube playlist</LiquidButton>}
          {p.spotifyUrl && <LiquidButton href={p.spotifyUrl} external size="lg">Spotify</LiquidButton>}
          {p.applePodcastsUrl && <LiquidButton href={p.applePodcastsUrl} external size="lg">Apple Podcasts</LiquidButton>}
        </>
      }
    >
      {eps.length > 0 ? (
        <>
          <div className="mb-10"><p className="eyebrow mb-4">Latest</p></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{eps.map((e) => <EpisodeCard key={e.id} ep={e} />)}</div>
        </>
      ) : (
        <Prelaunch what="Podcast episodes" />
      )}
      <div className="mt-24 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Editorial themes</p>
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">{THEMES.map((t) => <li key={t} className="display py-4 text-2xl">{t}</li>)}</ul>
        </div>
        <div>
          <p className="eyebrow">Good to know</p>
          <ul className="mt-4 grid gap-3 text-[var(--fg-dim)]">
            <li>The series title is provisional.</li>
            <li>Guests are named only once they agree.</li>
            <li>Recorded as video for YouTube, then shared as audio.</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
