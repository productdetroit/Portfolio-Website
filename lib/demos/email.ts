/** The two emails this space sends: a sign-in link, and Joe's invitation.
 *  Plain and short — they have to survive a corporate mail filter and be
 *  obviously from Joe. Replies go to his real inbox. */
import { Resend } from "resend";
import { site } from "../../content/site";
import { fromEmail, inviteFromEmail, resendApiKey } from "./config";
import { renderInviteEmail, type Invite } from "./invites";
import type { Demo } from "./manifest";

type Mail = { from: string; to: string; subject: string; text: string; html: string };

async function send(mail: Mail, label: string): Promise<void> {
  /* `next dev` without a Resend key prints the link instead of sending it —
     the whole flow is testable locally. Never in a deployed build. */
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log(`\n[demos] no RESEND_API_KEY — ${label} for ${mail.to}:\n${mail.text}\n`);
    return;
  }
  const resend = new Resend(resendApiKey());
  const { error } = await resend.emails.send({ replyTo: site.email, ...mail });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}

export async function sendInviteEmail(invite: Invite, demo: Demo, link: string): Promise<void> {
  const { text, html } = renderInviteEmail(invite, demo, link);
  await send({ from: inviteFromEmail(), to: invite.email, subject: invite.subject, text, html }, "invitation");
}

export async function sendSignInLink(to: string, link: string): Promise<void> {
  const text = [
    `Here's your sign-in link for the ${site.name} demo space:`,
    ``,
    link,
    ``,
    `It works once and expires in 15 minutes. If you didn't request it, ignore this email — nothing happens without the link.`,
    ``,
    `— Joe`,
  ].join("\n");
  const html = `<p>Here's your sign-in link for the ${site.name} demo space:</p>
<p><a href="${link}">Open the demos</a></p>
<p style="color:#6b6460;font-size:13px">It works once and expires in 15 minutes. If you didn't request it, ignore this email — nothing happens without the link.<br>If the button doesn't work, paste this into your browser:<br>${link}</p>
<p>— Joe</p>`;
  await send({ from: fromEmail(), to, subject: `Your sign-in link — ${site.name} demos`, text, html }, "sign-in link");
}
