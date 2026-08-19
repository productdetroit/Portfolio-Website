import type { ReactNode } from "react";

/** Hand-authored Learnings entries for /building.
 *
 *  This is AUTHORED content, not telemetry — the component renders it with an
 *  editorial treatment precisely so it can't be mistaken for the live
 *  registers. Adding an entry, or adding a link to an existing entry, is a
 *  content edit in this file only; the component sorts by `date` descending,
 *  so entry order here doesn't matter.
 *
 *  Link policy: never link Jira issues (private instance — they 404 for
 *  visitors). GitHub PRs only if the product repo is public (productdetroit/
 *  motor is private as of 2026-08-19, so entry one links only its LinkedIn
 *  essay).
 */
export interface Learning {
  /** Stable and URL-safe — reserved for a future /building/learning/[slug]. */
  slug: string;
  /** ISO 8601, e.g. "2026-08-19". Authored, never regenerated at build. */
  date: string;
  product: "MotorAdvisor" | "TopHand" | "Portfolio";
  title: string;
  /** ONE sentence, visible while collapsed — must carry the insight. */
  takeaway: string;
  body: ReactNode;
  links?: { label: string; href: string; external?: boolean }[];
}

export const learnings: Learning[] = [
  {
    slug: "token-cost-and-quality-gating",
    date: "2026-08-19",
    product: "MotorAdvisor",
    title:
      "What one AI conversation actually costs, and what it took to cut it 76%",
    takeaway:
      "An unmeasured transaction cost $0.715. It ships today at $0.168, with every hard quality gate green — and the optimization I expected to save the most saved nothing.",
    body: (
      <>
        <p>
          Every AI feature carries a marginal cost on every single interaction.
          It scales with conversation shape rather than user count, it is
          dominated by what you send rather than what the model says back, and
          it is invisible until you instrument it. I deferred measuring
          MotorAdvisor&rsquo;s until the product had enough shape to be worth
          optimizing. This is what I found.
        </p>
        <p>
          <strong>The unit.</strong> One complete demo transaction, four user
          turns: symptom, book a leak inspection (
          <span className="bl-mono">$90</span>), add an HVAC diagnosis (
          <span className="bl-mono">$180</span> total), quote a compressor.
          Every figure below is the API&rsquo;s own <code>usage</code>{" "}
          accounting, captured in the production agent loop against live data,
          18&ndash;19 August 2026. Pricing at list.
        </p>

        <h4>Baseline: $0.715, and no caching at all</h4>
        <div className="lrn-table-wrap">
          <table className="lrn-table">
            <thead>
              <tr>
                <th scope="col">Turn</th>
                <th scope="col" className="num">Model calls</th>
                <th scope="col" className="num">Input tokens</th>
                <th scope="col" className="num">Output tokens</th>
                <th scope="col" className="num">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1 &mdash; symptom to diagnostic menu</th>
                <td className="num">2</td>
                <td className="num">17,068</td>
                <td className="num">496</td>
                <td className="num">$0.098</td>
              </tr>
              <tr>
                <th scope="row">2 &mdash; book leak inspection</th>
                <td className="num">3</td>
                <td className="num">31,194</td>
                <td className="num">520</td>
                <td className="num">$0.169</td>
              </tr>
              <tr>
                <th scope="row">3 &mdash; book HVAC diagnosis</th>
                <td className="num">3</td>
                <td className="num">32,150</td>
                <td className="num">720</td>
                <td className="num">$0.179</td>
              </tr>
              <tr>
                <th scope="row">4 &mdash; compressor quote</th>
                <td className="num">4</td>
                <td className="num">49,524</td>
                <td className="num">885</td>
                <td className="num">$0.270</td>
              </tr>
              <tr className="lrn-table-total">
                <th scope="row">Total</th>
                <td className="num">12</td>
                <td className="num">129,936</td>
                <td className="num">2,621</td>
                <td className="num">$0.715</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Four user questions became twelve model calls, because an agentic
          loop re-sends its growing context on every internal step. Input was
          98% of tokens and 91% of cost; all output together came to{" "}
          <span className="bl-mono">$0.066</span>. Roughly 6,900 tokens of
          identical tool schemas and system prompt were re-billed at full
          price twelve times, about 83k of the 130k input tokens.{" "}
          <code>cache_read_input_tokens</code> was zero on every call.
        </p>

        <h4>Optimization 1 &mdash; prompt caching: $0.270, &minus;62%</h4>
        <p>
          Two <code>cache_control</code> breakpoints per request: one on the
          system block, which caches tools plus system prompt, and one on the
          final message&rsquo;s last content block, so each loop iteration and
          each following turn reads the conversation from cache. About 30
          lines behind a pure request-builder, plus six tests.
        </p>
        <p>
          Full-price input tokens fell from 129,936 to 20. Normalizing for
          path variance between runs, the like-for-like reduction is 52%.
          Responses ran roughly 27% faster as a side effect. No quality trade
          of any kind.
        </p>

        <h4>Optimization 2 &mdash; AI Gateway: $0.265, flat</h4>
        <p>
          Routing the same calls through an AI Gateway saved nothing, and it
          should not have. Cost-based provider routing ranks providers serving
          the <em>same</em> model, and Anthropic-family providers price Claude
          within a rounding error of each other. Cross-provider price
          arbitrage is real for open-weight models and close to nil for
          frontier proprietary ones.
        </p>
        <p>
          What the gateway does buy is a failover surface, per-app spend
          tracing, and an answer to what happens during a provider outage. It
          runs with the app&rsquo;s own provider key on each request, so
          inference bills the existing account at zero markup. Prompt caching
          passed through byte-identically. One sample showed a latency
          premium; a single sample is an anecdote, not a finding.
        </p>
        <p>
          I am documenting a flat result because the alternative is crediting
          infrastructure with savings it did not produce.
        </p>

        <h4>
          Optimization 3 &mdash; model-tier routing, quality-gated: $0.168
          shipped
        </h4>
        <p>
          Switching to a cheaper model is the most common cost lever and the
          least examined one. &ldquo;It scores 95% of the frontier model on a
          public benchmark&rdquo; is a hope, not a decision. So the gate came
          first.
        </p>
        <p>
          <strong>Hard gates</strong>, binary, on structured tool traffic, any
          failure disqualifying: turn 1 yields the two-inspection menu with no
          total; turn 2 maps the booking phrase to exactly one application id
          and returns <span className="bl-mono">$90.00</span>; turn 3 carries
          two ids and returns <span className="bl-mono">$180.00</span>; turn 4
          re-calls in quote stage and surfaces compressor candidates. The
          model never computes money &mdash; the upstream data service does
          &mdash; so accuracy for a model swap means{" "}
          <em>does the cheaper model drive the tools identically.</em>
        </p>
        <p>
          <strong>Soft gates</strong> covered style. Latency was measured as
          medians and ranges across five runs per arm, with time-to-first-token
          tracked separately from wall time.
        </p>
        <div className="lrn-table-wrap">
          <table className="lrn-table">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col" className="num">A: all Opus 5</th>
                <th scope="col" className="num">B: hybrid</th>
                <th scope="col" className="num">C: all Sonnet 5</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Hard gates (5 checks &times; 5 runs)</th>
                <td className="num">25/25</td>
                <td className="num">25/25</td>
                <td className="num">25/25</td>
              </tr>
              <tr>
                <th scope="row">Cost per transaction, median</th>
                <td className="num">$0.299</td>
                <td className="num">$0.170</td>
                <td className="num">$0.146</td>
              </tr>
              <tr>
                <th scope="row">Range</th>
                <td className="num">$0.222&ndash;0.303</td>
                <td className="num">$0.164&ndash;0.238</td>
                <td className="num">$0.133&ndash;0.150</td>
              </tr>
              <tr>
                <th scope="row">Wall time, median</th>
                <td className="num">72.9s</td>
                <td className="num">61.2s</td>
                <td className="num">61.5s</td>
              </tr>
              <tr>
                <th scope="row">Style: question-form endings</th>
                <td className="num">5/5</td>
                <td className="num">1/5</td>
                <td className="num">0/5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Time to first token was statistically identical: Opus 2,274ms median
          (n=32) against Sonnet 2,262ms (n=37). Wall time improved about 16%.
          Every money-critical behavior held in every arm, including the
          hybrid&rsquo;s $90 and $180 bookings, which were Sonnet turns.
        </p>
        <p>
          The gate caught exactly one real deviation, and it was style: Sonnet
          ended booking turns with an invitation rather than the specified
          next-step question. One added prompt line fixed it. Re-gating
          through the shipped code across three runs: hard gates 3/3, router
          placement exact in every run, question-form endings recovered to 8
          of 9 booking-adjacent turns from 2 of 10 before the fix. One
          residual slip in nine, reported rather than rounded away. Median
          cost <span className="bl-mono">$0.168</span>.
        </p>
        <p>
          <strong>What shipped:</strong> a deterministic{" "}
          <code>modelForTurn()</code> router in application code. Three
          mechanical booking-message forms route to Sonnet 5, everything else
          to Opus 5. Unit-tested, environment-overridable, one model per turn,
          because a mid-turn switch would thrash the model-scoped cache.
        </p>
        <p>
          <strong>What did not ship:</strong> all-Sonnet routing, worth
          another 20%, until the gate covers ambiguous vehicles, tool-error
          recovery, and off-script questions &mdash; where the more capable
          model is likeliest to earn its premium. The savings envelope is
          known. The license to take it is not yet earned.
        </p>

        <h4>Where the model decision actually lives</h4>
        <p>
          The most useful thing I learned has nothing to do with cost. Nothing
          in the stack picks your model for you. The API runs whatever you
          name. The gateway selects a provider for the model you already named
          and can substitute a pre-authorized fallback, but only on failure
          &mdash; never because a turn looked easy or expensive. Per-turn
          model choice is product logic. It belongs in application code where
          it is deterministic, testable, and visible in a trace.
        </p>

        <h4>Cumulative</h4>
        <p>
          <span className="bl-mono">$0.715</span> &rarr;{" "}
          <span className="bl-mono">$0.168</span> median, a 76% reduction,
          with zero measured quality given up because every step was gated.
          Against a <span className="bl-mono">$180</span> diagnostic ticket
          that is under 0.1% of ticket value. Each loop &mdash; instrument,
          measure, change one variable, re-measure, document &mdash; took an
          afternoon or less.
        </p>
      </>
    ),
    links: [
      {
        label: "Read the essay on LinkedIn",
        href: "https://www.linkedin.com/pulse/your-ai-feature-has-unit-cost-do-you-know-what-joe-ross-pfyxc",
        external: true,
      },
    ],
  },
];
