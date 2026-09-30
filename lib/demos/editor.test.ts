import { describe, expect, it } from "vitest";
import { DEFAULT_BODY, demoFromFields, fieldsFromDemo, today } from "./editor";

const base = { title: "T", summary: "", updated: "", video: "", access: "", links: "", body: "" };

describe("demoFromFields", () => {
  it("parses links and rules from lines", () => {
    const r = demoFromFields(
      { ...base, links: "Open | https://a.example\n\nMCP|https://a.example/mcp", access: "@Motor.com\nana@x.io", updated: "2026-09-21" },
      "s",
    );
    expect(r).toMatchObject({
      ok: true,
      demo: {
        slug: "s",
        updated: "2026-09-21",
        links: [
          { label: "Open", href: "https://a.example" },
          { label: "MCP", href: "https://a.example/mcp" },
        ],
        access: ["@motor.com", "ana@x.io"],
      },
    });
  });
  it("names the field that's wrong", () => {
    expect(demoFromFields({ ...base, title: " " }, "s")).toMatchObject({ ok: false, error: /title/ });
    expect(demoFromFields({ ...base, updated: "Sep 21" }, "s")).toMatchObject({ ok: false, error: /YYYY-MM-DD/ });
    expect(demoFromFields({ ...base, links: "no url here" }, "s")).toMatchObject({ ok: false, error: /Label \| https/ });
    expect(demoFromFields({ ...base, access: "not-an-email" }, "s")).toMatchObject({ ok: false, error: /email or @domain/ });
    expect(demoFromFields({ ...base, video: "../x.mp4" }, "s")).toMatchObject({ ok: false, error: /Video filename/ });
  });
  it("round-trips fieldsFromDemo", () => {
    const r = demoFromFields({ ...base, links: "A | https://a.example", access: "@m.com", body: "hi", video: "w.mp4" }, "s");
    if (!r.ok) throw new Error(r.error);
    expect(fieldsFromDemo(r.demo)).toEqual({ title: "T", summary: "", updated: expect.any(String), video: "w.mp4", access: "@m.com", links: "A | https://a.example", body: "hi" });
    expect(fieldsFromDemo().body).toBe(DEFAULT_BODY);
  });

  it("starts Updated at today in Detroit, even when editing an older demo", () => {
    const r = demoFromFields({ ...base, updated: "2026-09-21" }, "s");
    if (!r.ok) throw new Error(r.error);
    // 01:30 UTC on the 30th is still the evening of the 29th in Detroit.
    const now = new Date("2026-09-30T01:30:00Z");
    expect(fieldsFromDemo(r.demo, now).updated).toBe("2026-09-29");
    expect(fieldsFromDemo(undefined, now).updated).toBe("2026-09-29");
    expect(today(new Date("2026-09-29T14:00:00Z"))).toBe("2026-09-29");
  });
});
