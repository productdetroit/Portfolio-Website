import { describe, expect, it } from "vitest";
import type { Invite } from "./invites";
import type { Demo } from "./manifest";
import { renderOpenedNotice, waited } from "./notify";

const demo: Demo = { slug: "motor-quote", title: "MotorAdvisor <pitch>", summary: "", access: [], links: [], body: "" };
const invite: Invite = {
  slug: "motor-quote",
  email: "ana@motor.com",
  name: "Ana Lopez",
  subject: "s",
  message: "m",
  invitedAt: "2026-09-29T14:00:00.000Z",
  invitedBy: "joe@productdetroit.com",
  lastSentAt: "2026-09-29T14:00:00.000Z",
};

describe("waited", () => {
  const t0 = new Date("2026-09-29T14:00:00Z");
  const plus = (min: number) => new Date(t0.getTime() + min * 60000);
  it("picks a readable unit", () => {
    expect(waited(t0, plus(1))).toBe("1 minute");
    expect(waited(t0, plus(45))).toBe("45 minutes");
    expect(waited(t0, plus(180))).toBe("3 hours");
    expect(waited(t0, plus(60 * 72))).toBe("3 days");
    expect(waited(plus(5), t0)).toBe("0 minutes");
  });
});

describe("renderOpenedNotice", () => {
  const opened = new Date("2026-09-30T16:30:00Z");
  const n = renderOpenedNotice(invite, demo, opened, "Mozilla/5.0 <x>", "https://productdetroit.com/demos/access");

  it("names the person and the demo in the subject", () => {
    expect(n.subject).toBe("Ana Lopez opened MotorAdvisor <pitch>");
    expect(renderOpenedNotice({ ...invite, name: "" }, demo, opened, null, "u").subject).toBe("ana@motor.com opened MotorAdvisor <pitch>");
  });

  it("gives when, in Detroit time, and how long after the invite", () => {
    expect(n.text).toContain("Opened: Sep 30, 2026, 12:30 PM EDT");
    expect(n.text).toContain("27 hours earlier");
    expect(n.text).toContain("Access log: https://productdetroit.com/demos/access");
  });

  it("escapes everything in the HTML and omits a missing browser", () => {
    expect(n.html).toContain("MotorAdvisor &lt;pitch&gt;");
    expect(n.html).toContain("Mozilla/5.0 &lt;x&gt;");
    expect(n.html).not.toContain("<pitch>");
    expect(renderOpenedNotice(invite, demo, opened, null, "u").text).not.toContain("Browser:");
  });
});
