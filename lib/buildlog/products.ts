/** Per-product configuration for the build log (spec §8).
 *
 *  The page's thesis is "one operating model, run at every scale." A register
 *  per product is that claim instantiated; one merged register erases it. So
 *  every provider is parameterised by product rather than hardcoded to TopHand.
 */

/** Every product with a register. The single source of this union — the page
 *  content (content/products.tsx) and the payload contract (types.ts) both
 *  key off it, so a product can never be half-added. */
export type ProductId =
  | "tophand"
  | "motoradvisor"
  | "onward"
  | "writehome"
  | "bookevents";

export type ProductConfig = {
  id: ProductId;
  name: string;
  /** Jira project key — one per product. */
  jiraProject: string;
  /** Ticket prefix in commit subjects. Same as the project key today, but the
   *  two are conceptually different things and one has already diverged once. */
  ticketPrefix: string;
  /** Confluence space key. MFS is a dead FarmBoard-era name kept deliberately:
   *  it is wired into every existing page URL. */
  confluenceSpace: string;
  /** Every repository the product ships from.
   *
   *  TopHand ships from two. This is not a detail — KAN-123 shipped to
   *  production in tophand_website on 27 July and sat in Idea for three weeks
   *  because the reconciliation only read the app repo. Anything that reads one
   *  under-reports the product. */
  githubRepos: string[];
  /** Every Vercel project the product deploys to. MotorAdvisor has two
   *  surfaces (web app, MCP server — the Editorial Studio was retired and its
   *  Vercel project deleted on 18 Sep 2026, MOT-346); TopHand has two (app and
   *  marketing site). Deploys sum across all of them. */
  vercelProjectIds: string[];
  /** Day one for this product's "days building" tile.
   *
   *  Both dates are pinned constants rather than queried, for the same reason
   *  the deploy count keeps a committed baseline: Vercel prunes old
   *  deployments. MotorAdvisor's first production deploy (2026-08-09) is still
   *  retrievable and matches its first commit. TopHand's is not — everything
   *  before 2026-07-22 has been pruned, and dating TopHand from there would
   *  erase four weeks and make the older product look younger. */
  startDate: string;
  /** Rendered under the median tiles when the medians cannot be trusted. */
  medianCaveat?: string;
};

export const PRODUCTS: readonly ProductConfig[] = [
  {
    id: "tophand",
    name: "TopHand",
    jiraProject: "KAN",
    ticketPrefix: "KAN",
    confluenceSpace: "MFS",
    githubRepos: [
      "productdetroit/app.tophand.ag",
      "productdetroit/tophand_website",
    ],
    vercelProjectIds: [
      "prj_BSzl67wnbyvpvORNXZLZvMTKxFO0", // app.tophand.ag
      "prj_tDgXuxp8Xa4WDmoXgeZaXS0A7koG", // tophand-website
    ],
    startDate: "2026-06-25",
  },
  {
    id: "motoradvisor",
    name: "MotorAdvisor",
    jiraProject: "MOT",
    ticketPrefix: "MOT",
    confluenceSpace: "Motor",
    githubRepos: ["productdetroit/motor"],
    vercelProjectIds: [
      "prj_ighLLDZ0WOnHMjJpeQObOHvFejsR", // motor-web
      "prj_e0DsYKSSXFWSUHoohFHuQYIORuKU", // motor-mcp
    ],
    startDate: "2026-08-09",
    /** Spec §7. 106 issues were transitioned to Done in one reconciliation on
     *  17 Aug 2026, and `resolutiondate` is system-set and cannot be backdated.
     *  Every one of them therefore carries that date, so both medians measure
     *  the day the backlog was tidied rather than how long the work took.
     *  Counts, epics complete and deploys are unaffected and honest. */
    medianCaveat:
      "Backlog reconciled 17 Aug 2026; these medians measure that cleanup, not cycle time. Honest from work completed after that date.",
  },
  {
    id: "onward",
    name: "Onward",
    jiraProject: "ONWARD",
    ticketPrefix: "ONWARD",
    /** "Lecacy" is the space key; every URL renders the alias /spaces/Onward.
     *  CQL matches on the key, so the typo is what goes here — the same kind
     *  of dead-name-kept-deliberately as TopHand's MFS. */
    confluenceSpace: "Lecacy",
    githubRepos: ["productdetroit/onward"],
    vercelProjectIds: [
      "prj_cocjRrfmQKbtIjZBMRKQ8HMFsV1a", // onward — onwardlegacy.com
      "prj_AZnUzYDtIFEYofQVemUghCfoAuFR", // onward-app — app.onwardlegacy.com
    ],
    /** First commit, 29 Aug 2026 — the landing page out of Claude Design.
     *  Pinned for the same reason as the two above: Vercel prunes. */
    startDate: "2026-08-29",
  },
  {
    id: "writehome",
    name: "Write Home",
    jiraProject: "WH",
    ticketPrefix: "WH",
    confluenceSpace: "WH",
    githubRepos: ["productdetroit/writehome"],
    vercelProjectIds: [
      "prj_mjzOgmtqQ4DEjXzpvnADWw7hrIxA", // writehome — writehome.ink
    ],
    startDate: "2026-09-07",
  },
  {
    id: "bookevents",
    name: "Book Events",
    jiraProject: "BE",
    ticketPrefix: "BE",
    confluenceSpace: "Bookevents",
    /** Two repos for the same reason TopHand has two: the embedded Shopify
     *  app and the marketing site ship separately. */
    githubRepos: [
      "productdetroit/bookevents-app",
      "productdetroit/bookevents",
    ],
    vercelProjectIds: [
      "prj_Bp6x9ASDhrBX9E5sRAJdYzDs4ttJ", // bookevents-app
      "prj_bTEvXybHKH7PZYy6fzMWJyWQsgdw", // bookevents — bookevents.app
    ],
    startDate: "2026-09-01",
  },
] as const;

export const TEAM_ID = "team_QPNvbUaSuTv0tNOvAo4Tt7Xg";
export const ATLASSIAN_HOST = "https://productdetroit.atlassian.net";

export function productById(id: ProductConfig["id"]): ProductConfig {
  const found = PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`unknown product: ${id}`);
  return found;
}

/** Day one for the portfolio is the earliest product's day one.
 *
 *  A span, never a sum. Elapsed days from two concurrent products cannot be
 *  added — that would claim more calendar time than has passed. */
export function portfolioStartDate(): string {
  return PRODUCTS.map((p) => p.startDate).sort()[0];
}
