import Link from "next/link";
import { navLinks, site } from "@/content/site";

export default function Nav() {
  return (
    <nav>
      <Link className="nav-logo" href="/">
        {site.name}
      </Link>
      <div className="nav-links">
        {navLinks.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
