import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/demos/config";
import { isOwnerOnlyPath, isOwnerToken } from "@/lib/demos/owner";

/** Owner-only routes (lib/demos/owner.ts) answer the public with the site's
 *  ordinary 404 — not a sign-in prompt — so nothing hints they exist. Runs
 *  ahead of the page cache, so ISR'd pages stay locked too. */
export async function proxy(request: NextRequest) {
  if (!isOwnerOnlyPath(request.nextUrl.pathname)) return NextResponse.next();
  if (await isOwnerToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }
  return NextResponse.rewrite(new URL("/_owner-only-not-found", request.url), { status: 404 });
}

export const config = {
  matcher: ["/building", "/building/:path*", "/consulting", "/consulting/:path*"],
};
