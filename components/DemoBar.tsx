import Link from "next/link";
import { signOut } from "@/app/demos/actions";
import type { Viewer } from "@/lib/demos/session";

/** The signed-in strip at the top of every demo page: who you are, where
 *  you can go, and the way out. Owners also get the access log. */
export default function DemoBar({ viewer, current }: { viewer: Viewer; current: "index" | "demo" | "access" }) {
  return (
    <div className="dm-bar">
      <div className="dm-bar-links">
        {current === "index" ? <span aria-current="page">All demos</span> : <Link href="/demos">All demos</Link>}
        {viewer.owner ? (
          current === "access" ? (
            <span aria-current="page">Invitations</span>
          ) : (
            <Link href="/demos/access">Invitations</Link>
          )
        ) : null}
      </div>
      <form action={signOut} className="dm-bar-who">
        <span>{viewer.email}</span>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}
