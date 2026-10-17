import Link from "next/link";
import { Play } from "lucide-react";
import type { schema } from "@/db/client";
import { industries } from "@/content/industries";

type Episode = typeof schema.episodes.$inferSelect;

export const fmtDuration = (s?: number | null) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : null);

/** YouTube thumbnail via the privacy-friendly ytimg host. Lazy; no iframe is loaded until the viewer presses play. */
export function thumbOf(ep: Pick<Episode, "thumbnailUrl" | "youtubeId">) {
  return ep.thumbnailUrl ?? (ep.youtubeId ? `https://i.ytimg.com/vi/${ep.youtubeId}/hqdefault.jpg` : null);
}

export function EpisodeCard({ ep }: { ep: Episode }) {
  const thumb = thumbOf(ep);
  const ind = industries.find((i) => i.slug === ep.industry);
  const meta = [ep.season && ep.number ? `S${ep.season} · E${ep.number}` : null, ind?.short, fmtDuration(ep.durationSec)].filter(Boolean).join("  ·  ");
  return (
    <Link href={`/episodes/${ep.slug}`} className="group glass block overflow-hidden [--r:1.4rem]">
      <div className="relative aspect-video bg-graphite">
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" loading="lazy" decoding="async" width={480} height={360} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
        <span className="glass absolute bottom-3 left-3 grid size-11 place-items-center [--r:999px]">
          <Play size={16} aria-hidden />
        </span>
      </div>
      <div className="p-5">
        <p className="mono text-[var(--fg-faint)]">{meta}</p>
        <h3 className="display mt-2 text-2xl">{ep.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--fg-dim)]">{ep.summary}</p>
      </div>
    </Link>
  );
}
