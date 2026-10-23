import { brand } from "@/config/site";

/** A small arch: the doorway of the hero, reduced to a mark. */
export function ArchMark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 26 30" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M3 29V12a10 10 0 0 1 20 0v17" />
      <path d="M8 29V13a5 5 0 0 1 10 0v16" opacity="0.5" />
      <path d="M-1 22C7 20 12 27 27 18" strokeWidth="1.1" />
    </svg>
  );
}

/** The show logo (Show_DP) as a round badge with a gold ring. 96 and 192 px files exist for crisp small sizes. */
export function LogoBadge({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size logo; the optimiser would add a hop for nothing
    <img
      src={size > 48 ? "/brand/show-emblem-192.webp" : "/brand/show-emblem-96.webp"}
      width={size} height={size} alt="" decoding="async"
      className={`rounded-full object-cover ring-1 ring-[#f3e0a8]/60 shadow-[0_0_18px_-2px_rgb(203_174_118/0.45)] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The simplified B: the small-icon identity. Gold on any dark ground. */
export function BMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id="bmark-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e0a8" />
          <stop offset="1" stopColor="#b78d43" />
        </linearGradient>
      </defs>
      <path
        fill="url(#bmark-g)"
        fillRule="evenodd"
        d="M16 17 L23 10 H37 C46 10 51.5 14.5 51.5 21.5 C51.5 26.5 48.5 30 44 31.5 C50 33 54.5 37 54.5 43 C54.5 50.5 48.5 54 39.5 54 H16 Z M25 18.5 V27.5 H35 C38.8 27.5 41 25.8 41 23 C41 20.2 38.8 18.5 35 18.5 Z M25 36 V45.5 H38 C42.2 45.5 45 44 45 40.7 C45 37.5 42.2 36 38 36 Z"
      />
    </svg>
  );
}

/** Typographic wordmark. Swap this component for a logo file once final artwork exists. */
export function Wordmark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <span className={`logo-lockup flex items-center gap-2.5 text-[#f4eee4] ${className}`}>
        <LogoBadge size={42} className="logo-b" />
        <span className="display text-[1.3rem] leading-none tracking-tight">{brand.name}</span>
      </span>
    );
  }
  return (
    <span className={`block ${className}`}>
      <LogoBadge size={96} className="mb-5" />
      <span className="display block text-4xl leading-none sm:text-5xl">
        The Believing
        <br />
        <em>Room</em>
      </span>
    </span>
  );
}
