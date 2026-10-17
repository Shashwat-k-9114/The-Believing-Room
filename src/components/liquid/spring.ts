/**
 * Minimal damped-spring engine for the liquid interactions (~1 KB, no dependencies).
 * Semi-implicit Euler at a fixed 1/240 s step, so behaviour is frame-rate independent.
 * With stiffness 380, damping 28, mass 0.6 the damping ratio is ~0.93:
 * one barely visible overshoot, then rest. No wobble loop.
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export const LIQUID: SpringConfig = { stiffness: 380, damping: 28, mass: 0.6 };

const STEP = 1 / 240;
const REST_V = 0.002;
const REST_X = 0.0005;

export class Spring {
  value: number;
  target: number;
  velocity = 0;
  constructor(initial: number, private cfg: SpringConfig = LIQUID) {
    this.value = initial;
    this.target = initial;
  }
  set(target: number) {
    this.target = target;
  }
  get atRest() {
    return Math.abs(this.velocity) < REST_V && Math.abs(this.value - this.target) < REST_X;
  }
  /** Advance by `dt` seconds. */
  advance(dt: number) {
    const { stiffness: k, damping: c, mass: m } = this.cfg;
    let t = Math.min(dt, 0.05);
    while (t > 0) {
      const h = Math.min(STEP, t);
      const a = (-k * (this.value - this.target) - c * this.velocity) / m;
      this.velocity += a * h;
      this.value += this.velocity * h;
      t -= h;
    }
    if (this.atRest) {
      this.value = this.target;
      this.velocity = 0;
    }
  }
}
