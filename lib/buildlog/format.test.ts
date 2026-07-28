import { describe, expect, it } from "vitest";
import { asOfLine, isQuiet, shippedStamp } from "./format";

describe("shippedStamp", () => {
  it("renders same-day deploys with an ET time (spec 6.2)", () => {
    // 18:27 UTC = 2:27 PM ET in July (UTC-4)
    expect(
      shippedStamp({ subject: "x", at: "2026-07-28T18:27:00Z", daysAgo: 0 }),
    ).toBe("today · 2:27 PM ET");
  });
  it("renders yesterday and day counts", () => {
    expect(shippedStamp({ subject: "x", at: "2026-07-27T12:00:00Z", daysAgo: 1 })).toBe("yesterday");
    expect(shippedStamp({ subject: "x", at: "2026-07-20T12:00:00Z", daysAgo: 8 })).toBe("8 days ago");
  });
  it("relabels past 21 days to month and year only (spec 6.3)", () => {
    expect(
      shippedStamp({ subject: "x", at: "2026-06-05T12:00:00Z", daysAgo: 53 }),
    ).toBe("June 2026");
  });
});

describe("isQuiet", () => {
  it("flips only past 21 days", () => {
    expect(isQuiet({ subject: "x", at: "", daysAgo: 21 })).toBe(false);
    expect(isQuiet({ subject: "x", at: "", daysAgo: 22 })).toBe(true);
    expect(isQuiet(null)).toBe(false);
  });
});

describe("asOfLine", () => {
  it("uses a dated stamp for a non-today asOf (all-snapshot fallback)", () => {
    expect(asOfLine({ asOf: "2026-07-01T12:00:00Z", stale: true })).toContain(
      "as of July 1, 2026",
    );
  });
  it("uses an updated-time stamp for a same-day asOf", () => {
    expect(asOfLine({ asOf: new Date().toISOString(), stale: false })).toMatch(
      /updated \d{1,2}:\d{2} (AM|PM) ET$/,
    );
  });
});
