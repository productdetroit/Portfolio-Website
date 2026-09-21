/** Video naming and limits. Dependency-free so the browser-side editor can
 *  import it without dragging the manifest parser into the client bundle. */
export const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"]);
export const VIDEO_CONTENT_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
/** Vercel Blob's multipart ceiling is far higher; this is a sanity cap. */
export const VIDEO_MAX_BYTES = 4 * 1024 * 1024 * 1024;

/** What the editor accepts as a video filename: the browser's name, made
 *  safe for a URL path. `My Demo (final).MOV` → `my-demo-final.mov`. */
export function safeVideoName(original: string): string | null {
  const dot = original.lastIndexOf(".");
  if (dot <= 0) return null;
  const ext = original.slice(dot + 1).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(ext)) return null;
  const stem = original
    .slice(0, dot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${stem || "video"}.${ext}`;
}
