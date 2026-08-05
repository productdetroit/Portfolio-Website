import { createHmac, timingSafeEqual } from "node:crypto";

/** Vercel signs webhook deliveries with an HMAC-SHA1 of the raw request
 *  body, hex-encoded, in the `x-vercel-signature` header. Constant-time
 *  comparison; a missing or malformed header never matches. */
export function signatureMatches(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha1", secret).update(body).digest();
  const provided = Buffer.from(signature, "hex");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/** Only a production ship should drop the register's caches — previews and
 *  non-deploy events ack without refreshing. Narrows from unknown because
 *  the payload arrives as parsed, unvalidated JSON. */
export function isProductionShip(event: unknown): boolean {
  if (typeof event !== "object" || event === null) return false;
  const e = event as { type?: unknown; payload?: { target?: unknown } };
  return (
    e.type === "deployment.succeeded" && e.payload?.target === "production"
  );
}
