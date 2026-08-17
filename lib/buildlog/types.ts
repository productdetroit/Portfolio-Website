/** Payload contract from the /building spec (section 7.2). Design and the
 *  aggregator both depend on this exact shape. */
export type Duration = { value: number; unit: "hours" | "days" };

export type BuildLog = {
  asOf: string; // ISO 8601
  stale: boolean; // true when any provider fell back
  daysBuilding: number;
  /** Total issues in the product's Jira project — feeds the operating-model
   *  prose ("212 backlog items"). */
  backlogItems: number;
  /** Work items delivered: Story OR Task, Done, excluding Epic and Bug
   *  (spec §8.2). Named `featuresLive` for continuity with the payload
   *  contract; the tile reads "Work items delivered". */
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

/** One product's register. */
export type ProductBuildLog = BuildLog & {
  productId: "tophand" | "motoradvisor";
  productName: string;
  /** Day one for this product's elapsed-days tile. */
  startDate: string;
  /** Rendered beneath the median tiles when the medians cannot be trusted —
   *  MotorAdvisor's, because a 106-issue reconciliation stamped one date on
   *  all of them (spec §7). */
  medianCaveat?: string;
};

/** Every product, plus a portfolio total carrying ONLY additive metrics.
 *
 *  Never a pooled median: a median of medians is not a median of anything.
 *  Never summed elapsed days: two concurrent products would together claim
 *  more calendar time than has actually passed. */
export type PortfolioBuildLog = {
  asOf: string;
  stale: boolean;
  /** Span since the earliest product started — a span, not a sum. */
  daysBuilding: number;
  products: ProductBuildLog[];
  totals: {
    specsWritten: number;
    backlogItems: number;
    featuresLive: number;
    pullRequests: number;
    productionDeploys: number;
    epics: { done: number; total: number };
  };
  lastShipped: BuildLog["lastShipped"];
};

/** What lib/buildlog/jira.ts returns — five values from one result set. */
export type JiraMetrics = {
  backlogItems: number;
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
