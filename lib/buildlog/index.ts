import { unstable_cache } from "next/cache";
import { aggregate, type Providers } from "./aggregate";
import { getJiraMetrics } from "./jira";
import { getSpecsWritten } from "./confluence";
import { getPullRequestsMerged } from "./github";
import { getVercelMetrics } from "./vercel";
import type { BuildLog } from "./types";

const REVALIDATE_SECONDS = 3600;

/** Each provider carries its own cache tag so one failure never invalidates
 *  the others (spec 7.4). Failures are not cached — unstable_cache only
 *  stores resolved values, so a fallback retries on the next request. */
const cachedProviders: Providers = {
  jira: unstable_cache(getJiraMetrics, ["buildlog-jira"], {
    tags: ["buildlog-jira"],
    revalidate: REVALIDATE_SECONDS,
  }),
  confluence: unstable_cache(getSpecsWritten, ["buildlog-confluence"], {
    tags: ["buildlog-confluence"],
    revalidate: REVALIDATE_SECONDS,
  }),
  github: unstable_cache(getPullRequestsMerged, ["buildlog-github"], {
    tags: ["buildlog-github"],
    revalidate: REVALIDATE_SECONDS,
  }),
  vercel: unstable_cache(getVercelMetrics, ["buildlog-vercel"], {
    tags: ["buildlog-vercel"],
    revalidate: REVALIDATE_SECONDS,
  }),
};

export const BUILDLOG_CACHE_TAGS = [
  "buildlog-jira",
  "buildlog-confluence",
  "buildlog-github",
  "buildlog-vercel",
] as const;

/** The one entry point pages use (Server Components; spec 7.1). */
export function getBuildLog(): Promise<BuildLog> {
  return aggregate(cachedProviders);
}

export type { BuildLog } from "./types";
