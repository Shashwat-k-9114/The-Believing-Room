"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Privacy-enhanced, lazy YouTube embed. Nothing from YouTube loads except the
 * poster thumbnail until the viewer presses play. Then a youtube-nocookie iframe mounts.
 */
export function YouTubeFacade({ id, title, poster }: { id: string; title: string; poster?: string | null }) {
  const [on, setOn] = useState(false);
  const thumb = poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  return (
    <div className="relative aspect-video overflow-hidden rounded-[1.6rem] bg-black">
      {on ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 size-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb} alt="" loading="lazy" decoding="async" className="size-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="glass glass-frost absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center [--r:999px]">
            <Play size={28} aria-hidden />
          </span>
        </button>
      )}
    </div>
  );
}
