import { describe, expect, it, vi } from "vitest";
import {
  aggregate,
  calendarDaysAgo,
  daysBuilding,
  snapshot,
  type Providers,
} from "./aggregate";
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

const NOW = new Date("2026-07-28T16:00:00Z");

function liveProviders(overrides: Partial<Providers> = {}): Providers {
  return {
    jira: async () => jiraLive,
    confluence: async () => 19,
    github: async () => 93,
    vercel: async () => vercelLive,
    ...overrides,
  };
}

describe("aggregate", () => {
  it("returns a fully live payload (AC 1)", async () => {
    const log = await aggregate(liveProviders(), NOW);
    expect(log.stale).toBe(false);
    expect(log.asOf).toBe(NOW.toISOString());
    expect(log.featuresLive).toBe(72);
    expect(log.specsWritten).toBe(19);
    expect(log.pullRequests).toBe(93);
    expect(log.productionDeploys).toBe(112);
    expect(log.lastShipped).toEqual({
      subject: "capability controls",
      at: "2026-07-27T12:00:00Z",
      daysAgo: 1,
    });
  });

  it("falls back to snapshot for one failing provider, others stay live (AC 2)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const log = await aggregate(
      liveProviders({ github: async () => Promise.reject(new Error("401")) }),
      NOW,
    );
    expect(log.stale).toBe(true);
    expect(log.pullRequests).toBe(snapshot.pullRequests);
    expect(log.featuresLive).toBe(72);
    expect(log.productionDeploys).toBe(112);
    expect(log.asOf).toBe(NOW.toISOString());
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("returns the full snapshot with its capturedAt when all fail (AC 3)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = async () => Promise.reject(new Error("down"));
    const log = await aggregate(
      { jira: boom, confluence: boom, github: boom, vercel: boom },
      NOW,
    );
    expect(log.stale).toBe(true);
    expect(log.asOf).toBe(snapshot.capturedAt);
    expect(log.featuresLive).toBe(snapshot.featuresLive);
    expect(log.specsWritten).toBe(snapshot.specsWritten);
    expect(log.pullRequests).toBe(snapshot.pullRequests);
    expect(log.productionDeploys).toBe(snapshot.deploysBaseline.count);
    expect(log.lastShipped?.subject).toBe(snapshot.lastShipped?.subject);
    spy.mockRestore();
  });

  it("cuts off a hanging provider at the timeout (AC 4)", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const hang = () => new Promise<never>(() => {});
    const started = Date.now();
    const log = await aggregate(
      liveProviders({ jira: hang as Providers["jira"] }),
      NOW,
      200,
    );
    expect(Date.now() - started).toBeLessThan(1500);
    expect(log.stale).toBe(true);
    expect(log.featuresLive).toBe(snapshot.featuresLive);
    expect(log.pullRequests).toBe(93);
    spy.mockRestore();
  });
});

describe("calendarDaysAgo", () => {
  it("counts Detroit calendar days, so a yesterday-morning ship is not 'today'", () => {
    // Shipped Wed Aug 5, 10:19 AM ET; viewed Thu Aug 6, 8:21 AM ET. Only
    // ~22h elapsed, but it's the previous calendar day — daysAgo must be 1
    // (the old elapsed/24h floor said 0 and rendered "today · 10:19 AM ET",
    // a time in the viewer's future).
    expect(
      calendarDaysAgo("2026-08-05T14:19:50.420Z", new Date("2026-08-06T12:21:00Z")),
    ).toBe(1);
  });

  it("stays 0 for the whole Detroit day of the ship", () => {
    expect(
      calendarDaysAgo("2026-08-05T14:19:50.420Z", new Date("2026-08-05T23:00:00Z")),
    ).toBe(0);
  });

  it("ticks at Detroit midnight, not UTC midnight", () => {
    // 03:30 UTC Jul 28 is still 11:30 PM Jul 27 in Detroit (UTC-4), so by
    // Jul 28 noon Detroit the ship is one calendar day old.
    expect(
      calendarDaysAgo("2026-07-28T03:30:00Z", new Date("2026-07-28T16:00:00Z")),
    ).toBe(1);
  });

  it("never goes negative on clock skew", () => {
    expect(
      calendarDaysAgo("2026-08-07T00:00:00Z", new Date("2026-08-06T12:00:00Z")),
    ).toBe(0);
  });
});

describe("daysBuilding (AC 5)", () => {
  it("matches the spec baseline: July 26 is day 31", () => {
    expect(daysBuilding(new Date("2026-07-26T12:00:00-04:00"))).toBe(31);
  });

  it("increments at the Detroit midnight boundary, not UTC", () => {
    // 03:59 UTC on Jul 29 is still 23:59 Jul 28 in Detroit (UTC-4)…
    expect(daysBuilding(new Date("2026-07-29T03:59:00Z"))).toBe(33);
    // …and 04:00 UTC is 00:00 Jul 29 in Detroit — the day ticks over.
    expect(daysBuilding(new Date("2026-07-29T04:00:00Z"))).toBe(34);
  });
});
