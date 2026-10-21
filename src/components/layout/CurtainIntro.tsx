/**
 * Opening-night curtains: two velvet panels part over the page to reveal it, with the B mark on the closed curtain.
 *
 * Pure markup and CSS (see "curtain intro" in globals.css). It needs no script to run and ends on its own, so it can
 * never leave the page covered. It is decorative (aria-hidden), never intercepts clicks, plays once per browser
 * session, and is skipped for visitors who ask for reduced motion.
 */

/** Runs before first paint: marks the page so the curtains are skipped when already seen this session. */
export const CURTAIN_GUARD = `try{var d=document.documentElement;if(sessionStorage.getItem("tbr-curtain")||localStorage.getItem("arena-intro-v1")){d.setAttribute("data-curtain","seen")}else{sessionStorage.setItem("tbr-curtain","1")}}catch(e){}`;

export function CurtainIntro() {
  return (
    <div id="curtain-intro" aria-hidden="true">
      <div className="curtain curtain-l" />
      <div className="curtain curtain-r" />
      <div className="curtain-logo">
        {/* eslint-disable-next-line @next/next/no-img-element -- a 2 KB SVG that must paint immediately; no optimiser needed */}
        <img src="/brand/b-mark.svg" width={96} height={96} alt="" fetchPriority="high" decoding="async" />
        <span>The Believing Room</span>
      </div>
    </div>
  );
}
