/** Owner-only pages outside /demos. /building, /consulting and the home
 *  page's contact section are hidden from the public; an owner signed in at
 *  /demos sees them as before. The same session cookie is the key — there
 *  is no second password to manage.
 *
 *  `proxy.ts` enforces the gate on the routes; the layout and home page call
 *  `isOwnerRequest()` only to decide what to render. */
import { cookies } from "next/headers";
import { isOwner } from "./access";
import { SESSION_COOKIE, ownerEmails, sessionSecret } from "./config";
import { verifySessionToken } from "./tokens";

/** Path prefixes nobody but an owner may open. */
export const OWNER_ONLY_PATHS = ["/building", "/consulting"] as const;

export function isOwnerOnlyPath(pathname: string): boolean {
  return OWNER_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** True only for a valid session belonging to a DEMO_OWNER_EMAILS address.
 *  Any failure — no cookie, bad signature, missing secret — is "not owner". */
export async function isOwnerToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { email } = await verifySessionToken(token, sessionSecret());
    return isOwner(email.toLowerCase(), ownerEmails());
  } catch {
    return false;
  }
}

export async function isOwnerRequest(): Promise<boolean> {
  return isOwnerToken((await cookies()).get(SESSION_COOKIE)?.value);
}
