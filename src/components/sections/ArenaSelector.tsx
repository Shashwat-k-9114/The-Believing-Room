"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { industries } from "@/content/industries";
import { FluidTabBar } from "../liquid/controls";
import { LiquidButton } from "../liquid/LiquidButton";
import { IndustryArt } from "./IndustryArt";

/** Act III: four arenas as one interactive stage, each with its own atmosphere. */
export function ArenaSelector() {
  const [slug, setSlug] = useState(industries[0].slug);
  const ind = industries.find((i) => i.slug === slug)!;

  return (
    <div style={{ ["--ia" as string]: ind.accent }}>
      <div className="noscroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
        <FluidTabBar
          label="Choose an industry arena"
          idBase="arena-tab"
          value={slug}
          onChange={(v) => setSlug(v as typeof slug)}
          tabs={industries.map((i) => ({ id: i.slug, label: i.short, prefix: i.index }))}
          className="w-max"
        />
      </div>

      <div
        role="tabpanel"
        id={`panel-${ind.slug}`}
        aria-labelledby={`arena-tab-${ind.slug}`}
        tabIndex={0}
        className="relative mt-8 grid items-center gap-10 overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-10 lg:mt-10 lg:grid-cols-[1.05fr_1fr] lg:p-14"
        style={{
          background: `radial-gradient(80% 90% at 80% 20%, color-mix(in srgb, var(--ia) 20%, transparent), transparent 70%), linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.01))`,
        }}
      >
        <div key={ind.slug} className="relative z-10 [animation:rise_0.8s_var(--ease-cinema)_both]">
          <p className="mono" style={{ color: ind.accent }}>
            {ind.index} / {ind.motif}
          </p>
          <h3 className="display h-xl mt-4">{ind.name}</h3>
          <p className="display mt-3 text-2xl italic text-white/80 sm:text-3xl">{ind.tagline}</p>
          <p className="lede mt-6">{ind.blurb}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${ind.short} skills`}>
            {ind.skills.slice(0, 5).map((s) => (
              <li key={s} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LiquidButton href={`/industries/${ind.slug}`} variant="glass">
              Explore this arena <ArrowUpRight size={16} aria-hidden />
            </LiquidButton>
            <LiquidButton href={`/register/student?industry=${ind.slug}`} variant="quiet">
              Apply in this arena
            </LiquidButton>
          </div>
        </div>
        <div key={ind.slug + "-art"} className="relative [animation:rise_1s_var(--ease-cinema)_both]" aria-hidden>
          <IndustryArt slug={ind.slug} className="mx-auto w-full max-w-[520px]" />
        </div>
      </div>

      <p className="mt-5 text-sm text-[var(--fg-faint)]">
        Roles shown on each arena page are illustrative of what an industry offers, not confirmed vacancies.{" "}
        <Link href="/industries" className="underline underline-offset-4">
          Compare all four
        </Link>
      </p>
    </div>
  );
}
