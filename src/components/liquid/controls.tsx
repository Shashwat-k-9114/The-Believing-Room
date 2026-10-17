"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

/**
 * A liquid indicator that flows to the active item. Positioned imperatively (no
 * re-render) and moved with a CSS transition whose easing carries a hair of
 * overshoot, matching the spring feel of the buttons.
 * Before the first measurement (SSR / no JS) the active item paints its own fill,
 * so nothing is ever unstyled.
 */
function useSlider(activeKey: string) {
  const box = useRef<HTMLDivElement | null>(null);
  const bar = useRef<HTMLSpanElement | null>(null);
  const items = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const place = (animate: boolean) => {
      const c = box.current;
      const b = bar.current;
      const el = items.current[activeKey];
      if (!c || !b || !el) return;
      if (!animate) b.style.transition = "none";
      b.style.width = `${el.offsetWidth}px`;
      b.style.height = `${el.offsetHeight}px`;
      b.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
      c.dataset.slider = "ready";
      if (!animate) {
        void b.offsetWidth;
        b.style.transition = "";
      }
    };
    place(box.current?.dataset.slider !== "ready" ? false : !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const ro = new ResizeObserver(() => place(false));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [activeKey]);

  return { box, bar, setItem: (k: string) => (el: HTMLElement | null) => void (items.current[k] = el) };
}

const indicatorStyle = { background: "linear-gradient(180deg,#efe0c3,#d7c09a 60%,#bfa578)", boxShadow: "0 1px 0 rgb(255 255 255 / .7) inset, 0 8px 20px -8px rgb(215 192 154 / .6)" };

export interface TabItem {
  id: string;
  label: ReactNode;
  prefix?: string;
}

/**
 * ARIA tablist with a liquid indicator that flows between tabs.
 * Arrow keys / Home / End move focus and selection (roving tabindex).
 * Pair each tab with an element carrying id=`panel-${id}` and role="tabpanel".
 */
export function FluidTabBar({
  tabs,
  value,
  onChange,
  label,
  idBase = "tab",
  className = "",
}: {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  idBase?: string;
  className?: string;
}) {
  const { box, bar, setItem } = useSlider(value);

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === value);
    let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    onChange(tabs[n].id);
    box.current?.querySelector<HTMLElement>(`#${idBase}-${tabs[n].id}`)?.focus();
  };

  return (
    <div ref={box} role="tablist" aria-label={label} onKeyDown={onKeyDown} data-slider="pending" className={`glass slider noscroll-x relative flex gap-1 p-1.5 [--r:999px] ${className}`}>
      <span ref={bar} aria-hidden className="slider-bar rounded-full" style={indicatorStyle} />
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={setItem(t.id)}
            role="tab"
            id={`${idBase}-${t.id}`}
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`slider-item relative z-10 min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors sm:px-5 ${active ? "text-[#14110a]" : "text-[var(--fg-dim)] hover:text-[var(--fg)]"}`}
          >
            <span className="flex items-center gap-2">
              {t.prefix && <span className="mono opacity-60">{t.prefix}</span>}
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Native radio group dressed as a liquid segmented control. */
export function LiquidSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  legend,
}: {
  options: { value: T; label: ReactNode; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  name: string;
  legend: string;
}) {
  const { box, bar, setItem } = useSlider(value);
  return (
    <fieldset className="min-w-0">
      <legend className="eyebrow mb-3">{legend}</legend>
      <div ref={box} data-slider="pending" className="glass slider relative flex gap-1 p-1.5 [--r:1.1rem]">
        <span ref={bar} aria-hidden className="slider-bar rounded-[0.8rem]" style={{ ...indicatorStyle, boxShadow: "none" }} />
        {options.map((o) => {
          const active = o.value === value;
          return (
            <label key={o.value} ref={setItem(o.value)} className="slider-item relative z-10 flex-1 cursor-pointer rounded-[0.8rem]">
              <input type="radio" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} className="peer sr-only" />
              <span
                className={`relative flex min-h-12 flex-col items-center justify-center rounded-[0.8rem] px-3 text-center text-sm font-medium peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)] ${active ? "text-[#14110a]" : "text-[var(--fg-dim)]"}`}
              >
                {o.label}
                {o.hint && <span className="text-[0.7rem] opacity-70">{o.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
