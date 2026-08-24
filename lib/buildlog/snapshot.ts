import snapshotJson from "./snapshot.json";
import type { Duration } from "./types";
import type { ProductConfig } from "./products";

/** Committed last-known-good values, one set per product.
 *
 *  Two jobs: the fallback when a provider is down or slow, and the floor the
 *  live deploy count builds on — Vercel prunes old deployments, so a count
 *  derived purely from the API decays over time even when nothing shipped. */
export type ProductSnapshot = {
  capturedAt: string;
  daysBuilding: number;
  backlogItems: number;
  featuresLive: number;
  cycleTime: Duration;
  specToShipped: Duration;
  specsWritten: number;
  epics: { done: number; total: number };
  pullRequests: number;
  /** Net lines (additions minus deletions) over the product's merged PRs. */
  linesOfCode: number;
  /** Cumulative READY production deploys as of capturedAt. */
  deploysBaseline: { count: number; capturedAt: string };
  lastShipped: { subject: string; at: string } | null;
};

type SnapshotFile = Record<ProductConfig["id"], ProductSnapshot>;

export const snapshots = snapshotJson as SnapshotFile;

export function snapshotFor(id: ProductConfig["id"]): ProductSnapshot {
  const s = snapshots[id];
  if (!s) throw new Error(`no snapshot for product: ${id}`);
  return s;
}
