/** Manual live-credential check for the four providers, per product (PDW-4 AC 1).
 *  Run: npx tsx scripts/test-providers.ts [jira|confluence|github|vercel ...]
 *  Reads env vars; providers without credentials are reported, not thrown. */
import { getJiraMetrics } from "../lib/buildlog/jira";
import { getSpecsWritten } from "../lib/buildlog/confluence";
import { getPullRequestsMerged } from "../lib/buildlog/github";
import { getVercelMetrics } from "../lib/buildlog/vercel";
import { PRODUCTS } from "../lib/buildlog/products";

const only = process.argv.slice(2);
const want = (name: string) => only.length === 0 || only.includes(name);

async function run(name: string, fn: () => Promise<unknown>) {
  if (!want(name)) return;
  try {
    const started = Date.now();
    const result = await fn();
    console.log(`✔ ${name} (${Date.now() - started}ms):`, JSON.stringify(result));
  } catch (err) {
    console.log(`✘ ${name}:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

async function main() {
  for (const product of PRODUCTS) {
    console.log(`\n── ${product.name} ──`);
    await run(`jira`, () => getJiraMetrics(product));
    await run(`confluence`, () => getSpecsWritten(product));
    await run(`github`, () => getPullRequestsMerged(product));
    await run(`vercel`, () => getVercelMetrics(product));
  }
}

void main();
