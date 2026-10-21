import Link from "next/link";
import { formatINR, pricing } from "@/config/site";
import { phaseMeta } from "@/config/ecosystem";
import { seasonPhase } from "@/lib/queries";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { RibbonArt } from "./RibbonArt";

export async function Hero() {
  const phase = phaseMeta(await seasonPhase());
  return (
    <section data-theme="dark" aria-labelledby="hero-title" className="relative isolate min-h-svh overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_78%_72%,rgb(203_174_118/0.16),transparent_70%),radial-gradient(60%_50%_at_10%_0%,rgb(140_122_155/0.2),transparent_70%)]" />

      {/* One column of copy, with the sculpture placed by breakpoint. Wide: it bleeds behind the copy on the right.
          Narrow: it is its own full-bleed band between the primary actions and the secondary links, so it is seen in full and never under text. */}
      <div className="wrap flex min-h-svh flex-col justify-center pb-14 pt-32 max-lg:justify-start max-lg:pt-36">
        <div className="relative z-10">
        <p className="eyebrow hero-eyebrow mb-7 flex items-center gap-4">
          <span aria-hidden className="h-px w-10 bg-[var(--accent)]" />
          Real opportunities · Pure professionalism
        </p>

        <h1 id="hero-title" className="display h-mega max-w-[11ch]">
          <span className="hero-line" style={{ ["--i" as string]: 0 }}><span>Where</span></span>
          <span className="hero-line" style={{ ["--i" as string]: 1 }}><span>Opportunity</span></span>
          <span className="hero-line" style={{ ["--i" as string]: 2 }}><span>Meets <em>Belief.</em></span></span>
        </h1>

        <p className="display hero-fade mt-8 text-2xl italic text-[var(--fg-dim)] sm:text-3xl" style={{ ["--d" as string]: "0s" }}>
          One room. Many chances to be heard.
        </p>
        <p className="lede hero-fade mt-5 max-w-[34rem]" style={{ ["--d" as string]: "0.12s" }}>
          The Believing Room is a live internship-pitching show. Students present their skills, projects and potential directly to industry professionals, and show what a résumé cannot.
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "0.26s" }}>
          <MagneticCTA href="/register/candidate">Enter the Room</MagneticCTA>
          <LiquidButton href="/how-it-works" variant="glass" size="lg">Explore the Experience</LiquidButton>
        </div>

        </div>

        <div className="hero-art max-lg:relative max-lg:left-1/2 max-lg:mt-10 max-lg:h-[27rem] max-lg:w-screen max-lg:-translate-x-1/2 lg:absolute lg:inset-0">
          {/* Narrow screens fade the band's top and bottom with a transparency mask (not a colour), so it melts into whatever tint is behind it. */}
          <div className="absolute inset-0 max-lg:[mask-image:linear-gradient(to_bottom,transparent_0%,#000_24%,#000_74%,transparent_100%)] lg:left-[38%] lg:py-24">
            <RibbonArt className="h-full w-full" />
          </div>
          <div aria-hidden className="absolute inset-0 max-lg:hidden lg:bg-[linear-gradient(to_right,#160f1c_0%,#160f1c_38%,rgb(22_15_28/0.9)_46%,transparent_64%)]" />
        </div>

        <div className="relative z-10">
        <p className="hero-fade mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--fg-dim)]" style={{ ["--d" as string]: "0.4s" }}>
          <span>Candidate? <Link href="/register/candidate" className="link-u text-[var(--fg)]">Apply to pitch</Link></span>
          <span>Hiring? <Link href="/for-recruiters" className="link-u text-[var(--fg)]">Apply as a recruiter</Link></span>
          <span>Attending? <Link href="/register/audience" className="link-u text-[var(--fg)]">Audience tickets</Link></span>
        </p>

        <p className="eyebrow hero-fade mt-10" style={{ ["--d" as string]: "0.5s" }}>
          Season 01 · {phase.label}
        </p>
        <p className="hero-fade mt-2 text-xs text-[var(--fg-faint)]" style={{ ["--d" as string]: "0.55s" }}>
          Not a job board, and no placement is promised. Planned pricing: candidate {formatINR(pricing.candidate.amount)}, audience {formatINR(pricing.audience.amount)}, food included.
        </p>
        </div>
      </div>
    </section>
  );
}
