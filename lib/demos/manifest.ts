/** A demo is one folder in the private Blob store:
 *
 *    demos/<slug>/demo.md      frontmatter + markdown body
 *    demos/<slug>/<video>      referenced by the frontmatter `video:` key
 *
 *  This module turns `demo.md` into a typed record. Pure — the Blob reads
 *  live in store.ts. Content is authored by Joe, never by viewers, so the
 *  parser is trusting about shape and strict only about the slug. */
import matter from "gray-matter";

export type DemoLink = { label: string; href: string };

export type Demo = {
  slug: string;
  title: string;
  /** One line under the title on the index and the demo page. */
  summary: string;
  /** ISO date shown as "Updated …". Optional. */
  updated?: string;
  /** Filename of the video inside the demo's folder, e.g. `walkthrough.mp4`. */
  video?: string;
  /** Emails and `@domain` rules — see access.ts. */
  access: string[];
  /** Quick links rendered above the body: the live app, the MCP endpoint… */
  links: DemoLink[];
  /** Markdown body — instructions, context, what to try. */
  body: string;
};

/** Slug is the folder name and the URL segment: lowercase, digits, hyphens.
 *  Anything else is rejected before it reaches a blob pathname or a route. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(s: unknown): s is string {
  return typeof s === "string" && SLUG_RE.test(s);
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  if (typeof v === "string")
    return v
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean);
  return [];
}

function linkList(v: unknown): DemoLink[] {
  if (!Array.isArray(v)) return [];
  const out: DemoLink[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const label = str((item as Record<string, unknown>).label);
    const href = str((item as Record<string, unknown>).href);
    if (label && /^https?:\/\//.test(href)) out.push({ label, href });
  }
  return out;
}

/** Parse one `demo.md`. Throws on a bad slug or a missing title so a broken
 *  upload fails loudly in the publish script rather than silently vanishing
 *  from the index. */
export function parseDemo(slug: string, markdown: string): Demo {
  if (!isSlug(slug)) throw new Error(`bad demo slug: ${JSON.stringify(slug)}`);
  const { data, content } = matter(markdown);
  const title = str(data.title);
  if (!title) throw new Error(`${slug}/demo.md: frontmatter needs a title`);
  const video = str(data.video) || undefined;
  if (video && (video.includes("/") || video.includes("..")))
    throw new Error(`${slug}/demo.md: video must be a bare filename`);
  const updated =
    data.updated instanceof Date
      ? data.updated.toISOString().slice(0, 10)
      : str(data.updated) || undefined;
  return {
    slug,
    title,
    summary: str(data.summary),
    updated,
    video,
    access: strList(data.access),
    links: linkList(data.links),
    body: content.trim(),
  };
}

/** The pathname prefix for one demo's folder, and the well-known file names. */
export const DEMOS_PREFIX = "demos/";
export const MANIFEST_FILE = "demo.md";

export function demoFolder(slug: string): string {
  return `${DEMOS_PREFIX}${slug}/`;
}

/** `demos/<slug>/demo.md` → `<slug>`, or null for anything else under the prefix
 *  (video files, the `_log/` and `_tokens/` bookkeeping folders). */
export function slugFromManifestPath(pathname: string): string | null {
  const m = pathname.match(/^demos\/([^/]+)\/demo\.md$/);
  if (!m || !isSlug(m[1])) return null;
  return m[1];
}
