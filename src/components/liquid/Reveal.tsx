"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** Editorial scroll reveal. Content is visible without JS; the observer is released after the first reveal. */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ "--rd": `${delay}s` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

/**
 * A headline set line by line. Each line rises out of its own clip, one after another.
 * Pass lines as nodes so italics can be applied: ["Hiring should", <em key>feel human.</em>]
 */
export function Lines({
  lines,
  as = "h2",
  className = "",
  delay = 0,
  id,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <Reveal as={as} delay={delay} className={`reveal-lines ${className}`}>
      {/* The element id lives on the wrapper so aria-labelledby still resolves to the full headline */}
      <span id={id} className="block">
        {lines.map((l, i) => (
          <span key={i} className="ml" style={{ "--i": i } as React.CSSProperties}>
            <span>{l}</span>
          </span>
        ))}
      </span>
    </Reveal>
  );
}
