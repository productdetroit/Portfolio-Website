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

/** Verbatim copy of public/brand/product-detroit-mark-reversed.svg (brand
 *  guide v1.1) — inlined because ImageResponse can't fetch from /public. */
const MARK_REVERSED_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="56.5" fill="none" stroke="#F9F6F0" stroke-width="1.9"></circle><circle cx="60" cy="60" r="47.9" fill="none" stroke="#E8A58C" stroke-width="1.3" opacity="0.7"></circle><g transform="translate(32.84 76.01) scale(0.467)"><path fill="#F9F6F0" d="M29.4 0L2.2 0L2.2-1L4.2-1.7Q6.2-2.3 6.9-3.5Q7.5-4.7 7.5-6.7L7.5-6.7L7.5-59.1Q7.5-61.1 6.8-62.3Q6.1-63.5 4.1-64.2L4.1-64.2L2.2-65L2.2-66L26.5-66Q41.4-66 48.1-60.6Q54.7-55.1 54.7-46.2L54.7-46.2Q54.7-40.5 52.0-35.8Q49.2-31 42.9-28.2Q36.6-25.4 25.9-25.4L25.9-25.4L22.5-25.4L22.5-7Q22.5-3.1 26.4-1.9L26.4-1.9L29.4-1L29.4 0ZM22.5-64L22.5-27.4L26.3-27.4Q31.2-27.4 34.3-29Q37.4-30.6 38.9-34.6Q40.4-38.6 40.4-45.7L40.4-45.7Q40.4-52.9 38.8-56.9Q37.1-60.9 33.9-62.5Q30.7-64 25.9-64L25.9-64L22.5-64Z"></path><g transform="translate(56.5 0)"><path fill="#E8A58C" d="M14.8 1.5L14.8 1.5Q10.8 1.5 7.8-1.6Q4.7-4.7 4.7-12.4L4.7-12.4Q4.7-17.6 6.7-22.9Q8.7-28.2 12.1-33.0Q15.4-37.7 19.7-41.5Q23.9-45.3 28.5-47.5Q33.1-49.6 37.5-49.6L37.5-49.6Q39.5-49.6 41.3-49L41.3-49L42.8-56.5Q43.7-61 39.5-62.6L39.5-62.6L37.3-63.5L37.5-64.5L56.9-70.1L57.6-69.4L45.3-11.2Q45-9.6 44.9-8.6Q44.7-7.5 44.7-6.5L44.7-6.5Q44.7-4.4 46.4-4.4L46.4-4.4Q47.6-4.4 49.7-5.7Q51.7-6.9 53.8-9.4L53.8-9.4L54.9-8.4Q52.5-4.4 48.4-1.5Q44.3 1.5 39.7 1.5L39.7 1.5Q36.4 1.5 34.5-0.7Q32.6-2.8 32.6-6.2L32.6-6.2Q32.6-7.9 32.9-10.2L32.9-10.2Q28.8-5 24.0-1.8Q19.1 1.5 14.8 1.5ZM16.9-15.6L16.9-15.6Q16.9-10.6 18.5-8.4Q20.1-6.2 22.7-6.2L22.7-6.2Q27.3-6.2 33.3-13.2L33.3-13.2Q33.4-13.7 33.5-14.3L33.5-14.3L39.6-43.8Q37.1-46.1 33.7-46.1L33.7-46.1Q31.2-46.1 29.1-45.0Q26.9-43.8 25-41.7L25-41.7Q22.7-39.1 20.9-34.8Q19-30.4 17.9-25.4Q16.9-20.3 16.9-15.6Z"></path></g></g></svg>`;

const MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(MARK_REVERSED_SVG)}`;

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
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MARK_DATA_URI}
          alt=""
          width={140}
          height={140}
          style={{ position: "absolute", top: 80, right: 96 }}
        />
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
