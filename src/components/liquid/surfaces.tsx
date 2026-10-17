"use client";

import Link from "next/link";
import { useId, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useJelly } from "./useJelly";

/** Static glass panel. Specular highlight tracks the pointer; no layout motion. */
export function GlassSurface({
  as: Tag = "div",
  className = "",
  frost = false,
  children,
  style,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  frost?: boolean;
  children: ReactNode;
  style?: CSSProperties;
} & Record<string, unknown>) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <Tag className={`glass ${frost ? "glass-frost" : ""} ${className}`} style={style} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  );
}

/** Interactive card: lifts and leans on hover, compresses on press. Renders a link when `href` is given. */
export function ElasticCard({
  href,
  className = "",
  children,
  ariaLabel,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { ref, handlers } = useJelly<HTMLElement>({ pull: 5, ripple: true });
  const cls = `glass relative block overflow-hidden will-change-transform ${className}`;
  if (href) {
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} aria-label={ariaLabel} className={cls} {...handlers}>
        {children}
      </Link>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cls} {...handlers}>
      {children}
    </div>
  );
}

/** A surface lit by a soft spotlight that follows the pointer (and is static on touch). */
export function SpotlightSurface({
  className = "",
  children,
  color = "255 255 255",
}: {
  className?: string;
  children: ReactNode;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      style={
        {
          backgroundImage: `radial-gradient(420px circle at var(--sx, 50%) var(--sy, 0%), rgb(${color} / 0.12), transparent 65%)`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/** Small elastic label, used for tags and status chips. */
export function ElasticPill({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: "neutral" | "accent" | "live"; className?: string }) {
  const tones = {
    neutral: "text-[var(--fg-dim)]",
    accent: "text-[var(--accent)]",
    live: "text-emerald-300",
  };
  return (
    <span className={`glass inline-flex items-center gap-2 px-3 py-1.5 text-[0.7rem] font-medium tracking-[0.12em] uppercase [--r:999px] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Accessible tooltip: shown on hover AND keyboard focus, linked via aria-describedby. */
export function GlassTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      aria-describedby={id}
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={`glass glass-frost pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-64 -translate-x-1/2 px-3 py-2 text-xs text-[var(--fg)] transition-opacity duration-200 [--r:0.8rem] ${open ? "opacity-100" : "opacity-0"}`}
      >
        {label}
      </span>
    </span>
  );
}
