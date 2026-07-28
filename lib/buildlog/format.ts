import type { BuildLog } from "./types";

const ET = "America/Detroit";

function timeET(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ET,
    hour: "numeric",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(/\s?(AM|PM)/, " $1");
}

/** "Live from Jira, Confluence, GitHub and Vercel · updated 4:12 PM ET"
 *  (spec 6.2). Falls back to a dated stamp when the payload is snapshot-only. */
export function asOfLine(log: Pick<BuildLog, "asOf" | "stale">): string {
  const when = new Date(log.asOf);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: ET }).format(
    new Date(),
  );
  const asOfDay = new Intl.DateTimeFormat("en-CA", { timeZone: ET }).format(when);
  if (asOfDay !== today) {
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: ET,
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(when);
    return `Live from Jira, Confluence, GitHub and Vercel · as of ${date}`;
  }
  return `Live from Jira, Confluence, GitHub and Vercel · updated ${timeET(log.asOf)} ET`;
}

/** True once the newest production deploy is more than 21 days old —
 *  drives the silent "Latest milestone" relabel (spec 6.3). */
export function isQuiet(lastShipped: BuildLog["lastShipped"]): boolean {
  return !!lastShipped && lastShipped.daysAgo > 21;
}

/** Timestamp text for the Last shipped line entry:
 *  today · 2:41 PM ET → yesterday → N days ago → (quiet) June 2026. */
export function shippedStamp(
  lastShipped: NonNullable<BuildLog["lastShipped"]>,
): string {
  if (lastShipped.daysAgo > 21) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: ET,
      month: "long",
      year: "numeric",
    }).format(new Date(lastShipped.at));
  }
  if (lastShipped.daysAgo === 0) return `today · ${timeET(lastShipped.at)} ET`;
  if (lastShipped.daysAgo === 1) return "yesterday";
  return `${lastShipped.daysAgo} days ago`;
}
