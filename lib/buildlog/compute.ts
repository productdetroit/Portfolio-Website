import type { Duration } from "./types";

/** Median of a list of millisecond durations. Returns null for an empty list. */
export function medianMs(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Spec 6.1 metric 3: render in hours when under 48h, otherwise days. */
export function toDuration(ms: number): Duration {
  const hours = ms / 3_600_000;
  if (hours < 48) return { value: Math.round(hours), unit: "hours" };
  return { value: Math.round(hours / 24), unit: "days" };
}

/** Spec 6.2: commit subject, first line only, `KAN-nnn` prefix stripped.
 *  GitHub merge commits ("Merge pull request #94 from owner/feat/kan-117-x")
 *  are humanized from the branch name so the register reads like a log
 *  entry, not like git plumbing. */
export function cleanCommitSubject(message: string): string {
  const firstLine = message.split("\n", 1)[0];
  const merge = firstLine.match(/^Merge pull request #\d+ from \S+?\/(.+)$/i);
  if (merge) {
    const leaf = merge[1].split("/").pop() ?? merge[1];
    const words = leaf
      .replace(/^(feat|fix|chore|docs|refactor|perf|test)[-_]?/i, "")
      .replace(/^kan[-_]?\d+[-_]?/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    if (words) return words.charAt(0).toUpperCase() + words.slice(1);
  }
  return firstLine.replace(/^KAN-\d+\s*[:\-–—]?\s*/i, "").trim();
}

/** Whole days between two instants, floored at zero. */
export function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}
