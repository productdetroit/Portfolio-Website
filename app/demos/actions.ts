"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { mayRequestLink, normalizeEmail } from "@/lib/demos/access";
import { ownerEmails, sessionSecret } from "@/lib/demos/config";
import { sendSignInLink } from "@/lib/demos/email";
import { safeNext } from "@/lib/demos/paths";
import { sessionCookie } from "@/lib/demos/session";
import { consumeLinkToken, getInvite, issueLinkToken, listDemos, listInvites, recordSignIn } from "@/lib/demos/store";
import { newJti, peekKind, signLinkToken, signSessionToken, verifyInviteToken, verifyLinkToken } from "@/lib/demos/tokens";
import { baseUrl } from "@/lib/demos/url";

/** The sign-in form. Whatever the address, the answer is "check your inbox":
 *  the allowlist is never confirmed or denied to the person typing. */
export async function requestLink(formData: FormData): Promise<void> {
  const email = normalizeEmail(formData.get("email"));
  const next = safeNext(formData.get("next"));
  if (!email) redirect(`/demos?error=email&next=${encodeURIComponent(next)}`);

  let failed = false;
  const [demos, invites] = await Promise.all([listDemos(), listInvites()]);
  if (mayRequestLink(email, ownerEmails(), demos, invites)) {
    try {
      const jti = newJti();
      const token = await signLinkToken(email, jti, sessionSecret());
      await issueLinkToken(jti, email);
      const link = `${await baseUrl()}/demos/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(next)}`;
      await sendSignInLink(email, link);
    } catch (err) {
      console.error("[demos] sign-in link failed:", err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  redirect(failed ? `/demos?error=send` : `/demos?sent=1`);
}

/** The Continue button on /demos/verify. Only here — never on the GET that
 *  renders the page — is a link consumed, so a mail gateway pre-fetching
 *  the URL can't burn it before the person arrives. */
export async function completeSignIn(formData: FormData): Promise<void> {
  const token = typeof formData.get("token") === "string" ? (formData.get("token") as string) : "";
  let next = safeNext(formData.get("next"));
  const back = (error: string): never => redirect(`/demos?error=${error}&next=${encodeURIComponent(next)}`);

  /* Verify inside try, redirect outside it — redirect() throws, and a catch
     around it would turn every outcome into "invalid". */
  let outcome: { email: string; via: "link" | "invite" } | { error: string };
  try {
    if (peekKind(token) === "invite") {
      const p = await verifyInviteToken(token, sessionSecret());
      next = `/demos/${p.slug}`;
      outcome = (await getInvite(p.slug, p.email)) ? { email: p.email, via: "invite" } : { error: "revoked" };
    } else {
      const p = await verifyLinkToken(token, sessionSecret());
      outcome = (await consumeLinkToken(p.jti)) ? { email: p.email, via: "link" } : { error: "used" };
    }
  } catch (err) {
    outcome = { error: err instanceof Error && err.name === "JWTExpired" ? "expired" : "invalid" };
  }
  if ("error" in outcome) return back(outcome.error);
  const { email, via } = outcome;

  const jar = await cookies();
  jar.set(sessionCookie(await signSessionToken(email, sessionSecret())));
  try {
    await recordSignIn(email, (await headers()).get("user-agent"), via);
  } catch (err) {
    // The log is for Joe; a hiccup writing it must not lock the viewer out.
    console.error("[demos] sign-in log failed:", err instanceof Error ? err.message : err);
  }
  redirect(next);
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.set(sessionCookie(""));
  redirect("/demos");
}
