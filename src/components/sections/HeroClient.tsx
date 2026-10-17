"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { LiquidButton } from "../liquid/LiquidButton";
import { MorphingModal } from "../liquid/MorphingModal";
import { WaitlistForm } from "../forms/WaitlistForm";
import { brand } from "@/config/site";

/** Pointer parallax for the stage layers. CSS variables only: no re-renders. */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", String((e.clientX / innerWidth - 0.5) * 2));
        el.style.setProperty("--py", String((e.clientY / innerHeight - 0.5) * 2));
      });
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section ref={ref} data-theme="dark" aria-labelledby="hero-title" className="hero relative isolate min-h-svh overflow-hidden">
      {children}
    </section>
  );
}

/** Appears only while the first-visit intro plays. Never blocks content: it is already in the DOM. */
export function SkipIntro() {
  return (
    <button
      type="button"
      className="skip-intro glass mono absolute bottom-6 right-6 z-20 min-h-11 px-4 [--r:999px]"
      onClick={() => document.documentElement.setAttribute("data-intro", "done")}
    >
      Skip intro
    </button>
  );
}

/**
 * "Watch the Experience". There is no event footage yet and we will not fake any,
 * so this opens a truthful preview-status panel (and a YouTube link once configured).
 */
export function WatchExperience() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const yt = brand.social.youtube;
  return (
    <>
      <LiquidButton
        size="lg"
        variant="glass"
        aria-haspopup="dialog"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          setOpen(true);
        }}
      >
        <Play size={16} aria-hidden /> Watch the Experience
      </LiquidButton>
      <MorphingModal open={open} onClose={() => setOpen(false)} title="Watch the Experience" origin={origin}>
        <div className="grid gap-5 p-7 pt-14 sm:p-10 sm:pt-16">
          <p className="eyebrow">Preview status</p>
          <h2 className="display text-4xl sm:text-5xl">The first episode hasn’t been filmed yet.</h2>
          <p className="text-[var(--fg-dim)]">
            We won’t stand in for it with stock footage or a mock-up. When the first edition is recorded, and participants have approved what is published, it
            will appear here and on the channel.
          </p>
          {yt ? (
            <LiquidButton href={yt} external variant="primary">Open the YouTube channel</LiquidButton>
          ) : (
            <div className="grid gap-3 border-t border-white/10 pt-5">
              <p className="text-sm text-[var(--fg-dim)]">Be told when there is something to watch:</p>
              <WaitlistForm kind="updates" cta="Notify me at launch" note="the first episode and event announcements" />
            </div>
          )}
        </div>
      </MorphingModal>
    </>
  );
}
