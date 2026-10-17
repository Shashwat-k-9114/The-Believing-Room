import type { ReactNode } from "react";

/** Dark cinematic title block followed by a luminous (or dark) content body. */
export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  body = "light",
  accent,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  body?: "light" | "dark";
  accent?: string;
  actions?: ReactNode;
}) {
  return (
    <>
      <section data-theme="dark" className="relative isolate overflow-hidden pb-16 pt-40 sm:pb-24 sm:pt-48" style={accent ? ({ ["--accent" as string]: accent } as React.CSSProperties) : undefined}>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(60% 80% at 80% 0%, color-mix(in srgb, ${accent ?? "#d7c09a"} 18%, transparent), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgb(156 200 240 / 0.08), transparent 70%), #08090b`,
          }}
        />
        <div className="wrap">
          <div className="enter">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
              {eyebrow}
            </p>
            <h1 className="display h-xl mt-6 max-w-[18ch]">{title}</h1>
            {lede && <p className="lede mt-7">{lede}</p>}
            {actions && <div className="mt-9 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </div>
      </section>
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
      <strong>Draft for legal review.</strong> {children ?? "This text is a working draft and has not been reviewed by a lawyer. It must be reviewed and finalised before public launch or ticket sales."}
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
