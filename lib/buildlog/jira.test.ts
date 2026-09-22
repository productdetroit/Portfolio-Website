import { describe, expect, it } from "vitest";
import { metricsFromIssues, type JiraIssue } from "./jira";

const DAY = 86_400_000;
const CREATED = "2026-09-01T00:00:00.000Z";

function issue(
  type: string,
  opts: { done?: boolean; resolvedAfterDays?: number } = {},
): JiraIssue {
  const { done = false, resolvedAfterDays } = opts;
  return {
    fields: {
      issuetype: { name: type },
      status: done
        ? { name: "Done", statusCategory: { key: "done" } }
        : { name: "To Do", statusCategory: { key: "new" } },
      created: CREATED,
      resolutiondate:
        resolvedAfterDays === undefined
          ? null
          : new Date(Date.parse(CREATED) + resolvedAfterDays * DAY).toISOString(),
    },
  };
}

describe("metricsFromIssues", () => {
  it("counts Stories and Tasks marked Done, and neither Epics nor Bugs", () => {
    const issues = [
      issue("Story", { done: true, resolvedAfterDays: 1 }),
      issue("Task", { done: true, resolvedAfterDays: 1 }),
      issue("Story"),
      issue("Bug", { done: true, resolvedAfterDays: 1 }),
      issue("Epic", { done: true, resolvedAfterDays: 4 }),
    ];
    const m = metricsFromIssues(issues, "TEST");
    expect(m.featuresLive).toBe(2);
    expect(m.backlogItems).toBe(5);
    expect(m.epics).toEqual({ done: 1, total: 1 });
  });

  /* The Book Events case, 22 Sep 2026: 165 issues, 65 delivered, 25 epics and
     not one of them closed. Before this, the missing epic median threw and
     took every honest count down to the committed snapshot with it. */
  it("reports an uncomputable median as zero rather than failing the product", () => {
    const issues = [
      issue("Story", { done: true, resolvedAfterDays: 1 }),
      issue("Story", { done: true, resolvedAfterDays: 1 }),
      issue("Epic"),
      issue("Epic"),
    ];
    const m = metricsFromIssues(issues, "TEST");

    expect(m.specToShipped.value).toBe(0); // no resolved epic to measure
    expect(m.cycleTime.value).toBeGreaterThan(0); // stories still measured
    expect(m.featuresLive).toBe(2);
    expect(m.epics).toEqual({ done: 0, total: 2 });
  });

  it("reports both medians as zero when nothing at all has resolved", () => {
    const m = metricsFromIssues([issue("Story"), issue("Epic")], "TEST");
    expect(m.cycleTime.value).toBe(0);
    expect(m.specToShipped.value).toBe(0);
  });

  /* Still an error, and deliberately: an empty result set means the search
     failed or the project key is wrong, not that the product shipped nothing.
     Falling back to the snapshot is the right answer there. */
  it("throws on an empty result set", () => {
    expect(() => metricsFromIssues([], "TEST")).toThrow(/no issues for TEST/);
  });
});
