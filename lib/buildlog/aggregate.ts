import { snapshotFor } from "./snapshot";
import { PRODUCTS, portfolioStartDate, type ProductConfig } from "./products";
import type {
  BuildLog,
  JiraMetrics,
  PortfolioBuildLog,
  ProductBuildLog,
  VercelMetrics,
} from "./types";

const DETROIT_TZ = "America/Detroit";
/** Spec 7.4: 3-second budget per provider before snapshot fallback. */
const PROVIDER_TIMEOUT_MS = 3000;

/** Day one of the portfolio — the earliest product's start (spec 6.1 metric 1). */
export const START_DATE = portfolioStartDate();

export type Providers = {
  jira: (p: ProductConfig) => Promise<JiraMetrics>;
  confluence: (p: ProductConfig) => Promise<number>;
  github: (p: ProductConfig) => Promise<number>;
  /** Separate slot from `github` (same host, different endpoint) so a slow
   *  stats computation never drags the PR count down to snapshot with it. */
  githubLoc: (p: ProductConfig) => Promise<number>;
  vercel: (p: ProductConfig) => Promise<VercelMetrics>;
};

/** Calendar date (Y-M-D) of an instant in the Detroit timezone. */
function detroitCalendarDayUtcMs(now: Date): number {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: DETROIT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // "YYYY-MM-DD"
  return Date.parse(`${ymd}T00:00:00Z`);
}

/** Whole calendar days from a start date to `now`, America/Detroit (AC 5). */
export function daysBuilding(now: Date, startDate: string = START_DATE): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  return Math.max(
    0,
    Math.round((detroitCalendarDayUtcMs(now) - start) / 86_400_000),
  );
}

/** Whole calendar days between two instants, America/Detroit — "yesterday"
 *  is the previous Detroit calendar day, not 24 elapsed hours. A 10:19 AM
 *  ship must read "yesterday" the next morning, not "today · 10:19 AM". */
export function calendarDaysAgo(at: string, now: Date): number {
  return Math.max(
    0,
    Math.round(
      (detroitCalendarDayUtcMs(now) - detroitCalendarDayUtcMs(new Date(at))) /
        86_400_000,
    ),
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`provider timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

async function attempt<T>(
  name: string,
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T | null> {
  try {
    return await withTimeout(fn(), timeoutMs);
  } catch (err) {
    // Spec 7.4: log server-side, render nothing different to the user.
    console.error(
      `[buildlog] ${name} fell back to snapshot:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/** One product's register. Falls back to that product's committed snapshot
 *  per provider (spec 7.4, PDW-5). Pure given its inputs — caching is layered
 *  on in index.ts. */
export async function aggregateProduct(
  product: ProductConfig,
  providers: Providers,
  now: Date = new Date(),
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<ProductBuildLog> {
  const snapshot = snapshotFor(product.id);

  const [jira, confluence, github, githubLoc, vercel] = await Promise.all([
    attempt(`${product.id}/jira`, () => providers.jira(product), timeoutMs),
    attempt(
      `${product.id}/confluence`,
      () => providers.confluence(product),
      timeoutMs,
    ),
    attempt(`${product.id}/github`, () => providers.github(product), timeoutMs),
    attempt(
      `${product.id}/github-loc`,
      () => providers.githubLoc(product),
      timeoutMs,
    ),
    attempt(`${product.id}/vercel`, () => providers.vercel(product), timeoutMs),
  ]);

  const allFailed =
    !jira &&
    confluence === null &&
    github === null &&
    githubLoc === null &&
    !vercel;
  const stale =
    !jira ||
    confluence === null ||
    github === null ||
    githubLoc === null ||
    !vercel;

  const lastShippedSource = vercel ? vercel.lastShipped : snapshot.lastShipped;
  const lastShipped = lastShippedSource
    ? {
        subject: lastShippedSource.subject,
        at: lastShippedSource.at,
        daysAgo: calendarDaysAgo(lastShippedSource.at, now),
      }
    : null;

  return {
    productId: product.id,
    productName: product.name,
    medianCaveat: product.medianCaveat,
    asOf: allFailed ? snapshot.capturedAt : now.toISOString(),
    stale,
    daysBuilding: daysBuilding(now, product.startDate),
    startDate: product.startDate,
    backlogItems: jira?.backlogItems ?? snapshot.backlogItems,
    featuresLive: jira?.featuresLive ?? snapshot.featuresLive,
    cycleTime: jira?.cycleTime ?? snapshot.cycleTime,
    specToShipped: jira?.specToShipped ?? snapshot.specToShipped,
    specsWritten: confluence ?? snapshot.specsWritten,
    epics: jira?.epics ?? snapshot.epics,
    pullRequests: github ?? snapshot.pullRequests,
    linesOfCode: githubLoc ?? snapshot.linesOfCode,
    productionDeploys:
      vercel?.productionDeploys ?? snapshot.deploysBaseline.count,
    lastShipped,
  };
}

/** Every product, plus a portfolio total.
 *
 *  The total carries ONLY additive metrics. Medians are never pooled — a
 *  median of two medians is not a median of anything — and elapsed days are
 *  never summed, because two concurrent products would claim more calendar
 *  time than has passed. "Days building" for the portfolio is the span since
 *  the earliest product started, which is a span rather than a sum. */
export async function aggregate(
  providers: Providers,
  now: Date = new Date(),
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<PortfolioBuildLog> {
  const products = await Promise.all(
    PRODUCTS.map((p) => aggregateProduct(p, providers, now, timeoutMs)),
  );

  const sum = (pick: (p: ProductBuildLog) => number) =>
    products.reduce((n, p) => n + pick(p), 0);

  const shipped = products
    .map((p) => p.lastShipped)
    .filter((s): s is NonNullable<ProductBuildLog["lastShipped"]> => s !== null)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return {
    asOf: now.toISOString(),
    stale: products.some((p) => p.stale),
    daysBuilding: daysBuilding(now, START_DATE),
    products,
    totals: {
      specsWritten: sum((p) => p.specsWritten),
      backlogItems: sum((p) => p.backlogItems),
      featuresLive: sum((p) => p.featuresLive),
      pullRequests: sum((p) => p.pullRequests),
      linesOfCode: sum((p) => p.linesOfCode),
      productionDeploys: sum((p) => p.productionDeploys),
      epics: {
        done: sum((p) => p.epics.done),
        total: sum((p) => p.epics.total),
      },
    },
    lastShipped: shipped[0] ?? null,
  };
}

export type { BuildLog };
