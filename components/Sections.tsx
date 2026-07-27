import { career, pillars, press, proofStats, site } from "@/content/site";

export function Hero() {
  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-eyebrow">Executive Product Leader</div>
        <h1>
          Building products
          <br />
          that <em>scale</em> businesses.
        </h1>
        <p className="hero-sub">{site.heroSub}</p>
      </div>
    </div>
  );
}

export function Proof() {
  return (
    <div className="proof">
      <div className="proof-inner">
        <div className="proof-label">Career in numbers</div>
        <div className="proof-grid">
          {proofStats.map((s) => (
            <div className="proof-stat" key={s.desc}>
              <div
                className="number"
                dangerouslySetInnerHTML={{ __html: s.numberHtml }}
              />
              <div className="desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about">
      <div className="section-inner">
        <div className="section-label">About</div>
        <h2>A different kind of CPO.</h2>
        <div className="pillars">
          {pillars.map((p) => (
            <div className="pillar" key={p.tag}>
              <div className="pillar-tag">{p.tag}</div>
              <div className="pillar-title">{p.title}</div>
              <p className="pillar-text">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Video() {
  return (
    <section style={{ paddingTop: 0, background: "var(--cream)" }}>
      <div className="section-inner">
        <div className="section-label">Introduction</div>
        <h2>Hear from Joe directly.</h2>
        <div className="video-wrap">
          <iframe
            src={site.videoEmbed}
            title="Introduction from Joe Ross"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function Career() {
  return (
    <section id="career" style={{ background: "white" }}>
      <div className="section-inner">
        <div className="section-label">Career</div>
        <h2>Where I&rsquo;ve built.</h2>
        <div className="career-list">
          {career.map((c) => (
            <div className="career-item" key={c.company}>
              <div className="career-dates">{c.dates}</div>
              <div>
                <div className="career-co">{c.company}</div>
                <div className="career-role">{c.role}</div>
                <p
                  className="career-desc"
                  dangerouslySetInnerHTML={{ __html: c.descriptionHtml }}
                />
                <span
                  className={c.highlight ? "career-tag highlight" : "career-tag"}
                >
                  {c.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Press() {
  return (
    <section id="press">
      <div className="section-inner">
        <div className="section-label">Press &amp; Recognition</div>
        <h2>In the market.</h2>
        <div className="press-grid">
          {press.map((p) => (
            <div className="press-card" key={p.title}>
              <div className="press-date">{p.date}</div>
              <div className="press-title">{p.title}</div>
              <p className="press-text">{p.text}</p>
              <a
                className="press-link"
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <div className="cta-strip" id="contact">
      <h2 style={{ color: "white", marginBottom: 12 }}>Let&rsquo;s talk.</h2>
      <p>{site.ctaSub}</p>
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a href={site.links.calendly} target="_blank" rel="noopener noreferrer">
          Schedule 20 Minutes →
        </a>
        <a href={site.links.resume} target="_blank" rel="noopener noreferrer">
          Download Résumé ↓
        </a>
      </div>
    </div>
  );
}
