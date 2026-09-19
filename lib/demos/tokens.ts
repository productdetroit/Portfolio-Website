/** Two kinds of signed token, one secret, distinct audiences so a sign-in
 *  link can never be replayed as a session or vice versa.
 *
 *  - link:    emailed; 15 minutes; carries a `jti` the verify route consumes
 *             once (store.ts) so a forwarded link is dead after first use
 *  - session: HttpOnly cookie; 30 days; carries only the email — what that
 *             email may see is looked up fresh on every request */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { LINK_TTL_SECONDS, SESSION_TTL_SECONDS } from "./config";

const ALG = "HS256";
const ISSUER = "productdetroit.com/demos";

type Kind = "link" | "session";

async function sign(kind: Kind, email: string, ttl: number, secret: Uint8Array, jti?: string) {
  const jwt = new SignJWT({ email })
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

export function newJti(): string {
  return crypto.randomUUID();
}

export function signLinkToken(email: string, jti: string, secret: Uint8Array) {
  return sign("link", email, LINK_TTL_SECONDS, secret, jti);
}

/** Returns `{ email, jti }`; throws on tamper, expiry, or wrong audience. */
export async function verifyLinkToken(token: string, secret: Uint8Array) {
  const p = await verify("link", token, secret);
  if (typeof p.jti !== "string") throw new Error("link token has no jti");
  return { email: p.email, jti: p.jti };
}

export function signSessionToken(email: string, secret: Uint8Array) {
  return sign("session", email, SESSION_TTL_SECONDS, secret);
}

export async function verifySessionToken(token: string, secret: Uint8Array) {
  const p = await verify("session", token, secret);
  return { email: p.email };
}
