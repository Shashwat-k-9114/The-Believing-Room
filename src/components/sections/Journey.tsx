"use client";

import { useState } from "react";

export const JOURNEY = [
  { n: "01", t: "Apply", d: "Tell us about your skills, your work and what you want to show.", more: "Applying is free. You choose an industry, share your portfolio or projects and write a short pitch summary." },
  { n: "02", t: "Shortlist", d: "The organising team reviews applications.", more: "Applications are reviewed for fit with a panel. Being shortlisted is not a guarantee of anything beyond a place in the room." },
  { n: "03", t: "Pitch", d: "A short introduction, in person.", more: "A brief pitch, then questions from the panel. The structure of the slot is confirmed closer to the event." },
  { n: "04", t: "Evaluation", d: "Professionals assess skills, communication and potential.", more: "Each panel evaluates in the open, so candidates and the audience can see what is being weighed." },
  { n: "05", t: "Employer follow-up", d: "Interested employers may continue the conversation.", more: "Any follow-up is the employer's own decision, made on its own terms and timeline." },
  { n: "06", t: "Potential internship", d: "Some candidates may be offered an internship.", more: "Offers are never guaranteed. Employment decisions rest entirely with the participating employers." },
] as const;

/**
 * Desktop: stages strung along one drawn line; choosing a stage changes the reading beneath it.
 * Mobile: one vertical thread with every description visible (no hidden content on touch).
 */
export function Journey() {
  const [active, setActive] = useState(0);
  const stage = JOURNEY[active];
  return (
    <>
      <div className="relative mt-20 hidden lg:block">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[100px] w-full" aria-hidden>
          <path className="path-draw" pathLength={1} d="M0 50C50 20 60 20 100 20S250 80 300 80 450 20 500 20 650 80 700 80 850 20 900 20 980 40 1000 50" fill="none" stroke="#cbae76" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative grid grid-cols-6">
          {JOURNEY.map((s, i) => (
            <li key={s.n} className="relative" style={{ paddingTop: i % 2 ? 128 : 68 }}>
              <span
                aria-hidden
                className={`absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#cbae76] transition-colors duration-500 ${i === active ? "bg-[#cbae76]" : "bg-[#160f1c]"}`}
                style={{ top: i % 2 ? 80 : 20 }}
              />
              <button
                type="button"
                aria-pressed={i === active}
                aria-controls="journey-detail"
                onClick={() => setActive(i)}
                className="block w-full px-3 text-left"
              >
                <span className="eyebrow">{s.n}</span>
                <span className={`display mt-2 block text-[1.7rem] leading-tight transition-colors duration-500 ${i === active ? "text-[var(--accent)]" : ""}`}>{s.t}</span>
                <span className="mt-2 block text-sm text-[var(--fg-dim)]">{s.d}</span>
              </button>
            </li>
          ))}
        </ol>
        <div id="journey-detail" aria-live="polite" className="mt-16 grid gap-3 border-t border-[var(--line)] pt-8 lg:grid-cols-[14rem_1fr]">
          <p className="eyebrow">{stage.n} · {stage.t}</p>
          <p key={stage.n} className="display enter max-w-[52ch] text-3xl leading-snug">{stage.more}</p>
        </div>
      </div>

      <ol className="relative mt-14 border-l border-[var(--line)] pl-8 lg:hidden">
        {JOURNEY.map((s) => (
          <li key={s.n} className="relative pb-10 last:pb-0">
            <span aria-hidden className="absolute -left-[2.45rem] top-2 size-3 rounded-full border border-[#cbae76] bg-[#160f1c]" />
            <p className="eyebrow">{s.n}</p>
            <h3 className="display mt-1 text-3xl">{s.t}</h3>
            <p className="mt-1 text-[var(--fg-dim)]">{s.d} {s.more}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
