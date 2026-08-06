import snapshotJson from "./snapshot.json";
import type { BuildLog, Duration, JiraMetrics, VercelMetrics } from "./types";

/** Day one of the build log (spec 6.1 metric 1). */
export const START_DATE = "2026-06-25";
const DETROIT_TZ = "America/Detroit";
/** Spec 7.4: 3-second budget per provider before snapshot fallback. */
const PROVIDER_TIMEOUT_MS = 3000;

type Snapshot = {
  capturedAt: string;
  daysBuilding: number;
  backlogItems: number;
  featuresLive: number;
  cycleTime: Duration;
  specToShipped: Duration;
  specsWritten: number;
  epics: { done: number; total: number };
  pullRequests: number;
  /** Cumulative READY production deploys as of capturedAt — the floor the
   *  live count builds on (vercel.ts) and the fallback when Vercel is down. */
  deploysBaseline: { count: number; capturedAt: string };
  lastShipped: { subject: string; at: string } | null;
};

export const snapshot = snapshotJson as Snapshot;

export type Providers = {
  jira: () => Promise<JiraMetrics>;
  confluence: () => Promise<number>;
  github: () => Promise<number>;
  vercel: () => Promise<VercelMetrics>;
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

/** Whole calendar days from START_DATE to `now`, America/Detroit (AC 5). */
export function daysBuilding(now: Date): number {
  const start = Date.parse(`${START_DATE}T00:00:00Z`);
  return Math.max(
    0,
    Math.round((detroitCalendarDayUtcMs(now) - start) / 86_400_000),
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

/** Compose the four providers into the BuildLog payload, falling back to the
 *  committed snapshot per provider (spec 7.4, PDW-5). Pure given its inputs —
 *  caching is layered on in index.ts. */
export async function aggregate(
  providers: Providers,
  now: Date = new Date(),
  timeoutMs: number = PROVIDER_TIMEOUT_MS,
): Promise<BuildLog> {
  const [jira, confluence, github, vercel] = await Promise.all([
    attempt("jira", providers.jira, timeoutMs),
    attempt("confluence", providers.confluence, timeoutMs),
    attempt("github", providers.github, timeoutMs),
    attempt("vercel", providers.vercel, timeoutMs),
  ]);

  const allFailed = !jira && confluence === null && github === null && !vercel;
  const stale = !jira || confluence === null || github === null || !vercel;

  const lastShippedSource = vercel ? vercel.lastShipped : snapshot.lastShipped;
  const lastShipped = lastShippedSource
    ? {
        subject: lastShippedSource.subject,
        at: lastShippedSource.at,
        daysAgo: Math.max(
          0,
          Math.floor(
            (now.getTime() - Date.parse(lastShippedSource.at)) / 86_400_000,
          ),
        ),
      }
    : null;

  return {
    asOf: allFailed ? snapshot.capturedAt : now.toISOString(),
    stale,
    daysBuilding: daysBuilding(now),
    backlogItems: jira?.backlogItems ?? snapshot.backlogItems,
    featuresLive: jira?.featuresLive ?? snapshot.featuresLive,
    cycleTime: jira?.cycleTime ?? snapshot.cycleTime,
    specToShipped: jira?.specToShipped ?? snapshot.specToShipped,
    specsWritten: confluence ?? snapshot.specsWritten,
    epics: jira?.epics ?? snapshot.epics,
    pullRequests: github ?? snapshot.pullRequests,
    productionDeploys: vercel?.productionDeploys ?? snapshot.deploysBaseline.count,
    lastShipped,
  };
}
