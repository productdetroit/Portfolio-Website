/** Three kinds of signed token, one secret, distinct audiences so no token
 *  can be replayed as another kind.
 *
 *  - link:    emailed on request; 15 minutes; carries a `jti` the sign-in
 *             page consumes once (store.ts) so a forwarded link dies on use
 *  - invite:  emailed by Joe; 14 days; carries the demo slug; valid only
 *             while the invite record exists, so revoking kills it
 *  - session: HttpOnly cookie; 30 days; carries only the email — what that
 *             email may see is looked up fresh on every request */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { INVITE_TTL_SECONDS, LINK_TTL_SECONDS, SESSION_TTL_SECONDS } from "./config";

const ALG = "HS256";
const ISSUER = "productdetroit.com/demos";

type Kind = "link" | "invite" | "session";

async function sign(kind: Kind, claims: Record<string, string>, ttl: number, secret: Uint8Array, jti?: string) {
  const jwt = new SignJWT(claims)
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(kind)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`);
  if (jti) jwt.setJti(jti);
  return jwt.sign(secret);
}

async function verify(kind: Kind, token: string, secret: Uint8Array): Promise<JWTPayload & { email: string }> {
  const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, audience: kind, algorithms: [ALG] });
  if (typeof payload.email !== "string") throw new Error("token has no email");
  return payload as JWTPayload & { email: string };
}

/** Which kind a token claims to be, without trusting it — lets the sign-in
 *  page pick the right verifier before it has proven anything. */
export function peekKind(token: string): Kind | null {
  try {
    const body = token.split(".")[1];
    const aud = JSON.parse(Buffer.from(body, "base64url").toString("utf8")).aud;
    return aud === "link" || aud === "invite" || aud === "session" ? aud : null;
  } catch {
    return null;
  }
}

export function newJti(): string {
  return crypto.randomUUID();
}

export function signLinkToken(email: string, jti: string, secret: Uint8Array) {
  return sign("link", { email }, LINK_TTL_SECONDS, secret, jti);
}

/** Returns `{ email, jti }`; throws on tamper, expiry, or wrong audience. */
export async function verifyLinkToken(token: string, secret: Uint8Array) {
  const p = await verify("link", token, secret);
  if (typeof p.jti !== "string") throw new Error("link token has no jti");
  return { email: p.email, jti: p.jti };
}

export function signInviteToken(email: string, slug: string, secret: Uint8Array) {
  return sign("invite", { email, slug }, INVITE_TTL_SECONDS, secret);
}

export async function verifyInviteToken(token: string, secret: Uint8Array) {
  const p = await verify("invite", token, secret);
  if (typeof p.slug !== "string") throw new Error("invite token has no slug");
  return { email: p.email, slug: p.slug };
}

export function signSessionToken(email: string, secret: Uint8Array) {
  return sign("session", { email }, SESSION_TTL_SECONDS, secret);
}

export async function verifySessionToken(token: string, secret: Uint8Array) {
  const p = await verify("session", token, secret);
  return { email: p.email };
}
