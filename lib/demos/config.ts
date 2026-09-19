/** Environment for the private demo space. Read lazily so a missing variable
 *  fails the request that needs it, not the whole build.
 *
 *    DEMO_SESSION_SECRET   ≥32 random chars; signs sign-in links and sessions
 *    DEMO_OWNER_EMAILS     comma-separated; see every demo and /demos/access
 *    RESEND_API_KEY        sends the sign-in emails
 *    DEMO_FROM_EMAIL       optional; defaults to demos@productdetroit.com
 *    BLOB_READ_WRITE_TOKEN set by Vercel when the Blob store is connected */
// Relative, not "@/": lib/ is also imported by scripts/ and vitest, which have no alias.
import { site } from "../../content/site";

export const LINK_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
/** How long a freshly minted video URL stays playable. Long enough for a
 *  session, short enough that a forwarded URL goes dead the same afternoon. */
export const VIDEO_URL_TTL_MS = 4 * 60 * 60 * 1000;

export const SESSION_COOKIE = "pd_demos";

export function sessionSecret(): Uint8Array {
  const s = process.env.DEMO_SESSION_SECRET;
  if (!s || s.length < 32)
    throw new Error("DEMO_SESSION_SECRET must be set (≥32 characters)");
  return new TextEncoder().encode(s);
}

export function ownerEmails(): string[] {
  return (process.env.DEMO_OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function fromEmail(): string {
  return process.env.DEMO_FROM_EMAIL ?? `Joe Ross <demos@${new URL(site.url).host}>`;
}

export function resendApiKey(): string {
  const k = process.env.RESEND_API_KEY;
  if (!k) throw new Error("RESEND_API_KEY is not set");
  return k;
}

/** True once the Blob store is attached — locally that means `vercel env pull`
 *  after connecting it; without it the space renders as empty, not broken. */
export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
