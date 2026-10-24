import type { ReactNode } from "react";
import { COLOR, Curve } from "../sections/Curve";
import { WayArt, type SceneKind } from "../sections/WayArt";

/** Dark cinematic title block followed by a luminous (or dark) content body. */
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  body = "light",
  accent,
  actions,
  art,
  longTitle = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  body?: "light" | "dark";
  accent?: string;
  actions?: ReactNode;
  /** An illustration for the title block. Pages without one (the legal pages) stay text only. */
  art?: SceneKind;
  /** A long, two-sentence title: set it one size smaller so it does not run to five lines. */
  longTitle?: boolean;
}) {
  return (
    <>
      <section data-theme="dark" className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-44" style={accent ? ({ ["--accent" as string]: accent } as React.CSSProperties) : undefined}>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            // The last layer fades every tint back to the page colour so the header never ends in a visible band.
            background: `linear-gradient(to bottom, transparent 62%, #160f1c 100%), radial-gradient(60% 80% at 82% 0%, color-mix(in srgb, ${accent ?? "#8c7a9b"} 26%, transparent), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgb(203 174 118 / 0.1), transparent 70%), #160f1c`,
          }}
        />
        <div className={`wrap ${art ? "grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14" : ""}`}>
          <div className="enter">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
              {eyebrow}
            </p>
            <h1 className={`display ${longTitle ? "h-lg" : "h-xl"} mt-6 max-w-[24ch]`}>{title}</h1>
            {lede && <p className="lede mt-6">{lede}</p>}
            {actions && <div className="action-group mt-8 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {art && (
            <div className="enter relative mx-auto w-full max-w-[34rem] lg:max-w-none" style={{ animationDelay: "0.15s" }}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.4rem] border border-[#cbae76]/35 shadow-[0_36px_80px_-40px_rgb(0_0_0/0.85)]">
                <WayArt kind={art} className="absolute inset-0 h-full w-full" />
              </div>
            </div>
          )}
        </div>
      </section>
      {children && body === "light" && <Curve from={COLOR.aubergine} to={COLOR.ivory} shape="swell" />}
      {children && (
        <section data-theme={body} className="section !pt-16 sm:!pt-24">
          <div className="wrap">{children}</div>
        </section>
      )}
    </>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose-arena max-w-[72ch]">{children}</div>;
}

export function DraftNotice({ children }: { children?: ReactNode }) {
  return (
    <p role="note" className="mb-8 max-w-[72ch] rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 p-4 text-sm">
      <strong>Draft.</strong> {children ?? "This page is being finalised before the first event."}
    </p>
  );
}

export function TwoCol({ left, right }: { left: ReactNode; right: ReactNode }) {
  return <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"><div>{left}</div><div>{right}</div></div>;
}

export function ListRows({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
      {items.map((i) => (
        <li key={i.title} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-10">
          <h3 className="display text-2xl sm:text-3xl">{i.title}</h3>
          <p className="text-[var(--fg-dim)]">{i.body}</p>
        </li>
      ))}
    </ul>
  );
}
