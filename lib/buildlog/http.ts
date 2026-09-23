import { ProviderError } from "./types";

/** Spec 7.4: 3-second budget per provider before snapshot fallback. */
export const PROVIDER_TIMEOUT_MS = 3000;

/** The line count's own budget, for its provider slot and each request in it.
 *
 *  GitHub computes each merged PR's diffstat on demand, ~20ms a PR, so one
 *  100-PR page takes 2–3s by itself (measured 23 Sep 2026 on motor and
 *  app.tophand.ag). On the shared 3s budget the stat fell back to snapshot on
 *  every render and sat frozen for five weeks. The longer budget costs no
 *  visitor anything: the slot is isolated from the PR count, and its value is
 *  cached for an hour behind ISR, so only background regeneration ever waits. */
export const LINE_COUNT_TIMEOUT_MS = 10_000;

/** Fetch JSON with a hard timeout (spec 7.4) and no Next.js data-cache
 *  participation — caching happens in the aggregator. */
export async function fetchJson<T>(
  provider: ProviderError["provider"],
  url: string,
  init: RequestInit = {},
  timeoutMs = PROVIDER_TIMEOUT_MS,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new ProviderError(provider, `request failed (${url})`, { cause });
  }
  if (!res.ok) {
    throw new ProviderError(provider, `HTTP ${res.status} (${url})`);
  }
  try {
    return (await res.json()) as T;
  } catch (cause) {
    throw new ProviderError(provider, `invalid JSON (${url})`, { cause });
  }
}

export function requireEnv(
  provider: ProviderError["provider"],
  name: string,
): string {
  const value = process.env[name];
  if (!value) throw new ProviderError(provider, `missing env var ${name}`);
  return value;
}
