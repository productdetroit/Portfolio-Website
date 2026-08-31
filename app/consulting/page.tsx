import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  consultingMeta,
  masthead,
  symptoms,
  fitQualifiers,
  fitProse,
  engagementGroups,
  aiLayer,
  processSteps,
  scopeNote,
  principles,
  ctaBand,
  type Engagement,
} from "@/content/consulting";

/** Explicit per-route OG/Twitter tags — without these the root layout's
 *  homepage values leak through (same convention as /building). */
export const metadata: Metadata = {
  title: consultingMeta.title,
  description: consultingMeta.description,
  openGraph: {
    title: consultingMeta.fullTitle,
    description: consultingMeta.description,
    url: `${site.url}/consulting`,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: consultingMeta.fullTitle,
    description: consultingMeta.description,
  },
};

/** The one repeated structure on the page (spec §6): title + duration row,
 *  body paragraphs, optional clay-ruled proof note. `fit` renders the first
 *  paragraph in ink as the "when it fits" (§5.4); AI cards don't use it. */
function EngagementCard({ card, fit }: { card: Engagement; fit: boolean }) {
  return (
    <div className="con-card">
      <div className="con-card-top">
        <h4>{card.title}</h4>
        <span className="con-dur">{card.duration}</span>
      </div>
      {card.paragraphs.map((p, i) => (
        <p key={i} className={fit && i === 0 ? "con-fit" : undefined}>
          {p}
        </p>
      ))}
      {card.proofHtml ? (
        <p
          className="con-proof"
          /* Authored content from content/consulting.ts, not user input. */
          dangerouslySetInnerHTML={{ __html: card.proofHtml }}
        />
      ) : null}
    </div>
  );
}

function SectionHead({ kicker, heading, id }: { kicker: string; heading: string; id: string }) {
  return (
    <div className="con-sec-head">
      <div className="con-kicker">{kicker}</div>
      <h2 id={id}>{heading}</h2>
    </div>
  );
}

export default function ConsultingPage() {
  return (
    <div className="consulting">
      {/* 5.1 — Masthead */}
      <header className="con-masthead">
        <div className="con-wrap">
          <div className="con-kicker con-kicker-accent">{masthead.kicker}</div>
          <h1>
            {masthead.headBefore}
            <em>{masthead.headEm}</em>
            {masthead.headAfter}
          </h1>
          <p className="con-lede">{masthead.lede}</p>
          <a
            className="con-btn"
            href={site.links.calendly}
            target="_blank"
            rel="noopener noreferrer"
          >
            {masthead.ctaLabel}
          </a>
          <p className="con-sub">{masthead.sub}</p>
        </div>
      </header>

      {/* 5.2 — Symptoms */}
      <section className="con-section" aria-labelledby="symptoms-h">
        <div className="con-wrap">
          <SectionHead kicker="Symptoms" heading="You may recognize some of this" id="symptoms-h" />
          <div className="con-rows">
            {symptoms.map((s) => (
              <div key={s.lead} className="con-row">
                <p>
                  <strong>{s.lead}</strong> {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.3 — Fit */}
      <section className="con-section" aria-labelledby="fit-h">
        <div className="con-wrap">
          <SectionHead kicker="Fit" heading="Who this is for" id="fit-h" />
          <div className="con-two">
            <div className="con-qual">
              <ul>
                {fitQualifiers.map((q) => (
                  <li key={q.lead}>
                    <strong>{q.lead}</strong> {q.text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {fitProse.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p className="con-fit-links">
                <a href="/#career">The commercial record</a> and{" "}
                <a href="/building">what I&rsquo;m building now</a> are on the
                main site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.4 — Engagements */}
      <section className="con-section" aria-labelledby="engagements-h">
        <div className="con-wrap">
          <SectionHead kicker="Engagements" heading="Where I usually start" id="engagements-h" />
          {engagementGroups.map((g) => (
            <div key={g.heading} className="con-group">
              <h3>{g.heading}</h3>
              {g.intro ? <p className="con-intro">{g.intro}</p> : null}
              {g.cards.map((card) => (
                <EngagementCard key={card.title} card={card} fit />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 5.5 — The AI layer */}
      <section className="con-section" aria-labelledby="ai-h">
        <div className="con-wrap">
          <SectionHead kicker={aiLayer.kicker} heading={aiLayer.heading} id="ai-h" />
          {aiLayer.paragraphsHtml.map((html) => (
            <p
              key={html.slice(0, 24)}
              /* Authored content from content/consulting.ts, not user input. */
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
          <div className="con-ai-cards">
            {aiLayer.cards.map((card) => (
              <EngagementCard key={card.title} card={card} fit={false} />
            ))}
          </div>
        </div>
      </section>

      {/* 5.6 — Process */}
      <section className="con-section" aria-labelledby="process-h">
        <div className="con-wrap">
          <SectionHead kicker="Process" heading="How we'd start" id="process-h" />
          <div className="con-steps">
            {processSteps.map((s) => (
              <div key={s.label} className="con-step">
                <span className="con-step-label">{s.label}</span>
                <h4>{s.heading}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.7 — Scope and method */}
      <section className="con-section" aria-label="Scope and method">
        <div className="con-wrap">
          <div className="con-two">
            <div>
              <SectionHead kicker="Scope" heading="What I don't do" id="scope-h" />
              <p>{scopeNote}</p>
            </div>
            <div>
              <SectionHead kicker="Method" heading="How I work" id="method-h" />
              {principles.map((p) => (
                <div key={p.lead} className="con-principle">
                  <p>
                    <strong>{p.lead}</strong> {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5.8 — CTA band */}
      <div className="con-cta">
        <div className="con-wrap">
          <h2>{ctaBand.heading}</h2>
          <p>{ctaBand.text}</p>
          <a
            className="con-btn con-btn-cta"
            href={site.links.calendly}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ctaBand.ctaLabel}
          </a>
          <p className="con-cta-contact">
            <a href={`mailto:${site.email}`}>{site.email}</a> ·{" "}
            <a href={`tel:${site.phone}`}>{site.phoneDisplay}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
