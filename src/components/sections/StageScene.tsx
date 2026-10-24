/**
 * The hero illustration: a stage with two spotlights, a microphone and an audience in silhouette.
 * Pure SVG, no images. The light motion is CSS only (see .beam and .pool in globals.css) and stops for reduced motion.
 */
export function StageScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 720"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A stage lit by two spotlights, with a microphone at the centre and an audience in silhouette."
      className={className}
    >
      <defs>
        <radialGradient id="ss-wall" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#4a2f66" />
          <stop offset="0.55" stopColor="#231532" />
          <stop offset="1" stopColor="#120b19" />
        </radialGradient>
        <linearGradient id="ss-curtain" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5a3585" />
          <stop offset="0.6" stopColor="#35195a" />
          <stop offset="1" stopColor="#1a0d2e" />
        </linearGradient>
        <pattern id="ss-folds" width="38" height="10" patternUnits="userSpaceOnUse">
          <rect width="19" height="10" fill="#000" opacity="0.22" />
          <rect x="19" width="9" height="10" fill="#fff" opacity="0.05" />
        </pattern>
        <linearGradient id="ss-beam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#f3d98f" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f3d98f" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id="ss-pool" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#d8b45a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#d8b45a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset="0.5" stopColor="#d2a94f" />
          <stop offset="1" stopColor="#8f6a2a" />
        </linearGradient>
        <linearGradient id="ss-floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2b1b3b" />
          <stop offset="1" stopColor="#0f0816" />
        </linearGradient>
      </defs>

      <rect width="640" height="720" fill="url(#ss-wall)" />
      {/* back wall arch */}
      <path d="M120 560V300C120 190 210 120 320 120S520 190 520 300V560" fill="none" stroke="#cbae76" strokeOpacity="0.28" strokeWidth="2" />
      <path d="M150 560V306C150 210 226 150 320 150S490 210 490 306V560" fill="none" stroke="#cbae76" strokeOpacity="0.14" strokeWidth="1.5" />

      {/* spotlights */}
      <g className="parallax-slow">
        <g className="beam beam-a">
          <polygon points="112,0 168,0 430,566 190,566" fill="url(#ss-beam)" />
        </g>
        <g className="beam beam-b">
          <polygon points="472,0 528,0 450,566 210,566" fill="url(#ss-beam)" />
        </g>
        <circle cx="140" cy="6" r="15" fill="#fff3cf" opacity="0.9" />
        <circle cx="500" cy="6" r="15" fill="#fff3cf" opacity="0.9" />
      </g>

      {/* floor */}
      <polygon points="40,566 600,566 700,720 -60,720" fill="url(#ss-floor)" />
      <line x1="40" y1="566" x2="600" y2="566" stroke="url(#ss-gold)" strokeWidth="3" />
      <ellipse className="pool" cx="320" cy="618" rx="250" ry="42" fill="url(#ss-pool)" />

      {/* microphone */}
      <g>
        <ellipse cx="320" cy="650" rx="46" ry="9" fill="#0b0610" opacity="0.7" />
        <ellipse cx="320" cy="646" rx="36" ry="7" fill="url(#ss-gold)" />
        <rect x="317" y="420" width="6" height="226" rx="3" fill="url(#ss-gold)" />
        <rect x="296" y="346" width="48" height="84" rx="24" fill="url(#ss-gold)" />
        <g stroke="#6b4c1b" strokeOpacity="0.55" strokeWidth="2">
          <line x1="302" y1="366" x2="338" y2="366" />
          <line x1="300" y1="380" x2="340" y2="380" />
          <line x1="300" y1="394" x2="340" y2="394" />
          <line x1="302" y1="408" x2="338" y2="408" />
        </g>
        <rect x="292" y="426" width="56" height="8" rx="4" fill="#8f6a2a" />
        <ellipse cx="308" cy="368" rx="5" ry="16" fill="#fff" opacity="0.28" />
      </g>

      {/* curtains */}
      <path d="M0 0H152C124 190 168 410 104 720H0Z" fill="url(#ss-curtain)" />
      <path d="M0 0H152C124 190 168 410 104 720H0Z" fill="url(#ss-folds)" />
      <path d="M152 0C124 190 168 410 104 720" fill="none" stroke="url(#ss-gold)" strokeWidth="3" />
      <path d="M640 0H488C516 190 472 410 536 720H640Z" fill="url(#ss-curtain)" />
      <path d="M640 0H488C516 190 472 410 536 720H640Z" fill="url(#ss-folds)" />
      <path d="M488 0C516 190 472 410 536 720" fill="none" stroke="url(#ss-gold)" strokeWidth="3" />
      <path d="M0 0H640V46C540 92 440 38 320 68C200 38 100 92 0 46Z" fill="url(#ss-curtain)" />
      <path d="M0 46C100 92 200 38 320 68C440 38 540 92 640 46" fill="none" stroke="url(#ss-gold)" strokeWidth="3" />

      {/* audience in silhouette */}
      <g fill="#0b0610">
        {[40, 118, 196, 274, 352, 430, 508, 586].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i % 2 ? 688 : 700})`}>
            <circle cx="0" cy="-26" r="19" />
            <path d="M-34 40V8C-34 -8 -18 -8 0 -8S34 -8 34 8V40Z" />
          </g>
        ))}
      </g>

      {/* dust in the light */}
      <g fill="#fff3cf">
        {[
          [250, 330, 2.2, 0], [380, 290, 1.8, 1.4], [300, 220, 1.6, 0.7], [420, 420, 2.2, 2.1], [226, 460, 1.7, 1.1], [352, 500, 1.5, 0.4],
        ].map(([cx, cy, r, d]) => (
          <circle key={`${cx}-${cy}`} className="mote" cx={cx} cy={cy} r={r} style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    </svg>
  );
}
