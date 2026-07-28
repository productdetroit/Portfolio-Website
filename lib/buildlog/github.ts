import { fetchJson, requireEnv } from "./http";
import { ProviderError } from "./types";

/** Spec 6.2: merged PRs in productdetroit/app.tophand.ag only. The repo is
 *  private — a token without repo read scope makes total_count silently 0,
 *  so 0 is treated as an error rather than a value (spec: never render 0). */
export async function getPullRequestsMerged(): Promise<number> {
  const token = requireEnv("github", "GITHUB_TOKEN");
  const query = encodeURIComponent(
    "repo:productdetroit/app.tophand.ag is:pr is:merged",
  );
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
      "total_count is 0 — likely a token without repo read scope on the private repo",
    );
  }
  return count;
}
