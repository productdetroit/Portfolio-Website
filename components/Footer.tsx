import { site } from "@/content/site";
import ResumeLink from "@/components/ResumeLink";

export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <img
          src="/brand/product-detroit-mark-reversed.svg"
          alt=""
          width={120}
          height={120}
        />
        <span>© 2026 Joe Ross · {site.name}</span>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <a href={`mailto:${site.email}`}>Email</a>
        <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <ResumeLink>Résumé</ResumeLink>
        <a href={site.links.adplist} target="_blank" rel="noopener noreferrer">
          ADPList
        </a>
        <a href={site.links.calendly} target="_blank" rel="noopener noreferrer">
          Calendly
        </a>
      </div>
    </footer>
  );
}
