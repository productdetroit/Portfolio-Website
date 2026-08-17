import { fetchJson, requireEnv } from "./http";
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
