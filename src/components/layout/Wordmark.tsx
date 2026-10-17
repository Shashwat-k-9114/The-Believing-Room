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

/** Typographic wordmark. Swap this component for a logo file once final artwork exists. */
export function Wordmark({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <span className={`flex items-center gap-2.5 text-[#f4eee4] ${className}`}>
        <ArchMark size={20} className="text-[#cbae76]" />
        <span className="display text-[1.3rem] leading-none tracking-tight">{brand.name}</span>
      </span>
    );
  }
  return (
    <span className={`block ${className}`}>
      <ArchMark size={30} className="mb-4 text-[var(--accent)]" />
      <span className="display block text-4xl leading-none sm:text-5xl">
        The Believing
        <br />
        <em>Room</em>
      </span>
    </span>
  );
}
