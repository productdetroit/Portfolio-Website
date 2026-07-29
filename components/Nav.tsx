"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/content/site";

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav>
      <Link className="nav-logo" href="/" aria-label={`${site.name} — home`}>
        <img
          src="/brand/product-detroit-logo-primary.svg"
          alt="Product Detroit"
          width={386}
          height={92}
        />
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
