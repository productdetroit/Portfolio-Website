import { describe, expect, it } from "vitest";
import {
  countProductionDeploys,
  deploysBaseline,
  type Deployment,
} from "./vercel";

const baseline = { count: 128, capturedAt: "2026-08-06T00:00:00.000Z" };
const T0 = Date.parse(baseline.capturedAt);
const DAY = 86_400_000;

function deploy(created: number): Deployment {
  return { created, target: "production", state: "READY" };
}

describe("countProductionDeploys", () => {
  it("adds deploys created after the baseline capture", () => {
    const production = [deploy(T0 + DAY), deploy(T0 + 2 * DAY), deploy(T0 + 3 * DAY)];
    expect(countProductionDeploys(production, baseline)).toBe(131);
  });

  it("ignores deploys at or before the baseline — they are already in the count", () => {
    const production = [deploy(T0 - 5 * DAY), deploy(T0), deploy(T0 + DAY)];
    expect(countProductionDeploys(production, baseline)).toBe(129);
  });

  it("never decays: a fully pruned list still returns the baseline", () => {
    expect(countProductionDeploys([], baseline)).toBe(128);
  });

  it("holds the baseline when pruning shrinks the pre-baseline tail", () => {
    // Vercel pruned the raw list from 128 to 122 with nothing shipped in
    // between — only pre-baseline survivors remain, so the count is stable.
    const survivors = Array.from({ length: 122 }, (_, i) => deploy(T0 - (i + 1) * DAY));
    expect(countProductionDeploys(survivors, baseline)).toBe(128);
  });

  it("reads createdAt when created is absent", () => {
    const production: Deployment[] = [
      { createdAt: T0 + DAY, target: "production", state: "READY" },
    ];
    expect(countProductionDeploys(production, baseline)).toBe(129);
  });

  it("defaults to the committed snapshot baseline", () => {
    expect(countProductionDeploys([])).toBe(deploysBaseline.count);
    expect(countProductionDeploys([deploy(Date.parse(deploysBaseline.capturedAt) + DAY)]))
      .toBe(deploysBaseline.count + 1);
  });
});
