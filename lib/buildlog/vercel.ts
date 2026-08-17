import { snapshotFor } from "./snapshot";
import { fetchJson, requireEnv } from "./http";
import { cleanCommitSubject } from "./compute";
import { TEAM_ID, type ProductConfig } from "./products";
import type { VercelMetrics } from "./types";

export type Deployment = {
  created?: number;
  createdAt?: number;
  state?: string;
  readyState?: string;
  target?: string | null;
  meta?: { githubCommitMessage?: string };
};

type DeploymentsPage = {
  deployments?: Deployment[];
  pagination?: { next?: number | null };
};

/** Vercel prunes old deployments out of /v6/deployments, so the raw list
 *  length decays (128 on Aug 5 → 122 on Aug 6 with nothing shipped in
 *  between). The count rendered on /building is instead the committed
 *  baseline plus deploys created after it — see countProductionDeploys.
 *  To refresh a baseline: set `count` in snapshot.json for that product to the
 *  number currently rendered on /building and `capturedAt` to now. Do this
 *  every month or two, before pruning reaches deploys newer than `capturedAt`.
 *
 *  The same pruning is why product start dates are pinned constants rather
 *  than derived from the first production deploy — see products.ts. */
export function baselineFor(product: ProductConfig) {
  return snapshotFor(product.id).deploysBaseline;
}

/** Baseline count plus READY production deploys created strictly after the
 *  baseline capture. Never returns less than the baseline, so pruning can
 *  empty the fetched list entirely without the count decaying. */
export function countProductionDeploys(
  production: Deployment[],
  baseline: { count: number; capturedAt: string },
): number {
  const since = Date.parse(baseline.capturedAt);
  const newer = production.filter(
    (d) => (d.created ?? d.createdAt ?? 0) > since,
  ).length;
  return baseline.count + newer;
}

/** Every READY production deployment for one Vercel project. */
async function fetchProjectDeploys(
  projectId: string,
  headers: Record<string, string>,
): Promise<Deployment[]> {
  const base =
    `https://api.vercel.com/v6/deployments?projectId=${projectId}` +
    `&teamId=${TEAM_ID}&target=production&state=READY&limit=100`;

  const out: Deployment[] = [];
  let until: number | null | undefined;

  for (let page = 0; page < 10; page++) {
    const url = until ? `${base}&until=${until}` : base;
    const data = await fetchJson<DeploymentsPage>("vercel", url, { headers });
    for (const d of data.deployments ?? []) {
      const ready = (d.state ?? d.readyState) === "READY";
      if (d.target === "production" && ready) out.push(d);
    }
    until = data.pagination?.next;
    if (!until) break;
  }
  return out;
}

/** Spec 6.2: production deploy count plus the newest deploy's commit subject,
 *  summed across every Vercel project the product deploys to.
 *
 *  MotorAdvisor has three surfaces (web app, MCP server, Editorial Studio) and
 *  TopHand has two (app, marketing site). All of them are the product shipping,
 *  so all of them count. Filters on target/state client-side in case v6
 *  ignores the params. */
export async function getVercelMetrics(
  product: ProductConfig,
): Promise<VercelMetrics> {
  const token = requireEnv("vercel", "VERCEL_TOKEN");
  const headers = { Authorization: `Bearer ${token}` };

  const perProject = await Promise.all(
    product.vercelProjectIds.map((id) => fetchProjectDeploys(id, headers)),
  );
  const production = perProject.flat();

  const newest = production.reduce<Deployment | null>((best, d) => {
    const at = d.created ?? d.createdAt ?? 0;
    const bestAt = best ? (best.created ?? best.createdAt ?? 0) : -1;
    return at > bestAt ? d : best;
  }, null);

  return {
    productionDeploys: countProductionDeploys(production, baselineFor(product)),
    lastShipped: newest
      ? {
          subject: cleanCommitSubject(
            newest.meta?.githubCommitMessage ?? "Production deploy",
            product.ticketPrefix,
          ),
          at: new Date(newest.created ?? newest.createdAt ?? 0).toISOString(),
        }
      : null,
  };
}
