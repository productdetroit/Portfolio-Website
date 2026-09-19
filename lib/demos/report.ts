/** Turns the raw access log into what Joe wants to know: for each demo,
 *  who was invited, have they signed in, and did they open it. Pure. */
import { isDomainRule, ruleMatches } from "./access";
import type { Demo } from "./manifest";
import type { SignInEvent, ViewEvent } from "./store";

export type PersonRow = {
  email: string;
  signIns: number;
  firstSignIn?: Date;
  lastSignIn?: Date;
  /** Opens of the demo this row sits under (or all demos, in `others`). */
  views: number;
  lastView?: Date;
};

export type RuleRow =
  | { kind: "email"; rule: string; person: PersonRow }
  /** A domain rule: everyone at that company who has actually shown up. */
  | { kind: "domain"; rule: string; people: PersonRow[] };

export type DemoReport = { demo: Demo; rules: RuleRow[] };

export type AccessReport = {
  perDemo: DemoReport[];
  /** Signed in, but on no current list — removed invitees, or owners. */
  others: PersonRow[];
};

function later(a: Date | undefined, b: Date) {
  return !a || b > a ? b : a;
}
function earlier(a: Date | undefined, b: Date) {
  return !a || b < a ? b : a;
}

function person(email: string, signIns: SignInEvent[], views: ViewEvent[]): PersonRow {
  const row: PersonRow = { email, signIns: 0, views: 0 };
  for (const s of signIns) {
    if (s.email !== email) continue;
    row.signIns++;
    row.firstSignIn = earlier(row.firstSignIn, s.at);
    row.lastSignIn = later(row.lastSignIn, s.at);
  }
  for (const v of views) {
    if (v.email !== email) continue;
    row.views++;
    row.lastView = later(row.lastView, v.at);
  }
  return row;
}

export function buildReport(demos: Demo[], signIns: SignInEvent[], views: ViewEvent[]): AccessReport {
  const seen = new Set<string>();
  const known = new Set(signIns.map((s) => s.email));

  const perDemo = demos.map((demo) => {
    const mine = views.filter((v) => v.slug === demo.slug);
    const rules: RuleRow[] = demo.access.map((rule) => {
      if (isDomainRule(rule)) {
        const people = [...known]
          .filter((e) => ruleMatches(rule, e))
          .sort()
          .map((e) => {
            seen.add(e);
            return person(e, signIns, mine);
          });
        return { kind: "domain", rule, people };
      }
      const email = rule.trim().toLowerCase();
      seen.add(email);
      return { kind: "email", rule, person: person(email, signIns, mine) };
    });
    return { demo, rules };
  });

  const others = [...known]
    .filter((e) => !seen.has(e))
    .sort()
    .map((e) => person(e, signIns, views));

  return { perDemo, others };
}
