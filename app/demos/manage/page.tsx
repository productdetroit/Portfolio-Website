import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DemoBar from "@/components/DemoBar";
import { getViewer } from "@/lib/demos/session";
import { listDemos, listInvites } from "@/lib/demos/store";

export const dynamic = "force-dynamic";

/** Owners only. Every published demo with a way in to edit it, and the
 *  button that starts a new one. */
export default async function ManagePage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/demos?next=/demos/manage");
  if (!viewer.owner) notFound();

  const sp = await searchParams;
  const [demos, invites] = await Promise.all([listDemos(), listInvites()]);
  const invitedFor = (slug: string) => invites.filter((i) => i.slug === slug).length;

  return (
    <>
      <DemoBar viewer={viewer} current="manage" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">Owners</div>
          <h1>Demos</h1>
          <p className="dm-lede">
            {demos.length === 0 ? "Nothing published yet." : `${demos.length} published.`} Each demo is a write-up, a video, and
            links to the live product.
          </p>
          {sp.deleted ? (
            <p className="dm-banner" role="status">
              Deleted <strong>/demos/{sp.deleted}</strong>.
            </p>
          ) : null}
          <Link href="/demos/manage/new" className="dm-btn">
            New demo
          </Link>
        </div>
      </header>

      {demos.length > 0 ? (
        <section className="dm-section" aria-label="Published demos">
          <div className="dm-wrap">
            <div className="dm-list">
              {demos.map((d) => (
                <div key={d.slug} className="dm-card dm-card-static">
                  <div className="dm-card-top">
                    <h2>{d.title}</h2>
                    {d.updated ? <span className="dm-date">Updated {d.updated}</span> : null}
                  </div>
                  {d.summary ? <p>{d.summary}</p> : null}
                  <p className="dm-meta">
                    /demos/{d.slug} · {d.video ? d.video : "no video"} · {invitedFor(d.slug)} invited
                    {d.access.length ? ` · rules: ${d.access.join(", ")}` : ""}
                  </p>
                  <div className="dm-card-links">
                    <Link href={`/demos/manage/${d.slug}`}>Edit</Link>
                    <Link href={`/demos/${d.slug}`}>View</Link>
                    <Link href={`/demos/access#demo-${d.slug}`}>Invite</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
