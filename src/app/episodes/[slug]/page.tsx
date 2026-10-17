import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { publicEpisode, publicEpisodes } from "@/lib/queries";
import { industries } from "@/content/industries";
import { brand } from "@/config/site";
import { EpisodeCard, fmtDuration, thumbOf } from "@/components/media/EpisodeCard";
import { YouTubeFacade } from "@/components/media/YouTubeFacade";
import { PageShell } from "@/components/layout/PageShell";
import { LiquidButton } from "@/components/liquid/LiquidButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await publicEpisode((await params).slug);
  return e ? { title: e.title, description: e.summary, alternates: { canonical: `/episodes/${e.slug}` } } : {};
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const ep = await publicEpisode((await params).slug);
  if (!ep) notFound();
  const ind = industries.find((i) => i.slug === ep.industry);
  const all = await publicEpisodes();
  const related = (ep.relatedSlugs.length ? all.filter((e) => ep.relatedSlugs.includes(e.slug)) : all.filter((e) => e.id !== ep.id && e.kind === ep.kind)).slice(0, 3);
  const back = ep.kind === "podcast" ? "/podcast" : "/episodes";

  // Video schema only for real, published videos with a release date.
  const ld = ep.youtubeId && ep.releaseDate
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: ep.title,
        description: ep.summary,
        uploadDate: ep.releaseDate.toISOString(),
        thumbnailUrl: thumbOf(ep) ?? undefined,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ep.youtubeId}`,
        ...(ep.durationSec ? { duration: `PT${Math.floor(ep.durationSec / 60)}M${ep.durationSec % 60}S` } : {}),
      }
    : null;

  return (
    <PageShell
      eyebrow={[ep.kind === "podcast" ? "Podcast" : "Episode", ep.season && ep.number ? `S${ep.season} · E${ep.number}` : null, ind?.short, fmtDuration(ep.durationSec)].filter(Boolean).join("  ·  ")}
      title={ep.title}
      lede={ep.summary}
      body="dark"
    >
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />}
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {ep.youtubeId ? <YouTubeFacade id={ep.youtubeId} title={ep.title} poster={ep.thumbnailUrl} /> : <p className="glass p-6 [--r:1.4rem]">The video link for this episode hasn’t been added yet.</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            {ep.youtubeId && <LiquidButton href={`https://www.youtube.com/watch?v=${ep.youtubeId}`} external variant="glass">Watch on YouTube</LiquidButton>}
            {ep.spotifyUrl && <LiquidButton href={ep.spotifyUrl} external variant="glass">Listen on Spotify</LiquidButton>}
            {brand.social.youtube && <LiquidButton href={brand.social.youtube} external variant="quiet">Subscribe</LiquidButton>}
          </div>
          {ep.transcript && (
            <details className="mt-10 border-t border-white/10 pt-6">
              <summary className="display cursor-pointer text-2xl">Transcript</summary>
              <div className="prose-arena mt-4 whitespace-pre-line">{ep.transcript}</div>
            </details>
          )}
        </div>
        <aside className="grid h-fit gap-8">
          {ep.guests.length > 0 && (
            <div><p className="eyebrow mb-3">In this episode</p><ul className="grid gap-2">{ep.guests.map((g) => <li key={g.name}><span className="display text-xl">{g.name}</span>{g.role && <span className="block text-sm text-[var(--fg-faint)]">{g.role}</span>}</li>)}</ul></div>
          )}
          {ep.tags.length > 0 && <ul className="flex flex-wrap gap-2">{ep.tags.map((t) => <li key={t} className="rounded-full border border-white/15 px-3 py-1 text-xs text-[var(--fg-dim)]">{t}</li>)}</ul>}
          <Link href={back} className="underline underline-offset-4">← All {ep.kind === "podcast" ? "podcast episodes" : "episodes"}</Link>
        </aside>
      </div>
      {related.length > 0 && (
        <div className="mt-24"><p className="eyebrow mb-6">Watch next</p><div className="grid gap-5 md:grid-cols-3">{related.map((e) => <EpisodeCard key={e.id} ep={e} />)}</div></div>
      )}
    </PageShell>
  );
}
