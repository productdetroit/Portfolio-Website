import { Fragment } from "react";
import { notFound, redirect } from "next/navigation";
import DemoBar from "@/components/DemoBar";
import { buildReport, type PersonRow } from "@/lib/demos/report";
import { getViewer } from "@/lib/demos/session";
import { listDemos, readAccessLog } from "@/lib/demos/store";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Detroit",
});
const when = (d?: Date) => (d ? fmt.format(d) : "—");

function PersonLine({ p, showViews }: { p: PersonRow; showViews: boolean }) {
  const status = p.signIns === 0 ? "not yet" : `${p.signIns}× · last ${when(p.lastSignIn)}`;
  return (
    <tr className={p.signIns === 0 ? "dm-pending" : undefined}>
      <td>{p.email}</td>
      <td>{status}</td>
      {showViews ? <td>{p.views === 0 ? "—" : `${p.views}× · last ${when(p.lastView)}`}</td> : null}
    </tr>
  );
}

/** Owners only. Who was invited to what, whether they've signed in, and
 *  whether they opened it. Built from the append-only log in Blob. */
export default async function AccessPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/demos?next=/demos/access");
  if (!viewer.owner) notFound();

  const [demos, log] = await Promise.all([listDemos(), readAccessLog()]);
  const report = buildReport(demos, log.signIns, log.views);

  return (
    <>
      <DemoBar viewer={viewer} current="access" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">Owners</div>
          <h1>Access log</h1>
          <p className="dm-lede">
            {log.signIns.length} sign-in{log.signIns.length === 1 ? "" : "s"} · {log.views.length} demo open
            {log.views.length === 1 ? "" : "s"} · times in Detroit
          </p>
        </div>
      </header>

      {report.perDemo.map(({ demo, rules }) => (
        <section key={demo.slug} className="dm-section" aria-labelledby={`acc-${demo.slug}`}>
          <div className="dm-wrap">
            <div className="dm-sec-head">
              <div className="dm-kicker">/demos/{demo.slug}</div>
              <h2 id={`acc-${demo.slug}`}>{demo.title}</h2>
            </div>
            {rules.length === 0 ? (
              <p>No one is on this demo&rsquo;s access list.</p>
            ) : (
              <table className="dm-table">
                <thead>
                  <tr>
                    <th>Invited</th>
                    <th>Signed in</th>
                    <th>Opened this demo</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) =>
                    r.kind === "email" ? (
                      <PersonLine key={r.rule} p={r.person} showViews />
                    ) : (
                      <Fragment key={r.rule}>
                        <tr className="dm-rule">
                          <td colSpan={3}>
                            anyone <strong>{r.rule}</strong>
                            {r.people.length === 0 ? " — no one from there has signed in yet" : ""}
                          </td>
                        </tr>
                        {r.people.map((p) => (
                          <PersonLine key={`${r.rule}:${p.email}`} p={p} showViews />
                        ))}
                      </Fragment>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ))}

      {report.others.length > 0 ? (
        <section className="dm-section" aria-labelledby="acc-others">
          <div className="dm-wrap">
            <div className="dm-sec-head">
              <div className="dm-kicker">Not on any list</div>
              <h2 id="acc-others">Other sign-ins</h2>
            </div>
            <p>Owners, and anyone whose access was since removed.</p>
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
                  <PersonLine key={p.email} p={p} showViews />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}
