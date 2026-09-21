/** Publish, list, and remove private demos in the Blob store.
 *
 *    npm run demo -- publish <folder> [--slug name]
 *    npm run demo -- list
 *    npm run demo -- remove <slug>
 *
 *  A demo folder holds `demo.md` (see scripts/demo-template/demo.md) and,
 *  optionally, the video its frontmatter names. Keep demo folders OUTSIDE
 *  this repo — it is public. The slug defaults to the folder name.
 *
 *  Needs BLOB_READ_WRITE_TOKEN; `.env.local` is loaded if present
 *  (`vercel env pull` writes it once the store is connected). */
import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { del, list, put } from "@vercel/blob";
import { DEMOS_PREFIX, MANIFEST_FILE, demoFolder, isSlug, parseDemo, slugFromManifestPath } from "../lib/demos/manifest";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PRIVATE = { access: "private", addRandomSuffix: false, allowOverwrite: true } as const;

function die(msg: string): never {
  console.error(`✘ ${msg}`);
  process.exit(1);
}

async function folderBlobs(slug: string) {
  const { blobs } = await list({ prefix: demoFolder(slug), limit: 1000 });
  return blobs;
}

async function publish(folder: string, slugArg?: string) {
  const dir = resolve(folder);
  const slug = slugArg ?? basename(dir);
  if (!isSlug(slug)) die(`slug must be lowercase letters, digits and hyphens: ${slug}`);
  const mdPath = join(dir, MANIFEST_FILE);
  if (!existsSync(mdPath)) die(`${mdPath} not found`);

  const markdown = readFileSync(mdPath, "utf8");
  const demo = parseDemo(slug, markdown); // throws on a bad manifest
  if (demo.access.length === 0) console.warn("  ⚠ access list is empty — no one but owners can open this");

  const keep = new Set<string>([demoFolder(slug) + MANIFEST_FILE]);
  await put(demoFolder(slug) + MANIFEST_FILE, markdown, { ...PRIVATE, contentType: "text/markdown" });
  console.log(`  ↑ ${MANIFEST_FILE}`);

  if (demo.video) {
    const videoPath = join(dir, demo.video);
    if (!existsSync(videoPath)) die(`frontmatter names video "${demo.video}" but ${videoPath} is missing`);
    const size = statSync(videoPath).size;
    const pathname = demoFolder(slug) + demo.video;
    keep.add(pathname);
    console.log(`  ↑ ${demo.video} (${(size / 1e6).toFixed(1)} MB)…`);
    await put(pathname, readFileSync(videoPath), { ...PRIVATE, multipart: size > 50e6 });
  }

  // Anything else in the folder is a leftover from a previous publish.
  const stale = (await folderBlobs(slug)).filter((b) => !keep.has(b.pathname));
  if (stale.length) {
    await del(stale.map((b) => b.url));
    for (const b of stale) console.log(`  ✂ ${b.pathname.slice(demoFolder(slug).length)} (stale)`);
  }

  console.log(`\n✔ /demos/${slug} — "${demo.title}"`);
  console.log(`  access: ${demo.access.join(", ") || "(owners only)"}`);
}

async function listDemos() {
  const { blobs } = await list({ prefix: DEMOS_PREFIX, limit: 1000 });
  const slugs = blobs.map((b) => slugFromManifestPath(b.pathname)).filter((s): s is string => Boolean(s));
  if (slugs.length === 0) return console.log("no demos published");
  for (const slug of slugs.sort()) {
    const files = blobs.filter((b) => b.pathname.startsWith(demoFolder(slug)));
    const bytes = files.reduce((n, b) => n + b.size, 0);
    console.log(`/demos/${slug}  ${files.length} file${files.length === 1 ? "" : "s"}, ${(bytes / 1e6).toFixed(1)} MB`);
  }
}

async function remove(slug: string) {
  if (!isSlug(slug)) die(`bad slug: ${slug}`);
  const blobs = await folderBlobs(slug);
  if (blobs.length === 0) die(`no demo at /demos/${slug}`);
  await del(blobs.map((b) => b.url));
  console.log(`✔ removed /demos/${slug} (${blobs.length} file${blobs.length === 1 ? "" : "s"})`);
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) die("BLOB_READ_WRITE_TOKEN is not set — run `vercel env pull`");
  const [cmd, arg, ...rest] = process.argv.slice(2);
  const slugFlag = rest.indexOf("--slug");
  switch (cmd) {
    case "publish":
      if (!arg) die("usage: demo publish <folder> [--slug name]");
      return publish(arg, slugFlag >= 0 ? rest[slugFlag + 1] : undefined);
    case "list":
      return listDemos();
    case "remove":
      if (!arg) die("usage: demo remove <slug>");
      return remove(arg);
    default:
      die("usage: demo publish <folder> | list | remove <slug>");
  }
}

main().catch((err) => die(err instanceof Error ? err.message : String(err)));
