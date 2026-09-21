import Link from "next/link";
import { redirect } from "next/navigation";
import { sessionSecret } from "@/lib/demos/config";
import { safeNext } from "@/lib/demos/paths";
import { getDemo, getInvite } from "@/lib/demos/store";
import { peekKind, verifyInviteToken, verifyLinkToken } from "@/lib/demos/tokens";
import { completeSignIn } from "../actions";

export const dynamic = "force-dynamic";

/** Where an emailed link lands. Deliberately a page with a button, not a
 *  redirect: corporate mail gateways fetch every URL in an inbound message
 *  to scan it, and a GET that signed people in would be spent — or worse,
 *  a session handed to the scanner — before the person ever clicked.
 *  Nothing here consumes anything; the button POSTs to completeSignIn. */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const next = safeNext(sp.next);
  const back = (error: string): never => redirect(`/demos?error=${error}&next=${encodeURIComponent(next)}`);

  /* Verify inside try, redirect outside it — redirect() throws, and a catch
     around it would relabel every outcome "invalid". */
  let outcome: { email: string; title?: string } | { error: string };
  try {
    if (peekKind(token) === "invite") {
      const p = await verifyInviteToken(token, sessionSecret());
      const [invite, demo] = await Promise.all([getInvite(p.slug, p.email), getDemo(p.slug)]);
      outcome = invite && demo ? { email: p.email, title: demo.title } : { error: "revoked" };
    } else {
      const p = await verifyLinkToken(token, sessionSecret());
      outcome = { email: p.email };
    }
  } catch (err) {
    outcome = { error: err instanceof Error && err.name === "JWTExpired" ? "expired" : "invalid" };
  }
  if ("error" in outcome) return back(outcome.error);
  const who = outcome;

  return (
    <header className="dm-masthead">
      <div className="dm-wrap dm-narrow">
        <div className="dm-kicker">Private</div>
        <h1>{who.title ? "You're invited" : "Almost there"}</h1>
        <p className="dm-lede">
          {who.title ? (
            <>
              Continue as <strong>{who.email}</strong> to open <strong>{who.title}</strong>.
            </>
          ) : (
            <>
              Continue as <strong>{who.email}</strong>.
            </>
          )}
        </p>
        <form action={completeSignIn} className="dm-form">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="dm-btn">
            Continue
          </button>
        </form>
        <p className="dm-sub">
          Not you? <Link href="/demos">Sign in with a different email</Link>
        </p>
      </div>
    </header>
  );
}
