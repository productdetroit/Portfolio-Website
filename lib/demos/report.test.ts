import { describe, expect, it } from "vitest";
import type { Demo } from "./manifest";
import { buildReport } from "./report";

const demo = (slug: string, access: string[]): Demo => ({
  slug,
  title: slug,
  summary: "",
  access,
  links: [],
  body: "",
});

const d = (n: number) => new Date(2026, 8, n);

describe("buildReport", () => {
  const demos = [demo("motor", ["ana@motor.com", "@motor.com"]), demo("other", ["cal@other.io"])];
  const signIns = [
    { email: "ana@motor.com", at: d(1) },
    { email: "ana@motor.com", at: d(3) },
    { email: "bob@motor.com", at: d(2) },
    { email: "joe@productdetroit.com", at: d(4) },
  ];
  const views = [
    { email: "ana@motor.com", slug: "motor", at: d(3) },
    { email: "ana@motor.com", slug: "other", at: d(3) },
    { email: "joe@productdetroit.com", slug: "motor", at: d(4) },
  ];
  const report = buildReport(demos, signIns, views);

  it("counts sign-ins per invited email and views per demo", () => {
    const [motor] = report.perDemo;
    expect(motor.rules[0]).toMatchObject({
      kind: "email",
      rule: "ana@motor.com",
      person: { email: "ana@motor.com", signIns: 2, firstSignIn: d(1), lastSignIn: d(3), views: 1, lastView: d(3) },
    });
  });

  it("expands a domain rule to the people from there who showed up", () => {
    const [motor] = report.perDemo;
    const rule = motor.rules[1];
    expect(rule.kind).toBe("domain");
    if (rule.kind !== "domain") return;
    expect(rule.people.map((p) => p.email)).toEqual(["ana@motor.com", "bob@motor.com"]);
    expect(rule.people[1]).toMatchObject({ signIns: 1, views: 0 });
  });

  it("shows an invitee who never signed in as pending", () => {
    const [, other] = report.perDemo;
    expect(other.rules[0]).toMatchObject({ kind: "email", person: { email: "cal@other.io", signIns: 0, views: 0 } });
  });

  it("lists sign-ins matched by no rule under others", () => {
    expect(report.others.map((p) => p.email)).toEqual(["joe@productdetroit.com"]);
    expect(report.others[0]).toMatchObject({ signIns: 1, views: 1 });
  });
});
