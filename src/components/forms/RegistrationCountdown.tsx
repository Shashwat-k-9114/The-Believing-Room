"use client";

import { useEffect, useState, type ReactNode } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to `closesAt` (ISO). Shows `children` (the form) until then, and `closed` once it passes. */
export function RegistrationCountdown({ closesAt, children, closed }: { closesAt: string; children: ReactNode; closed: ReactNode }) {
  const end = Date.parse(closesAt);
  // null until mounted so the server and first client render match.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  if (left === 0) return <>{closed}</>;

  const s = Math.floor((left ?? 0) / 1000);
  const text = left === null ? "--:--:--" : `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

  return (
    <>
      <div className="glass glass-frost mb-10 flex flex-wrap items-center justify-between gap-3 p-5 [--r:1.2rem]">
        <p className="eyebrow">Candidate registration closes in</p>
        <p className="display mono text-3xl" role="timer" aria-label={`Registration closes in ${text}`}>{text}</p>
      </div>
      {children}
    </>
  );
}
