import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand, formatINR, inclusions, pricing, socialLinks } from "@/config/site";
import { industries } from "@/content/industries";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { Lines, Reveal } from "../liquid/Reveal";
import { COLOR, Curve } from "./Curve";
import { DisciplineMark } from "./DisciplineMark";
import { ShowShelf } from "./HomeDynamic";
import { EcosystemHome } from "../partners/Ecosystem";
import { EducationBenefit } from "../partners/Education";
import { Journey } from "./Journey";
import { ArchMark } from "../layout/Wordmark";

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="eyebrow flex items-center gap-4">
    <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
    {children}
  </p>
);

/* ------------------------- Act II: The philosophy -------------------------- */
export function ActPhilosophy() {
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.ivory} shape="swell" />
      <section data-theme="light" aria-labelledby="act-philosophy" className="section !pt-16 sm:!pt-24">
        <div className="wrap grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:gap-24">
          <div>
            <Reveal><Eyebrow>The philosophy</Eyebrow></Reveal>
            <Lines
              id="act-philosophy"
              as="h2"
              className="display h-xl mt-8"
              lines={["Your resume opens the door.", <span key="e">Your potential makes you <em>stand out.</em></span>]}
            />
            <Reveal delay={0.2}>
              <p className="lede mt-10">
                A résumé tells a company what you have done. It cannot show how you think, how you speak, or how you respond when someone asks a hard question. The Believing Room gives candidates the chance to do exactly that, in front of the people who hire.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.25} className="self-end">
            <dl className="border-t border-[var(--fg)]">
              {[
                ["Conventional screening", "Behind closed doors. A document, a keyword filter, a decision you rarely see."],
                ["The Believing Room", "In the room. A conversation, a fair chance to be heard, and a constructive next step whatever the result."],
              ].map(([t, d], i) => (
                <div key={t} className="grid gap-1 border-b border-[var(--line)] py-6">
                  <dt className={`eyebrow ${i ? "!text-[var(--accent)]" : ""}`}>{t}</dt>
                  <dd className="display text-2xl leading-snug">{d}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* -------------------------- Scene IV: The candidate journey ---------------- */
export function ActProcess() {
  return (
    <>
      <Curve from={COLOR.pearl} to={COLOR.aubergine} shape="tide" flip />
      <section data-theme="dark" aria-labelledby="act-process" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>The candidate journey</Eyebrow></Reveal>
          <Lines id="act-process" as="h2" className="display h-xl mt-8 max-w-[14ch]" lines={["From application", <em key="e">to opportunity.</em>]} />
          <Reveal delay={0.1}><Journey /></Reveal>
          <Reveal delay={0.1}>
            <p className="mt-16 max-w-[60ch] text-sm text-[var(--fg-faint)]">
              Employment decisions remain with the participating employers. Registration and payment do not guarantee an offer. <Link href="/how-it-works" className="link-u text-[var(--fg)]">The full process</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Act V: Four disciplines -------------------------- */
const PANEL_TONE: Record<string, { bg: string; theme: "dark" | "light" }> = {
  "it-technology": { bg: "#2a2033", theme: "dark" },
  "finance-accounting": { bg: "#e3cfa8", theme: "light" },
  "sales-marketing": { bg: "#b7a9c4", theme: "light" },
  "animation-multimedia": { bg: "#3a2a45", theme: "dark" },
};

export function ActDisciplines() {
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.ivory} shape="arc" />
      <section data-theme="light" aria-labelledby="act-disciplines" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>Season 01 · Four disciplines</Eyebrow></Reveal>
          <Lines id="act-disciplines" as="h2" className="display h-xl mt-8 max-w-[16ch]" lines={["Four categories.", <em key="e">Real decisions.</em>]} />
          <Reveal delay={0.1}>
            <p className="lede mt-8">The first season focuses on four internship categories and gives candidates a transparent opportunity to demonstrate their skills.</p>
          </Reveal>
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

/* ----------------------- Act VI: Inside the experience --------------------- */
const MOMENTS = [
  ["Candidate pitches", "A short introduction, a demonstration, a story."],
  ["Industry evaluation", "Panelists assess skills, communication and potential."],
  ["Real conversations", "Questions that go further than a résumé can."],
  ["Panel questions", "Where thinking becomes visible."],
  ["Audience learning", "Everyone in the room learns what hiring looks like."],
  ["Possible decisions", "Offers, where a panel sees fit, are the company’s call."],
];

export function ActInside() {
  return (
    <>
      <Curve from={COLOR.ivory} to={COLOR.aubergine} shape="tide" />
      <section data-theme="dark" aria-labelledby="act-inside" className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src="/images/concept-stage.jpg" alt="" fill sizes="100vw" className="object-cover object-[50%_40%] opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#160f1c_8%,rgb(22_15_28/0.8)_45%,rgb(22_15_28/0.35)_100%),linear-gradient(to_bottom,#160f1c,transparent_25%,transparent_70%,#160f1c)]" />
        </div>
        <div className="wrap section cv-auto !pt-12">
          <Reveal><Eyebrow>Inside the experience</Eyebrow></Reveal>
          <Lines id="act-inside" as="h2" className="display h-xl mt-8 max-w-[12ch]" lines={["A room where", <em key="e">people are heard.</em>]} />
          <ul className="mt-16 grid max-w-3xl gap-x-12 sm:grid-cols-2">
            {MOMENTS.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.06} className="border-t border-[var(--line)] py-5">
                <h3 className="display text-2xl">{t}</h3>
                <p className="mt-1 text-sm text-[var(--fg-dim)]">{d}</p>
              </Reveal>
            ))}
          </ul>
          <p className="eyebrow mt-10">Conceptual imagery · not footage from an event</p>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Act VII: Your place ------------------------------ */
export function ActPlace() {
  const afterShortlist = pricing.candidatePaymentStage === "after_shortlist";
  return (
    <>
      <Curve from={COLOR.champagne} to={COLOR.ivory} shape="swell" flip />
      <section data-theme="light" aria-labelledby="act-place" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>Three ways in</Eyebrow></Reveal>
          <Lines id="act-place" as="h2" className="display h-xl mt-8 max-w-[14ch]" lines={["There is a place", <em key="e">for you in the room.</em>]} />

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr] lg:gap-14">
            {/* The one signature glass moment: the candidate ticket */}
            <Reveal>
              <article data-theme="dark" className="glass relative flex h-full flex-col overflow-hidden p-8 sm:p-10 [--r:1.2rem]" style={{ background: "linear-gradient(160deg,#2d2238,#160f1c 70%)" }}>
                <ArchMark size={34} className="text-[#cbae76]" />
                <p className="eyebrow mt-8">Candidate</p>
                <p className="display mt-3 text-7xl leading-none sm:text-8xl" aria-label={`${formatINR(pricing.candidate.amount)} candidate ticket`}>{formatINR(pricing.candidate.amount)}</p>
                <p className="mt-2 text-sm text-[var(--fg-faint)]">Candidate ticket · food included</p>
                <p className="mt-6 text-[var(--fg-dim)]">Put your skills, story and personality in front of real hiring decision-makers.</p>
                <ul className="mt-6 grid gap-2 text-sm text-[var(--fg-dim)]">
                  {[...inclusions.both, ...inclusions.candidate].map((f) => <li key={f} className="border-t border-[var(--line)] pt-2">{f}</li>)}
                </ul>
                <p className="mt-6 text-xs text-[var(--fg-faint)]">
                  {afterShortlist ? "Applying is free; the ticket is requested after you are shortlisted. " : "Payable when you register. "}Not a guarantee of an offer. Selection depends entirely on the panel’s decision.
                </p>
                <div className="mt-auto pt-8"><LiquidButton href="/register/candidate" variant="primary" size="lg" className="w-full">Apply as a Candidate</LiquidButton></div>
              </article>
            </Reveal>

            <Reveal delay={0.1}>
              <article className="flex h-full flex-col border-t border-[var(--fg)] pt-8">
                <p className="eyebrow">Hiring companies</p>
                <h3 className="display mt-3 text-5xl">Recruiter</h3>
                <p className="mt-5 text-[var(--fg-dim)]">Meet candidates, evaluate their potential and offer meaningful internship opportunities.</p>
                <p className="mt-4 text-sm text-[var(--fg-faint)]">Participation is by enquiry. No hiring outcome or media reach is promised.</p>
                <div className="mt-auto pt-8"><LiquidButton href="/for-recruiters" variant="glass" size="lg">Apply as a Recruiter</LiquidButton></div>
              </article>
            </Reveal>

            <Reveal delay={0.2}>
              <article className="flex h-full flex-col border-t border-[var(--fg)] pt-8">
                <p className="eyebrow">Audience</p>
                <p className="display mt-3 text-7xl leading-none" aria-label={`${formatINR(pricing.audience.amount)} audience ticket`}>{formatINR(pricing.audience.amount)}</p>
                <p className="mt-2 text-sm text-[var(--fg-faint)]">Audience ticket · food included</p>
                <p className="mt-5 text-[var(--fg-dim)]">Follow the journey, learn from real interviews and join the community.</p>
                <div className="mt-auto pt-8"><LiquidButton href="/register/audience" variant="glass" size="lg">Audience tickets</LiquidButton></div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Act X: The show ---------------------------------- */
export function ActShow() {
  return (
    <>
      <Curve from={COLOR.ivory} to={COLOR.aubergine} shape="tide" />
      <section data-theme="dark" aria-labelledby="act-show" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap">
          <Reveal><Eyebrow>The Show</Eyebrow></Reveal>
          <Lines id="act-show" as="h2" className="display h-xl mt-8 max-w-[14ch]" lines={["Hiring,", <em key="e">on camera.</em>]} />
          <Reveal delay={0.1}>
            <p className="lede mt-8">The live event is filmed and published on YouTube: full episodes, candidate pitches, panel conversations, highlights and behind the scenes, always with participants’ permission.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LiquidButton href={brand.social.youtube} external variant="primary" size="lg">Visit @thebelievingroom</LiquidButton>
              <LiquidButton href="/the-show" variant="glass" size="lg">About the show</LiquidButton>
            </div>
          </Reveal>
          <div className="mt-16"><ShowShelf /></div>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Act XI: The podcast ------------------------------ */
const POD_THEMES = ["The first opportunity", "What recruiters evaluate", "Life before the first job", "Founders and hiring", "Career mistakes", "Creative careers"];

export function ActPodcast() {
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.pearl} shape="swell" flip />
      <section data-theme="light" aria-labelledby="act-podcast" className="section cv-auto !bg-[var(--bg-raised)] !pt-16 sm:!pt-24" style={{ ["--bg" as string]: COLOR.pearl }}>
        <div className="wrap grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
          <div>
            <Reveal><Eyebrow>The Podcast</Eyebrow></Reveal>
            <Lines id="act-podcast" as="h2" className="display h-xl mt-8" lines={["Conversations before", <em key="e">the first job.</em>]} />
            <Reveal delay={0.15}>
              <p className="lede mt-8">Long-form interviews with founders, hiring managers, interns and mentors about ambition, recruitment and how careers actually begin. Intelligent and conversational, not motivational.</p>
              <p className="mt-6 max-w-[56ch] text-sm text-[var(--fg-faint)]">Recording location to be announced. Equipment and production are arranged by The Believing Room.</p>
              <p className="eyebrow mt-6">Coming soon · no episodes published yet</p>
              <div className="mt-8"><LiquidButton href="/podcast" variant="glass" size="lg">The podcast</LiquidButton></div>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="self-end">
            <ul className="border-t border-[var(--fg)]">
              {POD_THEMES.map((t, i) => (
                <li key={t} className="display flex items-baseline gap-5 border-b border-[var(--line)] py-4 text-2xl sm:text-3xl">
                  <span className="eyebrow w-6">{String(i + 1).padStart(2, "0")}</span>{t}
                </li>
              ))}
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
        <Reveal><Eyebrow>The confirmed ecosystem</Eyebrow></Reveal>
        <Lines id="act-ecosystem" as="h2" className="display h-xl mt-8 max-w-[24ch]" lines={["The people and organisations", <em key="e">helping bring the room to life.</em>]} />
        <div className="mt-16"><EcosystemHome /></div>
      </div>
    </section>
  );
}

/* ------------------------ Scene VII: The educational contribution ---------- */
export function ActEducation() {
  return (
    <>
      <Curve from={COLOR.aubergine} to={COLOR.champagne} shape="ribbon" />
      <section data-theme="light" aria-labelledby="act-education" className="section cv-auto !pb-24 !pt-16 sm:!pb-32 sm:!pt-24" style={{ ["--bg" as string]: COLOR.champagne, background: COLOR.champagne }}>
        <div className="wrap">
          <Reveal><Eyebrow>The educational contribution</Eyebrow></Reveal>
          <Lines id="act-education" as="h2" className="display h-xl mt-8 max-w-[16ch]" lines={["Learning, beyond", <em key="e">the hiring decision.</em>]} />
          <div className="mt-14"><EducationBenefit /></div>
        </div>
      </section>
    </>
  );
}

/* ------------------------ Scene XI: Sponsor the room ----------------------- */
export function ActSponsor() {
  return (
    <>
      <Curve from={COLOR.pearl} to={COLOR.aubergine} shape="veil" />
      <section data-theme="dark" aria-labelledby="act-sponsor" className="section cv-auto !pt-16 sm:!pt-24">
        <div className="wrap grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-24">
          <div>
            <Reveal><Eyebrow>Sponsor the room</Eyebrow></Reveal>
            <Lines id="act-sponsor" as="h2" className="display h-xl mt-8" lines={["Help make", <em key="e">opportunity visible.</em>]} />
            <Reveal delay={0.15}>
              <p className="lede mt-8">
                The venue is yet to be announced. Filming, audio, lighting, postproduction, hospitality and event operations still need support. Founding partners are being invited to help produce a first season that is honest, well made and useful to students.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <LiquidButton href="/sponsors" variant="primary" size="lg">Explore partnership</LiquidButton>
                <LiquidButton href="/sponsors#enquiry" variant="glass" size="lg">Start a conversation</LiquidButton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <ul className="border-t border-[var(--fg)]">
              {["Professional filming and audio", "Candidate and guest hospitality", "Educational content", "Responsible media production"].map((t, i) => (
                <li key={t} className="display flex items-baseline gap-5 border-b border-[var(--line)] py-4 text-2xl sm:text-3xl">
                  <span className="eyebrow w-6">{String(i + 1).padStart(2, "0")}</span>{t}
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-4">Proposed formats · subject to agreement</p>
          </Reveal>
        </div>
      </section>
    </>
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
          <ArchMark size={44} className="text-[#cbae76]" />
          <Lines id="act-manifesto" as="h2" className="display h-xl mt-10 max-w-[16ch]" lines={["Talent is everywhere.", <em key="e">Opportunity shouldn’t be hidden.</em>]} />
          <Reveal delay={0.2}>
            <p className="lede mx-auto mt-8">Be one of the first candidates, companies or supporters to help build a different hiring experience.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <MagneticCTA href="/register/candidate">Apply as a Candidate</MagneticCTA>
              <LiquidButton href="/for-recruiters" variant="glass" size="lg">I’m Hiring</LiquidButton>
            </div>
            <ul className="mt-14 flex flex-wrap justify-center gap-x-7 gap-y-2" aria-label="Follow the journey">
              {socialLinks.map((s) => (
                <li key={s.key}><a href={s.href} target="_blank" rel="noopener noreferrer" className="link-u text-sm text-[var(--fg-dim)] hover:text-[var(--fg)]">{s.label} · {s.handle}</a></li>
              ))}
            </ul>
            <a className="link-u mt-5 inline-block text-sm" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
