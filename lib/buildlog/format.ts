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

/** Update-spec §4.1: at this many days since the last production deploy the
 *  register switches from the live view to a static cumulative summary, so a
 *  quiet stretch never reads as abandonment. Single constant so it's tunable. */
export const STALE_AFTER_DAYS = 10;

/** True when the register should render the static summary framing instead
 *  of the live "updated [time]" / "Last shipped" view (update-spec §4.1). */
export function isStaleView(lastShipped: BuildLog["lastShipped"]): boolean {
  return !lastShipped || lastShipped.daysAgo >= STALE_AFTER_DAYS;
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

function spelled(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Update-spec §4.2: the "Four weeks shipping code" phrase is generated from
 *  the day counter so it can never drift from the "Days building" tile.
 *  Weeks while young, months once weeks stop reading naturally. */
export function shippingPhrase(daysBuilding: number): string {
  const weeks = Math.max(1, Math.round(daysBuilding / 7));
  if (weeks === 1) return "One week shipping code";
  if (weeks <= 12) return `${capitalize(spelled(weeks))} weeks shipping code`;
  const months = Math.max(3, Math.round(daysBuilding / 30.44));
  if (months < 24) return `${capitalize(spelled(months))} months shipping code`;
  const years = Math.round(daysBuilding / 365.25);
  return `${capitalize(spelled(years))} years shipping code`;
}

/** The static replacement for the "updated [time]" line in the stale view:
 *  same proof, cumulative framing, no decay (update-spec §4.1). */
export function staleSummary(
  log: Pick<BuildLog, "daysBuilding" | "featuresLive" | "pullRequests">,
): string {
  const months = Math.max(1, Math.round(log.daysBuilding / 30.44));
  const span =
    months === 1 ? "one month" : `${spelled(months)} months`;
  return `Built over ${span}: ${log.featuresLive} features, ${log.pullRequests} pull requests, every one reviewed.`;
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
