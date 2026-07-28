/** Payload contract from the /building spec (section 7.2). Design and the
 *  aggregator both depend on this exact shape. */
export type Duration = { value: number; unit: "hours" | "days" };

export type BuildLog = {
  asOf: string; // ISO 8601
  stale: boolean; // true when any provider fell back
  daysBuilding: number;
  featuresLive: number;
  cycleTime: Duration;
  specToShipped: Duration;
  specsWritten: number;
  epics: { done: number; total: number };
  pullRequests: number;
  productionDeploys: number;
  lastShipped: {
    subject: string;
    at: string; // ISO 8601
    daysAgo: number; // drives the 21-day relabel
  } | null;
};

/** What lib/buildlog/jira.ts returns — four metrics from one result set. */
export type JiraMetrics = {
  featuresLive: number;
  cycleTime: Duration;
  specToShipped: Duration;
  epics: { done: number; total: number };
};

export type VercelMetrics = {
  productionDeploys: number;
  lastShipped: { subject: string; at: string } | null;
};

/** Providers throw this instead of returning partial data (PDW-4 AC 2). */
export class ProviderError extends Error {
  readonly provider: "jira" | "confluence" | "github" | "vercel";
  constructor(
    provider: ProviderError["provider"],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`${provider}: ${message}`, options);
    this.name = "ProviderError";
    this.provider = provider;
  }
}
