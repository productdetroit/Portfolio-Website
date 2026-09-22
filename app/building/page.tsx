import type { Metadata } from "next";
import PortfolioTotals from "@/components/PortfolioTotals";
import ProductCard from "@/components/ProductCard";
import Learnings from "@/components/Learnings";
import ContactBand from "@/components/ContactBand";
import { PRODUCTS } from "@/content/products";
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

/** Page spine per change-spec §4: the claim (one model, two scales) → the
 *  model itself → the portfolio (one card per product, each linking to its
 *  own page) → the receipts across it → the so-what for a hiring company.
 *  Dark route treatment — see globals.css. */
export default async function BuildingPage() {
  const log = await getBuildLog();

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

      {/* 3 — The proof point, as an index. One card per product; the page
          grows by a card rather than by another full product block. */}
      <section aria-labelledby="portfolio-h" className="bl-portfolio-section">
        <div className="section-label">Portfolio</div>
        <h2 id="portfolio-h" className="bl-h2">
          Products I&rsquo;m building.
        </h2>
        {/* The story, the technical highlights and the per-product register
            all live on /building/[slug] now — a card carries only what makes
            a reader choose to open one. */}
        <div className="bl-portfolio-grid">
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              log={log.products.find((r) => r.productId === p.productId)}
            />
          ))}
        </div>

        {/* 4 — The receipts, across the portfolio. Directly under the grid:
            per-product registers now live on the detail pages, so this is the
            only telemetry the index carries. */}
        <div className="bl-portfolio-totals">
          <PortfolioTotals log={log} />
        </div>
      </section>

      {/* 5 — The evidence for the so-what: authored learnings, read
          immediately before the claims they back. Content lives in
          content/learnings.tsx; this is deliberately NOT register telemetry. */}
      <Learnings />

      {/* 6 — The so-what */}
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

      {/* 7 — Contact */}
      <ContactBand />
    </div>
  );
}
