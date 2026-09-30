/** Email Joe the first time an invitee opens the demo he invited them to.
 *
 *  Runs after the demo page has rendered (next/server `after`), so a slow
 *  Blob or Resend call never holds up the viewer. Once per invite: a marker
 *  file in Blob records that the notice went out. Owners and people admitted
 *  only by an `access:` rule don't trigger it — only UI invitations do. */
import { ownerEmails } from "./config";
import { sendOpenedNotice } from "./email";
import type { Demo } from "./manifest";
import { renderOpenedNotice } from "./notify";
import { claimNotice, getInvite, releaseNotice, viewedBefore, wasNotified } from "./store";

export async function notifyFirstOpen(
  email: string,
  demo: Demo,
  openedAt: Date,
  userAgent: string | null,
  accessUrl: string,
): Promise<void> {
  const owners = ownerEmails();
  if (owners.includes(email) || owners.length === 0) return;
  const invite = await getInvite(demo.slug, email);
  if (!invite) return;
  if (await wasNotified(demo.slug, email)) return;

  /* Checked before claiming: someone who opened it before this shipped
     gets a marker and no email — "first time" means first time. */
  const seenBefore = await viewedBefore(email, demo.slug, openedAt.getTime());
  if (!(await claimNotice(demo.slug, email))) return;
  if (seenBefore) return;

  try {
    await sendOpenedNotice(owners, renderOpenedNotice(invite, demo, openedAt, userAgent, accessUrl));
  } catch (err) {
    await releaseNotice(demo.slug, email).catch(() => {});
    throw err;
  }
}
