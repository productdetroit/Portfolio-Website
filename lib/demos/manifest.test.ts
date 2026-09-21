import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseDemo, slugFromManifestPath } from "./manifest";

const md = (front: string, body = "Hello") => `---\n${front}\n---\n\n${body}\n`;

describe("parseDemo", () => {
  it("parses the shipped template", () => {
    const demo = parseDemo("example", readFileSync("scripts/demo-template/demo.md", "utf8"));
    expect(demo.title).toMatch(/what this demo shows/);
    expect(demo.video).toBe("walkthrough.mp4");
    expect(demo.updated).toBe("2026-09-19");
    expect(demo.access).toEqual(["ana@example.com", "@example.com"]);
    expect(demo.links).toEqual([
      { label: "Open the live app", href: "https://example.com" },
      { label: "MCP endpoint", href: "https://example.com/mcp" },
    ]);
    expect(demo.body).toMatch(/^## What you're looking at/);
  });

  it("accepts a comma-separated access string", () => {
    expect(parseDemo("x", md('title: T\naccess: "a@b.co, @c.io"')).access).toEqual(["a@b.co", "@c.io"]);
  });

  it("drops links that aren't https", () => {
    const demo = parseDemo("x", md("title: T\nlinks:\n  - label: bad\n    href: javascript:alert(1)"));
    expect(demo.links).toEqual([]);
  });

  it("rejects a bad slug, a missing title, or a video path", () => {
    expect(() => parseDemo("Bad Slug", md("title: T"))).toThrow(/slug/);
    expect(() => parseDemo("x", md("summary: no title"))).toThrow(/title/);
    expect(() => parseDemo("x", md("title: T\nvideo: ../secret.mp4"))).toThrow(/video/);
  });

  it("tolerates no frontmatter at all except the title", () => {
    const demo = parseDemo("x", md("title: Only"));
    expect(demo).toMatchObject({ slug: "x", title: "Only", summary: "", access: [], links: [], body: "Hello" });
    expect(demo.video).toBeUndefined();
  });
});

describe("slugFromManifestPath", () => {
  it("recognises only demos/<slug>/demo.md", () => {
    expect(slugFromManifestPath("demos/motor-quote/demo.md")).toBe("motor-quote");
    expect(slugFromManifestPath("demos/motor-quote/walkthrough.mp4")).toBeNull();
    expect(slugFromManifestPath("demos/_log/signin/a@b.co/1.json")).toBeNull();
    expect(slugFromManifestPath("demos/Bad_Slug/demo.md")).toBeNull();
  });
});
