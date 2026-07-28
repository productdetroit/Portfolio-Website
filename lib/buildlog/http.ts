import { ProviderError } from "./types";

/** Fetch JSON with a hard timeout (spec 7.4: 3 seconds per provider) and no
 *  Next.js data-cache participation — caching happens in the aggregator. */
export async function fetchJson<T>(
  provider: ProviderError["provider"],
  url: string,
  init: RequestInit = {},
  timeoutMs = 3000,
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
