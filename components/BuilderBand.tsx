/** Builder band (change-spec §1) — the argument the build metrics ribbon
 *  supports. A band between About and the ribbon, not a seventh About tile:
 *  the pillars are past-tense and organizational; this claim is present-tense
 *  and personal. Copy is verbatim from the spec (third paragraph's "two
 *  reasons" clause revised per Joe, 28 Jul 2026) — edit there first.
 *  Ends with the §2.3 bridge line separating commercial proof (the career
 *  stats above) from capability proof (the ribbon below). */
export default function BuilderBand() {
  return (
    <section className="builder-band" aria-labelledby="builder-h">
      <div className="section-inner">
        <div className="builder-head">
          {/* True right arrow U+2192, display serif, no mono kicker (§1). */}
          <h2 id="builder-h">Product Manager → Product Builder</h2>
        </div>
        <div className="builder-prose">
          <p>
            For thirty years, the distance between a pervasive market problem
            and a positive customer outcome that moves revenue was the
            availability of engineering capacity. Product leaders could always
            reprioritize &mdash; but real problems still went unsolved in a
            backlog. Not because they were wrong, but because expensive and
            finite capacity wasn&rsquo;t available. Every one of those was a
            customer outcome that never happened and revenue nobody ever
            booked.
          </p>
          <p>
            That constraint has changed. At BS&amp;A I designed an AI-native
            software development lifecycle in partnership with my CTO, and
            took AI tool adoption across seven engineering teams from 19% to
            58% in three months &mdash; a 49% velocity gain on a large, aging
            brownfield codebase. This doesn&rsquo;t shrink engineering &mdash;
            it means product leaders stop spending judgment on triage and
            start spending it on what&rsquo;s actually worth building. Then I
            ran the same model myself, alone, to find out whether it holds
            when there&rsquo;s no organization behind it.
          </p>
          <p>
            <a
              href="https://tophand.ag"
              target="_blank"
              rel="noopener noreferrer"
            >
              TopHand.ag
            </a>{" "}
            is where I&rsquo;m testing that. It&rsquo;s a real product, not a
            demo &mdash; built for two reasons: to leverage AI assisted
            design, agentic coding and deployment tools firsthand to fuel my
            passion for the continuous improvement of the product management
            discipline while applying those learnings to solving a problem in
            a workflow I know well.
          </p>
        </div>
        <p className="builder-bridge">
          <em>The commercial record is above. This is the capability test.</em>
        </p>
      </div>
    </section>
  );
}
