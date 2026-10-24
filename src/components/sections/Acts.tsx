import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand, formatINR, pricing } from "@/config/site";
import { industries } from "@/content/industries";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { Lines, Reveal } from "../liquid/Reveal";
import { COLOR, Curve } from "./Curve";
import { DisciplineMark } from "./DisciplineMark";
import { ShowShelf } from "./HomeDynamic";
import { EcosystemHome } from "../partners/Ecosystem";
import { ShowFlow } from "./ShowFlow";
import { WayArt } from "./WayArt";
import { LogoBadge } from "../layout/Wordmark";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow flex items-center gap-4">
    <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
    {children}
  </p>
);

/* ------------------------ How it works: four lit steps --------------------- */
export function ActHow() {
  return (
    <section data-theme="dark" aria-labelledby="act-how" className="section cv-auto !pt-8 sm:!pt-12">
      <div className="wrap">
        <Reveal><Eyebrow>How it works</Eyebrow></Reveal>
        <Lines id="act-how" as="h2" className="display h-xl mt-6 max-w-[16ch]" lines={["Four steps", <em key="e">to the spotlight.</em>]} />
        <div className="mt-14 sm:mt-20"><ShowFlow /></div>
        <Reveal delay={0.1}>
          <p className="mt-14 max-w-[60ch] text-sm text-[var(--fg-faint)]">
            Shortlisting and offers are never guaranteed. Hiring decisions rest with each company. <Link href="/how-it-works" className="link-u text-[var(--fg)]">The full process</Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------ Three ways in ------------------------------------ */
const WAYS = [
  { kind: "candidate", who: "Candidates", a: "Get Seen.", b: "Get Discovered.", href: "/register/candidate", cta: "Apply as a Candidate" },
  { kind: "audience", who: "Audience", a: "Watch. Learn.", b: "Grow.", href: "/register/audience", cta: "Get Audience Tickets" },
  { kind: "recruiter", who: "Recruiters", a: "Discover. Evaluate.", b: "Hire.", href: "/for-recruiters", cta: "Partner as a Recruiter" },
] as const;

const WAY_CARD = "way hover-lift flex h-full flex-col overflow-hidden rounded-[1.3rem] border bg-[var(--bg-raised)]";

export function ActWays() {
  const afterShortlist = pricing.candidatePaymentStage === "after_shortlist";
  const facts: Record<(typeof WAYS)[number]["kind"], string> = {
    candidate: afterShortlist
      ? `Apply free. ${formatINR(pricing.candidate.amount)} ticket if shortlisted. Food and goodies included.`
      : `${formatINR(pricing.candidate.amount)} ticket. Food and goodies included.`,
    audience: `${formatINR(pricing.audience.amount)} ticket. Food and goodies included.`,
    recruiter: "Participation by enquiry.",
  };
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.ivory} shape="swell" flip />
      <section data-theme="light" aria-labelledby="act-ways" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>Choose your seat</Eyebrow></Reveal>
          <Lines id="act-ways" as="h2" className="display h-xl mt-6" lines={["Three ways in.", <em key="e">One room.</em>]} />

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
            {WAYS.map((w, i) => (
              <Reveal key={w.kind} delay={i * 0.1}>
                <article className={`${WAY_CARD} ${w.kind === "candidate" ? "hover-lift-gold relative border-[#b8975a] shadow-[0_0_0_1px_#b8975a,0_24px_60px_-24px_rgb(184_151_90/0.55)]" : "border-[var(--line)]"}`}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <WayArt kind={w.kind} className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <p className="eyebrow">{w.who}</p>
                    <h3 className="display mt-3 text-[2.1rem] leading-[1.02] sm:text-[2.4rem]">{w.a} <em>{w.b}</em></h3>
                    <p className="mt-4 text-sm text-[var(--fg-faint)]">{facts[w.kind]}</p>
                    <div className="mt-auto pt-7">
                      <LiquidButton href={w.href} variant="primary" size="lg" className="w-full">{w.cta}</LiquidButton>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-[64ch] text-sm text-[var(--fg-faint)]">
              No offer is guaranteed. Selection is the panel’s decision, and hiring is each company’s own.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

const PANEL_TONE: Record<string, { bg: string; theme: "dark" | "light" }> = {
  "it-technology": { bg: "#2a2033", theme: "dark" },
  "finance-accounting": { bg: "#e3cfa8", theme: "light" },
  "sales-marketing": { bg: "#b7a9c4", theme: "light" },
  "animation-multimedia": { bg: "#3a2a45", theme: "dark" },
};

export function ActDisciplines() {
  return (
    <>
      <section data-theme="light" aria-labelledby="act-disciplines" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>Multiple disciplines</Eyebrow></Reveal>
          <Lines id="act-disciplines" as="h2" className="display h-xl mt-6 max-w-[16ch]" lines={["Four categories.", <em key="e">Real decisions.</em>]} />
          <Reveal delay={0.15} className="mt-16">
            <ul className="panels overflow-hidden rounded-[1.2rem]">
              {industries.map((i) => {
                const tone = PANEL_TONE[i.slug];
                return (
                  <li key={i.slug} className="contents lg:block">
                    <Link
                      href={`/industries/${i.slug}`}
                      data-theme={tone.theme}
                      style={{ background: tone.bg }}
                      className="panel relative flex min-h-[20rem] flex-col justify-between overflow-hidden p-7 sm:p-9 lg:h-full lg:min-h-0 lg:w-full"
                    >
                      <DisciplineMark slug={i.slug} className="pointer-events-none absolute -bottom-6 -right-6 w-52 opacity-35 sm:w-64" />
                      <span className="eyebrow !text-[var(--fg-dim)]">{i.index}</span>
                      <div className="relative">
                        <h3 className="display panel-title">{i.name}</h3>
                        <div className="panel-more">
                          <p className="mt-3 max-w-[34ch] text-[var(--fg-dim)]">{i.blurb}</p>
                          <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">Explore this discipline <ArrowUpRight size={16} aria-hidden /></span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Scene III: The confirmed ecosystem ---------------- */
export function ActEcosystem() {
  return (
    <section data-theme="light" aria-labelledby="act-ecosystem" className="section cv-auto !bg-[var(--bg-raised)] !pt-16 sm:!pt-24" style={{ ["--bg" as string]: COLOR.pearl }}>
      <div className="wrap">
        <Reveal><Eyebrow>Confirmed participants</Eyebrow></Reveal>
        <Lines id="act-ecosystem" as="h2" className="display h-xl mt-8 max-w-[24ch]" lines={["Who is", <em key="e">in the room.</em>]} />
        <div className="mt-16"><EcosystemHome /></div>
      </div>
    </section>
  );
}

/* ------------------------ Act X: The show ---------------------------------- */
export function ActMedia() {
  return (
    <>
      <Curve from={COLOR.pearl} to={COLOR.aubergine} shape="tide" />
      <section data-theme="dark" aria-labelledby="act-media" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>Filmed and recorded</Eyebrow></Reveal>
          <Lines id="act-media" as="h2" className="display h-xl mt-6 max-w-[16ch]" lines={["Hiring,", <em key="e">on camera and on air.</em>]} />

          <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {[
              {
                kind: "show" as const, who: "The Show", a: "Every pitch,", b: "published.",
                line: "Each edition is filmed for YouTube, always with participants’ permission.",
                status: "Nothing is published yet. The first episode follows the first event.",
                actions: (
                  <>
                    <LiquidButton href="/the-show" variant="primary">About the show</LiquidButton>
                    <LiquidButton href={brand.social.youtube} external variant="glass">YouTube channel</LiquidButton>
                  </>
                ),
              },
              {
                kind: "podcast" as const, who: "The Podcast", a: "Before the", b: "first job.",
                line: "Founders, hiring managers, interns and mentors on how careers really begin.",
                status: "Coming soon. No episodes are published yet.",
                actions: <LiquidButton href="/podcast" variant="glass">About the podcast</LiquidButton>,
              },
            ].map((m, i) => (
              <Reveal key={m.kind} delay={i * 0.1}>
                <article className="way hover-lift flex h-full flex-col overflow-hidden rounded-[1.3rem] border border-[var(--line)] bg-[var(--bg-raised)]">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <WayArt kind={m.kind} className="absolute inset-0 h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <p className="eyebrow">{m.who}</p>
                    <h3 className="display mt-3 text-[2.1rem] leading-[1.02] sm:text-[2.4rem]">{m.a} <em>{m.b}</em></h3>
                    <p className="mt-4 text-[var(--fg-dim)]">{m.line}</p>
                    <p className="mt-3 text-sm text-[var(--fg-faint)]">{m.status}</p>
                    <div className="mt-auto flex flex-wrap gap-3 pt-7">{m.actions}</div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Appears only once episodes are published */}
          <ShowShelf />
        </div>
      </section>
    </>
  );
}

export function ActSponsor() {
  return (
    <section data-theme="dark" aria-labelledby="act-sponsor" className="section cv-auto !pt-8 sm:!pt-12">
      <div className="wrap">
        <div className="hairline mb-16 sm:mb-24" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal><Eyebrow>Sponsor the room</Eyebrow></Reveal>
            <Lines id="act-sponsor" as="h2" className="display h-xl mt-6" lines={["Help make", <em key="e">opportunity visible.</em>]} />
            <Reveal delay={0.15}>
              <p className="lede mt-7">The venue is yet to be announced. Founding partners are invited to help produce Season 01.</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="What partners help produce">
                {["Filming and audio", "Hospitality", "Media production"].map((t) => (
                  <li key={t} className="rounded-full border border-[var(--line)] px-4 py-1.5 text-sm text-[var(--fg-dim)]">{t}</li>
                ))}
              </ul>
              <p className="eyebrow mt-4">Proposed formats · subject to agreement</p>
              <div className="action-group mt-8 flex flex-wrap gap-3">
                <LiquidButton href="/sponsors" variant="primary" size="lg">Explore partnership</LiquidButton>
                <LiquidButton href="/sponsors#enquiry" variant="glass" size="lg">Start a conversation</LiquidButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] border border-[#cbae76]/35 shadow-[0_36px_80px_-40px_rgb(0_0_0/0.85)]">
              <WayArt kind="partners" className="absolute inset-0 h-full w-full" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------ Act XII: Manifesto ------------------------------- */
export function ActManifesto() {
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.ivory} shape="arc" />
      <section data-theme="light" aria-labelledby="act-manifesto" className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_50%_100%,rgb(203_174_118/0.2),transparent_70%)]" />
        <div className="wrap section grid min-h-[88svh] content-center justify-items-center text-center !pt-12">
          <LogoBadge size={88} />
          <Lines id="act-manifesto" as="h2" className="display h-xl mt-10 max-w-[16ch]" lines={["Talent is everywhere.", <em key="e">Opportunity shouldn’t be hidden.</em>]} />
          <Reveal delay={0.2}>
            <p className="lede mx-auto mt-8">Be one of the first in the room.</p>
            <div className="action-group mt-10 flex flex-wrap justify-center gap-3">
              <MagneticCTA href="/register/candidate">Apply as a Candidate</MagneticCTA>
              <LiquidButton href="/for-recruiters" variant="glass" size="lg">I’m Hiring</LiquidButton>
            </div>
            <a className="link-u mt-14 inline-block text-sm" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
