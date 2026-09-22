import ResumeLink from "@/components/ResumeLink";
import { site } from "@/content/site";

/** The terracotta closing band on the dark route. Shared so /building and
 *  every /building/[slug] page close on the same ask rather than two copies
 *  of it drifting apart. */
export default function ContactBand() {
  return (
    <section className="bl-contact" aria-label="Contact">
      <h2>Open to senior product roles in B2B enterprise SaaS.</h2>
      <p>Thirty years of judgment, now with no queue in front of it.</p>
      <div className="bl-contact-ctas">
        <a href={site.links.calendly} target="_blank" rel="noopener noreferrer">
          Schedule 20 Minutes →
        </a>
        <ResumeLink>Download Résumé ↓</ResumeLink>
      </div>
      <a className="bl-contact-email" href={`mailto:${site.email}`}>
        {site.email}
      </a>
    </section>
  );
}
