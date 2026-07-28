import { describe, expect, it } from "vitest";
import { cleanCommitSubject, daysBetween, medianMs, toDuration } from "./compute";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

describe("medianMs", () => {
  it("returns null for an empty list", () => {
    expect(medianMs([])).toBeNull();
  });
  it("returns the middle value for odd counts", () => {
    expect(medianMs([5, 1, 3])).toBe(3);
  });
  it("averages the two middle values for even counts", () => {
    expect(medianMs([4, 1, 3, 2])).toBe(2.5);
  });
  it("does not mutate its input", () => {
    const input = [3, 1, 2];
    medianMs(input);
    expect(input).toEqual([3, 1, 2]);
  });
});

describe("toDuration", () => {
  it("renders under 48h in hours (spec 6.1 metric 3)", () => {
    expect(toDuration(11 * HOUR)).toEqual({ value: 11, unit: "hours" });
    expect(toDuration(47.4 * HOUR)).toEqual({ value: 47, unit: "hours" });
  });
  it("renders 48h and over in days", () => {
    expect(toDuration(48 * HOUR)).toEqual({ value: 2, unit: "days" });
    expect(toDuration(6 * DAY)).toEqual({ value: 6, unit: "days" });
  });
  it("rounds rather than truncates", () => {
    expect(toDuration(10.6 * HOUR)).toEqual({ value: 11, unit: "hours" });
    expect(toDuration(6.4 * DAY)).toEqual({ value: 6, unit: "days" });
  });
});

describe("cleanCommitSubject", () => {
  it("strips a KAN-nnn prefix with colon", () => {
    expect(cleanCommitSubject("KAN-123: ship the thing")).toBe("ship the thing");
  });
  it("strips a bare KAN-nnn prefix", () => {
    expect(cleanCommitSubject("KAN-7 ship the thing")).toBe("ship the thing");
  });
  it("strips dash separators", () => {
    expect(cleanCommitSubject("KAN-42 - ship the thing")).toBe("ship the thing");
  });
  it("keeps KAN references mid-subject", () => {
    expect(cleanCommitSubject("Revert KAN-9 hotfix")).toBe("Revert KAN-9 hotfix");
  });
  it("takes the first line only", () => {
    expect(cleanCommitSubject("KAN-115: capability controls\n\nLong body")).toBe(
      "capability controls",
    );
  });
  it("humanizes merge commits from the branch name", () => {
    expect(
      cleanCommitSubject(
        "Merge pull request #94 from productdetroit/feat/kan-117-feature-gating",
      ),
    ).toBe("Feature gating");
    expect(
      cleanCommitSubject(
        "Merge pull request #93 from productdetroit/feat/kan-115-capability-controls",
      ),
    ).toBe("Capability controls");
  });
  it("passes through ordinary subjects without a prefix", () => {
    expect(cleanCommitSubject("Ship the maple engine")).toBe(
      "Ship the maple engine",
    );
  });
});

describe("daysBetween", () => {
  it("computes whole days", () => {
    expect(
      daysBetween(new Date("2026-06-25T00:00:00-04:00"), new Date("2026-07-26T12:00:00-04:00")),
    ).toBe(31);
  });
  it("floors partial days", () => {
    expect(
      daysBetween(new Date("2026-06-25T00:00:00Z"), new Date("2026-06-25T23:00:00Z")),
    ).toBe(0);
  });
  it("never goes negative", () => {
    expect(
      daysBetween(new Date("2026-06-25T00:00:00Z"), new Date("2026-06-24T00:00:00Z")),
    ).toBe(0);
  });
});
