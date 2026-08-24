import { unstable_cache } from "next/cache";
import { aggregate, type Providers } from "./aggregate";
import { getJiraMetrics } from "./jira";
import { getSpecsWritten } from "./confluence";
import { getLinesOfCode, getPullRequestsMerged } from "./github";
import { getVercelMetrics } from "./vercel";
import { PRODUCTS, type ProductConfig } from "./products";
import type { PortfolioBuildLog } from "./types";

const REVALIDATE_SECONDS = 3600;

const PROVIDER_NAMES = [
  "jira",
  "confluence",
  "github",
  "github-loc",
  "vercel",
] as const;
type ProviderName = (typeof PROVIDER_NAMES)[number];

/** Cache tag for one provider on one product.
 *
 *  Per product AND per provider (spec §8.1): Jira failing for MotorAdvisor
 *  must never blank TopHand's register, and vice versa. One shared tag would
 *  couple two independent products' liveness together. */
export function cacheTag(product: ProductConfig["id"], p: ProviderName) {
  return `buildlog-${product}-${p}`;
}

/** Wrap a provider so each (product, provider) pair caches independently.
 *  Failures are not cached — unstable_cache only stores resolved values, so a
 *  fallback retries on the next request. */
function perProduct<T>(
  name: ProviderName,
  fn: (p: ProductConfig) => Promise<T>,
): (p: ProductConfig) => Promise<T> {
  const byProduct = new Map<string, () => Promise<T>>();
  for (const product of PRODUCTS) {
    const tag = cacheTag(product.id, name);
    byProduct.set(
      product.id,
      unstable_cache(() => fn(product), [tag], {
        tags: [tag],
        revalidate: REVALIDATE_SECONDS,
      }),
    );
  }
  return (product: ProductConfig) => {
    const cached = byProduct.get(product.id);
    if (!cached) throw new Error(`no cached provider for ${product.id}`);
    return cached();
  };
}

const cachedProviders: Providers = {
  jira: perProduct("jira", getJiraMetrics),
  confluence: perProduct("confluence", getSpecsWritten),
  github: perProduct("github", getPullRequestsMerged),
  githubLoc: perProduct("github-loc", getLinesOfCode),
  vercel: perProduct("vercel", getVercelMetrics),
};

export const BUILDLOG_CACHE_TAGS = PRODUCTS.flatMap((product) =>
  PROVIDER_NAMES.map((p) => cacheTag(product.id, p)),
);

/** The one entry point pages use (Server Components; spec 7.1). */
export function getBuildLog(): Promise<PortfolioBuildLog> {
  return aggregate(cachedProviders);
}

export type { BuildLog, PortfolioBuildLog, ProductBuildLog } from "./types";
