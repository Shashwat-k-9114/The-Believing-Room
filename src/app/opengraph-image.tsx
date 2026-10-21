import { ImageResponse } from "next/og";
import { OG_EMBLEM } from "@/lib/og-emblem";

export const alt = "The Believing Room: Where Opportunity Meets Belief.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview. The title is live text (large, high contrast), never baked into the artwork. The emblem is the
 * founder-supplied show artwork; no third-party logos, no dates, no claims.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "64px 72px 64px 84px",
          background: "radial-gradient(70% 90% at 90% 100%, rgba(203,174,118,0.28), rgba(22,15,28,0) 70%), #160f1c", color: "#f4eee4",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: 640, fontFamily: "serif" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#cbae76", fontFamily: "sans-serif" }}>Season 01</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, lineHeight: 1.04 }}>The Believing Room</div>
            <div style={{ fontSize: 40, marginTop: 22, fontStyle: "italic", color: "#cbae76" }}>Where Opportunity Meets Belief.</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "rgba(244,238,228,0.78)", fontFamily: "sans-serif" }}>A live internship-pitching show, filmed for YouTube.</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={OG_EMBLEM} width={420} height={420} alt="" style={{ borderRadius: 36, border: "2px solid rgba(203,174,118,0.55)" }} />
      </div>
    ),
    size,
  );
}
