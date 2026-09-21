"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { site } from "@/content/site";
import { mayRequestLink, normalizeEmail } from "@/lib/demos/access";
import { ownerEmails, sessionSecret } from "@/lib/demos/config";
import { sendSignInLink } from "@/lib/demos/email";
import { safeNext } from "@/lib/demos/paths";
import { sessionCookie } from "@/lib/demos/session";
import { issueLinkToken, listDemos } from "@/lib/demos/store";
import { newJti, signLinkToken } from "@/lib/demos/tokens";

/** Production links must carry the real domain; previews and localhost use
 *  whatever host the form was submitted on so the link comes back here. */
async function baseUrl(): Promise<string> {
  if (process.env.VERCEL_ENV === "production") return site.url;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** The sign-in form. Whatever the address, the answer is "check your inbox":
 *  the allowlist is never confirmed or denied to the person typing. */
export async function requestLink(formData: FormData): Promise<void> {
  const email = normalizeEmail(formData.get("email"));
  const next = safeNext(formData.get("next"));
  if (!email) redirect(`/demos?error=email&next=${encodeURIComponent(next)}`);

  let failed = false;
  if (mayRequestLink(email, ownerEmails(), await listDemos())) {
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

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.set(sessionCookie(""));
  redirect("/demos");
}
