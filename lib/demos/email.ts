/** The one email this space sends: a sign-in link. Plain and short — it has
 *  to survive a corporate mail filter and be obviously from Joe. */
import { Resend } from "resend";
import { site } from "../../content/site";
import { fromEmail, resendApiKey } from "./config";

export async function sendSignInLink(to: string, link: string): Promise<void> {
  /* `next dev` without a Resend key prints the link instead of sending it —
     the whole flow is testable locally. Never in a deployed build. */
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY) {
    console.log(`\n[demos] no RESEND_API_KEY — sign-in link for ${to}:\n${link}\n`);
    return;
  }
  const resend = new Resend(resendApiKey());
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
  const { error } = await resend.emails.send({
    from: fromEmail(),
    to,
    subject: `Your sign-in link — ${site.name} demos`,
    text,
    html,
  });
  if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
}
