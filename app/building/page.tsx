import type { Metadata } from "next";
import Scoreboard from "@/components/Scoreboard";
import PortfolioTotals from "@/components/PortfolioTotals";
import ResumeLink from "@/components/ResumeLink";
import { getBuildLog } from "@/lib/buildlog";
import { shippingPhrase } from "@/lib/buildlog/format";
import { site } from "@/content/site";

export const revalidate = 3600;

/** Short name only — the root layout's title template appends the site suffix.
 *  OG/Twitter don't inherit the template, so they use FULL_TITLE. */
const TITLE = "Building";
const FULL_TITLE = "Building — Joe Ross, Product Detroit";
const DESCRIPTION =
  "One operating model at two scales: the AI-native SDLC designed at BS&A, run solo end to end. A live build log straight from Jira, GitHub and Vercel.";

/** Explicit per-route OG/Twitter tags — without these the root layout's
 *  homepage values leak through (update-spec §5.1). */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: FULL_TITLE,
    description: DESCRIPTION,
    url: `${site.url}/building`,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: FULL_TITLE,
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
    name: "Prototype",
    desc: "Claude Design. High-fidelity, cheap, in front of users before code.",
    gate: "Human gate",
  },
  {
    name: "Backlog",
    desc: "Jira epic and linked stories, written by both of us.",
    gate: "Shared",
  },
  {
    name: "Build / Test",
    desc: "Claude Code. Stories in parallel; tests written and run with every branch.",
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

/** Technical highlights per product card. The commercial narrative says what
 *  each product is worth; these say what it took to build — the objective is
 *  to make the engineering legible, not to list every dependency.
 *
 *  Per §10 the two licensed upstream data providers are named by category
 *  only. Everything else here is an owned stack choice, so it is named. */
const TOPHAND_HIGHLIGHTS: Array<[string, string]> = [
  [
    "Installable PWA",
    "Next.js, React, TypeScript and Tailwind, with a Serwist service worker so it keeps working in a field with no signal.",
  ],
  [
    "Multi-tenant from the ground up",
    "Account → farm scoping on every query, Postgres row-level security behind it as defence in depth, and a registry that fails the build if a new table doesn’t declare its tenancy.",
  ],
  [
    "Plans, add-ons and feature gating",
    "A capability-key registry resolving entitlements per account.",
  ],
  [
    "Satellite field mapping",
    "Mapbox GL with draw tools, Turf for automatic acreage, and field boundaries parsed straight from deed text by AI.",
  ],
  [
    "AI enrichment the farmer confirms",
    "Anthropic’s Claude API fills in researchable values as editable suggestions — never auto-committed, because a wrong estimate silently accepted is worse than a blank field.",
  ],
  [
    "Condition-gated timing engine",
    "Weather and crop state reconciled into a cutting-window recommendation — the difference between recording the past and acting on the present.",
  ],
  [
    "Notifications that land somewhere",
    "Twilio SMS (consent-gated, toll-free verified) and Resend transactional email, each deep-linked to the record that triggered it.",
  ],
  [
    "Hands-free in the field",
    "ElevenLabs text-to-speech reads recommendations aloud for a farmer whose hands are full.",
  ],
  [
    "Serverless Postgres on Neon",
    "With photo storage on Vercel Blob.",
  ],
  ["1,078 tests", "Across 89 files, run on every branch."],
];

const MOTORADVISOR_HIGHLIGHTS: Array<[string, string]> = [
  [
    "Responsive web app",
    "Next.js, React and TypeScript end to end — no second language anywhere in the stack.",
  ],
  [
    "Conversational AI layer",
    "Anthropic’s Claude API running an agentic tool loop over task-shaped tools, so the model asks a question rather than walking a catalogue.",
  ],
  [
    "Custom remote MCP server",
    "Stateless streamable HTTP with OAuth 2.1, PKCE and dynamic client registration — an external agent gets the same tools the app uses.",
  ],
  [
    "Two licensed data-as-a-service integrations",
    "Repair data and vehicle valuation, HMAC-signed, and deliberately blind to each other in code so one vendor’s failure modes never reach the other.",
  ],
  [
    "Multi-tenant by shop",
    "Each shop carries its own labor, tax and supplies rates, its own branding, and its own connected payment account.",
  ],
  [
    "Integrated payments",
    "Stripe Connect: the shop is merchant of record, a platform fee rides each invoice, and the customer pays on a shop-branded page via Stripe Elements.",
  ],
  [
    "Editorial Studio",
    "A third deployed surface that extracts PDFs into structured records with per-field provenance.",
  ],
  [
    "Documents that leave the building",
    "Printable and emailable PDF quotes, and QR-coded pay links.",
  ],
  [
    "Architecture enforced by the build",
    "Six framework-free packages whose module boundaries are policed by dependency-cruiser with negative controls — a rule that isn’t proven to fail when violated isn’t a rule.",
  ],
  [
    "916 tests, offline fixture replay",
    "The whole suite runs with no network at all.",
  ],
];

/** Page spine per change-spec §4: the claim (one model, two scales) → the
 *  model itself → the proof point (TopHand) → the receipts (register) → the
 *  so-what for a hiring company. Dark route treatment — see globals.css. */
export default async function BuildingPage() {
  const log = await getBuildLog();
  const tophand = log.products.find((p) => p.productId === "tophand");
  const motoradvisor = log.products.find((p) => p.productId === "motoradvisor");

  return (
    <div className="building">
      {/* 1 — The claim */}
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

      <section className="bl-lede" aria-label="Introduction">
        <p className="bl-lede-lead">
          One operating model, run at two scales. At BS&amp;A I designed an
          AI-native software development lifecycle in partnership with my CTO
          and took AI tool adoption across seven engineering teams from 19% to
          58% in three months &mdash; a 49% velocity gain on a large, aging
          brownfield codebase. This page is the same model at the other scale:
          one person, end to end, alone &mdash; to find out whether it holds
          when there&rsquo;s no organization behind it.
        </p>
        <p>
          I&rsquo;ve spent thirty years in B2B enterprise SaaS building
          products and shipping features &mdash; hundreds of products,
          thousands of features, always in partnership with engineering, and
          always bounded by engineering capacity, velocity, and priorities.
          The constraint was never judgment. It was capacity &mdash; and that
          has been true of every product leader alive.
        </p>
        <p>
          That constraint is gone. I can find a market problem, design the
          solution, build it, put it in front of real users, and iterate
          &mdash; in days. The numbers below come from my actual Jira,
          Confluence, GitHub and Vercel accounts, updated automatically.
        </p>
        <p className="bl-lede-close">
          I have never been more excited about this work.
        </p>
      </section>

      {/* 2 — The model itself */}
      <section aria-labelledby="sdlc-h" className="bl-sdlc">
        <div className="section-label">Operating model</div>
        <h2 id="sdlc-h" className="bl-h2">
          An AI-native SDLC, run by one person.
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
            reversible. The spec becomes a high-fidelity Claude Design
            prototype &mdash; quick and cheap enough to put in front of real
            users and validate before any code is written &mdash; then an epic
            and linked stories in Jira. Claude Code works stories in parallel,
            each on its own branch. Merges trigger builds and deploy to
            production through Vercel, continuously.
          </p>
        </div>

        <p className="bl-pullquote">I review the pull request.</p>

        <div className="bl-prose">
          <p>
            Same stack an enterprise product org runs. Same gates.{" "}
            <span className="bl-ink">
              {log.totals.specsWritten} specs, {log.totals.backlogItems}{" "}
              backlog items, {log.totals.pullRequests} pull requests
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
          <p className="bl-ink">
            Those are product decisions. They&rsquo;re the same ones I&rsquo;ve
            been making for thirty years. What changed is that I no longer wait
            in line to see them built.
          </p>
        </div>
      </section>

      {/* 3 — The proof point. Section-level header frames this as the start
          of a product portfolio (per Joe) — more product cards land here. */}
      <section aria-labelledby="portfolio-h" className="bl-tophand-section">
        <div className="section-label">Portfolio</div>
        <h2 id="portfolio-h" className="bl-h2">
          Products I&rsquo;m building.
        </h2>
        <div className="bl-tophand">
          <div className="section-label">Product 01</div>
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
              When I found that my data model had quietly assumed hay was the
              only crop a farm grows, that became a Confluence spec, a
              nine-story epic, and a shipped migration &mdash; seven days from
              problem to production, with the whole thread traceable from the
              decision to the commit.
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

          <div className="bl-highlights">
            <div className="section-label">Technical highlights</div>
            <ul>
              {TOPHAND_HIGHLIGHTS.map(([name, detail]) => (
                <li key={name}>
                  <strong>{name}</strong> {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Spec §8.3: the register sits under the product it describes.
              Two registers side by side ARE the "one operating model, two
              scales" claim; one merged register erases it. */}
          {tophand ? (
            <div className="bl-product-register">
              <Scoreboard log={tophand} />
            </div>
          ) : null}
        </div>

        <div className="bl-tophand">
          <div className="section-label">Product 02</div>
          <h2 id="ma-h" className="bl-h2 bl-tophand-h">
            MotorAdvisor &mdash; the question becomes a repair order.
          </h2>
          <p className="bl-tophand-meta">
            motoradvisor.app · in active development · independent repair shops
          </p>
          <div className="bl-prose">
            <p>
              A service writer standing at a counter has one question &mdash;{" "}
              <em>what&rsquo;s wrong with this car, what will it cost, and
              should we even do the work?</em> &mdash; and answering it today
              means crossing four systems and a phone call. MotorAdvisor turns
              that question into a{" "}
              <span className="bl-ink">
                priced, bookable, payable repair order
              </span>
              , in the conversation where it was asked.
            </p>
            <p>
              The bet isn&rsquo;t that shops want another database. It&rsquo;s
              that the repair decision is a{" "}
              <span className="bl-ink">single continuous act</span> &mdash;
              diagnose, price, decide, approve, pay &mdash; and that every
              product in this market breaks it into pieces and hands the seams
              to the shop.
            </p>
            <p>
              The part nobody does: it gates the repair against the car.
              A vehicle valuation sits alongside the estimate, so a{" "}
              <span className="bl-mono">$3,400</span> repair on a car worth{" "}
              <span className="bl-mono">$2,900</span>{" "}
              is a conversation the system starts rather than one the writer
              has to remember to have.
              That verdict is advisor-facing by default &mdash; telling a
              customer their car isn&rsquo;t worth fixing is the shop&rsquo;s
              call to make, in the shop&rsquo;s voice.
            </p>
            <p>
              Same operating model as TopHand, at a different scale: specs
              first, epics and stories, one story per pull request, every merge
              reviewed. Where it differs is the shape of the risk &mdash; two
              licensed upstream data providers that must stay strictly separate
              in the code, enforced as build rules with negative controls
              rather than as conventions anyone has to remember.
            </p>
          </div>

          <a
            className="bl-tophand-cta"
            href="https://motoradvisor.app/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit motoradvisor.app <span aria-hidden="true">↗</span>
          </a>

          <div className="bl-highlights">
            <div className="section-label">Technical highlights</div>
            <ul>
              {MOTORADVISOR_HIGHLIGHTS.map(([name, detail]) => (
                <li key={name}>
                  <strong>{name}</strong> {detail}
                </li>
              ))}
            </ul>
          </div>

          {motoradvisor ? (
            <div className="bl-product-register">
              <Scoreboard log={motoradvisor} />
            </div>
          ) : null}
        </div>
      </section>

      {/* 4 — The receipts, across the portfolio */}
      <section className="bl-register-section" aria-label="The receipts">
        <PortfolioTotals log={log} />
      </section>

      {/* 5 — The so-what */}
      <section aria-labelledby="sowhat-h" className="bl-sowhat">
        <div className="section-label">Why it matters</div>
        <h2 id="sowhat-h" className="bl-h2">
          What this buys a hiring company.
        </h2>
        <div className="bl-prose">
          <p>
            For a PE-backed SaaS company, this experiment is diligence you can
            hire:
          </p>
          <p>
            I can assess vendor and internal AI delivery claims against a model
            I&rsquo;ve run myself, at both scales &mdash; I know what the demos
            leave out and what the pilot numbers actually mean.
          </p>
          <p>
            When I propose an AI operating model to an engineering
            organization, it isn&rsquo;t theory. I&rsquo;ve driven adoption
            across seven teams with a CTO partner and run the whole lifecycle
            alone &mdash; credibility with engineering that a mandate
            can&rsquo;t buy.
          </p>
          <p className="bl-ink">
            And I know where it breaks: which gates have to stay human, where a
            thin spec turns into rework, and what review has to catch that
            automation never will.
          </p>
        </div>
      </section>

      {/* 6 — Contact */}
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
