/** The link in the email lands here. Verify the signature, burn the one-use
 *  token, set the session cookie, log the sign-in, and send them on. Every
 *  failure goes back to the sign-in form with a reason it can explain. */
import { NextResponse, type NextRequest } from "next/server";
import { sessionSecret } from "@/lib/demos/config";
import { safeNext } from "@/lib/demos/paths";
import { sessionCookie } from "@/lib/demos/session";
import { consumeLinkToken, recordSignIn } from "@/lib/demos/store";
import { signSessionToken, verifyLinkToken } from "@/lib/demos/tokens";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const token = url.searchParams.get("token") ?? "";
  const next = safeNext(url.searchParams.get("next"));
  const back = (error: string) =>
    NextResponse.redirect(new URL(`/demos?error=${error}&next=${encodeURIComponent(next)}`, url));

  let email: string;
  let jti: string;
  try {
    ({ email, jti } = await verifyLinkToken(token, sessionSecret()));
  } catch (err) {
    const expired = err instanceof Error && err.name === "JWTExpired";
    return back(expired ? "expired" : "invalid");
  }
  if (!(await consumeLinkToken(jti))) return back("used");

  const res = NextResponse.redirect(new URL(next, url));
  res.cookies.set(sessionCookie(await signSessionToken(email, sessionSecret())));
  try {
    await recordSignIn(email, request.headers.get("user-agent"));
  } catch (err) {
    // The log is for Joe; a hiccup writing it must not lock the viewer out.
    console.error("[demos] sign-in log failed:", err instanceof Error ? err.message : err);
  }
  return res;
}
