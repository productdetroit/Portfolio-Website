"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeEmail } from "@/lib/demos/access";
import { sessionSecret } from "@/lib/demos/config";
import { sendInviteEmail } from "@/lib/demos/email";
import { validateInviteInput, type Invite } from "@/lib/demos/invites";
import { isSlug } from "@/lib/demos/manifest";
import { getViewer } from "@/lib/demos/session";
import { deleteInvite, getDemo, getInvite, saveInvite } from "@/lib/demos/store";
import { signInviteToken } from "@/lib/demos/tokens";
import { baseUrl } from "@/lib/demos/url";

/** Owners only. Anyone else — including a signed-in invitee who guesses the
 *  form — gets the same 404 the page gives them. */
async function requireOwner() {
  const viewer = await getViewer();
  if (!viewer?.owner) redirect("/demos");
  return viewer;
}

/** Back to the console with a one-line result, scrolled to the demo. */
function done(slug: string, ok: string, email?: string): never {
  const q = new URLSearchParams({ ok, ...(email ? { email } : {}) });
  redirect(`/demos/access?${q}#demo-${slug}`);
}
function fail(slug: string, error: string): never {
  redirect(`/demos/access?${new URLSearchParams({ error })}#demo-${slug}`);
}

const str = (f: FormData, k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string) : "");

/** The personal link an invitation carries: a 14-day token for this email
 *  and demo. Stateless — minting another never invalidates one already sent;
 *  the invite record in Blob is what /demos/verify checks. */
async function inviteUrl(slug: string, email: string): Promise<string> {
  const token = await signInviteToken(email, slug, sessionSecret());
  return `${await baseUrl()}/demos/verify?token=${encodeURIComponent(token)}`;
}

async function deliver(invite: Invite): Promise<void> {
  const demo = await getDemo(invite.slug);
  if (!demo) throw new Error(`no demo ${invite.slug}`);
  await sendInviteEmail(invite, demo, await inviteUrl(invite.slug, invite.email));
}

export type InviteLinkResult = { ok: true; link: string } | { ok: false; error: string };

/** The same link the email carries, for pasting into a note Joe sends by
 *  hand when the invitation itself isn't getting through. Read-only: the
 *  invite record is checked, never written, so the Sent time stays put and
 *  the emailed link keeps working. Returned to the caller, not redirected
 *  to, so the token never lands in a URL bar or a request log. */
export async function inviteLink(slug: string, email: string): Promise<InviteLinkResult> {
  await requireOwner();
  const to = normalizeEmail(email);
  if (!isSlug(slug) || !to) return { ok: false, error: "That invitation doesn't look right." };
  if (!(await getInvite(slug, to))) return { ok: false, error: "That invitation no longer exists." };
  try {
    return { ok: true, link: await inviteUrl(slug, to) };
  } catch (err) {
    console.error("[demos] invite link failed:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Couldn't make the link just now. Try again." };
  }
}

/** New invitation, or a fresh note to someone already invited (keeps their
 *  original invitedAt so the log still shows when they first heard). */
export async function sendInvite(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const slug = str(formData, "slug");
  if (!isSlug(slug) || !(await getDemo(slug))) redirect("/demos/access");
  const email = normalizeEmail(formData.get("email"));
  if (!email) fail(slug, "That doesn't look like an email address.");
  const input = validateInviteInput({ name: str(formData, "name"), subject: str(formData, "subject"), message: str(formData, "message") });
  if (!input.ok) fail(slug, input.error);

  const now = new Date().toISOString();
  const existing = await getInvite(slug, email);
  const invite: Invite = {
    slug,
    email,
    ...input.value,
    invitedAt: existing?.invitedAt ?? now,
    invitedBy: owner.email,
    lastSentAt: now,
  };

  let error: string | null = null;
  try {
    await saveInvite(invite);
    await deliver(invite);
  } catch (err) {
    console.error("[demos] invite failed:", err instanceof Error ? err.message : err);
    error = "The invitation was saved but the email didn't send. Try Resend in a minute.";
  }
  revalidatePath("/demos/access");
  if (error) fail(slug, error);
  done(slug, existing ? "resent" : "sent", email);
}

/** Same note again — for the "it went to spam, can you send it again" reply. */
export async function resendInvite(formData: FormData): Promise<void> {
  await requireOwner();
  const slug = str(formData, "slug");
  const email = normalizeEmail(formData.get("email"));
  if (!isSlug(slug) || !email) redirect("/demos/access");
  const invite = await getInvite(slug, email);
  if (!invite) fail(slug, "That invitation no longer exists.");

  let error: string | null = null;
  try {
    invite.lastSentAt = new Date().toISOString();
    await saveInvite(invite);
    await deliver(invite);
  } catch (err) {
    console.error("[demos] resend failed:", err instanceof Error ? err.message : err);
    error = "The email didn't send. Try again in a minute.";
  }
  revalidatePath("/demos/access");
  if (error) fail(slug, error);
  done(slug, "resent", email);
}

/** Pull access. Their invite link stops working on the next click; a live
 *  session ends at its next page load because the demo drops off their list. */
export async function revokeInvite(formData: FormData): Promise<void> {
  await requireOwner();
  const slug = str(formData, "slug");
  const email = normalizeEmail(formData.get("email"));
  if (!isSlug(slug) || !email) redirect("/demos/access");
  try {
    await deleteInvite(slug, email);
  } catch (err) {
    console.error("[demos] revoke failed:", err instanceof Error ? err.message : err);
    fail(slug, "Couldn't revoke just now. Try again.");
  }
  revalidatePath("/demos/access");
  done(slug, "revoked", email);
}
