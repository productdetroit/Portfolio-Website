/** Invitations: one person, one demo, one personal note from Joe.
 *
 *  An invite is stored as one file in Blob (store.ts) and doubles as an
 *  access grant — `session.ts` treats "has an invite" like "matches a rule
 *  in demo.md". This module is the pure part: shape, defaults, validation,
 *  and turning Joe's plain-text note into safe email HTML. */
import { site } from "../../content/site";
import type { Demo } from "./manifest";

export type Invite = {
  /** Demo slug + normalized email identify an invite; there is one per pair. */
  slug: string;
  email: string;
  /** How Joe addressed them — shows in the log and the greeting. Optional. */
  name: string;
  subject: string;
  /** Plain text, newlines preserved. Rendered escaped. */
  message: string;
  invitedAt: string;
  invitedBy: string;
  /** Bumped by "Resend". */
  lastSentAt: string;
};

export const MESSAGE_MAX = 4000;
export const SUBJECT_MAX = 150;
export const NAME_MAX = 80;

export function defaultSubject(demo: Demo): string {
  return `A demo for you: ${demo.title}`;
}

/** What the textarea starts with. Joe edits it per person; the title is
 *  the demo's, the greeting uses the name if he typed one. */
export function defaultMessage(demo: Demo, name = ""): string {
  const hi = name.trim() ? `Hi ${name.trim().split(/\s+/)[0]},` : "Hi,";
  return [
    hi,
    ``,
    `I've put together a short walkthrough of ${demo.title}${demo.summary ? ` — ${demo.summary.replace(/\.$/, "")}` : ""}.`,
    ``,
    `The link below is yours: it opens the video, the write-up, and a way to try the live product yourself. I'd love to hear what you think.`,
    ``,
    `Joe`,
  ].join("\n");
}

export type InviteInput = { name: string; subject: string; message: string };

/** Trim, bound, and reject the empty. Returns the cleaned fields or a
 *  message the form can show. */
export function validateInviteInput(raw: Record<string, unknown>): { ok: true; value: InviteInput } | { ok: false; error: string } {
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).replace(/\r\n/g, "\n").trim() : "");
  const name = str("name");
  const subject = str("subject");
  const message = str("message");
  if (name.length > NAME_MAX) return { ok: false, error: `Name is over ${NAME_MAX} characters.` };
  if (!subject) return { ok: false, error: "Subject is empty." };
  if (subject.length > SUBJECT_MAX) return { ok: false, error: `Subject is over ${SUBJECT_MAX} characters.` };
  if (/[\r\n]/.test(subject)) return { ok: false, error: "Subject can't contain line breaks." };
  if (!message) return { ok: false, error: "Message is empty." };
  if (message.length > MESSAGE_MAX) return { ok: false, error: `Message is over ${MESSAGE_MAX} characters.` };
  return { ok: true, value: { name, subject, message } };
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Paragraphs on blank lines, <br> inside them, nothing else — Joe writes
 *  prose, not markup. */
export function messageToHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

/** The whole invite email. Text first — it has to read well in a corporate
 *  client with images off — HTML is the same words with a button. */
export function renderInviteEmail(invite: Invite, demo: Demo, link: string): { text: string; html: string } {
  const note = `This link is yours alone — it signs you in as ${invite.email} and works for 14 days. After that, enter your email at ${site.url}/demos for a fresh link.`;
  const text = [invite.message, ``, `Open the demo: ${link}`, ``, note].join("\n");
  const html = `${messageToHtml(invite.message)}
<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="background:#1f3a5f;color:#fff;text-decoration:none;padding:12px 22px;font-family:ui-monospace,Menlo,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase">Open the demo</a></p>
<p style="color:#6b6460;font-size:13px">${escapeHtml(note)}<br>If the button doesn't work, paste this into your browser:<br>${escapeHtml(link)}</p>`;
  return { text, html };
}
