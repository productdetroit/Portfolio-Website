import type { Metadata } from "next";
import Scoreboard from "@/components/Scoreboard";
import ResumeLink from "@/components/ResumeLink";
import { getBuildLog } from "@/lib/buildlog";
import { shippingPhrase } from "@/lib/buildlog/format";
import { site } from "@/content/site";

export const revalidate = 3600;

const TITLE = "Building — Joe Ross, Product Detroit";
const DESCRIPTION =
  "Thirty years shipping product. A live log of what I'm building now, straight from Jira, GitHub and Vercel.";

/** Explicit per-route OG/Twitter tags — without these the root layout's
 *  homepage values leak through (update-spec §5.1). */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${site.url}/building`,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const GATES = [
  {
    name: "Spec",
    desc: "Confluence. Problem, data model, reversible decision.",
    gate: "Human gate",
  },
  {
    name: "Backlog",
    desc: "Jira epic and linked stories, written by both of us.",
    gate: "Shared",
  },
  {
    name: "Build",
    desc: "Claude Code works one story on one branch.",
    gate: "Automated",
  },
  {
    name: "Review",
    desc: "Pull request. Nothing merges without my read.",
    gate: "Human gate",
  },
  {
    name: "Production",
    desc: "Merge triggers the build; Vercel deploys.",
    gate: "Automated",
  },
];

export default async function BuildingPage() {
  const log = await getBuildLog();

  return (
    <div className="building">
      {/* Block 1 — Claim */}
      <header className="bl-header">
        <div className="bl-eyebrow">
          <span className="bl-eyebrow-rule" aria-hidden="true" />
          <span>Build log</span>
        </div>
        <h1>
          Thirty years shipping product.
          <br />
          <em>{shippingPhrase(log.daysBuilding)}.</em>
        </h1>
      </header>

      {/* Block 2 — Scoreboard */}
      <Scoreboard log={log} />

      {/* Block 3 — Lede */}
      <section className="bl-lede" aria-label="Introduction">
        <p className="bl-lede-lead">
          I&rsquo;ve spent thirty years in B2B enterprise SaaS building
          products and shipping features &mdash; hundreds of products,
          thousands of features, always in partnership with engineering, and
          always bounded by engineering capacity, velocity, and priorities.
        </p>
        <p>
          I&rsquo;m not a trained engineer. For three decades that meant every
          idea I had went into a queue and waited for someone else&rsquo;s
          calendar.
        </p>
        <p>
          That constraint is gone. I can find a market problem, design the
          solution, build it, put it in front of real users, and iterate
          &mdash; in days. The numbers above come from my actual Jira,
          Confluence, GitHub and Vercel accounts, updated automatically.
        </p>
        <p className="bl-lede-close">
          I have never been more excited about this work.
        </p>
      </section>

      {/* Block 4 — Operating model */}
      <section aria-labelledby="sdlc-h" className="bl-sdlc">
        <div className="section-label">Operating model</div>
        <h2 id="sdlc-h" className="bl-h2">
          An enterprise SDLC, run by one person.
        </h2>

        <div className="bl-gates">
          {GATES.map((g, i) => (
            <div key={g.name} className="bl-gate">
              <div className="bl-gate-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="bl-gate-name">{g.name}</div>
              <div className="bl-gate-desc">{g.desc}</div>
              <div
                className={`bl-gate-kind${g.gate === "Human gate" ? " human" : ""}`}
              >
                {g.gate}
              </div>
            </div>
          ))}
        </div>

        <div className="bl-prose">
          <p>
            I didn&rsquo;t abandon the discipline when the constraint lifted. I
            applied it.
          </p>
          <p>
            Every feature starts as a spec in Confluence &mdash; the problem,
            the data model, the architecture decision and why it&rsquo;s
            reversible. The spec becomes an epic and linked stories in Jira.
            Claude Code works a story on a branch. Merge triggers a build and
            deploys to production through Vercel.
          </p>
        </div>

        <p className="bl-pullquote">I review the pull request.</p>

        <div className="bl-prose">
          <p>
            Same stack a 200-person product org runs. Same gates.{" "}
            <span className="bl-ink">
              {log.specsWritten} specs, {log.backlogItems} backlog items,{" "}
              {log.pullRequests} pull requests
            </span>{" "}
            &mdash; every one of them reviewed by me.
          </p>
          <p>
            What&rsquo;s new is that Claude writes to Jira and Confluence
            directly. The backlog isn&rsquo;t documentation I keep up after the
            fact; it&rsquo;s the live system of record my AI collaborator and I
            both operate from. Ideation, research and architecture happen in
            conversation. Design prototypes come out of Claude Design. Code
            lands as a branch and a pull request. Nothing skips the spec, and
            nothing merges without review.
          </p>
          <p>
            When I found that my data model had quietly assumed hay was the
            only crop a farm grows, that became a Confluence spec, a nine-story
            epic, and a shipped migration &mdash; seven days from problem to
            production, with the whole thread traceable from the decision to
            the commit.
          </p>
          <p className="bl-ink">
            Those are product decisions. They&rsquo;re the same ones I&rsquo;ve
            been making for thirty years. What changed is that I no longer wait
            in line to see them built.
          </p>
        </div>
      </section>

      {/* Block 5 — TopHand card */}
      <section aria-labelledby="th-h" className="bl-tophand-section">
        <div className="bl-tophand">
          <div className="section-label">The product</div>
          <h2 id="th-h" className="bl-h2 bl-tophand-h">
            TopHand &mdash; the farm&rsquo;s most knowledgeable hand.
          </h2>
          <p className="bl-tophand-meta">
            tophand.ag · in active development · first customer: GoatLife Farm,
            Michigan
          </p>
          <div className="bl-prose">
            <p>
              Farm management software has a crowded middle: everyone sells
              record-keeping, and record-keeping is a chore farmers resent
              paying for. TopHand sells something no competitor pairs &mdash; a{" "}
              <span className="bl-ink">condition-gated timing engine</span>{" "}
              that tells a farmer <em>when</em> to act, bridged to a{" "}
              <span className="bl-ink">coordination board</span> that handles{" "}
              <em>who does it</em>.
            </p>
            <p>
              The wedge is money, not time. Cutting hay in the right window is
              worth <span className="bl-mono">$70&ndash;100</span> per ton in
              grade spread; every day of delay past peak costs roughly{" "}
              <span className="bl-mono">$9</span>{" "}
              per acre in quality loss. A tool that saves one cutting pays for
              itself for years.
              That&rsquo;s a different sales conversation than &ldquo;keep
              better records.&rdquo;
            </p>
            <p>
              My family runs a working dairy-goat farm in Michigan. It&rsquo;s
              the first tenant, the demo environment, and the reason I know
              which problems are real.
            </p>
            <p>
              TopHand exists to prove the operating model, not to raise
              capital. It&rsquo;s a live product with real users because
              that&rsquo;s the only honest way to test whether the method
              works.
            </p>
          </div>
          <a
            className="bl-tophand-cta"
            href="https://tophand.ag"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit tophand.ag <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* Block 6 — Contact */}
      <section className="bl-contact" aria-label="Contact">
        <h2>Open to senior product roles in B2B enterprise SaaS.</h2>
        <p>Thirty years of judgment, now with no queue in front of it.</p>
        <div className="bl-contact-ctas">
          <a
            href={site.links.calendly}
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule 20 Minutes →
          </a>
          <ResumeLink>Download Résumé ↓</ResumeLink>
        </div>
        <a className="bl-contact-email" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </section>
    </div>
  );
}
