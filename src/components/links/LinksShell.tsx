"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Wraps the /links page. Two jobs, both progressive enhancement:
 *  - Start the entrance when the opening curtains are half open (or at once if they are not playing, e.g. in-site navigation
 *    or reduced motion). Without JS the page is simply visible: the hidden state only exists under `.js`.
 *  - Follow the pointer over link cards so the gold spotlight tracks it.
 */
export function LinksShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const curtain = document.getElementById("curtain-intro");
    const playing = curtain && getComputedStyle(curtain).display !== "none" && getComputedStyle(curtain).visibility !== "hidden";
    const t = window.setTimeout(() => el.classList.add("go"), playing ? 1500 : 60);
    return () => window.clearTimeout(t);
  }, []);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const card = (e.target as HTMLElement).closest<HTMLElement>(".lk-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div ref={root} data-theme="dark" className="links-page" onPointerMove={onMove}>
      {children}
    </div>
  );
}

/** Copies this page's address, for sharing the page itself. */
export function CopyLink() {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setDone(true);
      window.setTimeout(() => setDone(false), 2200);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). Nothing useful to do; the address bar still works.
    }
  }
  return (
    <button type="button" onClick={copy} className="lk-chip" aria-live="polite">
      {done ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      <span>{done ? "Link copied" : "Copy link"}</span>
    </button>
  );
}
