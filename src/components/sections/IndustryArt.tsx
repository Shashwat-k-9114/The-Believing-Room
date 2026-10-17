import type { IndustrySlug } from "@/content/industries";

/** Abstract artwork per industry. Each uses the arena's glass/line language with its own motif. Colour comes from --ia. */
export function IndustryArt({ slug, className = "" }: { slug: IndustrySlug; className?: string }) {
  const common = { viewBox: "0 0 600 480", className, "aria-hidden": true, focusable: false } as const;
  const stroke = "var(--ia, #d7c09a)";

  if (slug === "it-technology") {
    // Architectural lattice: isometric cubes and a routed path.
    const nodes = Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => [90 + c * 70 + (r % 2) * 35, 80 + r * 75] as const)).flat();
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="it-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#fff" opacity="0.35" />
        ))}
        <path d="M125 155 L195 155 L195 230 L335 230 L335 305 L475 305" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        {[[125, 155], [195, 230], [335, 305], [475, 305]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="6" fill="#08090b" stroke={stroke} strokeWidth="2" />
        ))}
        <g transform="translate(300 150)">
          <path d="M0 -70 L70 -32 L70 48 L0 86 L-70 48 L-70 -32Z" fill="url(#it-g)" stroke="#fff" strokeOpacity="0.5" />
          <path d="M0 -70 L0 10 M0 10 L70 -32 M0 10 L-70 -32" stroke="#fff" strokeOpacity="0.45" fill="none" />
          <path d="M0 10 L0 86" stroke={stroke} strokeWidth="1.5" />
        </g>
        <text x="90" y="430" className="mono" fontSize="12" fill="#fff" fillOpacity="0.5" fontFamily="var(--font-mono-face)">build · ship · explain</text>
      </svg>
    );
  }

  if (slug === "finance") {
    const bars = [90, 140, 120, 190, 170, 250, 230, 310];
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="fi-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="60" x2="540" y1={90 + i * 75} y2={90 + i * 75} stroke="#fff" strokeOpacity="0.1" />
        ))}
        {bars.map((h, i) => (
          <rect key={i} x={80 + i * 58} y={390 - h} width="36" height={h} rx="3" fill="url(#fi-g)" stroke="#fff" strokeOpacity="0.4" />
        ))}
        <polyline points={bars.map((h, i) => `${98 + i * 58},${390 - h - 24}`).join(" ")} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {bars.map((h, i) => (i % 3 === 1 ? <circle key={i} cx={98 + i * 58} cy={390 - h - 24} r="5" fill="#08090b" stroke={stroke} strokeWidth="2" /> : null))}
        <text x="60" y="430" fontSize="12" fill="#fff" fillOpacity="0.5" fontFamily="var(--font-mono-face)">thesis · assumptions · risk</text>
      </svg>
    );
  }

  if (slug === "sales-marketing") {
    // Voice: concentric arcs radiating from a point + oversized quotation mark.
    return (
      <svg {...common}>
        {[40, 80, 120, 160, 200, 240].map((r, i) => (
          <path key={r} d={`M${110} ${240 - r} A${r} ${r} 0 0 1 ${110} ${240 + r}`} fill="none" stroke={i === 2 ? stroke : "#fff"} strokeOpacity={i === 2 ? 1 : 0.25 - i * 0.025} strokeWidth={i === 2 ? 2.5 : 1.5} transform="translate(60 0)" />
        ))}
        <circle cx="170" cy="240" r="9" fill={stroke} />
        <text x="330" y="330" fontSize="300" fill="#fff" fillOpacity="0.14" fontFamily="var(--font-serif), serif" fontStyle="italic">”</text>
        <text x="60" y="430" fontSize="12" fill="#fff" fillOpacity="0.5" fontFamily="var(--font-mono-face)">message · audience · result</text>
      </svg>
    );
  }

  // animation-multimedia: flowing ribbons.
  return (
    <svg {...common}>
      <defs>
        <linearGradient id="an-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M30 ${300 - i * 6} C 170 ${60 + i * 18}, 300 ${440 - i * 16}, 570 ${130 + i * 14}`}
          fill="none"
          stroke={i === 4 ? stroke : "url(#an-g)"}
          strokeWidth={i === 4 ? 2.5 : 1.2}
          opacity={i === 4 ? 1 : 0.8}
        />
      ))}
      <circle cx="300" cy="240" r="46" fill="#fff" fillOpacity="0.06" stroke="#fff" strokeOpacity="0.4" />
      <path d="M288 222 L322 240 L288 258Z" fill="#fff" fillOpacity="0.8" />
      <text x="60" y="430" fontSize="12" fill="#fff" fillOpacity="0.5" fontFamily="var(--font-mono-face)">craft · process · taste</text>
    </svg>
  );
}
