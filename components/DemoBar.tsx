import Link from "next/link";
import { signOut } from "@/app/demos/actions";
import type { Viewer } from "@/lib/demos/session";

type Page = "index" | "demo" | "access" | "manage";

/** The signed-in strip at the top of every demo page: who you are, where
 *  you can go, and the way out. Owners also get the console pages. */
export default function DemoBar({ viewer, current }: { viewer: Viewer; current: Page }) {
  const item = (page: Page, href: string, label: string) =>
    current === page ? (
      <span key={page} aria-current="page">
        {label}
      </span>
    ) : (
      <Link key={page} href={href}>
        {label}
      </Link>
    );
  return (
    <div className="dm-bar">
      <div className="dm-bar-links">
        {item("index", "/demos", "All demos")}
        {viewer.owner ? item("manage", "/demos/manage", "Manage") : null}
        {viewer.owner ? item("access", "/demos/access", "Invitations") : null}
      </div>
      <form action={signOut} className="dm-bar-who">
        <span>{viewer.email}</span>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
