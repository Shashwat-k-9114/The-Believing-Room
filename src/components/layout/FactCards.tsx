import type { ReactNode } from "react";
import { ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "../liquid/Reveal";

export type Fact = { icon: LucideIcon; title: string; body?: ReactNode };

const COLS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

/**
 * Short cards that replace paragraphs: an icon, a few words, at most one line of explanation.
 * Works on both the dark and the light page body (it only uses theme tokens).
 */
export function FactCards({ items, cols = 3 }: { items: Fact[]; cols?: keyof typeof COLS }) {
  return (
    <ul className={`grid gap-4 ${COLS[cols]}`}>
      {items.map((f, i) => (
        <Reveal as="li" key={f.title} delay={(i % 4) * 0.06}>
          <div className="hover-lift h-full rounded-[1.1rem] border border-[var(--line)] bg-[color-mix(in_srgb,var(--fg)_4%,var(--bg))] p-6">
            <span aria-hidden className="grid size-11 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
              <f.icon size={22} strokeWidth={2} />
            </span>
            <h3 className="display mt-5 text-xl leading-snug">{f.title}</h3>
            {f.body && <p className="mt-2 text-sm text-[var(--fg-dim)]">{f.body}</p>}
          </div>
        </Reveal>
      ))}
    </ul>
  );
}

/** A single honest limit, set apart from the page so it is read but does not compete. */
export function HonestNote({ children, title = "Good to know" }: { children: ReactNode; title?: string }) {
  return (
    <aside role="note" className="flex max-w-[68ch] items-start gap-4 rounded-[1.1rem] border border-[var(--line)] p-5">
      <ShieldCheck aria-hidden size={22} className="mt-0.5 shrink-0 text-[var(--accent)]" />
      <div>
        <p className="eyebrow">{title}</p>
        <p className="mt-1 text-sm text-[var(--fg-dim)]">{children}</p>
      </div>
    </aside>
  );
}

/** One pitch slot drawn to scale: pitch, panel questions, changeover. */
export function SlotBar({ pitch, panel, transition }: { pitch: number; panel: number; transition: number }) {
  const parts = [
    { label: "Pitch", min: pitch, cls: "bg-[#cbae76] text-[#160f1c]" },
    { label: "Panel questions", min: panel, cls: "bg-[#6f5a8a] text-white" },
    { label: "Changeover", min: transition, cls: "bg-[var(--line)] text-[var(--fg-dim)]" },
  ];
  return (
    <figure aria-label={`One slot: ${pitch} minute pitch, ${panel} minutes of panel questions, ${transition} minute changeover`}>
      <div className="flex h-12 overflow-hidden rounded-full text-xs font-medium">
        {parts.map((p) => (
          <div key={p.label} style={{ flexGrow: p.min }} className={`grid min-w-0 place-items-center px-2 ${p.cls}`}>
            <span className="truncate">{p.min} min</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between gap-2 text-xs text-[var(--fg-faint)]">
        {parts.map((p) => (
          <span key={p.label} style={{ flexGrow: p.min, flexBasis: 0 }} className="min-w-0">{p.label}</span>
        ))}
      </figcaption>
    </figure>
  );
}
