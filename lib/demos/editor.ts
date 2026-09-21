/** The editor's fields ⇄ a Demo. Pure; the actions file wraps this with
 *  the Blob checks. Fields are what the form posts: strings, newline-
 *  separated lists for access rules and links. */
import type { Demo } from "./manifest";
import { safeVideoName } from "./video";

export type EditorFields = {
  title: string;
  summary: string;
  updated: string;
  video: string;
  access: string;
  links: string;
  body: string;
};

const norm = (s: unknown) => (typeof s === "string" ? s.replace(/\r\n/g, "\n").trim() : "");
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function demoFromFields(raw: Record<string, unknown>, slug: string): { ok: true; demo: Demo } | { ok: false; error: string } {
  const title = norm(raw.title);
  if (!title) return { ok: false, error: "The demo needs a title." };
  const updated = norm(raw.updated);
  if (updated && !/^\d{4}-\d{2}-\d{2}$/.test(updated)) return { ok: false, error: "Updated must be a date (YYYY-MM-DD)." };

  const links = [];
  for (const line of lines(norm(raw.links))) {
    const [label, href] = line.split("|").map((s) => s.trim());
    if (!label || !/^https?:\/\/\S+$/.test(href ?? "")) return { ok: false, error: `Link "${line}" should read "Label | https://…".` };
    links.push({ label, href });
  }

  const access = lines(norm(raw.access)).map((r) => r.toLowerCase());
  for (const r of access) {
    if (!/^(@|[^@\s]+@)[^@\s]+\.[^@\s]+$/.test(r)) return { ok: false, error: `Access rule "${r}" should be an email or @domain.` };
  }

  const video = norm(raw.video) || undefined;
  if (video && safeVideoName(video) !== video) return { ok: false, error: "Video filename is not valid." };

  return {
    ok: true,
    demo: { slug, title, summary: norm(raw.summary), updated: updated || undefined, video, access, links, body: norm(raw.body) },
  };
}

/** What to put in the form for an existing demo (or a blank one). */
export function fieldsFromDemo(demo?: Demo): EditorFields {
  return {
    title: demo?.title ?? "",
    summary: demo?.summary ?? "",
    updated: demo?.updated ?? new Date().toISOString().slice(0, 10),
    video: demo?.video ?? "",
    access: (demo?.access ?? []).join("\n"),
    links: (demo?.links ?? []).map((l) => `${l.label} | ${l.href}`).join("\n"),
    body: demo?.body ?? DEFAULT_BODY,
  };
}

export const DEFAULT_BODY = `## What you're looking at

Two or three sentences of context: what the product does, what stage it's at, and what to pay attention to in the video.

## Try it yourself

1. Open the live app with the button above.
2. Do the thing the video shows.
3. Then try breaking it.

## What I'd love to hear

- Where did the flow feel wrong?
- What would you need to see before using this for real?`;
