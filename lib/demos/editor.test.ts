import { describe, expect, it } from "vitest";
import { DEFAULT_BODY, demoFromFields, fieldsFromDemo } from "./editor";

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
});
