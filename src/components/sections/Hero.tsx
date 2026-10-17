import Link from "next/link";
import { formatINR, pricing } from "@/config/site";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { RibbonArt } from "./RibbonArt";

export function Hero() {
  return (
    <section data-theme="dark" aria-labelledby="hero-title" className="relative isolate min-h-svh overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_78%_72%,rgb(203_174_118/0.16),transparent_70%),radial-gradient(60%_50%_at_10%_0%,rgb(140_122_155/0.2),transparent_70%)]" />

      {/* sculpture: the animated layer spans the whole hero so the ribbon can bleed behind the copy */}
      <div className="hero-art absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 top-[40%] lg:inset-y-0 lg:left-[38%] lg:top-0 lg:py-24">
          <RibbonArt className="h-full w-full" />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,#160f1c_0%,#160f1c_38%,rgb(22_15_28/0.9)_46%,transparent_64%)] max-lg:bg-[linear-gradient(to_bottom,#160f1c_0%,rgb(22_15_28/0.55)_38%,transparent_64%)]" />
      </div>

      <div className="wrap relative z-10 flex min-h-svh flex-col justify-center pb-14 pt-32 max-lg:justify-start max-lg:pt-36">
        <p className="eyebrow hero-eyebrow mb-7 flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-[var(--accent)]" />
          Real opportunities · Pure professionalism
        </p>

        <h1 id="hero-title" className="display h-mega max-w-[9ch] lg:max-w-[11ch]">
          <span className="hero-line" style={{ ["--i" as string]: 0 }}><span>Where</span></span>
          <span className="hero-line" style={{ ["--i" as string]: 1 }}><span>Opportunity</span></span>
          <span className="hero-line" style={{ ["--i" as string]: 2 }}><span>Meets <em>Belief.</em></span></span>
        </h1>

        <p className="display hero-fade mt-8 text-2xl italic text-[var(--fg-dim)] sm:text-3xl" style={{ ["--d" as string]: "0s" }}>
          One room. Many chances to be heard.
        </p>
        <p className="lede hero-fade mt-5 max-w-[34rem]" style={{ ["--d" as string]: "0.12s" }}>
          Candidates and hiring companies meet in person, so people can demonstrate their skills, show their potential and receive honest feedback.
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "0.26s" }}>
          <MagneticCTA href="/register/candidate">Apply as a Candidate</MagneticCTA>
          <LiquidButton href="/how-it-works" variant="glass" size="lg">See How It Works</LiquidButton>
        </div>

        <p className="hero-fade mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--fg-dim)]" style={{ ["--d" as string]: "0.4s" }}>
          <span>Hiring? <Link href="/for-recruiters" className="link-u text-[var(--fg)]">Apply as a recruiter</Link></span>
          <span>Attending? <Link href="/register/audience" className="link-u text-[var(--fg)]">Audience tickets</Link></span>
        </p>

        <p className="eyebrow hero-fade mt-10" style={{ ["--d" as string]: "0.5s" }}>
          Candidate {formatINR(pricing.candidate.amount)} &nbsp;·&nbsp; Audience {formatINR(pricing.audience.amount)} &nbsp;·&nbsp; Food included
        </p>
      </div>
    </section>
  );
}
