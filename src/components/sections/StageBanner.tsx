import { LiquidButton } from "../liquid/LiquidButton";
import { Reveal } from "../liquid/Reveal";

/** The show banner, right under the hero: the stage, the logo and the line, with one beam of light sweeping across as it reveals. */
export function StageBanner() {
  return (
    <section data-theme="dark" aria-label="The Believing Room" className="relative pb-14 pt-4 sm:pb-20 sm:pt-6">
      <div className="wrap">
        <Reveal>
          <figure className="stage-banner relative overflow-hidden rounded-[1.4rem] border border-[#f3e0a8]/25 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.85)] sm:rounded-[2rem]">
            <picture>
              <source type="image/webp" srcSet="/brand/tbr-banner-1000.webp 1000w, /brand/tbr-banner-2000.webp 2000w" sizes="(min-width: 1280px) 1180px, 96vw" />
              <img
                src="/brand/tbr-banner-2000.jpg" width={2000} height={667} loading="lazy" decoding="async"
                alt="The Believing Room: Where Talent Meets Opportunity. A gold B with a microphone and necktie, on a spotlit stage with purple curtains."
                className="block h-auto w-full"
              />
            </picture>
            <span aria-hidden className="stage-beam" />
          </figure>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <p className="display max-w-[30ch] text-2xl italic text-[var(--fg-dim)] sm:text-3xl">The stage is set. <em>Step into the light.</em></p>
            <div className="flex flex-wrap gap-3">
              <LiquidButton href="/register/candidate" variant="primary">Apply to pitch</LiquidButton>
              <LiquidButton href="/links" variant="glass">All our links</LiquidButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
