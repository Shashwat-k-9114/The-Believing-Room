import { ImageResponse } from "next/og";

export const alt = "The Believing Room: Where Opportunity Meets Belief.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Brand-only social preview: no third-party logos, no dates, no claims. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 84px",
          background: "radial-gradient(70% 90% at 90% 100%, rgba(203,174,118,0.28), rgba(22,15,28,0) 70%), #160f1c", color: "#f4eee4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#cbae76" }}>
          <svg width="34" height="40" viewBox="0 0 26 30" fill="none" stroke="#cbae76" strokeWidth="1.4" strokeLinecap="round">
            <path d="M3 29V12a10 10 0 0 1 20 0v17" />
            <path d="M8 29V13a5 5 0 0 1 10 0v16" opacity="0.5" />
            <path d="M-1 22C7 20 12 27 27 18" />
          </svg>
          Season 01
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "serif" }}>
          <div style={{ fontSize: 104, lineHeight: 1.02 }}>The Believing Room</div>
          <div style={{ fontSize: 46, marginTop: 22, fontStyle: "italic", color: "#cbae76" }}>Where Opportunity Meets Belief.</div>
        </div>
        <div style={{ fontSize: 24, color: "rgba(244,238,228,0.7)" }}>A live internship pitching show, filmed for YouTube.</div>
      </div>
    ),
    size,
  );
}
