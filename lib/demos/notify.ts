/** The note Joe gets the first time someone he invited opens their demo.
 *  Pure — the when-to-send lives in first-open.ts, the sending in email.ts. */
import { escapeHtml, type Invite } from "./invites";
import type { Demo } from "./manifest";

const TZ = "America/Detroit";

function when(d: Date): string {
  return d.toLocaleString("en-US", { timeZone: TZ, year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

/** "3 hours", "2 days" — how long the invite sat before it was opened. */
export function waited(from: Date, to: Date): string {
  const min = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const unit = (n: number, s: string) => `${n} ${s}${n === 1 ? "" : "s"}`;
  if (min < 60) return unit(min, "minute");
  const h = Math.round(min / 60);
  if (h < 48) return unit(h, "hour");
  return unit(Math.round(h / 24), "day");
}

export function renderOpenedNotice(
  invite: Invite,
  demo: Demo,
  openedAt: Date,
  userAgent: string | null,
  accessUrl: string,
): { subject: string; text: string; html: string } {
  const who = invite.name ? `${invite.name} (${invite.email})` : invite.email;
  const subject = `${invite.name || invite.email} opened ${demo.title}`;
  const lines: [string, string][] = [
    ["Who", who],
    ["Demo", demo.title],
    ["Opened", when(openedAt)],
    ["Invited", `${when(new Date(invite.invitedAt))} — ${waited(new Date(invite.invitedAt), openedAt)} earlier`],
    ...(userAgent ? ([["Browser", userAgent]] as [string, string][]) : []),
  ];
  const text = [
    `${who} just opened ${demo.title} for the first time.`,
    ``,
    ...lines.map(([k, v]) => `${k}: ${v}`),
    ``,
    `Access log: ${accessUrl}`,
  ].join("\n");
  const html = `<p>${escapeHtml(who)} just opened <strong>${escapeHtml(demo.title)}</strong> for the first time.</p>
<table style="border-collapse:collapse;font-size:14px">
${lines.map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#6b6460">${k}</td><td style="padding:2px 0">${escapeHtml(v)}</td></tr>`).join("\n")}
</table>
<p><a href="${escapeHtml(accessUrl)}">Open the access log</a></p>`;
  return { subject, text, html };
}
