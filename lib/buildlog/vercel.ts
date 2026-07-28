import { fetchJson, requireEnv } from "./http";
import { cleanCommitSubject } from "./compute";
import type { VercelMetrics } from "./types";

/** app.tophand.ag — the TopHand product project, not this portfolio site. */
const PROJECT_ID = "prj_BSzl67wnbyvpvORNXZLZvMTKxFO0";
const TEAM_ID = "team_QPNvbUaSuTv0tNOvAo4Tt7Xg";

type Deployment = {
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

/** Spec 6.2: production deploy count plus the newest deploy's commit subject.
 *  Filters on target/state client-side in case v6 ignores the params. */
export async function getVercelMetrics(): Promise<VercelMetrics> {
  const token = requireEnv("vercel", "VERCEL_TOKEN");
  const headers = { Authorization: `Bearer ${token}` };
  const base =
    `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}` +
    `&teamId=${TEAM_ID}&target=production&state=READY&limit=100`;

  const production: Deployment[] = [];
  let until: number | null | undefined;

  for (let page = 0; page < 10; page++) {
    const url = until ? `${base}&until=${until}` : base;
    const data = await fetchJson<DeploymentsPage>("vercel", url, { headers });
    for (const d of data.deployments ?? []) {
      const ready = (d.state ?? d.readyState) === "READY";
      if (d.target === "production" && ready) production.push(d);
    }
    until = data.pagination?.next;
    if (!until) break;
  }

  const newest = production.reduce<Deployment | null>((best, d) => {
    const at = d.created ?? d.createdAt ?? 0;
    const bestAt = best ? (best.created ?? best.createdAt ?? 0) : -1;
    return at > bestAt ? d : best;
  }, null);

  return {
    productionDeploys: production.length,
    lastShipped: newest
      ? {
          subject: cleanCommitSubject(
            newest.meta?.githubCommitMessage ?? "Production deploy",
          ),
          at: new Date(newest.created ?? newest.createdAt ?? 0).toISOString(),
        }
      : null,
  };
}
