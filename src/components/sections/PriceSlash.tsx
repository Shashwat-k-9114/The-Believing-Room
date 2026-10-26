"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/config/site";

/**
 * The old price is cut down the moment it scrolls into view and "Free" takes its place.
 * Without JS, or with reduced motion, the page simply renders the finished state.
 */
export function PriceSlash({ was }: { was: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the pre-cut state only exists once the observer is ready
    setArmed(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // Let the card finish its own reveal, then cut.
        setTimeout(() => setArmed(false), 450);
        io.disconnect();
      },
      { threshold: 0.9 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="slash" data-armed={armed ? "" : undefined}>
      <span className="sr-only">Free, was {formatINR(was)}</span>
      <span aria-hidden className="slash-was display">
        {formatINR(was)}
        <i className="slash-line" />
      </span>
      <span aria-hidden className="slash-now display">
        Free<span className="slash-flash" />
      </span>
    </div>
  );
}
