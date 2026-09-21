import { describe, expect, it } from "vitest";
import { defaultMessage, defaultSubject, messageToHtml, renderInviteEmail, validateInviteInput, type Invite } from "./invites";
import type { Demo } from "./manifest";

const demo: Demo = {
  slug: "motor-quote",
  title: "MotorAdvisor — quote-to-invoice",
  summary: "The advisor flow end to end.",
  access: [],
  links: [],
  body: "",
};

describe("defaults", () => {
  it("names the demo in the subject and greets by first name", () => {
    expect(defaultSubject(demo)).toBe("A demo for you: MotorAdvisor — quote-to-invoice");
    expect(defaultMessage(demo, "Ana Lopez")).toMatch(/^Hi Ana,\n/);
    expect(defaultMessage(demo)).toMatch(/^Hi,\n/);
    expect(defaultMessage(demo)).toContain("MotorAdvisor — quote-to-invoice — The advisor flow end to end.");
  });
});

describe("validateInviteInput", () => {
  it("trims and normalizes line endings", () => {
    const r = validateInviteInput({ name: " Ana ", subject: " Hello ", message: "Hi\r\n\r\nthere " });
    expect(r).toEqual({ ok: true, value: { name: "Ana", subject: "Hello", message: "Hi\n\nthere" } });
  });
  it("rejects empties, overlong fields and multi-line subjects", () => {
    expect(validateInviteInput({ name: "", subject: "", message: "x" })).toMatchObject({ ok: false, error: /Subject/ });
    expect(validateInviteInput({ name: "", subject: "s", message: " " })).toMatchObject({ ok: false, error: /Message/ });
    expect(validateInviteInput({ name: "", subject: "a\nb", message: "x" })).toMatchObject({ ok: false, error: /line breaks/ });
    expect(validateInviteInput({ name: "", subject: "s", message: "x".repeat(4001) })).toMatchObject({ ok: false, error: /4000/ });
  });
});

describe("messageToHtml", () => {
  it("makes paragraphs, keeps single line breaks, escapes markup", () => {
    expect(messageToHtml("Hi Ana,\nline two\n\n<b>bold</b> & done")).toBe(
      "<p>Hi Ana,<br>line two</p>\n<p>&lt;b&gt;bold&lt;/b&gt; &amp; done</p>",
    );
  });
});

describe("renderInviteEmail", () => {
  const invite: Invite = {
    slug: "motor-quote",
    email: "ana@motor.com",
    name: "Ana",
    subject: "s",
    message: "Hi Ana,\n\nTake a look.",
    invitedAt: "2026-09-21T00:00:00.000Z",
    invitedBy: "joe@productdetroit.com",
    lastSentAt: "2026-09-21T00:00:00.000Z",
  };
  it("puts the message first and the link in both parts", () => {
    const link = "https://productdetroit.com/demos/verify?token=abc";
    const { text, html } = renderInviteEmail(invite, demo, link);
    expect(text.startsWith("Hi Ana,\n\nTake a look.")).toBe(true);
    expect(text).toContain(`Open the demo: ${link}`);
    expect(text).toContain("signs you in as ana@motor.com");
    expect(html).toContain(`href="${link}"`);
    expect(html).toContain("<p>Hi Ana,</p>");
  });
});
