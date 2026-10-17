import { industries } from "@/content/industries";

/**
 * The hero object: a suspended glass stage lit by a single descending beam,
 * with four polished slabs standing on it, one per industry. The metaphor is
 * literal: four arenas, one stage, one light.
 *
 * Pure SVG + CSS (no WebGL): first paint is instant, GPU cost is negligible,
 * and it IS the static fallback. Server-rendered; the intro choreography is
 * driven by CSS classes (see globals.css).
 */

const SLABS = [
  { cx: 525, w: 108, h: 250 },
  { cx: 645, w: 116, h: 340 },
  { cx: 785, w: 116, h: 295 },
  { cx: 905, w: 108, h: 215 },
];
const BASE = 742;

// Deterministic dust motes inside the beam (no Math.random: stable SSR).
const MOTES = Array.from({ length: 26 }, (_, i) => {
  const t = (i * 0.61803398875) % 1;
  const u = (i * 0.7548776662) % 1;
  const y = 40 + t * 640;
  const half = 20 + (y / 760) * 250;
  return { x: 720 + (u * 2 - 1) * half, y, r: 0.8 + ((i * 37) % 10) / 9, o: 0.15 + ((i * 13) % 10) / 30 };
});

export function StageArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#dfe8f5" stopOpacity="0.16" />
          <stop offset="1" stopColor="#d7c09a" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#d7c09a" stopOpacity="0.14" />
          <stop offset="1" stopColor="#d7c09a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f3a" />
          <stop offset="1" stopColor="#0d0f14" />
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
          <stop offset="0.38" stopColor="#cfd8e6" stopOpacity="0.09" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.02" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="softer" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="reflect">
          <rect x="0" y="0" width="1440" height="900" fill="url(#fade)" />
        </mask>
        {industries.map((ind) => (
          <radialGradient key={ind.slug} id={`glow-${ind.slug}`} cx="0.5" cy="1" r="0.8">
            <stop offset="0" stopColor={ind.accent} stopOpacity="0.55" />
            <stop offset="1" stopColor={ind.accent} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* Beam: slowest parallax layer */}
      <g className="par par-a hero-beam">
        <polygon points="690,0 750,0 1060,770 380,770" fill="url(#beam)" opacity="0.35" />
        <polygon points="702,0 738,0 1010,770 430,770" fill="url(#beam)" />
        <rect x="719" y="0" width="2" height="740" fill="url(#core)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="#fff" opacity={m.o} />
        ))}
      </g>

      {/* Stage deck */}
      <g className="par par-c hero-stage">
        <ellipse cx="720" cy="772" rx="520" ry="96" fill="url(#pool)" />
        <ellipse cx="720" cy="764" rx="430" ry="72" fill="url(#deck)" stroke="#fff" strokeOpacity="0.28" />
        <ellipse cx="720" cy="756" rx="430" ry="72" fill="none" stroke="#fff" strokeOpacity="0.12" />
        <ellipse cx="720" cy="760" rx="335" ry="52" fill="none" stroke="#d7c09a" strokeOpacity="0.5" strokeWidth="1" />
        <ellipse cx="720" cy="760" rx="210" ry="30" fill="none" stroke="#fff" strokeOpacity="0.14" />
        <path d="M290 764 A430 72 0 0 0 1150 764 L1150 790 A430 72 0 0 1 290 790 Z" fill="#06070a" stroke="#fff" strokeOpacity="0.1" />
      </g>

      {/* Four industry slabs */}
      <g className="par par-b">
        {SLABS.map((s, i) => {
          const ind = industries[i];
          const x0 = -s.w / 2;
          return (
            <g key={ind.slug} transform={`translate(${s.cx} ${BASE})`}>
              <g className="hero-slab" style={{ ["--i" as string]: i }}>
                <g className="slab-float" style={{ animationDelay: `${i * -2.2}s` }}>
                  {/* accent bloom on the deck */}
                  <ellipse cx="0" cy="6" rx={s.w * 0.95} ry="20" fill={`url(#glow-${ind.slug})`} />
                  {/* reflection */}
                  <g transform="scale(1 -1) translate(0 -2)" opacity="0.5" mask="url(#reflect)">
                    <path d={`M${x0} ${-s.h + 10} L${s.w / 2} ${-s.h} L${s.w / 2} 0 L${x0} 0Z`} fill="url(#face)" />
                  </g>
                  {/* side face */}
                  <path d={`M${s.w / 2} ${-s.h} L${s.w / 2 + 18} ${-s.h + 9} L${s.w / 2 + 18} 9 L${s.w / 2} 0Z`} fill="url(#side)" stroke="#fff" strokeOpacity="0.18" />
                  {/* front face */}
                  <path d={`M${x0} ${-s.h + 10} L${s.w / 2} ${-s.h} L${s.w / 2} 0 L${x0} 0Z`} fill="url(#face)" stroke="#fff" strokeOpacity="0.4" />
                  {/* colour absorbed from the deck */}
                  <path d={`M${x0} ${-60} L${s.w / 2} ${-60} L${s.w / 2} 0 L${x0} 0Z`} fill={ind.accent} opacity="0.14" />
                  {/* specular edge */}
                  <path d={`M${x0 + 1.5} ${-s.h + 14} L${x0 + 1.5} -4`} stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
                  <path d={`M${x0 + 8} ${-s.h + 13} L${s.w / 2 - 6} ${-s.h + 5}`} stroke="#fff" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
                  <text x={x0 + 14} y="-14" fontFamily="var(--font-mono-face), monospace" fontSize="11" letterSpacing="2" fill="#fff" fillOpacity="0.55">
                    {ind.index}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
