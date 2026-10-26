import { phaseMeta } from "@/config/ecosystem";
import { seasonPhase } from "@/lib/content";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { PitchScene } from "./PitchScene";

/** First screen: the stage, one line that says what it is, three ways in. */
export function Hero() {
  const phase = phaseMeta(seasonPhase());
  return (
    <section data-theme="dark" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_80%_55%,rgb(203_174_118/0.18),transparent_70%),radial-gradient(55%_45%_at_8%_0%,rgb(140_122_155/0.22),transparent_70%)]" />

      <div className="wrap grid items-center gap-10 pb-16 pt-28 md:pt-40 lg:min-h-svh lg:grid-cols-[1.2fr_0.8fr] lg:gap-6 lg:pb-12 lg:pt-28">
        <div className="relative z-10">
          <p className="eyebrow hero-eyebrow mb-6 flex items-center gap-4">
            <span aria-hidden className="h-px w-10 bg-[var(--accent)]" />
            Live pitch show · Season 01
          </p>

          <h1 id="hero-title" className="display h-hero">
            <span className="hero-line" style={{ ["--i" as string]: 0 }}><span>Your Talent.</span></span>
            <span className="hero-line" style={{ ["--i" as string]: 1 }}><span>Your Stage.</span></span>
            <span className="hero-line" style={{ ["--i" as string]: 2 }}><span>Your <em>Opportunity.</em></span></span>
          </h1>

          <p className="hero-fade mt-7 max-w-[30rem] text-xl font-medium text-[var(--fg)] sm:text-2xl" style={{ ["--d" as string]: "0s" }}>
            Pitch live. Meet recruiters. Unlock opportunities.
          </p>

          <div className="action-group hero-fade mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ ["--d" as string]: "0.14s" }}>
            <MagneticCTA href="/register/candidate">Apply as a Candidate</MagneticCTA>
            <LiquidButton href="/register/audience" variant="glass" size="lg">Join the Audience</LiquidButton>
            <LiquidButton href="/for-recruiters" variant="glass" size="lg">Partner as a Recruiter</LiquidButton>
          </div>

          <p className="eyebrow hero-fade mt-9" style={{ ["--d" as string]: "0.3s" }}>
            Season 01 · {phase.label}
          </p>
          <p className="hero-fade mt-2 max-w-[34rem] text-xs text-[var(--fg-faint)]" style={{ ["--d" as string]: "0.36s" }}>
            Not a job board. No placement is promised. Candidate and audience tickets are free, food and goodies included.
          </p>
        </div>

        <div className="hero-art relative mx-auto w-full max-w-[28rem] lg:ml-auto lg:mr-0 lg:max-w-[27rem]">
          <div className="relative aspect-[8/9] overflow-hidden rounded-[1.6rem] border border-[#cbae76]/35 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.85)]">
            <PitchScene className="absolute inset-0 h-full w-full" />
            {/* What is happening in the picture, in four words each. Real text, so it is read aloud and survives without the art. */}
            <ul className="pitch-tags">
              <li className="pitch-tag" style={{ ["--d" as string]: "1.5s", left: "4%", top: "34%" }}><span aria-hidden />Candidate pitches</li>
              <li className="pitch-tag" style={{ ["--d" as string]: "1.75s", right: "4%", top: "66%" }}><span aria-hidden />Recruiters evaluate</li>
              <li className="pitch-tag" style={{ ["--d" as string]: "2s", left: "4%", bottom: "3.5%" }}><span aria-hidden />Filmed for YouTube</li>
              <li className="pitch-tag" style={{ ["--d" as string]: "2.25s", right: "4%", bottom: "3.5%" }}><span aria-hidden />Audience watches</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
