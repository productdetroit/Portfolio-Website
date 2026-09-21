/** The viewer, as far as the current request knows.
 *
 *  `getViewer()` is the one thing pages and actions call. It reads the
 *  session cookie and, if valid, combines the email with the live manifest
 *  and invitations so callers get "what can this person open" already
 *  answered. */
import { cookies } from "next/headers";
import { cache } from "react";
import { canView, isOwner } from "./access";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, ownerEmails, sessionSecret } from "./config";
import type { Invite } from "./invites";
import type { Demo } from "./manifest";
import { listDemos, listInvites } from "./store";
import { verifySessionToken } from "./tokens";

export type Viewer = {
  email: string;
  owner: boolean;
  /** Demos this viewer may open — every demo for an owner. */
  demos: Demo[];
};

/** A demo is open to someone on its `access:` rules or holding an invite.
 *  Both are re-read on every request; nothing is baked into the cookie. */
export function demosFor(email: string, demos: Demo[], invites: Invite[]): Demo[] {
  return demos.filter((d) => canView(email, d.access) || invites.some((i) => i.slug === d.slug && i.email === email));
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let email: string;
  try {
    ({ email } = await verifySessionToken(token, sessionSecret()));
  } catch {
    return null;
  }
  const owner = isOwner(email, ownerEmails());
  const [all, invites] = await Promise.all([listDemos(), listInvites()]);
  return { email, owner, demos: owner ? all : demosFor(email, all, invites) };
});

/** Cookie attributes shared by sign-in (set) and sign-out (clear).
 *  Scoped to /demos so the rest of the site never even sees it. */
export function sessionCookie(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/demos",
    maxAge: value ? SESSION_TTL_SECONDS : 0,
  };
}
