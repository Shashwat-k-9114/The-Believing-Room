import type { IndustrySlug } from "@/content/industries";

/**
 * One fine line drawing per discipline, in the same language as the hero ribbon:
 * a single stroke weight, currentColor, no fills. Decorative only.
 */
export function DisciplineMark({ slug, className = "" }: { slug: IndustrySlug; className?: string }) {
  const p = { viewBox: "0 0 240 240", className, "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeWidth: 1.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

  if (slug === "it-technology")
    // architecture: orthogonal routes resolving into a node
    return (
      <svg {...p}>
        <path d="M20 200V150H80V100H140V50H220" />
        <path d="M20 170H60V120H110V70H170V30" opacity="0.5" />
        <circle cx="220" cy="50" r="5" />
        <circle cx="80" cy="150" r="3.5" />
        <circle cx="140" cy="100" r="3.5" />
      </svg>
    );
  if (slug === "finance-accounting")
    // structure: a ledger line climbing over a quiet baseline
    return (
      <svg {...p}>
        <path d="M20 200H220" opacity="0.5" />
        <path d="M20 180C70 176 80 120 120 124S170 70 220 40" />
        <path d="M60 200V176M120 200V124M180 200V82" opacity="0.5" />
        <circle cx="220" cy="40" r="4" />
      </svg>
    );
  if (slug === "sales-marketing")
    // voice: arcs travelling outward from a point
    return (
      <svg {...p}>
        {[30, 62, 94, 126].map((r, i) => (
          <path key={r} d={`M40 ${120 - r} A${r} ${r} 0 0 1 40 ${120 + r}`} opacity={1 - i * 0.2} />
        ))}
        <circle cx="40" cy="120" r="4" />
      </svg>
    );
  // animation & multimedia: parallel currents
  return (
    <svg {...p}>
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M10 ${150 - i * 8} C70 ${40 + i * 10} 130 ${230 - i * 12} 230 ${70 + i * 8}`} opacity={i === 3 ? 1 : 0.45} />
      ))}
    </svg>
  );
}
