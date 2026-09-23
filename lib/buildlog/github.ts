import { fetchJson, LINE_COUNT_TIMEOUT_MS, requireEnv } from "./http";
import { ProviderError } from "./types";
import type { ProductConfig } from "./products";

/** Spec 6.2: merged PRs across every repository the product ships from.
 *
 *  TopHand ships from two. A single-repo query under-reports it — which is not
 *  hypothetical: KAN-123 shipped to production in tophand_website on 27 July
 *  and went unnoticed for three weeks precisely because the tooling only read
 *  the app repo.
 *
 *  The repos are private, and a token without repo read scope makes
 *  total_count silently 0, so 0 is treated as an error rather than a value
 *  (spec: never render 0). */
export async function getPullRequestsMerged(
  product: ProductConfig,
): Promise<number> {
  const token = requireEnv("github", "GITHUB_TOKEN");
  const repoQualifier = product.githubRepos.map((r) => `repo:${r}`).join(" ");
  const query = encodeURIComponent(`${repoQualifier} is:pr is:merged`);

  const data = await fetchJson<{ total_count?: number }>(
    "github",
    `https://api.github.com/search/issues?q=${query}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  const count = data.total_count ?? 0;
  if (count === 0) {
    throw new ProviderError(
      "github",
      `total_count is 0 for ${product.githubRepos.join(", ")} — likely a token without repo read scope`,
    );
  }
  return count;
}

/** One window of a repo's merged PRs, carrying only the fields asked for. */
type PullRequestWindow = {
  pageInfo?: { hasNextPage: boolean; endCursor: string | null };
  nodes?: Array<{ additions: number; deletions: number }>;
};

type PullRequestPage = {
  data?: { repository?: { pullRequests?: PullRequestWindow } };
  errors?: Array<{ message?: string }>;
};

/** The 100 merged PRs after `cursor`, selecting `fields` from the connection. */
async function mergedWindow(
  repo: string,
  token: string,
  cursor: string | null,
  fields: string,
): Promise<PullRequestWindow> {
  const [owner, name] = repo.split("/");
  const query = `query($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      pullRequests(states: MERGED, first: 100, after: $cursor) { ${fields} }
    }
  }`;
  const body: PullRequestPage = await fetchJson(
    "github",
    "https://api.github.com/graphql",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { owner, name, cursor } }),
    },
    LINE_COUNT_TIMEOUT_MS,
  );
  const prs = body.data?.repository?.pullRequests;
  if (!prs) {
    const reason = body.errors?.[0]?.message ?? "no repository in response";
    throw new ProviderError("github", `${reason} (${repo})`);
  }
  return prs;
}

/** Net lines merged into one repo across all of its merged PRs.
 *
 *  GraphQL rather than the REST stats endpoints deliberately: code_frequency
 *  computes lazily and can answer 202 indefinitely (observed on motor for
 *  minutes at a stretch), which on a 3-second budget means a stat frozen on
 *  its snapshot. PR diffs are exact, always available, and measure the same
 *  thing the register already claims — everything ships through a reviewed
 *  pull request.
 *
 *  The diffstats are the expensive part — GitHub computes them per PR, 2–3s
 *  for a window of 100 — while walking the cursors alone takes ~0.3s a window.
 *  So the walk runs ahead and each window's diffstats are fetched the moment
 *  its cursor is known, all in parallel. The whole read then costs one window
 *  plus 0.3s per extra window, instead of 2–3s per window in sequence, and the
 *  line count's budget keeps holding as the repos grow. */
async function netLinesMerged(repo: string, token: string): Promise<number> {
  const windows: Promise<number>[] = [];
  let cursor: string | null = null;
  // 100 PRs per window; the ceiling is a runaway guard, not an expected limit.
  for (let page = 0; page < 20; page++) {
    const window = mergedWindow(
      repo,
      token,
      cursor,
      "nodes { additions deletions }",
    ).then(({ nodes }) => {
      if (!nodes) throw new ProviderError("github", `no PRs in window (${repo})`);
      return nodes.reduce((n, pr) => n + pr.additions - pr.deletions, 0);
    });
    // Promise.all below observes every window; this only stops a window that
    // fails while the walk is still running from surfacing as unhandled.
    window.catch(() => {});
    windows.push(window);

    const { pageInfo } = await mergedWindow(
      repo,
      token,
      cursor,
      "pageInfo { hasNextPage endCursor }",
    );
    if (!pageInfo) throw new ProviderError("github", `no pageInfo (${repo})`);
    if (!pageInfo.hasNextPage) {
      const nets = await Promise.all(windows);
      return nets.reduce((n, lines) => n + lines, 0);
    }
    cursor = pageInfo.endCursor;
  }
  throw new ProviderError("github", `pagination never terminated (${repo})`);
}

/** Net lines across every repository the product ships from: additions minus
 *  deletions over all merged pull requests, summed over repos for the same
 *  reason the PR count is — a single-repo read under-reports TopHand.
 *  0 is treated as an error, not a value (spec: never render 0). */
export async function getLinesOfCode(product: ProductConfig): Promise<number> {
  const token = requireEnv("github", "GITHUB_TOKEN");
  const perRepo = await Promise.all(
    product.githubRepos.map((repo) => netLinesMerged(repo, token)),
  );
  const net = perRepo.reduce((n, lines) => n + lines, 0);
  if (net <= 0) {
    throw new ProviderError(
      "github",
      `merged PRs net ${net} lines for ${product.githubRepos.join(", ")}`,
    );
  }
  return net;
}
