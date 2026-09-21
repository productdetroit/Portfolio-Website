import { headers } from "next/headers";
import { site } from "../../content/site";

/** Production links must carry the real domain; previews and localhost use
 *  whatever host the request came in on so the link comes back here. */
export async function baseUrl(): Promise<string> {
  if (process.env.VERCEL_ENV === "production") return site.url;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
