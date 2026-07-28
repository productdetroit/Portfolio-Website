import CountUp from "@/components/CountUp";
import { asOfLine, isQuiet, shippedStamp } from "@/lib/buildlog/format";
import type { BuildLog, Duration } from "@/lib/buildlog/types";

/** The drafting register (spec §6, PDW-6 design). Server component —
 *  values arrive rendered; CountUp animates them once after hydration. */

type Tile = {
  label: string;
  title: string;
  note: string;
  value: number;
  unit?: string;
  denominator?: number;
};

function tiles(log: BuildLog): Tile[] {
  const dur = (d: Duration) => d.unit;
  const all: (Tile | null)[] = [
    {
      label: "Days building",
      title: "Whole days since 25 June 2026, America/Detroit.",
      note: "Since 25 June 2026, the first commit.",
      value: log.daysBuilding,
    },
    {
      label: "Features live",
      title: "Jira KAN issues of type Story with status Done.",
      note: "Stories closed Done in Jira, in production.",
      value: log.featuresLive,
    },
    {
      label: "Median idea → live",
      title:
        "Median time from issue created to resolved across Stories, Tasks and Bugs.",
      note: "Median created → resolved, all issue types.",
      value: log.cycleTime.value,
      unit: dur(log.cycleTime),
    },
    {
      label: "Spec → shipped",
      title: "Median time from epic created to epic resolved — spec to shipped.",
      note: "Median epic lifetime: Confluence spec to production.",
      value: log.specToShipped.value,
      unit: dur(log.specToShipped),
    },
    {
      label: "Specs written",
      title: "Confluence pages in space MFS, excluding templates.",
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

export default function Scoreboard({ log }: { log: BuildLog }) {
  const primary = tiles(log);
  const quiet = isQuiet(log.lastShipped);

  return (
    <section aria-labelledby="reg-h" className="reg-section">
      <div className="reg-head">
        <h2 id="reg-h" className="reg-title">
          Register · Live
        </h2>
        <p className="reg-asof">{asOfLine(log)}</p>
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

      <dl className="reg-secondary">
        {log.pullRequests > 0 ? (
          <div
            className="reg-sec-item"
            title="GitHub: repo productdetroit/app.tophand.ag only — merged pull requests. Portfolio repos are not counted."
          >
            <dt>Pull requests merged</dt>
            <dd>{log.pullRequests}</dd>
          </div>
        ) : null}
        {log.productionDeploys > 0 ? (
          <div
            className="reg-sec-item"
            title="Vercel production deployments in state READY for the TopHand project."
          >
            <dt>Production deploys</dt>
            <dd>{log.productionDeploys}</dd>
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

      {log.lastShipped ? (
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
