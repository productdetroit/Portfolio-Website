import CountUp from "@/components/CountUp";
import {
  asOfLine,
  isQuiet,
  isStaleView,
  shippedStamp,
  staleSummary,
} from "@/lib/buildlog/format";
import type { Duration, ProductBuildLog } from "@/lib/buildlog/types";

/** The drafting register (spec §6, PDW-6 design). Server component —
 *  values arrive rendered; CountUp animates them once after hydration. */

type Tile = {
  label: string;
  title: string;
  note: string;
  value: number;
  unit?: string;
  denominator?: number;
  /** Median tiles carry the product's caveat when its medians can't be
   *  trusted — see ProductConfig.medianCaveat. */
  caveated?: boolean;
};

/** "2026-06-25" → "25 June 2026". */
function humanDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

function tiles(log: ProductBuildLog, stale: boolean): Tile[] {
  const dur = (d: Duration) => d.unit;
  const all: (Tile | null)[] = [
    // Stale view (update-spec §4.1): the elapsed-days framing is replaced by
    // the cumulative summary line, so the tile is dropped and the grid reflows.
    stale
      ? null
      : {
          label: "Days building",
          title: `Whole days since ${humanDate(log.startDate)}, America/Detroit.`,
          note: `Since ${humanDate(log.startDate)}, day one for ${log.productName}.`,
          value: log.daysBuilding,
        },
    {
      label: "Work items delivered",
      title:
        "Jira issues of type Story or Task with status Done. An epic is a container and a bug is a correction, so neither counts.",
      note: "Stories and tasks closed Done in Jira, in production.",
      value: log.featuresLive,
    },
    {
      label: "Median idea → live",
      title:
        "Median time from issue created to resolved across Stories, Tasks and Bugs.",
      note: "Median created → resolved, all issue types.",
      value: log.cycleTime.value,
      unit: dur(log.cycleTime),
      caveated: true,
    },
    {
      label: "Spec → shipped",
      title: "Median time from epic created to epic resolved — spec to shipped.",
      note: "Median epic lifetime: Confluence spec to production.",
      value: log.specToShipped.value,
      unit: dur(log.specToShipped),
      caveated: true,
    },
    {
      label: "Specs written",
      title: "Confluence pages in this product’s space, excluding templates.",
      note: "Problem, data model, architecture decision — before code.",
      value: log.specsWritten,
    },
    log.epics.total > 0
      ? {
          label: "Epics complete",
          title: "Jira epics with status Done, out of all epics created.",
          note: "Done of created. The rest are sequenced, not stalled.",
          value: log.epics.done,
          denominator: log.epics.total,
        }
      : null,
  ];
  // Spec 6.3: never render zero — omit the tile and let the grid reflow.
  return all.filter((t): t is Tile => t !== null && t.value > 0);
}

export default function Scoreboard({ log }: { log: ProductBuildLog }) {
  const stale = isStaleView(log.lastShipped);
  const primary = tiles(log, stale);
  const quiet = isQuiet(log.lastShipped);

  return (
    <section aria-labelledby="reg-h" className="reg-section">
      <div className="reg-head">
        <h2 id="reg-h" className="reg-title">
          Register · {log.productName}
        </h2>
        <p className="reg-asof">{stale ? staleSummary(log) : asOfLine(log)}</p>
        <a
          className="reg-source"
          href="https://github.com/productdetroit"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/productdetroit <span aria-hidden="true">↗</span>
        </a>
      </div>

      <dl className="reg-grid">
        {primary.map((t, i) => (
          <div key={t.label} className="reg-tile" title={t.title}>
            <dt className="reg-tile-head">
              <span className="reg-label">{t.label}</span>
              <span className="reg-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </dt>
            <dd>
              <span className="reg-number">
                <CountUp value={t.value} order={i} />
                {t.unit ? <span className="reg-unit">{t.unit}</span> : null}
                {t.denominator ? (
                  <>
                    <span className="reg-slash">/</span>
                    <span className="reg-denominator">{t.denominator}</span>
                  </>
                ) : null}
              </span>
              <span className="reg-note">{t.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Spec §7: MotorAdvisor's medians measure the day its backlog was
          reconciled, not cycle time. Shown with the caveat rather than hidden
          — a suppressed tile invites the reader to assume the number is bad,
          when what is actually true is that it is measuring something else. */}
      {log.medianCaveat && primary.some((t) => t.caveated) ? (
        <p className="reg-caveat">
          <strong>On the medians:</strong> {log.medianCaveat}
        </p>
      ) : null}

      <dl className="reg-secondary">
        {log.pullRequests > 0 ? (
          <div
            className="reg-sec-item"
            title={`Merged pull requests across every repository ${log.productName} ships from. Portfolio repos are not counted.`}
          >
            <dt>Pull requests merged</dt>
            <dd>{log.pullRequests}</dd>
          </div>
        ) : null}
        {log.productionDeploys > 0 ? (
          <div
            className="reg-sec-item"
            title={`Vercel production deployments in state READY across every ${log.productName} project.`}
          >
            <dt>Production deploys</dt>
            <dd>{log.productionDeploys}</dd>
          </div>
        ) : null}
        {log.linesOfCode > 0 ? (
          <div
            className="reg-sec-item"
            title={`Net lines merged across every repository ${log.productName} ships from: additions minus deletions over all merged pull requests — code, config and lockfiles alike.`}
          >
            <dt>Lines of code</dt>
            <dd>{log.linesOfCode.toLocaleString("en-US")}</dd>
          </div>
        ) : null}
        <div
          className="reg-sec-item"
          title="Every merged pull request on the TopHand repo was reviewed by Joe."
        >
          <dt>Reviewed by me</dt>
          <dd>100%</dd>
        </div>
      </dl>

      {log.lastShipped && !stale ? (
        <dl
          className="reg-shipped"
          title={
            quiet
              ? "Most recent production milestone."
              : "Newest production deployment on Vercel: commit subject and relative time."
          }
        >
          <dt className="reg-shipped-label">
            <span className="reg-dot" aria-hidden="true" />
            {quiet ? "Latest milestone" : "Last shipped"}
          </dt>
          <dd className="reg-shipped-value">
            {log.lastShipped.subject}{" "}
            <span className="reg-shipped-when">
              {shippedStamp(log.lastShipped)}
            </span>
          </dd>
        </dl>
      ) : null}
    </section>
  );
}
