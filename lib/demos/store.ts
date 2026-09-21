/** Everything that touches the private Blob store.
 *
 *  Layout (all `access: 'private'`):
 *
 *    demos/<slug>/demo.md                     manifest + body (manifest.ts)
 *    demos/<slug>/<video>                     served via short-lived signed URL
 *    demos/_tokens/<jti>                      one file per unused sign-in link
 *    demos/_invites/<slug>/<email>.json       one file per invitation (invites.ts)
 *    demos/_log/signin/<email>/<ms>.json      one file per sign-in
 *    demos/_log/view/<email>/<ms>-<slug>.json one file per demo page open
 *
 *  The log is append-only, one blob per event — no read-modify-write, so
 *  two events in the same instant can't clobber each other. The owner page
 *  reads the pathnames alone; the bodies are there for forensics. */
import { del, get, head, issueSignedToken, list, presignUrl, put } from "@vercel/blob";
import { cache } from "react";
import { blobConfigured, VIDEO_URL_TTL_MS } from "./config";
import type { Invite } from "./invites";
import {
  DEMOS_PREFIX,
  MANIFEST_FILE,
  demoFolder,
  isSlug,
  parseDemo,
  slugFromManifestPath,
  type Demo,
} from "./manifest";

const PRIVATE = { access: "private" } as const;
const TOKENS_PREFIX = `${DEMOS_PREFIX}_tokens/`;
const INVITES_PREFIX = `${DEMOS_PREFIX}_invites/`;
const LOG_PREFIX = `${DEMOS_PREFIX}_log/`;
const JSON_PUT = { ...PRIVATE, contentType: "application/json", addRandomSuffix: false } as const;

async function readText(pathname: string): Promise<string | null> {
  const r = await get(pathname, { ...PRIVATE, useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return new Response(r.stream).text();
}

/** Walk a prefix to the end — `list` pages at 1000 and the log will outgrow
 *  a page long before the demos do. */
async function listAll(prefix: string) {
  const out: { pathname: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) out.push({ pathname: b.pathname, uploadedAt: b.uploadedAt });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

/* ── Demos ─────────────────────────────────────────────────────────────── */

/** Every published demo, newest `updated` first. Cached per request so the
 *  index, the sign-in check and the access page share one Blob round-trip.
 *  A demo whose manifest fails to parse is logged and skipped — one bad
 *  upload must not take the whole space down. */
export const listDemos = cache(async (): Promise<Demo[]> => {
  if (!blobConfigured()) return [];
  const blobs = await listAll(DEMOS_PREFIX);
  const slugs = blobs.map((b) => slugFromManifestPath(b.pathname)).filter((s): s is string => Boolean(s));
  const demos = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const md = await readText(demoFolder(slug) + MANIFEST_FILE);
        return md ? parseDemo(slug, md) : null;
      } catch (err) {
        console.error(`[demos] skipping ${slug}:`, err instanceof Error ? err.message : err);
        return null;
      }
    }),
  );
  return demos
    .filter((d): d is Demo => Boolean(d))
    .sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "") || a.title.localeCompare(b.title));
});

export async function getDemo(slug: string): Promise<Demo | null> {
  if (!isSlug(slug)) return null;
  return (await listDemos()).find((d) => d.slug === slug) ?? null;
}

/** A URL the browser can stream the video from directly — seeking works
 *  because the Blob CDN handles Range requests — that expires in a few hours.
 *  Only minted after the caller has checked access. */
export async function videoUrl(demo: Demo): Promise<string | null> {
  if (!demo.video) return null;
  const pathname = demoFolder(demo.slug) + demo.video;
  const validUntil = Date.now() + VIDEO_URL_TTL_MS;
  const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
  const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, access: "private", validUntil });
  return presignedUrl;
}

/* ── Sign-in links ─────────────────────────────────────────────────────── */

export async function issueLinkToken(jti: string, email: string): Promise<void> {
  await put(`${TOKENS_PREFIX}${jti}`, JSON.stringify({ email, issuedAt: new Date().toISOString() }), JSON_PUT);
}

/** Burn the token. True exactly once per jti; a second click on the same
 *  link finds nothing and is refused. */
export async function consumeLinkToken(jti: string): Promise<boolean> {
  const pathname = `${TOKENS_PREFIX}${jti}`;
  try {
    await head(pathname);
  } catch {
    return false;
  }
  await del(pathname);
  return true;
}

/* ── Invitations ───────────────────────────────────────────────────────── */

function invitePath(slug: string, email: string) {
  return `${INVITES_PREFIX}${slug}/${email}.json`;
}

/** Every invitation, cached per request like the demos. Access checks,
 *  the sign-in form and the owner page all read this once. */
export const listInvites = cache(async (): Promise<Invite[]> => {
  if (!blobConfigured()) return [];
  const blobs = await listAll(INVITES_PREFIX);
  const invites = await Promise.all(
    blobs.map(async (b) => {
      try {
        const json = await readText(b.pathname);
        return json ? (JSON.parse(json) as Invite) : null;
      } catch (err) {
        console.error(`[demos] bad invite ${b.pathname}:`, err instanceof Error ? err.message : err);
        return null;
      }
    }),
  );
  return invites.filter((i): i is Invite => Boolean(i && isSlug(i.slug) && i.email));
});

export async function getInvite(slug: string, email: string): Promise<Invite | null> {
  return (await listInvites()).find((i) => i.slug === slug && i.email === email) ?? null;
}

/** Create or overwrite — a resend keeps the same file. */
export async function saveInvite(invite: Invite): Promise<void> {
  await put(invitePath(invite.slug, invite.email), JSON.stringify(invite), { ...JSON_PUT, allowOverwrite: true });
}

/** Revoke. The invite link's token is still signed, but the sign-in page
 *  checks for this file, so the link is dead from here on. */
export async function deleteInvite(slug: string, email: string): Promise<void> {
  await del(invitePath(slug, email));
}

/* ── Access log ────────────────────────────────────────────────────────── */

export type SignInEvent = { email: string; at: Date };
export type ViewEvent = { email: string; slug: string; at: Date };
export type SignInVia = "link" | "invite";

function logPath(kind: "signin" | "view", email: string, suffix = "") {
  return `${LOG_PREFIX}${kind}/${email}/${Date.now()}${suffix}.json`;
}

export async function recordSignIn(email: string, userAgent: string | null, via: SignInVia): Promise<void> {
  await put(logPath("signin", email), JSON.stringify({ email, at: new Date().toISOString(), userAgent, via }), JSON_PUT);
}

export async function recordView(email: string, slug: string): Promise<void> {
  await put(logPath("view", email, `-${slug}`), JSON.stringify({ email, slug, at: new Date().toISOString() }), JSON_PUT);
}

/** The whole log, parsed from pathnames. Bounded by how many people Joe
 *  invites, not by traffic — this is a handful of viewers, not analytics. */
export async function readAccessLog(): Promise<{ signIns: SignInEvent[]; views: ViewEvent[] }> {
  const signIns: SignInEvent[] = [];
  const views: ViewEvent[] = [];
  for (const b of await listAll(LOG_PREFIX)) {
    const m = b.pathname.match(/^demos\/_log\/(signin|view)\/([^/]+)\/(\d+)(?:-([a-z0-9-]+))?\.json$/);
    if (!m) continue;
    const at = new Date(Number(m[3]));
    if (m[1] === "signin") signIns.push({ email: m[2], at });
    else if (m[4]) views.push({ email: m[2], slug: m[4], at });
  }
  return { signIns, views };
}
