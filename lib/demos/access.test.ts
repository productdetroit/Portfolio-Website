import { describe, expect, it } from "vitest";
import { canView, isOwner, mayRequestLink, normalizeEmail, ruleMatches } from "./access";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Ana@Motor.COM ")).toBe("ana@motor.com");
  });
  it("rejects non-addresses and path-breaking characters", () => {
    for (const bad of ["", "ana", "ana@", "@motor.com", "a b@motor.com", "a/b@motor.com", 42, null])
      expect(normalizeEmail(bad)).toBeNull();
  });
});

describe("ruleMatches", () => {
  it("matches a full address exactly, case-insensitively", () => {
    expect(ruleMatches("Ana@Motor.com", "ana@motor.com")).toBe(true);
    expect(ruleMatches("ana@motor.com", "bob@motor.com")).toBe(false);
  });
  it("a bare @domain admits anyone at that domain only", () => {
    expect(ruleMatches("@motor.com", "ana@motor.com")).toBe(true);
    expect(ruleMatches("@motor.com", "ana@notmotor.com")).toBe(false);
    expect(ruleMatches("@motor.com", "ana@motor.com.evil.io")).toBe(false);
    expect(ruleMatches("@motor.com", "ana@sub.motor.com")).toBe(false);
  });
  it("ignores blank rules", () => {
    expect(ruleMatches("  ", "ana@motor.com")).toBe(false);
  });
});

describe("canView / isOwner / mayRequestLink", () => {
  const demos = [{ access: ["@motor.com"] }, { access: ["cal@other.io"] }];
  const owners = ["joe@productdetroit.com"];
  it("owners may request a link even when on no list", () => {
    expect(isOwner("joe@productdetroit.com", owners)).toBe(true);
    expect(mayRequestLink("joe@productdetroit.com", owners, demos)).toBe(true);
  });
  it("anyone on any demo may request a link; strangers may not", () => {
    expect(mayRequestLink("ana@motor.com", owners, demos)).toBe(true);
    expect(mayRequestLink("cal@other.io", owners, demos)).toBe(true);
    expect(mayRequestLink("stranger@gmail.com", owners, demos)).toBe(false);
  });
  it("canView is per demo", () => {
    expect(canView("ana@motor.com", demos[0].access)).toBe(true);
    expect(canView("ana@motor.com", demos[1].access)).toBe(false);
  });
});
