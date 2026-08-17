import CountUp from "@/components/CountUp";
import type { PortfolioBuildLog } from "@/lib/buildlog/types";

/** The portfolio total (spec §8.3).
 *
 *  Additive metrics ONLY. There is deliberately no median here and no summed
 *  elapsed time: a median of two medians is not a median of anything, and two
 *  concurrent products cannot between them have consumed more calendar days
 *  than have actually passed. Those numbers live on the per-product registers,
 *  where they mean something.
 */
export default function PortfolioTotals({ log }: { log: PortfolioBuildLog }) {
  const items: Array<{ label: string; value: number; denominator?: number }> = [
    { label: "Specs written", value: log.totals.specsWritten },
    { label: "Work items delivered", value: log.totals.featuresLive },
    { label: "Pull requests merged", value: log.totals.pullRequests },
    { label: "Production deploys", value: log.totals.productionDeploys },
    {
      label: "Epics complete",
      value: log.totals.epics.done,
      denominator: log.totals.epics.total,
    },
  ].filter((i) => i.value > 0);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="tot-h" className="tot-section">
      <div className="tot-head">
        <h2 id="tot-h" className="tot-title">
          Across the portfolio
        </h2>
        <p className="tot-sub">
          {log.products.length} products, one operating model. Totals only
          &mdash; cycle times live on each product&rsquo;s register, where they
          describe a single thing.
        </p>
      </div>

      <dl className="tot-grid">
        {items.map((i, n) => (
          <div key={i.label} className="tot-item">
            <dt className="tot-label">{i.label}</dt>
            <dd className="tot-value">
              <CountUp value={i.value} order={n} />
              {i.denominator ? (
                <>
                  <span className="tot-slash">/</span>
                  <span className="tot-denominator">{i.denominator}</span>
                </>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
