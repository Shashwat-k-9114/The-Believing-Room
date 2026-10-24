"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, ClipboardCheck, Eye, GraduationCap, Handshake, Mail, Megaphone, Ticket, Users, Utensils } from "lucide-react";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Icons are chosen by name so a server page can describe a flow without passing components across the client boundary. */
const ICONS = {
  // Four drawn to match the homepage scene
  apply: (
    <g {...stroke}>
      <path d="M18 8h22l10 10v38H18z" />
      <path d="M40 8v10h10" />
      <path d="M25 31h18M25 38h12" />
      <path d="M25 47l5 5 10-11" />
    </g>
  ),
  stage: (
    <g {...stroke}>
      <path d="M8 10h48" />
      <path d="M12 10c7 9 7 25 0 36M52 10c-7 9-7 25 0 36" />
      <path d="M6 58l6-12h40l6 12z" />
      <path d="M32 10v8" />
      <circle cx="32" cy="30" r="5" />
    </g>
  ),
  pitch: (
    <g {...stroke}>
      <rect x="25" y="6" width="14" height="28" rx="7" />
      <path d="M17 28a15 15 0 0 0 30 0" />
      <path d="M32 43v13M23 57h18" />
    </g>
  ),
  discover: (
    <g {...stroke}>
      <circle cx="27" cy="29" r="16" />
      <path d="M39 41l16 16" />
      <circle cx="27" cy="24" r="4.5" />
      <path d="M18 38c1-7 17-7 18 0" />
      <path d="M51 7l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    </g>
  ),
} satisfies Record<string, ReactNode>;

const LUCIDE = { ticket: Ticket, watch: Eye, handshake: Handshake, calendar: CalendarDays, school: GraduationCap, mail: Mail, confirm: ClipboardCheck, group: Users, meal: Utensils, announce: Megaphone } as const;

export type FlowIcon = keyof typeof ICONS | keyof typeof LUCIDE;
export type FlowStep = { t: string; d: string; icon: FlowIcon };

export const SHOW_STEPS: readonly FlowStep[] = [
  { t: "Apply", d: "Tell us what you can do.", icon: "apply" },
  { t: "Take the Stage", d: "Shortlisted candidates get a live slot.", icon: "stage" },
  { t: "Pitch Live", d: "A short pitch, then panel questions.", icon: "pitch" },
  { t: "Get Discovered", d: "Interested recruiters may reach out.", icon: "discover" },
];

function Glyph({ name }: { name: FlowIcon }) {
  if (name in ICONS) return <svg viewBox="0 0 64 64" aria-hidden className="flow-glyph">{ICONS[name as keyof typeof ICONS]}</svg>;
  const L = LUCIDE[name as keyof typeof LUCIDE];
  return <L aria-hidden strokeWidth={2.2} className="flow-glyph" />;
}

/**
 * Steps joined by one line. As the visitor scrolls, the stage lights come on one step at a time and the line fills.
 * Without JavaScript, or with reduced motion, every step is lit from the start (see .flow in globals.css).
 * `compact` is the smaller version that sits above a form.
 */
export function ShowFlow({ steps = SHOW_STEPS, compact = false, label }: { steps?: readonly FlowStep[]; compact?: boolean; label?: string }) {
  const list = useRef<HTMLOListElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [lit, setLit] = useState(0);
  const target = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLLIElement[];
    // Unarmed (no JS, reduced motion, no observer): the CSS leaves every step lit.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const ol = list.current;
    ol?.setAttribute("data-armed", "");
    // Light steps in order, one every 550 ms, up to the furthest step that has scrolled into view.
    const run = () => {
      if (timer.current) return;
      timer.current = setInterval(() => {
        setLit((n) => {
          if (n >= target.current) {
            if (timer.current) clearInterval(timer.current);
            timer.current = null;
            return n;
          }
          return n + 1;
        });
      }, 550);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLLIElement);
          target.current = Math.max(target.current, i + 1);
          run();
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.4 },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      ol?.removeAttribute("data-armed");
      io.disconnect();
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, []);

  const progress = Math.max(0, Math.min(1, (lit - 1) / Math.max(1, steps.length - 1)));
  return (
    <ol ref={list} aria-label={label} className={`flow ${compact ? "flow-compact" : ""}`} style={{ ["--p" as string]: progress }}>
      <span aria-hidden className="flow-track"><span className="flow-fill" /></span>
      {steps.map((s, i) => (
        <li key={s.t} ref={(el) => { refs.current[i] = el; }} className="flow-step" data-lit={i < lit ? "true" : "false"}>
          <span aria-hidden className="flow-cone" />
          <span className="flow-orb"><Glyph name={s.icon} /></span>
          <div className="flow-copy">
            <p className="eyebrow">Step {i + 1}</p>
            <h3 className={`display mt-1 ${compact ? "text-xl" : "text-[1.65rem] sm:text-3xl"}`}>{s.t}</h3>
            <p className={`mt-2 text-[var(--fg-dim)] ${compact ? "text-sm" : ""}`}>{s.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
