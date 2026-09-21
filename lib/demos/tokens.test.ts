import { describe, expect, it } from "vitest";
import { signLinkToken, signSessionToken, verifyLinkToken, verifySessionToken } from "./tokens";

const secret = new TextEncoder().encode("test-secret-test-secret-test-secret-xx");
const other = new TextEncoder().encode("other-secret-other-secret-other-secret");

describe("tokens", () => {
  it("round-trips a link token with its jti", async () => {
    const t = await signLinkToken("ana@motor.com", "jti-1", secret);
    expect(await verifyLinkToken(t, secret)).toEqual({ email: "ana@motor.com", jti: "jti-1" });
  });

  it("round-trips a session token", async () => {
    const t = await signSessionToken("ana@motor.com", secret);
    expect(await verifySessionToken(t, secret)).toEqual({ email: "ana@motor.com" });
  });

  it("a link token is not a session and vice versa", async () => {
    const link = await signLinkToken("ana@motor.com", "jti-2", secret);
    await expect(verifySessionToken(link, secret)).rejects.toThrow();
    const session = await signSessionToken("ana@motor.com", secret);
    await expect(verifyLinkToken(session, secret)).rejects.toThrow();
  });

  it("rejects the wrong secret and tampering", async () => {
    const t = await signSessionToken("ana@motor.com", secret);
    await expect(verifySessionToken(t, other)).rejects.toThrow();
    await expect(verifySessionToken(t.slice(0, -2) + "xx", secret)).rejects.toThrow();
  });
});
