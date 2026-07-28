import { ImageResponse } from "next/og";

/** Homepage share card (update-spec §5.2) — the root route previously had no
 *  og:image at all. Brand palette: navy, cream, terracotta. */

export const alt =
  "Joe Ross — Executive Product Leader. $1.2B exit · $68M→$150M ARR · 2x founding CPO.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1f3a5f";
const CREAM = "#f9f6f0";
const TERRACOTTA = "#c8522a";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: NAVY,
          color: CREAM,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: TERRACOTTA,
            marginBottom: 28,
          }}
        >
          ProductDetroit.com
        </div>
        <div style={{ fontSize: 84, lineHeight: 1.05, marginBottom: 20 }}>
          Joe Ross
        </div>
        <div
          style={{
            fontSize: 40,
            color: "rgba(249, 246, 240, 0.85)",
            marginBottom: 56,
          }}
        >
          Executive Product Leader
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 30,
            color: "rgba(249, 246, 240, 0.75)",
          }}
        >
          <span>$1.2B exit</span>
          <span style={{ color: TERRACOTTA }}>·</span>
          <span>$68M→$150M ARR</span>
          <span style={{ color: TERRACOTTA }}>·</span>
          <span>2x founding CPO</span>
        </div>
      </div>
    ),
    size,
  );
}
