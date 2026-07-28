import Link from "next/link";
import CountUp from "@/components/CountUp";
import type { BuildLog } from "@/lib/buildlog/types";

/** Home-page teaser strip — three metrics and the link to /building
 *  (spec §4, PDW-8). Proof without a click; the full page one click deeper. */
export default function ScoreboardTeaser({ log }: { log: BuildLog }) {
  const metrics: Array<{ label: string; value: number; unit?: string } | null> = [
    { label: "Days building", value: log.daysBuilding },
    { label: "Features live", value: log.featuresLive },
    {
      label: "Median idea → live",
      value: log.cycleTime.value,
      unit: log.cycleTime.unit === "hours" ? "h" : "d",
    },
  ];

  return (
    <section className="teaser-section" aria-label="Build log summary">
      <div className="section-inner">
        <div className="teaser-strip">
          <div className="teaser-metrics">
            {metrics
              .filter((m): m is NonNullable<typeof m> => !!m && m.value > 0)
              .map((m, i) => (
                <div key={m.label}>
                  <div className="teaser-number">
                    <CountUp value={m.value} order={i} />
                    {m.unit ? <span className="teaser-unit">{m.unit}</span> : null}
                  </div>
                  <div className="teaser-label">{m.label}</div>
                </div>
              ))}
            <div className="teaser-framing">
              Thirty years shipping product. Four weeks shipping code — live
              from my Jira, GitHub and Vercel.
            </div>
          </div>
          <Link className="teaser-link" href="/building">
            See the build log →
          </Link>
        </div>
      </div>
    </section>
  );
}
