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

describe("serializeDemo", () => {
  it("round-trips through parseDemo, quoting @domain rules", async () => {
    const { serializeDemo } = await import("./manifest");
    const demo = parseDemo("x", readFileSync("scripts/demo-template/demo.md", "utf8"));
    const md = serializeDemo(demo);
    expect(md).toMatch(/^---\ntitle: /);
    expect(md).toContain("'@example.com'");
    expect(parseDemo("x", md)).toEqual(demo);
  });
  it("omits empty fields and handles no body", async () => {
    const { serializeDemo } = await import("./manifest");
    const md = serializeDemo({ title: "T", summary: "", access: [], links: [], body: "" });
    expect(md).toBe("---\ntitle: T\n---\n\n");
  });
});

describe("safeVideoName", () => {
  it("slugs the stem and keeps a known extension", async () => {
    const { safeVideoName } = await import("./manifest");
    expect(safeVideoName("My Demo (final).MOV")).toBe("my-demo-final.mov");
    expect(safeVideoName("walkthrough.mp4")).toBe("walkthrough.mp4");
    expect(safeVideoName("...mp4")).toBe("video.mp4");
  });
  it("rejects unknown types", async () => {
    const { safeVideoName } = await import("./manifest");
    expect(safeVideoName("notes.txt")).toBeNull();
    expect(safeVideoName("noext")).toBeNull();
  });
});
