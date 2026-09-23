import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLinesOfCode } from "./github";
import { LINE_COUNT_TIMEOUT_MS } from "./http";
import { productById } from "./products";

type Diffstat = { additions: number; deletions: number };

/** A fake GraphQL endpoint: `repo` → its merged PRs, served 100 to a window.
 *  Cursors are window offsets. Diffstat requests are held until `release()`
 *  so a test can see which windows were requested before any of them answered. */
function fakeGitHub(repos: Record<string, Diffstat[]>) {
  const held: Array<() => void> = [];
  const diffstatCursors: Array<string | null> = [];
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const { query, variables } = JSON.parse(String(init.body));
    const prs = repos[`${variables.owner}/${variables.name}`];
    const start = variables.cursor === null ? 0 : Number(variables.cursor);
    const window = prs.slice(start, start + 100);
    const end = start + window.length;
    const connection = query.includes("additions")
      ? { nodes: window }
      : {
          pageInfo: {
            hasNextPage: end < prs.length,
            endCursor: String(end),
          },
        };
    const response = new Response(
      JSON.stringify({ data: { repository: { pullRequests: connection } } }),
    );
    if (!query.includes("additions")) return response;
    diffstatCursors.push(variables.cursor);
    await new Promise<void>((resolve) => held.push(resolve));
    return response;
  });
  return {
    fetch,
    diffstatCursors,
    release: () => held.splice(0).forEach((resolve) => resolve()),
  };
}

const prs = (n: number, net: number): Diffstat[] =>
  Array.from({ length: n }, () => ({ additions: net + 1, deletions: 1 }));

describe("getLinesOfCode", () => {
  beforeEach(() => vi.stubEnv("GITHUB_TOKEN", "test-token"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sums net lines over every window of every repo", async () => {
    const gh = fakeGitHub({
      "productdetroit/app.tophand.ag": prs(238, 10),
      "productdetroit/tophand_website": prs(9, 100),
    });
    vi.stubGlobal("fetch", gh.fetch);
    const pending = getLinesOfCode(productById("tophand"));
    await vi.waitFor(() => expect(gh.diffstatCursors).toHaveLength(4));
    gh.release();
    expect(await pending).toBe(238 * 10 + 9 * 100);
  });

  it("requests every window's diffstats before any of them answers", async () => {
    // Diffstats cost GitHub 2–3s a window; fetched one after another they
    // outran the budget. Only the cheap cursor walk may be sequential.
    const gh = fakeGitHub({ "productdetroit/motor": prs(333, 1) });
    vi.stubGlobal("fetch", gh.fetch);
    const pending = getLinesOfCode(productById("motoradvisor"));
    await vi.waitFor(() =>
      expect(gh.diffstatCursors).toEqual([null, "100", "200", "300"]),
    );
    gh.release();
    expect(await pending).toBe(333);
  });

  it("gives each request the line count's budget, not the default 3s", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    const gh = fakeGitHub({ "productdetroit/motor": prs(5, 1) });
    vi.stubGlobal("fetch", gh.fetch);
    const pending = getLinesOfCode(productById("motoradvisor"));
    await vi.waitFor(() => expect(gh.diffstatCursors).toHaveLength(1));
    gh.release();
    await pending;
    expect(timeout).toHaveBeenCalled();
    for (const [ms] of timeout.mock.calls) expect(ms).toBe(LINE_COUNT_TIMEOUT_MS);
  });

  it("fails rather than render a partial count when one window fails", async () => {
    const gh = fakeGitHub({ "productdetroit/motor": prs(150, 1) });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        const { query, variables } = JSON.parse(String(init.body));
        if (query.includes("additions") && variables.cursor === "100") {
          return new Response("", { status: 502 });
        }
        const res = gh.fetch(url, init);
        gh.release();
        return res;
      }),
    );
    await expect(getLinesOfCode(productById("motoradvisor"))).rejects.toThrow(
      /HTTP 502/,
    );
  });
});
