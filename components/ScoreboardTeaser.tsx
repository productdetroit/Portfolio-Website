import Link from "next/link";
import CountUp from "@/components/CountUp";
import { shippingPhrase } from "@/lib/buildlog/format";
import type { BuildLog } from "@/lib/buildlog/types";

/** Home-page teaser strip — three metrics and the link to /building
 *  (spec §4, PDW-8). Proof without a click; the full page one click deeper. */
export default function ScoreboardTeaser({ log }: { log: BuildLog }) {
  const metrics: Array<{ label: string; value: number; unit?: string } | null> = [
    { label: "Days building", value: log.daysBuilding },
    // "in TopHand" gives the metrics a subject (change-spec §2.2).
    { label: "Features live in TopHand", value: log.featuresLive },
    {
      label: "Median idea → live",
      value: log.cycleTime.value,
      unit: log.cycleTime.unit === "hours" ? "h" : "d",
    },
    // D6 (change-spec §6): reserved outcome-shaped slot. Once TopHand has
    // real usage, replace with e.g. { label: "…", value: log.<outcome> } —
    // null entries and zero values are filtered out below, so the slot ships
    // dormant by design.
    null,
  ];

  return (
    <section className="teaser-section" aria-label="Build log summary">
      <div className="section-inner">
        {/* Mono kicker on the navy rule (change-spec §2.1) — names the proof
            type so velocity metrics don't read as commercial claims. */}
        <div className="teaser-kicker">
          Proof · One person, one AI-native SDLC
        </div>
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
              Thirty years shipping product.{" "}
              {shippingPhrase(log.daysBuilding)} — live from my Jira, GitHub
              and Vercel.
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
