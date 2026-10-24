import { Suspense } from "react";
import { publicEpisodes } from "@/lib/content";
import { LiquidButton } from "../liquid/LiquidButton";
import { EpisodeCard } from "../media/EpisodeCard";

async function Shelf() {
  const eps = (await publicEpisodes()).slice(0, 3);
  if (eps.length > 0)
    return (
      <div className="mt-14">
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
  return null;
}

export function ShowShelf() {
  return (
    <Suspense fallback={null}>
      <Shelf />
    </Suspense>
  );
}
