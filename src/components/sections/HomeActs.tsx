import Link from "next/link";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import { formatINR, inclusions, pricing } from "@/config/site";
import { LiquidButton, MagneticCTA } from "../liquid/LiquidButton";
import { Reveal } from "../liquid/Reveal";
import { ElasticPill } from "../liquid/surfaces";
import { ArenaSelector } from "./ArenaSelector";
import { PeopleBlock, ShowShelf } from "./HomeDynamic";
import { StageArt } from "./StageArt";

/* ----------------------------- Act II ------------------------------------- */
export function ActOldNew() {
  const rows = [
    ["A PDF, read for seven seconds", "Five minutes, live, with questions"],
    ["Your grades speak for you", "You speak for your work"],
    ["Silence after you apply", "A panel that responds in the room"],
    ["Hope you stand out", "A stage built to make you stand out"],
  ];
  return (
    <section data-theme="light" aria-labelledby="act2" className="section cv-auto">
      <div className="wrap grid gap-16 lg:grid-cols-[1.25fr_1fr] lg:gap-24">
        <Reveal>
          <p className="eyebrow">The old way, the new way</p>
          <h2 id="act2" className="display h-xl mt-6">
            A résumé tells them what you’ve done. <em>A stage shows them what you can do.</em>
          </h2>
          <p className="lede mt-8">
            Applications flatten people into a page. Here, a candidate explains a project, defends a decision and answers a hard question, in front of the people who
            actually hire. It is a higher bar and a fairer one: it rewards preparation and thinking, not just polish on paper.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="self-end">
          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {rows.map(([a, b]) => (
              <div key={a} className="grid gap-1 py-5">
                <dt className="text-sm text-[var(--fg-faint)] line-through decoration-[var(--line)]">{a}</dt>
                <dd className="display text-2xl">{b}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------- Act III ------------------------------------ */
export function ActArenas() {
  return (
    <section data-theme="dark" aria-labelledby="act3" className="section cv-auto">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Four arenas</p>
          <h2 id="act3" className="display h-xl mt-6 max-w-[16ch]">
            One stage. <em>Four ways to be seen.</em>
          </h2>
        </Reveal>
        <div className="mt-14">
          <ArenaSelector />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Act IV ------------------------------------- */
const JOURNEY = [
  { n: "01", t: "Apply", d: "Tell us what you have built or done, in your industry, and why you should be on stage. It takes about ten minutes and is free.", s: "open" },
  { n: "02", t: "Screening", d: "Organisers review each application against published criteria for the industry. Being screened in does not guarantee a live slot.", s: "organiser" },
  { n: "03", t: "Preparation", d: "Shortlisted students receive the format, time limits and what the panel is likely to ask, so nerves are about the idea, not the logistics.", s: "planned" },
  { n: "04", t: "Live pitch", d: "A short, structured pitch on the arena floor, in front of a panel and an audience.", s: "planned" },
  { n: "05", t: "Panel questions", d: "Industry professionals probe the work. This is where thinking shows.", s: "planned" },
  { n: "06", t: "Hiring conversations", d: "Companies that want to talk further do so directly with candidates, after the show.", s: "planned" },
  { n: "07", t: "Possible internships", d: "Any offer is entirely the company’s decision. We introduce; we do not promise.", s: "company" },
] as const;

const STATUS = {
  open: { label: "Open now", tone: "live" as const },
  organiser: { label: "Organiser-run", tone: "accent" as const },
  planned: { label: "Planned format · pending organiser approval", tone: "neutral" as const },
  company: { label: "Decided by companies", tone: "neutral" as const },
};

export function ActJourney() {
  return (
    <section data-theme="light" aria-labelledby="act4" className="section cv-auto !bg-[var(--bg-raised)]" style={{ ["--bg" as string]: "#eeece8" }}>
      <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">The journey</p>
          <h2 id="act4" className="display h-xl mt-6">
            From application to <em>a conversation.</em>
          </h2>
          <p className="lede mt-6">Seven steps. We’re explicit about which are live today and which are proposals still to be confirmed.</p>
          <div className="mt-8">
            <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-1 underline underline-offset-4">
              The full process <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
        </Reveal>
        <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {JOURNEY.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.04} className="grid gap-3 py-7 sm:grid-cols-[4rem_1fr] sm:gap-6">
              <span className="mono pt-1.5 text-[var(--fg-faint)]">{s.n}</span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="display text-3xl">{s.t}</h3>
                  <ElasticPill tone={STATUS[s.s].tone}>{STATUS[s.s].label}</ElasticPill>
                </div>
                <p className="mt-2 max-w-[56ch] text-[var(--fg-dim)]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------- Act V -------------------------------------- */
export function ActAtmosphere() {
  const parts = [
    ["The floor", "A lit stage and a single microphone. Candidates, a panel, and an audience close enough to hear a pin drop."],
    ["The panel", "Hiring managers and founders per industry, confirmed and named only once they have agreed."],
    ["The cameras", "Selected sessions are filmed for the series, strictly with each participant’s separate permission."],
  ];
  return (
    <section data-theme="dark" aria-labelledby="act5" className="relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        <StageArt className="h-full w-full scale-125 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,transparent,#08090b_85%)]" />
      </div>
      <div className="wrap section relative z-10 min-h-[90svh] content-end">
        <Reveal>
          <p className="eyebrow">The atmosphere</p>
          <h2 id="act5" className="display h-xl mt-6 max-w-[14ch]">
            Built like a <em>show.</em> Run like an interview.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {parts.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="glass glass-frost h-full p-7 [--r:1.5rem]">
                <h3 className="display text-3xl">{t}</h3>
                <p className="mt-3 text-[var(--fg-dim)]">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mono mt-8 text-[var(--fg-faint)]">Conceptual illustration. Not event footage; none has been shot yet.</p>
      </div>
    </section>
  );
}

/* ----------------------------- Act VI ------------------------------------- */
export function ActPeople() {
  return (
    <section data-theme="light" aria-labelledby="act6" className="section cv-auto">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">The people behind the opportunities</p>
          <h2 id="act6" className="display h-xl mt-6 max-w-[18ch]">
            Meet the people looking for <em>the next generation</em> of talent.
          </h2>
        </Reveal>
        <div className="mt-14">
          <PeopleBlock />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Act VII ------------------------------------ */
export function PassCard({ kind }: { kind: "student" | "audience" }) {
  const isStudent = kind === "student";
  const p = pricing[kind];
  return (
    <div className="glass glass-frost relative flex h-full flex-col overflow-hidden p-8 sm:p-10 [--r:1.9rem]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{isStudent ? "For pitchers" : "For the room"}</p>
          <h3 className="display mt-3 text-4xl sm:text-5xl">{p.label}</h3>
        </div>
        <span className="mono rounded-full border border-[var(--line)] px-3 py-1 text-[var(--fg-faint)]">№ {isStudent ? "S" : "A"}</span>
      </div>
      <p className="display mt-10 text-7xl leading-none sm:text-8xl" aria-label={`${formatINR(p.amount)} per ${isStudent ? "student" : "ticket"}`}>
        {formatINR(p.amount)}
      </p>
      <p className="mt-2 text-sm text-[var(--fg-faint)]">{isStudent ? "per student, after shortlisting" : "per ticket"}</p>
      <div className="relative my-8 border-t border-dashed border-[var(--line)]">
        <span aria-hidden className="absolute -left-[2.75rem] -top-3 size-6 rounded-full bg-[var(--bg)] sm:-left-[3.25rem]" />
        <span aria-hidden className="absolute -right-[2.75rem] -top-3 size-6 rounded-full bg-[var(--bg)] sm:-right-[3.25rem]" />
      </div>
      <ul className="grid gap-3 text-[var(--fg-dim)]">
        {(isStudent
          ? ["Your place on the arena floor if shortlisted", ...inclusions.slice(0, 1), "Preparation guidance before the event"]
          : inclusions
        ).map((f) => (
          <li key={f} className="flex gap-3">
            <Check size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-[var(--fg-faint)]">
        {isStudent
          ? "Applying is free. The pass is requested only after you are shortlisted. It does not buy selection, a slot or an internship."
          : "Entry and food only. Not a guarantee of any hiring outcome."}
      </p>
      <div className="mt-auto pt-8">
        <LiquidButton href={isStudent ? "/register/student" : "/register/audience"} variant="primary" size="lg" className="w-full">
          {isStudent ? "Apply to pitch" : "Get audience tickets"}
        </LiquidButton>
      </div>
    </div>
  );
}

export function ActTickets() {
  return (
    <section data-theme="light" aria-labelledby="act7" className="section cv-auto" style={{ ["--bg" as string]: "#f7f7f5" }}>
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Tickets</p>
          <h2 id="act7" className="display h-xl mt-6 max-w-[16ch]">
            Two passes. <em>Food included in both.</em>
          </h2>
          <p className="lede mt-6">
            What you pay for: your place and your meals. What you don’t: selection, a pitching slot, or an internship. Those depend on screening and on the companies
            in the room.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal><PassCard kind="student" /></Reveal>
          <Reveal delay={0.1}><PassCard kind="audience" /></Reveal>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-[var(--fg-faint)]">
          <Clock size={14} aria-hidden /> Ticket sales open when an event is confirmed. See{" "}
          <Link href="/events" className="underline underline-offset-4">events</Link> and the{" "}
          <Link href="/refund-policy" className="underline underline-offset-4">refund policy</Link>.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------- Act VIII ----------------------------------- */
export function ActShow() {
  return (
    <section data-theme="dark" aria-labelledby="act8" className="section cv-auto">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">The show continues</p>
          <h2 id="act8" className="display h-xl mt-6 max-w-[18ch]">
            Every pitch is a story. <em>Some become episodes.</em>
          </h2>
          <p className="lede mt-6">
            Full episodes, standout pitches, panel conversations, behind the scenes and a podcast. All published on YouTube, and only with participants’ permission.
          </p>
        </Reveal>
        <div className="mt-14">
          <ShowShelf />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Act IX ------------------------------------- */
export function ActTrust() {
  const items = [
    ["How opportunities are sourced", "Companies tell us the internship functions they want to meet candidates for. We list a company only after it has confirmed in writing."],
    ["How selection works", "Applications are screened by organisers against published criteria. Panels question candidates live. Neither step is a guarantee."],
    ["Who decides on internships", "Participating companies, alone. We make introductions and never promise, broker or announce an offer on a company’s behalf."],
  ];
  return (
    <section data-theme="light" aria-labelledby="act9" className="section cv-auto">
      <div className="wrap grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">Proof and trust</p>
          <h2 id="act9" className="display h-xl mt-6">
            No inflated numbers. <em>Just how it works.</em>
          </h2>
          <p className="lede mt-6">
            There have been no events yet, so there are no placement statistics and no testimonials, and we will not invent any. Verified outcomes will appear on{" "}
            <Link href="/stories" className="underline underline-offset-4">Stories</Link> once they exist.
          </p>
        </Reveal>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {items.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.06} className="py-7">
              <h3 className="display text-3xl">{t}</h3>
              <p className="mt-2 max-w-[54ch] text-[var(--fg-dim)]">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Act X -------------------------------------- */
export function ActFinale() {
  return (
    <section data-theme="dark" aria-labelledby="act10" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-70" aria-hidden>
        <StageArt className="h-full w-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#08090b,transparent_30%,transparent_55%,#08090b)]" />
      </div>
      <div className="wrap section grid min-h-[90svh] content-center justify-items-center text-center">
        <Reveal>
          <h2 id="act10" className="display h-mega">
            You have something to prove.
            <br />
            <em>We have a stage.</em>
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <MagneticCTA href="/register/student">Enter the Arena</MagneticCTA>
            <LiquidButton href="/register/audience" size="lg" variant="glass">Attend the Show</LiquidButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
