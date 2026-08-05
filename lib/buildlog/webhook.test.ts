import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isProductionShip, signatureMatches } from "./webhook";

const SECRET = "test-secret";
const sign = (body: string) =>
  createHmac("sha1", SECRET).update(body).digest("hex");

describe("signatureMatches", () => {
  it("accepts Vercel's HMAC-SHA1 hex signature of the raw body", () => {
    const body = '{"type":"deployment.succeeded"}';
    expect(signatureMatches(body, sign(body), SECRET)).toBe(true);
  });
  it("rejects a signature made with a different secret", () => {
    const body = '{"type":"deployment.succeeded"}';
    const wrong = createHmac("sha1", "other").update(body).digest("hex");
    expect(signatureMatches(body, wrong, SECRET)).toBe(false);
  });
  it("rejects a signature for a different body", () => {
    expect(signatureMatches("tampered", sign("original"), SECRET)).toBe(false);
  });
  it("rejects missing or malformed headers", () => {
    expect(signatureMatches("body", null, SECRET)).toBe(false);
    expect(signatureMatches("body", "", SECRET)).toBe(false);
    expect(signatureMatches("body", "not-hex", SECRET)).toBe(false);
  });
});

describe("isProductionShip", () => {
  it("matches deployment.succeeded on production", () => {
    expect(
      isProductionShip({
        type: "deployment.succeeded",
        payload: { target: "production" },
      }),
    ).toBe(true);
  });
  it("ignores preview deploys and other events", () => {
    expect(
      isProductionShip({
        type: "deployment.succeeded",
        payload: { target: null },
      }),
    ).toBe(false);
    expect(
      isProductionShip({
        type: "deployment.created",
        payload: { target: "production" },
      }),
    ).toBe(false);
    expect(isProductionShip({})).toBe(false);
  });
});
