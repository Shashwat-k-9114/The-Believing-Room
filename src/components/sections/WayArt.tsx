export type SceneKind = "candidate" | "audience" | "recruiter" | "college" | "show" | "podcast" | "events" | "about" | "partners" | "stories";
type Kind = SceneKind;

const label: Record<Kind, string> = {
  candidate: "A candidate at a microphone under a spotlight.",
  audience: "Rows of audience members watching the stage.",
  recruiter: "A panel of recruiters seated behind a table, one of them highlighted.",
  college: "A college building with students in front, one of them under a spotlight.",
  show: "A camera on a tripod filming a candidate on a lit stage, with a play button for the published episode.",
  podcast: "Two microphones facing each other across a table with sound waves between them.",
  events: "A calendar and a map pin, both marked with question marks because the date and venue are not yet announced.",
  about: "A paper resume on one side and a person on a lit stage on the other.",
  partners: "Three banners hanging over a lit stage, with a podium and a gold star at the centre.",
  stories: "Two empty speech bubbles in dashed outline, waiting for the first stories.",
};

/** A head and shoulders, centred on (x, y) where y is the neck. */
function Person({ x, y, s = 1, cls = "" }: { x: number; y: number; s?: number; cls?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={cls}>
      <circle cx="0" cy="-17" r="11" />
      <path d="M-22 26V8C-22 -2 -11 -4 0 -4S22 -2 22 8V26Z" />
    </g>
  );
}

/**
 * Small illustrations for the three audience cards. Decorative scenes in the brand colours; the hover state
 * (see .way in globals.css) brightens the light and picks out one figure.
 */
export function WayArt({ kind, className = "" }: { kind: Kind; className?: string }) {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label[kind]} className={className}>
      <defs>
        <linearGradient id={`wa-bg-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3b2455" />
          <stop offset="1" stopColor="#170f21" />
        </linearGradient>
        <linearGradient id={`wa-beam-${kind}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.75" />
          <stop offset="1" stopColor="#f3d98f" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`wa-gold-${kind}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset="1" stopColor="#b88a38" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#wa-bg-${kind})`} />

      {kind === "candidate" && (
        <>
          <polygon className="art-beam" points="140,0 180,0 236,160 84,160" fill={`url(#wa-beam-${kind})`} />
          <rect x="0" y="150" width="320" height="30" fill="#0e0816" />
          <line x1="0" y1="150" x2="320" y2="150" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <ellipse className="art-beam" cx="160" cy="156" rx="78" ry="8" fill="#f3d98f" opacity="0.35" />
          <g fill="#0e0816">
            <Person x={150} y={104} s={1.55} />
          </g>
          <g>
            <rect x="197" y="84" width="3" height="66" fill={`url(#wa-gold-${kind})`} />
            <rect x="191" y="68" width="15" height="24" rx="7.5" fill={`url(#wa-gold-${kind})`} />
          </g>
        </>
      )}

      {kind === "audience" && (
        <>
          <rect x="108" y="14" width="104" height="56" rx="5" fill="#241636" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <polygon className="art-beam" points="150,30 150,54 174,42" fill="#fbe7a6" opacity="0.85" />
          <g fill="#0e0816">
            {[48, 104, 160, 216, 272].map((x, i) => (
              <Person key={`r1-${x}`} x={x} y={112} s={0.9} cls={i === 2 ? "art-hi" : ""} />
            ))}
            {[20, 76, 132, 188, 244, 300].map((x, i) => (
              <Person key={`r2-${x}`} x={x} y={160} s={1.1} cls={i === 4 ? "art-hi" : ""} />
            ))}
          </g>
        </>
      )}

      {kind === "recruiter" && (
        <>
          <polygon className="art-beam" points="120,0 200,0 240,120 80,120" fill={`url(#wa-beam-${kind})`} opacity="0.7" />
          <g fill="#0e0816">
            <Person x={88} y={88} s={1.1} />
            <Person x={160} y={86} s={1.2} cls="art-hi" />
            <Person x={232} y={88} s={1.1} />
          </g>
          <rect x="40" y="108" width="240" height="14" rx="3" fill="#2a1a3d" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
          <rect x="52" y="122" width="216" height="58" fill="#120a1b" />
          <g className="art-hi-stroke" fill="none" stroke="#fbe7a6" strokeWidth="2.2" strokeLinecap="round">
            <path d="M158 38l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
          </g>
        </>
      )}

      {kind === "college" && (
        <>
          <polygon className="art-beam" points="146,0 174,0 240,170 80,170" fill={`url(#wa-beam-${kind})`} opacity="0.55" />
          <polygon points="76,64 160,30 244,64" fill="#241636" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <rect x="88" y="64" width="144" height="70" fill="#1c1129" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
          {[104, 132, 160, 188, 216].map((x) => (
            <rect key={x} x={x - 4} y="72" width="8" height="58" fill="#3a2552" />
          ))}
          <rect x="74" y="134" width="172" height="8" fill="#2a1a3d" />
          <rect x="64" y="142" width="192" height="8" fill="#241636" />
          <g fill="#0e0816">
            <Person x={96} y={172} s={0.9} />
            <Person x={160} y={170} s={1} cls="art-hi" />
            <Person x={226} y={172} s={0.9} />
          </g>
        </>
      )}

      {kind === "show" && (
        <>
          <rect x="150" y="30" width="146" height="100" rx="5" fill="#1b1030" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
          <polygon className="art-beam" points="214,0 232,0 286,130 160,130" fill={`url(#wa-beam-${kind})`} opacity="0.6" />
          <rect x="150" y="130" width="146" height="30" fill="#0e0816" />
          <line x1="150" y1="130" x2="296" y2="130" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <g fill="#0e0816"><Person x={226} y={112} s={0.95} /></g>
          <rect x="262" y="40" width="30" height="20" rx="5" fill="#2a1a3d" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
          <polygon className="art-hi-stroke" points="272,45 272,55 282,50" fill="#fbe7a6" />
          <g stroke="#8f6a2a" strokeWidth="2.4" strokeLinecap="round">
            <line x1="76" y1="116" x2="54" y2="172" />
            <line x1="76" y1="116" x2="98" y2="172" />
            <line x1="76" y1="116" x2="76" y2="176" />
          </g>
          <rect x="46" y="86" width="52" height="32" rx="5" fill="#15091f" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.8" />
          <rect x="98" y="94" width="16" height="16" rx="3" fill="#0b0610" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.4" />
          <circle cx="54" cy="94" r="3" fill="#ff6b5e" />
        </>
      )}

      {kind === "podcast" && (
        <>
          <rect x="40" y="132" width="240" height="12" rx="3" fill="#2a1a3d" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
          <rect x="52" y="144" width="216" height="36" fill="#120a1b" />
          {[100, 220].map((x) => (
            <g key={x}>
              <rect x={x - 1.5} y="96" width="3" height="36" fill={`url(#wa-gold-${kind})`} />
              <rect x={x - 11} y="56" width="22" height="42" rx="11" fill={`url(#wa-gold-${kind})`} />
              <g stroke="#6b4c1b" strokeOpacity="0.5" strokeWidth="1.4">
                <line x1={x - 7} y1="68" x2={x + 7} y2="68" />
                <line x1={x - 8} y1="76" x2={x + 8} y2="76" />
                <line x1={x - 7} y1="84" x2={x + 7} y2="84" />
              </g>
            </g>
          ))}
          <g className="art-hi-stroke" fill="none" stroke="#fbe7a6" strokeWidth="3" strokeLinecap="round">
            {[10, 22, 34, 44, 34, 22, 10].map((h, i) => (
              <line key={i} x1={130 + i * 10} y1={90 - h / 2} x2={130 + i * 10} y2={90 + h / 2} />
            ))}
          </g>
        </>
      )}

      {kind === "events" && (
        <>
          <rect x="44" y="40" width="108" height="104" rx="9" fill="#241636" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <rect x="44" y="40" width="108" height="28" rx="9" fill={`url(#wa-gold-${kind})`} />
          <rect x="44" y="58" width="108" height="10" fill={`url(#wa-gold-${kind})`} />
          <g fill="#fbe7a6" opacity="0.35">
            {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={64 + c * 24} cy={86 + r * 14} r="2.2" />))}
          </g>
          <text x="98" y="128" textAnchor="middle" fontSize="44" fill="#fbe7a6" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="art-hi-stroke">?</text>
          <path d="M232 46c-26 0-42 18-42 40 0 28 42 70 42 70s42-42 42-70c0-22-16-40-42-40Z" fill="#241636" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <circle cx="232" cy="86" r="20" fill="#120a1b" />
          <text x="232" y="98" textAnchor="middle" fontSize="30" fill="#fbe7a6" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>?</text>
        </>
      )}

      {kind === "about" && (
        <>
          <g opacity="0.85">
            <rect x="34" y="34" width="84" height="112" rx="5" fill="#2a1f38" stroke="#7b6a8e" strokeWidth="1.5" />
            <g stroke="#7b6a8e" strokeWidth="3" strokeLinecap="round">
              <line x1="48" y1="56" x2="104" y2="56" />
              <line x1="48" y1="72" x2="96" y2="72" />
              <line x1="48" y1="88" x2="104" y2="88" />
              <line x1="48" y1="104" x2="86" y2="104" />
            </g>
          </g>
          <path d="M126 90h28" stroke={`url(#wa-gold-${kind})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
          <polygon points="170,90 158,82 158,98" fill="#cbae76" />
          <polygon className="art-beam" points="236,0 262,0 306,158 192,158" fill={`url(#wa-beam-${kind})`} />
          <rect x="176" y="146" width="140" height="34" fill="#0e0816" />
          <line x1="176" y1="146" x2="316" y2="146" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <g fill="#0e0816" stroke="#fbe7a6" strokeOpacity="0.4" strokeWidth="1"><Person x={249} y={146} s={1.25} /></g>
        </>
      )}

      {kind === "partners" && (
        <>
          <polygon className="art-beam" points="120,0 200,0 262,150 58,150" fill={`url(#wa-beam-${kind})`} />
          {/* Three banners hang over the stage; the middle one is picked out on hover */}
          {[
            { x: 62, c: "" },
            { x: 138, c: "art-hi" },
            { x: 214, c: "" },
          ].map((b) => (
            <g key={b.x} className={b.c}>
              <line x1={b.x + 22} y1="0" x2={b.x + 22} y2="16" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.5" />
              <path d={`M${b.x} 16h44v62l-22-11-22 11z`} fill="#241636" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" strokeLinejoin="round" />
              <path d={`M${b.x + 22} 28l3.4 8.6 8.6 3.4-8.6 3.4-3.4 8.6-3.4-8.6-8.6-3.4 8.6-3.4z`} fill="#cbae76" opacity="0.85" />
            </g>
          ))}
          {/* Stage floor and a podium with a gold star plate */}
          <rect x="0" y="150" width="320" height="30" fill="#0e0816" />
          <line x1="0" y1="150" x2="320" y2="150" stroke={`url(#wa-gold-${kind})`} strokeWidth="2" />
          <ellipse className="art-beam" cx="160" cy="156" rx="86" ry="8" fill="#f3d98f" opacity="0.3" />
          <path d="M134 150l6-40h40l6 40z" fill="#1d1230" stroke={`url(#wa-gold-${kind})`} strokeWidth="1.6" strokeLinejoin="round" />
          <path className="art-hi-stroke" d="M160 118l3.6 9 9 3.6-9 3.6-3.6 9-3.6-9-9-3.6 9-3.6z" fill={`url(#wa-gold-${kind})`} />
          <g fill="#fbe7a6" opacity="0.55">
            <circle cx="40" cy="120" r="2.2" /><circle cx="282" cy="108" r="2.2" /><circle cx="258" cy="132" r="1.6" /><circle cx="70" cy="136" r="1.6" />
          </g>
        </>
      )}

      {kind === "stories" && (
        <>
          <g fill="none" stroke={`url(#wa-gold-${kind})`} strokeWidth="2.2" strokeDasharray="6 6" strokeLinecap="round">
            <path d="M60 36h120a14 14 0 0 1 14 14v44a14 14 0 0 1-14 14h-70l-22 20v-20h-28a14 14 0 0 1-14-14V50a14 14 0 0 1 14-14Z" />
            <path d="M150 112h110a14 14 0 0 1 14 14v22a14 14 0 0 1-14 14h-10v14l-18-14h-82a14 14 0 0 1-14-14v-22a14 14 0 0 1 14-14Z" />
          </g>
          <g fill="#fbe7a6" opacity="0.55">
            <circle cx="88" cy="72" r="4" /><circle cx="108" cy="72" r="4" /><circle cx="128" cy="72" r="4" />
          </g>
        </>
      )}
    </svg>
  );
}
