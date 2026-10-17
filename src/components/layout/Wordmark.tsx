import { brand } from "@/config/site";

/** Temporary typographic wordmark. Replace via brand config or swap this component for a logo. */
export function Wordmark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const [a, b] = brand.wordmark;
  if (compact) {
    return (
      <span className={`flex items-center gap-2.5 ${className}`}>
        <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden className="shrink-0">
          <defs>
            <linearGradient id="wm" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f7f7f5" />
              <stop offset="1" stopColor="#d7c09a" />
            </linearGradient>
          </defs>
          <path d="M13 2 24 22H2Z" fill="none" stroke="url(#wm)" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M13 9v6" stroke="url(#wm)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="display text-[1.15rem] leading-none tracking-tight text-white">
          {brand.shortName}
        </span>
      </span>
    );
  }
  return (
    <span className={`block leading-none ${className}`}>
      <span className="mono block text-[0.68rem] text-[var(--fg-faint)]">{a}</span>
      <span className="display block text-4xl">{b}</span>
    </span>
  );
}
