/**
 * The hero sculpture: a silk ribbon unfurling through a lit archway, the doorway a
 * candidate steps through. Pure SVG: instant first paint, tiny, and it is its own
 * static fallback. Colour comes from the brand palette only.
 */
export function RibbonArt({ className = "", still = false }: { className?: string; still?: boolean }) {
  return (
    <svg viewBox="0 0 760 960" preserveAspectRatio="xMidYMid meet" style={{ overflow: "visible" }} className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="room" cx="0.5" cy="0.72" r="0.62">
          <stop offset="0" stopColor="#fdf4de" />
          <stop offset="0.38" stopColor="#ecd7ae" />
          <stop offset="0.8" stopColor="#a98a4f" />
          <stop offset="1" stopColor="#4a3a2d" />
        </radialGradient>
        <linearGradient id="reveal-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e6c3" stopOpacity="0" />
          <stop offset="1" stopColor="#fff7e6" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="silk-a" x1="0" y1="0" x2="1" y2="0.7">
          <stop offset="0" stopColor="#c9bcd6" />
          <stop offset="0.45" stopColor="#8c7a9b" />
          <stop offset="1" stopColor="#3f2c4d" />
        </linearGradient>
        <linearGradient id="silk-b" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#f4e6c6" />
          <stop offset="0.5" stopColor="#cbae76" />
          <stop offset="1" stopColor="#8a6d3b" />
        </linearGradient>
        <linearGradient id="silk-c" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a1c33" />
          <stop offset="1" stopColor="#160f1c" />
        </linearGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className={still ? undefined : "hero-art-drift"}>
        {/* the lit room beyond the arch */}
        <path d="M150 960V350a230 230 0 0 1 460 0v610Z" fill="url(#room)" />
        <path d="M150 960V350a230 230 0 0 1 460 0v610Z" fill="none" stroke="#f4e6c6" strokeOpacity="0.55" strokeWidth="1.2" />
        <path d="M190 960V356a190 190 0 0 1 380 0v604Z" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1" />
        <path d="M232 960V362a148 148 0 0 1 296 0v598Z" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="150" y="780" width="460" height="180" fill="url(#reveal-floor)" />
        <ellipse cx="380" cy="948" rx="330" ry="30" fill="url(#shadow)" />

        {/* ribbon: three overlapping bands imply folds in a single length of silk */}
        <path d="M-1500 150C120 70 330 120 440 290C530 430 620 520 1220 520L1220 690C610 690 490 590 390 460C300 340 120 300 -1500 370Z" fill="url(#silk-a)" />
        <path d="M-1500 290C100 230 290 290 385 425C478 556 600 640 1220 640L1220 704C600 720 465 640 362 516C272 408 110 380 -1500 406Z" fill="url(#silk-b)" />
        <path d="M-1500 390C100 372 250 436 332 560C402 668 540 800 1220 800L1220 842C520 866 380 742 298 618C228 516 100 462 -1500 476Z" fill="url(#silk-c)" />
        {/* sheen along the fold */}
        <path d="M-160 188C180 150 320 190 410 300C470 372 520 424 600 468" fill="none" stroke="url(#sheen)" strokeWidth="2" strokeLinecap="round" />
        <path d="M-200 330C160 296 290 340 372 440C440 524 520 592 640 622" fill="none" stroke="url(#sheen)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  );
}
