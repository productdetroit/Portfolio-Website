import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isOwnerOnlyPath, isOwnerToken } from "./owner";
import { signInviteToken, signSessionToken } from "./tokens";

const SECRET = "x".repeat(32);
const key = new TextEncoder().encode(SECRET);

describe("isOwnerOnlyPath", () => {
  it("covers /building, /consulting and everything under them", () => {
    for (const p of ["/building", "/building/tophand", "/building/opengraph-image.png", "/consulting"])
      expect(isOwnerOnlyPath(p)).toBe(true);
  });
  it("leaves the rest of the site public", () => {
    for (const p of ["/", "/demos", "/privacy", "/buildings", "/consultingx"]) expect(isOwnerOnlyPath(p)).toBe(false);
  });
});

describe("isOwnerToken", () => {
  beforeEach(() => {
    process.env.DEMO_SESSION_SECRET = SECRET;
    process.env.DEMO_OWNER_EMAILS = "joe@productdetroit.com";
  });
  afterEach(() => {
    delete process.env.DEMO_SESSION_SECRET;
    delete process.env.DEMO_OWNER_EMAILS;
  });

  it("admits an owner's session", async () => {
    expect(await isOwnerToken(await signSessionToken("joe@productdetroit.com", key))).toBe(true);
  });
  it("refuses an invitee's session, other token kinds, and garbage", async () => {
    expect(await isOwnerToken(await signSessionToken("ana@motor.com", key))).toBe(false);
    expect(await isOwnerToken(await signInviteToken("joe@productdetroit.com", "x", key))).toBe(false);
    expect(await isOwnerToken("not-a-token")).toBe(false);
    expect(await isOwnerToken(undefined)).toBe(false);
  });
  it("refuses everyone when the secret is missing", async () => {
    const token = await signSessionToken("joe@productdetroit.com", key);
    delete process.env.DEMO_SESSION_SECRET;
    expect(await isOwnerToken(token)).toBe(false);
  });
});
