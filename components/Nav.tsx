"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/content/site";

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav>
      <Link className="nav-logo" href="/">
        {site.name}
      </Link>
      <div className="nav-links">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            aria-current={l.href === pathname ? "page" : undefined}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
