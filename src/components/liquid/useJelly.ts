"use client";

import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Spring } from "./spring";

/**
 * Spring-physics "liquid" interaction model shared by every tactile control.
 *
 *  hover  : surface leans toward the pointer (<= `pull` px), lifts 2%, stretches
 *           slightly along the axis of travel; the specular highlight follows the cursor.
 *  press  : compresses (x 1.035 / y 0.94) and an elastic ripple spreads from the touch point.
 *  release: springs back to the hover pose (or rest). Never snaps.
 *
 * Touch input never depends on hover: only the press response applies.
 * prefers-reduced-motion disables transforms and ripples entirely.
 * The transform is written straight to the element (no React re-render per frame),
 * and the rAF loop sleeps as soon as every spring is at rest.
 */
export interface JellyOptions {
  pull?: number;
  /** If > 0, element is attracted to the pointer within this radius (px). */
  magnetRadius?: number;
  magnetStrength?: number;
  ripple?: boolean;
}

interface Engine {
  el: () => HTMLElement | null;
  x: Spring;
  y: Spring;
  sx: Spring;
  sy: Spring;
  raf: number;
  last: number;
}

function run(e: Engine, now: number) {
  const el = e.el();
  if (!el) {
    e.raf = 0;
    return;
  }
  const dt = (now - e.last) / 1000;
  e.last = now;
  e.x.advance(dt);
  e.y.advance(dt);
  e.sx.advance(dt);
  e.sy.advance(dt);
  el.style.transform = `translate3d(${e.x.value.toFixed(2)}px, ${e.y.value.toFixed(2)}px, 0) scale(${e.sx.value.toFixed(4)}, ${e.sy.value.toFixed(4)})`;
  if (e.x.atRest && e.y.atRest && e.sx.atRest && e.sy.atRest) {
    e.raf = 0;
    if (e.sx.value === 1 && e.sy.value === 1 && e.x.value === 0 && e.y.value === 0) el.style.transform = "";
    return;
  }
  e.raf = requestAnimationFrame((t) => run(e, t));
}

export function useJelly<T extends HTMLElement>({ pull = 3, magnetRadius = 0, magnetStrength = 10, ripple = true }: JellyOptions = {}) {
  const ref = useRef<T | null>(null);
  const eng = useRef<Engine | null>(null);
  const reduce = useRef(false);
  const hovering = useRef(false);
  const pressed = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduce.current = mq.matches;
    const on = () => (reduce.current = mq.matches);
    mq.addEventListener("change", on);
    return () => {
      mq.removeEventListener("change", on);
      if (eng.current) cancelAnimationFrame(eng.current.raf);
    };
  }, []);

  const engine = (): Engine => (eng.current ??= { el: () => ref.current, x: new Spring(0), y: new Spring(0), sx: new Spring(1), sy: new Spring(1), raf: 0, last: 0 });

  const wake = useCallback(() => {
    const e = engine();
    if (!e.raf) {
      e.last = performance.now();
      e.raf = requestAnimationFrame((t) => run(e, t));
    }
  }, []);

  const target = (x: number, y: number, sx: number, sy: number) => {
    if (reduce.current) return;
    const e = engine();
    e.x.set(x);
    e.y.set(y);
    e.sx.set(sx);
    e.sy.set(sy);
    wake();
  };

  const settle = () => (hovering.current ? target(eng.current?.x.target ?? 0, eng.current?.y.target ?? 0, 1.02, 1.02) : target(0, 0, 1, 1));

  const spawnRipple = (el: HTMLElement, px: number, py: number) => {
    if (reduce.current || !ripple || !el.animate) return;
    const r = document.createElement("span");
    r.className = "jelly-ripple";
    r.style.left = `${px}px`;
    r.style.top = `${py}px`;
    el.appendChild(r);
    const a = r.animate(
      [
        { transform: "scale(0.15)", opacity: 0.9 },
        { transform: "scale(1.6)", opacity: 0 },
      ],
      { duration: 720, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    a.onfinish = () => r.remove();
  };

  const press = (el: HTMLElement, px: number, py: number) => {
    pressed.current = true;
    el.dataset.hot = "true";
    const e = engine();
    target(e.x.target, e.y.target, 1.035, 0.94);
    spawnRipple(el, px, py);
  };

  const release = () => {
    pressed.current = false;
    settle();
  };

  const onPointerMove = (e: PointerEvent<T>) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    el.style.setProperty("--mx", `${(px / r.width) * 100}%`);
    el.style.setProperty("--my", `${(py / r.height) * 100}%`);
    if (reduce.current) return;
    hovering.current = true;
    const nx = (px / r.width - 0.5) * 2;
    const ny = (py / r.height - 0.5) * 2;
    if (pressed.current) target(nx * pull, ny * pull * 0.8 - 1.5, 1.035, 0.94);
    else target(nx * pull, ny * pull * 0.8 - 1.5, 1.02 + Math.abs(nx) * 0.012, 1.02 - Math.abs(nx) * 0.006);
  };

  const onPointerEnter = (e: PointerEvent<T>) => {
    if (e.pointerType !== "touch") e.currentTarget.dataset.hot = "true";
  };

  const onPointerLeave = (e: PointerEvent<T>) => {
    hovering.current = false;
    pressed.current = false;
    e.currentTarget.dataset.hot = "false";
    e.currentTarget.style.setProperty("--mx", "30%");
    e.currentTarget.style.setProperty("--my", "0%");
    target(0, 0, 1, 1);
  };

  const onPointerDown = (e: PointerEvent<T>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    press(el, e.clientX - r.left, e.clientY - r.top);
  };

  const onPointerUp = (e: PointerEvent<T>) => {
    if (e.pointerType === "touch") {
      e.currentTarget.dataset.hot = "false";
      hovering.current = false;
    }
    release();
  };

  /** Keyboard activation gets the same tactile response as a click. */
  const onKeyDown = (e: KeyboardEvent<T>) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      press(el, r.width / 2, r.height / 2);
      window.setTimeout(release, 140);
    }
  };

  // Magnetic attraction: listens on window so it can begin before the pointer arrives.
  useEffect(() => {
    if (!magnetRadius) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (ev: globalThis.PointerEvent) => {
      const el = ref.current;
      if (!el || hovering.current || reduce.current) return;
      const r = el.getBoundingClientRect();
      const dx = ev.clientX - (r.left + r.width / 2);
      const dy = ev.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = magnetRadius + Math.max(r.width, r.height) / 2;
      const e = engine();
      if (dist < reach) {
        const k = 1 - dist / reach;
        target((dx / (dist || 1)) * magnetStrength * k, (dy / (dist || 1)) * magnetStrength * k, 1, 1);
      } else if (!pressed.current && (e.x.target !== 0 || e.y.target !== 0)) target(0, 0, 1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [magnetRadius, magnetStrength]);

  return {
    ref,
    handlers: { onPointerMove, onPointerEnter, onPointerLeave, onPointerDown, onPointerUp, onPointerCancel: onPointerLeave, onKeyDown },
  };
}
