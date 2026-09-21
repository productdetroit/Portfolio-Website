import { Fragment } from "react";
import { notFound, redirect } from "next/navigation";
import DemoBar from "@/components/DemoBar";
import { MESSAGE_MAX, NAME_MAX, SUBJECT_MAX, defaultMessage, defaultSubject } from "@/lib/demos/invites";
import type { Demo } from "@/lib/demos/manifest";
import { buildReport, type DemoReport, type PersonRow } from "@/lib/demos/report";
import { getViewer } from "@/lib/demos/session";
import { listDemos, listInvites, readAccessLog } from "@/lib/demos/store";
import { resendInvite, revokeInvite, sendInvite } from "./actions";

export const dynamic = "force-dynamic";

type Search = { ok?: string; email?: string; error?: string };

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Detroit",
});
const when = (d?: Date | string) => (d ? fmt.format(typeof d === "string" ? new Date(d) : d) : "—");

const OK: Record<string, string> = {
  sent: "Invitation sent to",
  resent: "Sent again to",
  revoked: "Access revoked for",
};

function Status({ p }: { p: PersonRow }) {
  return (
    <>
      <td>{p.signIns === 0 ? <span className="dm-pending">not yet</span> : `${p.signIns}× · last ${when(p.lastSignIn)}`}</td>
      <td>{p.views === 0 ? "—" : `${p.views}× · last ${when(p.lastView)}`}</td>
    </>
  );
}

/** One demo's block: who's invited, then the form to invite the next
 *  person. The form is plain HTML posting to a server action — no client
 *  JS, so it works the moment the page renders. */
function DemoBlock({ report }: { report: DemoReport }) {
  const { demo, invites, rules } = report;
  return (
    <section id={`demo-${demo.slug}`} className="dm-section" aria-labelledby={`h-${demo.slug}`}>
      <div className="dm-wrap">
        <div className="dm-sec-head">
          <div className="dm-kicker">/demos/{demo.slug}</div>
          <h2 id={`h-${demo.slug}`}>{demo.title}</h2>
        </div>

        {invites.length === 0 ? (
          <p>No one has been invited yet.</p>
        ) : (
          <table className="dm-table">
            <thead>
              <tr>
                <th>Invited</th>
                <th>Sent</th>
                <th>Signed in</th>
                <th>Opened</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invites.map(({ invite, person }) => (
                <tr key={invite.email}>
                  <td>
                    {invite.name ? <strong>{invite.name}</strong> : null}
                    {invite.name ? <br /> : null}
                    {invite.email}
                  </td>
                  <td>
                    {when(invite.lastSentAt)}
                    {invite.lastSentAt !== invite.invitedAt ? <span className="dm-faint"> · first {when(invite.invitedAt)}</span> : null}
                  </td>
                  <Status p={person} />
                  <td className="dm-actions">
                    <form action={resendInvite}>
                      <input type="hidden" name="slug" value={demo.slug} />
                      <input type="hidden" name="email" value={invite.email} />
                      <button type="submit" className="dm-link-btn">Resend</button>
                    </form>
                    <form action={revokeInvite}>
                      <input type="hidden" name="slug" value={demo.slug} />
                      <input type="hidden" name="email" value={invite.email} />
                      <button type="submit" className="dm-link-btn dm-danger">Revoke</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {rules.length > 0 ? (
          <details className="dm-rules">
            <summary>Also allowed by rule in demo.md</summary>
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Signed in</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) =>
                  r.kind === "email" ? (
                    <tr key={r.rule}>
                      <td>{r.person.email}</td>
                      <Status p={r.person} />
                    </tr>
                  ) : (
                    <Fragment key={r.rule}>
                      <tr className="dm-rule">
                        <td colSpan={3}>
                          anyone <strong>{r.rule}</strong>
                          {r.people.length === 0 ? " — no one from there has signed in yet" : ""}
                        </td>
                      </tr>
                      {r.people.map((p) => (
                        <tr key={p.email}>
                          <td>{p.email}</td>
                          <Status p={p} />
                        </tr>
                      ))}
                    </Fragment>
                  ),
                )}
              </tbody>
            </table>
          </details>
        ) : null}

        <InviteForm demo={demo} />
      </div>
    </section>
  );
}

function InviteForm({ demo }: { demo: Demo }) {
  const id = (f: string) => `inv-${demo.slug}-${f}`;
  return (
    <details className="dm-invite">
      <summary className="dm-btn">Invite someone</summary>
      <form action={sendInvite} className="dm-invite-form">
        <input type="hidden" name="slug" value={demo.slug} />
        <div className="dm-two">
          <div>
            <label htmlFor={id("email")}>Email</label>
            <input id={id("email")} name="email" type="email" required autoComplete="off" placeholder="ana@motor.com" />
          </div>
          <div>
            <label htmlFor={id("name")}>Name (optional)</label>
            <input id={id("name")} name="name" type="text" maxLength={NAME_MAX} autoComplete="off" placeholder="Ana" />
          </div>
        </div>
        <label htmlFor={id("subject")}>Subject</label>
        <input id={id("subject")} name="subject" type="text" required maxLength={SUBJECT_MAX} defaultValue={defaultSubject(demo)} />
        <label htmlFor={id("message")}>Your message</label>
        <textarea id={id("message")} name="message" required rows={9} maxLength={MESSAGE_MAX} defaultValue={defaultMessage(demo)} />
        <p className="dm-sub">
          Sent from demos@productdetroit.com with replies to you. The email adds an <em>Open the demo</em> button under your
          message — a personal link that signs them in for 30 days, valid for 14 days or until you revoke it.
        </p>
        <button type="submit" className="dm-btn">
          Send invitation
        </button>
      </form>
    </details>
  );
}

/** Owners only. Invite people, see who's signed in and opened what. */
export default async function AccessPage({ searchParams }: { searchParams: Promise<Search> }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/demos?next=/demos/access");
  if (!viewer.owner) notFound();

  const sp = await searchParams;
  const [demos, invites, log] = await Promise.all([listDemos(), listInvites(), readAccessLog()]);
  const report = buildReport(demos, invites, log.signIns, log.views);

  return (
    <>
      <DemoBar viewer={viewer} current="access" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">Owners</div>
          <h1>Invitations</h1>
          <p className="dm-lede">
            {invites.length} invited · {log.signIns.length} sign-in{log.signIns.length === 1 ? "" : "s"} ·{" "}
            {log.views.length} demo open{log.views.length === 1 ? "" : "s"} · times in Detroit
          </p>
          {sp.ok && OK[sp.ok] ? (
            <p className="dm-banner" role="status">
              {OK[sp.ok]} <strong>{sp.email}</strong>.
            </p>
          ) : null}
          {sp.error ? (
            <p className="dm-banner dm-banner-error" role="alert">
              {sp.error}
            </p>
          ) : null}
        </div>
      </header>

      {report.perDemo.length === 0 ? (
        <section className="dm-section">
          <div className="dm-wrap">
            <p>
              No demos are published yet — <code>npm run demo -- publish &lt;folder&gt;</code> one first.
            </p>
          </div>
        </section>
      ) : (
        report.perDemo.map((r) => <DemoBlock key={r.demo.slug} report={r} />)
      )}

      {report.others.length > 0 ? (
        <section className="dm-section" aria-labelledby="acc-others">
          <div className="dm-wrap">
            <div className="dm-sec-head">
              <div className="dm-kicker">Not invited anywhere</div>
              <h2 id="acc-others">Other sign-ins</h2>
            </div>
            <p>Owners, and anyone whose access was since revoked.</p>
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Signed in</th>
                  <th>Demos opened</th>
                </tr>
              </thead>
              <tbody>
                {report.others.map((p) => (
                  <tr key={p.email}>
                    <td>{p.email}</td>
                    <Status p={p} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}
