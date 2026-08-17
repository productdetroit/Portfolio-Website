/** Per-product configuration for the build log (spec §8).
 *
 *  The page's thesis is "one operating model, run at two scales." Two registers
 *  side by side are that claim instantiated; one merged register erases it. So
 *  every provider is parameterised by product rather than hardcoded to TopHand.
 */

export type ProductConfig = {
  id: "tophand" | "motoradvisor";
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
  /** Every Vercel project the product deploys to. MotorAdvisor has three
   *  surfaces (web app, MCP server, Editorial Studio); TopHand has two (app and
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
      "prj_zOKvKn7FKR2bxs0nIzEi1w62kk7z", // motor-studio
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
