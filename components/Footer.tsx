import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer>
      <span>© 2026 Joe Ross · {site.name}</span>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <a href={`mailto:${site.email}`}>Email</a>
        <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={site.links.resume} target="_blank" rel="noopener noreferrer">
          Résumé
        </a>
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
