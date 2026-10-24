/**
 * The hero illustration. It shows the show itself: a candidate pitching on stage with a slide behind them, a panel of
 * recruiters at a table in front, a camera filming, and the audience in the dark. Pure SVG, no images.
 * Light motion is CSS only (.beam, .pool, .mote, .pitch-bar in globals.css) and stops for reduced motion.
 */
export function PitchScene({ className = "" }: { className?: string }) {
  const bars = [
    { x: 388, h: 26 },
    { x: 416, h: 40 },
    { x: 444, h: 33 },
    { x: 472, h: 58 },
    { x: 500, h: 74 },
  ];
  return (
    <svg
      viewBox="0 0 640 720"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A candidate pitching on a lit stage with a chart on a screen behind them. A panel of recruiters watches from a table in front, a camera films the stage, and the audience sits in the dark."
      className={className}
    >
      <defs>
        <radialGradient id="pt-wall" cx="50%" cy="34%" r="72%">
          <stop offset="0" stopColor="#4a2f66" />
          <stop offset="0.55" stopColor="#231532" />
          <stop offset="1" stopColor="#120b19" />
        </radialGradient>
        <linearGradient id="pt-curtain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a3585" />
          <stop offset="0.6" stopColor="#35195a" />
          <stop offset="1" stopColor="#1a0d2e" />
        </linearGradient>
        <pattern id="pt-folds" width="38" height="10" patternUnits="userSpaceOnUse">
          <rect width="19" height="10" fill="#000" opacity="0.22" />
          <rect x="19" width="9" height="10" fill="#fff" opacity="0.05" />
        </pattern>
        <linearGradient id="pt-beam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#f3d98f" stopOpacity="0.18" />
          <stop offset="1" stopColor="#f3d98f" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="pt-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#d8b45a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#d8b45a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pt-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset="0.5" stopColor="#d2a94f" />
          <stop offset="1" stopColor="#8f6a2a" />
        </linearGradient>
        <linearGradient id="pt-floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2b1b3b" />
          <stop offset="1" stopColor="#0f0816" />
        </linearGradient>
        <linearGradient id="pt-screen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2c1a45" />
          <stop offset="1" stopColor="#170c26" />
        </linearGradient>
      </defs>

      <rect width="640" height="720" fill="url(#pt-wall)" />
      <path d="M120 470V250C120 160 210 100 320 100S520 160 520 250V470" fill="none" stroke="#cbae76" strokeOpacity="0.26" strokeWidth="2" />

      {/* the slide behind the candidate */}
      <g>
        <rect x="364" y="186" width="190" height="122" rx="7" fill="url(#pt-screen)" stroke="url(#pt-gold)" strokeWidth="2" />
        <line x1="380" y1="296" x2="538" y2="296" stroke="#cbae76" strokeOpacity="0.5" />
        {bars.map((b, i) => (
          <rect key={b.x} className="pitch-bar" x={b.x} y={296 - b.h} width="16" height={b.h} rx="2" fill="url(#pt-gold)" style={{ animationDelay: `${1 + i * 0.12}s` }} />
        ))}
        <polyline points="396,252 424,238 452,244 480,218 508,206" fill="none" stroke="#fff3cf" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* spotlights, both landing on the candidate */}
      <g className="parallax-slow">
        <g className="beam beam-a">
          <polygon points="112,0 168,0 330,470 170,470" fill="url(#pt-beam)" />
        </g>
        <g className="beam beam-b">
          <polygon points="472,0 528,0 330,470 170,470" fill="url(#pt-beam)" />
        </g>
        <circle cx="140" cy="6" r="15" fill="#fff3cf" opacity="0.9" />
        <circle cx="500" cy="6" r="15" fill="#fff3cf" opacity="0.9" />
      </g>

      {/* stage */}
      <polygon points="110,402 530,402 592,470 48,470" fill="url(#pt-floor)" />
      <rect x="48" y="470" width="544" height="18" fill="#1a0f26" />
      <line x1="48" y1="470" x2="592" y2="470" stroke="url(#pt-gold)" strokeWidth="3" />
      <ellipse className="pool" cx="250" cy="446" rx="120" ry="17" fill="url(#pt-pool)" />

      {/* the candidate, mid-pitch, one arm toward the slide */}
      <g fill="#0b0610" stroke="#fbe7a6" strokeOpacity="0.4" strokeWidth="1.2">
        <rect x="237" y="392" width="10" height="70" rx="4" />
        <rect x="252" y="392" width="10" height="70" rx="4" />
        <path d="M226 348C226 332 274 332 274 348L270 402H230Z" />
        <circle cx="250" cy="320" r="15" />
      </g>
      <g stroke="#0b0610" strokeWidth="8" strokeLinecap="round" fill="none">
        <path d="M270 350L304 328L330 304" />
        <path d="M230 352L224 384" />
      </g>
      {/* the candidate's microphone stand */}
      <rect x="203" y="366" width="3" height="96" rx="1.5" fill="url(#pt-gold)" />
      <rect x="196" y="346" width="17" height="26" rx="8.5" fill="url(#pt-gold)" />

      {/* recruiters' table, with scorecards */}
      <rect x="96" y="522" width="448" height="15" rx="4" fill="#2a1a3d" stroke="url(#pt-gold)" strokeWidth="1.5" />
      <rect x="112" y="537" width="416" height="44" fill="#120a1b" />
      {[158, 292, 426].map((x) => (
        <rect key={x} x={x} y="509" width="40" height="10" rx="2" fill="#fbe7a6" opacity="0.8" />
      ))}

      {/* recruiters, seen from behind */}
      <g fill="#07040b" stroke="#fbe7a6" strokeOpacity="0.28" strokeWidth="1.2">
        {[176, 320, 464].map((x) => (
          <g key={x} transform={`translate(${x} 612)`}>
            <circle cx="0" cy="-30" r="22" />
            <path d="M-46 62V18C-46 -2 -22 -6 0 -6S46 -2 46 18V62Z" />
          </g>
        ))}
      </g>

      {/* the camera filming it */}
      <g>
        <g stroke="#8f6a2a" strokeWidth="3" strokeLinecap="round">
          <line x1="86" y1="632" x2="56" y2="702" />
          <line x1="86" y1="632" x2="116" y2="702" />
          <line x1="86" y1="632" x2="86" y2="708" />
        </g>
        <rect x="52" y="586" width="62" height="40" rx="6" fill="#15091f" stroke="url(#pt-gold)" strokeWidth="2" />
        <rect x="114" y="596" width="18" height="20" rx="3" fill="#0b0610" stroke="url(#pt-gold)" strokeWidth="1.5" />
        <circle cx="62" cy="596" r="3.5" fill="#ff6b5e" />
      </g>

      {/* audience, closest to the viewer */}
      <g fill="#040207">
        {[36, 150, 262, 380, 496, 606].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 2 ? 724 : 736}) scale(2.1)`}>
            <circle cx="0" cy="-17" r="11" />
            <path d="M-22 26V8C-22 -2 -11 -4 0 -4S22 -2 22 8V26Z" />
          </g>
        ))}
      </g>

      {/* curtains */}
      <path d="M0 0H152C124 190 168 410 104 720H0Z" fill="url(#pt-curtain)" />
      <path d="M0 0H152C124 190 168 410 104 720H0Z" fill="url(#pt-folds)" />
      <path d="M152 0C124 190 168 410 104 720" fill="none" stroke="url(#pt-gold)" strokeWidth="3" />
      <path d="M640 0H488C516 190 472 410 536 720H640Z" fill="url(#pt-curtain)" />
      <path d="M640 0H488C516 190 472 410 536 720H640Z" fill="url(#pt-folds)" />
      <path d="M488 0C516 190 472 410 536 720" fill="none" stroke="url(#pt-gold)" strokeWidth="3" />
      <path d="M0 0H640V46C540 92 440 38 320 68C200 38 100 92 0 46Z" fill="url(#pt-curtain)" />
      <path d="M0 46C100 92 200 38 320 68C440 38 540 92 640 46" fill="none" stroke="url(#pt-gold)" strokeWidth="3" />

      <g fill="#fff3cf">
        {[
          [250, 300, 2.2, 0], [330, 260, 1.8, 1.4], [290, 200, 1.6, 0.7], [210, 380, 2, 2.1], [360, 350, 1.5, 1.1],
        ].map(([cx, cy, r, d]) => (
          <circle key={`${cx}-${cy}`} className="mote" cx={cx} cy={cy} r={r} style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    </svg>
  );
}
