"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/content/site";

export default function Nav() {
  const pathname = usePathname();
  /* /building is the site's single dark route (change-spec §4) — the nav
     goes near-black there and swaps in the reversed lockup. */
  const dark = pathname === "/building" || pathname.startsWith("/building/");
  return (
    <nav className={dark ? "nav-dark" : undefined}>
      <Link className="nav-logo" href="/" aria-label={`${site.name} — home`}>
        <img
          src={
            dark
              ? "/brand/product-detroit-logo-primary-reversed.svg"
              : "/brand/product-detroit-logo-primary.svg"
          }
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
