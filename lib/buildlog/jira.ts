import { fetchJson, requireEnv } from "./http";
import { medianMs, toDuration } from "./compute";
import { ProviderError, type JiraMetrics } from "./types";

const HOST = "https://productdetroit.atlassian.net";

type JiraIssue = {
  fields: {
    issuetype?: { name?: string };
    status?: { name?: string; statusCategory?: { key?: string } };
    created?: string;
    resolutiondate?: string | null;
  };
};

type SearchPage = {
  issues?: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
};

function authHeader(): string {
  const email = requireEnv("jira", "ATLASSIAN_EMAIL");
  const token = requireEnv("jira", "ATLASSIAN_API_TOKEN");
  return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
}

/** One paginated search over project KAN supplies all four Jira metrics
 *  (spec 6.1 rows 2-4 and 6; PDW-4). */
export async function getJiraMetrics(): Promise<JiraMetrics> {
  const auth = authHeader();
  const issues: JiraIssue[] = [];
  let nextPageToken: string | undefined;

  for (let page = 0; page < 10; page++) {
    const body: Record<string, unknown> = {
      jql: "project = KAN",
      fields: ["issuetype", "status", "created", "resolutiondate"],
      maxResults: 100,
    };
    if (nextPageToken) body.nextPageToken = nextPageToken;

    const data = await fetchJson<SearchPage>(
      "jira",
      `${HOST}/rest/api/3/search/jql`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    issues.push(...(data.issues ?? []));
    if (data.isLast !== false || !data.nextPageToken) break;
    nextPageToken = data.nextPageToken;
  }

  if (issues.length === 0) {
    throw new ProviderError("jira", "search returned no issues for KAN");
  }

  const isDone = (i: JiraIssue) =>
    i.fields.status?.statusCategory?.key === "done" ||
    i.fields.status?.name === "Done";
  const type = (i: JiraIssue) => i.fields.issuetype?.name ?? "";
  const resolvedMs = (i: JiraIssue): number | null => {
    const { created, resolutiondate } = i.fields;
    if (!created || !resolutiondate) return null;
    const delta = Date.parse(resolutiondate) - Date.parse(created);
    return Number.isFinite(delta) && delta >= 0 ? delta : null;
  };

  const featuresLive = issues.filter(
    (i) => type(i) === "Story" && isDone(i),
  ).length;

  const cycleSamples = issues
    .filter((i) => ["Story", "Task", "Bug"].includes(type(i)))
    .map(resolvedMs)
    .filter((v): v is number => v !== null);
  const cycleMedian = medianMs(cycleSamples);

  const epicsAll = issues.filter((i) => type(i) === "Epic");
  const epicSamples = epicsAll
    .map(resolvedMs)
    .filter((v): v is number => v !== null);
  const epicMedian = medianMs(epicSamples);

  if (cycleMedian === null || epicMedian === null) {
    throw new ProviderError("jira", "no resolved issues to compute medians");
  }

  return {
    featuresLive,
    cycleTime: toDuration(cycleMedian),
    specToShipped: toDuration(epicMedian),
    epics: {
      done: epicsAll.filter(isDone).length,
      total: epicsAll.length,
    },
  };
}
