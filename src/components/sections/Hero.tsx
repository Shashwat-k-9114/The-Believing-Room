import { formatINR, pricing } from "@/config/site";
import { MagneticCTA } from "../liquid/LiquidButton";
import { HeroParallax, SkipIntro, WatchExperience } from "./HeroClient";
import { StageArt } from "./StageArt";

const LINES = ["Your potential.", "Their attention.", "Your moment."];

export function Hero() {
  return (
    <HeroParallax>
      {/* Art: right-weighted on desktop, lower half on mobile */}
      <div className="absolute inset-x-0 bottom-0 top-[34%] lg:inset-y-0 lg:left-[34%]">
        <StageArt className="h-full w-full" />
      </div>

      <div className="wrap relative z-10 flex min-h-svh flex-col justify-end pb-10 pt-32 sm:pb-14 lg:justify-center lg:pb-20">
        <p className="eyebrow hero-brand mb-6 flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
          A live pitching stage for student talent · India
        </p>

        <h1 id="hero-title" className="display h-mega max-w-[16ch] uppercase">
          {LINES.map((l, i) => (
            <span key={l} className="hero-line" style={{ ["--i" as string]: i }}>
              <span className={i === 2 ? "italic text-[var(--accent)]" : ""}>{l}</span>
            </span>
          ))}
        </h1>

        <p className="lede hero-fade mt-7 max-w-[34rem]" style={{ ["--d" as string]: "0s" }}>
          An extraordinary stage where ambitious students pitch their abilities directly to industry professionals and compete for real internship opportunities.
        </p>
        <p className="mono hero-fade mt-4 text-[var(--fg-faint)]" style={{ ["--d" as string]: "0.12s" }}>
          Four industries. One stage. A world of possibilities.
        </p>

        <div className="hero-fade mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "0.28s" }}>
          <MagneticCTA href="/register/student">Enter the Arena</MagneticCTA>
          <WatchExperience />
        </div>

        <ul className="hero-fade mono mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[var(--fg-dim)]" style={{ ["--d" as string]: "0.4s" }}>
          <li>Student Pass {formatINR(pricing.student.amount)}</li>
          <li>Audience Pass {formatINR(pricing.audience.amount)}</li>
          {pricing.foodIncluded && <li className="text-[var(--accent)]">Food included</li>}
        </ul>
      </div>
      <SkipIntro />
    </HeroParallax>
  );
}
