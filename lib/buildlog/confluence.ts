import { fetchJson, requireEnv } from "./http";
import { ATLASSIAN_HOST, type ProductConfig } from "./products";

type SearchResult = {
  results?: Array<{ title?: string; content?: { title?: string } }>;
  totalSize?: number;
  _links?: { next?: string };
};

/** Spec 6.1 row 5: Confluence pages in the product's space, excluding
 *  "Template - " titles. One space per product — the PD portfolio space must
 *  never count (spec §2). */
export async function getSpecsWritten(
  product: ProductConfig,
): Promise<number> {
  const email = requireEnv("confluence", "ATLASSIAN_EMAIL");
  const token = requireEnv("confluence", "ATLASSIAN_API_TOKEN");
  const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

  const cql = encodeURIComponent(
    `space = "${product.confluenceSpace}" AND type = page`,
  );
  let url = `${ATLASSIAN_HOST}/wiki/rest/api/search?cql=${cql}&limit=100`;
  let count = 0;

  for (let page = 0; page < 10; page++) {
    const data = await fetchJson<SearchResult>("confluence", url, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    for (const r of data.results ?? []) {
      const title = r.title ?? r.content?.title ?? "";
      if (!/^Template - /.test(title)) count++;
    }
    const next = data._links?.next;
    if (!next) break;
    url = `${ATLASSIAN_HOST}/wiki${next.startsWith("/wiki") ? next.slice(5) : next}`;
  }

  return count;
}
