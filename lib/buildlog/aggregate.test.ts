import { describe, expect, it, vi } from "vitest";
import {
  aggregate,
  aggregateProduct,
  calendarDaysAgo,
  daysBuilding,
  type Providers,
} from "./aggregate";
import { snapshotFor } from "./snapshot";
import { PRODUCTS, productById } from "./products";
import type { JiraMetrics, VercelMetrics } from "./types";

const jiraLive: JiraMetrics = {
  backlogItems: 168,
  featuresLive: 72,
  cycleTime: { value: 12, unit: "hours" },
  specToShipped: { value: 6, unit: "days" },
  epics: { done: 7, total: 24 },
};

const vercelLive: VercelMetrics = {
  productionDeploys: 112,
  lastShipped: { subject: "capability controls", at: "2026-07-27T12:00:00Z" },
};

const NOW = new Date("2026-08-17T16:00:00Z");
const tophand = productById("tophand");
const motoradvisor = productById("motoradvisor");

function liveProviders(overrides: Partial<Providers> = {}): Providers {
  return {
    jira: async () => jiraLive,
    confluence: async () => 19,
    github: async () => 93,
    githubLoc: async () => 42_000,
    vercel: async () => vercelLive,
    ...overrides,
  };
}

describe("aggregateProduct", () => {
  it("returns a fully live payload for one product (AC 1)", async () => {
    const log = await aggregateProduct(tophand, liveProviders(), NOW);
    expect(log.stale).toBe(false);
    expect(log.asOf).toBe(NOW.toISOString());
    expect(log.productId).toBe("tophand");
    expect(log.productName).toBe("TopHand");
    expect(log.featuresLive).toBe(72);
    expect(log.specsWritten).toBe(19);
    expect(log.pullRequests).toBe(93);
    expect(log.linesOfCode).toBe(42_000);
    expect(log.productionDeploys).toBe(112);
    expect(log.lastShipped).toEqual({
      subject: "capability controls",
      at: "2026-07-27T12:00:00Z",
      daysAgo: 21,
    });
  });

  it("falls back to that product's own snapshot per provider (AC 2)", async () => {
    const snap = snapshotFor("motoradvisor");
    const log = await aggregateProduct(
      motoradvisor,
      liveProviders({
        jira: async () => {
          throw new Error("jira down");
        },
      }),
      NOW,
    );
    expect(log.stale).toBe(true);
    // Jira values come from MotorAdvisor's snapshot, not TopHand's.
    expect(log.featuresLive).toBe(snap.featuresLive);
    expect(log.backlogItems).toBe(snap.backlogItems);
    // The providers that answered are still live.
    expect(log.specsWritten).toBe(19);
    expect(log.pullRequests).toBe(93);
  });

  it("keeps the PR count live when only the LOC stats endpoint fails", async () => {
    // The two GitHub reads are separate provider slots precisely so a slow
    // code_frequency computation can't drag the PR count down to snapshot.
    const log = await aggregateProduct(
      tophand,
      liveProviders({
        githubLoc: async () => {
          throw new Error("stats still computing");
        },
      }),
      NOW,
    );
    expect(log.stale).toBe(true);
    expect(log.pullRequests).toBe(93);
    expect(log.linesOfCode).toBe(snapshotFor("tophand").linesOfCode);
  });

  it("dates each product from its own start date", async () => {
    const th = await aggregateProduct(tophand, liveProviders(), NOW);
    const ma = await aggregateProduct(motoradvisor, liveProviders(), NOW);
    expect(th.startDate).toBe("2026-06-25");
    expect(ma.startDate).toBe("2026-08-09");
    // TopHand is the older product and must read as such.
    expect(th.daysBuilding).toBeGreaterThan(ma.daysBuilding);
    expect(ma.daysBuilding).toBe(daysBuilding(NOW, "2026-08-09"));
  });

  it("carries the median caveat only where the medians are untrustworthy", async () => {
    const th = await aggregateProduct(tophand, liveProviders(), NOW);
    const ma = await aggregateProduct(motoradvisor, liveProviders(), NOW);
    expect(th.medianCaveat).toBeUndefined();
    // Spec §7: a 106-issue reconciliation stamped one resolutiondate on all of
    // them, so MotorAdvisor's medians measure the cleanup.
    expect(ma.medianCaveat).toMatch(/reconciled/i);
  });
});

describe("aggregate (portfolio)", () => {
  it("returns one register per configured product", async () => {
    const log = await aggregate(liveProviders(), NOW);
    expect(log.products).toHaveLength(PRODUCTS.length);
    expect(log.products.map((p) => p.productId)).toEqual(
      PRODUCTS.map((p) => p.id),
    );
  });

  it("sums the additive metrics", async () => {
    const log = await aggregate(liveProviders(), NOW);
    const n = PRODUCTS.length;
    expect(log.totals.featuresLive).toBe(72 * n);
    expect(log.totals.specsWritten).toBe(19 * n);
    expect(log.totals.pullRequests).toBe(93 * n);
    expect(log.totals.linesOfCode).toBe(42_000 * n);
    expect(log.totals.productionDeploys).toBe(112 * n);
    expect(log.totals.epics).toEqual({ done: 7 * n, total: 24 * n });
  });

  it("never exposes a pooled median or summed elapsed time", async () => {
    const log = await aggregate(liveProviders(), NOW);
    // A median of medians is not a median of anything, so the totals object
    // must not carry one at all — this is the guard against someone adding it.
    expect(log.totals).not.toHaveProperty("cycleTime");
    expect(log.totals).not.toHaveProperty("specToShipped");
    expect(log.totals).not.toHaveProperty("daysBuilding");
    // Portfolio elapsed time is a SPAN from the earliest product, never a sum.
    const summed = log.products.reduce((n, p) => n + p.daysBuilding, 0);
    expect(log.daysBuilding).toBeLessThan(summed);
    expect(log.daysBuilding).toBe(daysBuilding(NOW, "2026-06-25"));
  });

  it("reports the most recent ship across all products", async () => {
    const log = await aggregate(
      liveProviders({
        vercel: async (p) => ({
          productionDeploys: 10,
          lastShipped: {
            subject: p.id,
            at:
              p.id === "motoradvisor"
                ? "2026-08-16T12:00:00Z"
                : "2026-08-10T12:00:00Z",
          },
        }),
      }),
      NOW,
    );
    expect(log.lastShipped?.subject).toBe("motoradvisor");
  });

  it("is stale when any product has any failing provider", async () => {
    const log = await aggregate(
      liveProviders({
        github: async (p) => {
          if (p.id === "motoradvisor") throw new Error("no repo access");
          return 93;
        },
      }),
      NOW,
    );
    expect(log.stale).toBe(true);
    expect(log.products.find((p) => p.productId === "tophand")?.stale).toBe(
      false,
    );
    expect(
      log.products.find((p) => p.productId === "motoradvisor")?.stale,
    ).toBe(true);
  });
});

describe("daysBuilding", () => {
  it("counts whole calendar days from the given start", () => {
    expect(daysBuilding(new Date("2026-06-25T05:00:00Z"), "2026-06-25")).toBe(0);
    expect(daysBuilding(new Date("2026-07-05T05:00:00Z"), "2026-06-25")).toBe(
      10,
    );
  });
});

describe("calendarDaysAgo", () => {
  it("counts Detroit calendar days, not 24-hour buckets", () => {
    // 10:19 AM yesterday must read as 1 day ago the next morning, not 0.
    expect(
      calendarDaysAgo("2026-08-16T14:19:00Z", new Date("2026-08-17T13:00:00Z")),
    ).toBe(1);
  });
});

describe("provider timeouts", () => {
  it("falls back when a provider exceeds the budget", async () => {
    vi.useFakeTimers();
    const slow = aggregateProduct(
      tophand,
      liveProviders({
        confluence: () => new Promise<number>(() => {}),
      }),
      NOW,
      50,
    );
    await vi.advanceTimersByTimeAsync(60);
    const log = await slow;
    vi.useRealTimers();
    expect(log.stale).toBe(true);
    expect(log.specsWritten).toBe(snapshotFor("tophand").specsWritten);
  });
});
