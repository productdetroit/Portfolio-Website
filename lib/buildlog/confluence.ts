import { fetchJson, requireEnv } from "./http";

const HOST = "https://productdetroit.atlassian.net";

type SearchResult = {
  results?: Array<{ title?: string; content?: { title?: string } }>;
  totalSize?: number;
  _links?: { next?: string };
};

/** Spec 6.1 row 5: Confluence pages in space MFS, excluding "Template - "
 *  titles. MFS only — the PD portfolio space must never count (spec §2). */
export async function getSpecsWritten(): Promise<number> {
  const email = requireEnv("confluence", "ATLASSIAN_EMAIL");
  const token = requireEnv("confluence", "ATLASSIAN_API_TOKEN");
  const auth = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

  const cql = encodeURIComponent('space = MFS AND type = page');
  let url = `${HOST}/wiki/rest/api/search?cql=${cql}&limit=100`;
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
    url = `${HOST}/wiki${next.startsWith("/wiki") ? next.slice(5) : next}`;
  }

  return count;
}
