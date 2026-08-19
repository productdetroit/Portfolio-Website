import { learnings } from "@/content/learnings";

/** Authored Learnings between the portfolio totals and "Why it matters" —
 *  the evidence for that section's claims, read immediately before it.
 *
 *  Deliberately editorial (serif titles, prose column, date bylines) so it
 *  can't be confused with the live registers: everything else on the page is
 *  telemetry; this is written by hand.
 *
 *  Native <details>/<summary>: toggles are independent, the browser exposes
 *  expanded state to AT, and collapsed bodies are still in the server-rendered
 *  DOM for crawlers. Every entry loads collapsed.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Parse the authored ISO date directly — `new Date("2026-08-19")` is UTC
 *  midnight and can render a day early in western timezones. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function Learnings() {
  const entries = [...learnings].sort((a, b) => b.date.localeCompare(a.date));
  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="lrn-h" className="bl-learnings">
      <div className="section-label">Learnings</div>
      <h2 id="lrn-h" className="bl-h2">
        What the build is teaching me.
      </h2>
      <p className="lrn-deck">
        Written by me, dated, and occasionally a correction of something I got
        wrong first.
      </p>

      <div className="lrn-list">
        {entries.map((e) => (
          <article key={e.slug} className="lrn-entry" id={`learning-${e.slug}`}>
            <details className="lrn-details">
              <summary className="lrn-summary">
                <span className="lrn-byline">
                  <time dateTime={e.date}>{formatDate(e.date)}</time>
                  <span className="lrn-product">{e.product}</span>
                </span>
                <h3 className="lrn-title">{e.title}</h3>
                <span className="lrn-takeaway">{e.takeaway}</span>
                <span className="lrn-toggle" aria-hidden="true" />
              </summary>
              <div className="lrn-body">
                {e.body}
                {e.links?.length ? (
                  <p className="lrn-links">
                    {e.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        {...(l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {l.label}
                        {l.external ? (
                          <>
                            {" "}
                            <span aria-hidden="true">↗</span>
                          </>
                        ) : null}
                      </a>
                    ))}
                  </p>
                ) : null}
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
