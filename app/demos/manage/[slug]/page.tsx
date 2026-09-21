import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DemoBar from "@/components/DemoBar";
import DemoEditor from "@/components/DemoEditor";
import { fieldsFromDemo } from "@/lib/demos/editor";
import { isSlug } from "@/lib/demos/manifest";
import { getViewer } from "@/lib/demos/session";
import { getDemo } from "@/lib/demos/store";

export const dynamic = "force-dynamic";

type Search = { error?: string; saved?: string };

/** Owners only. `/demos/manage/new` starts a demo; any other slug edits
 *  the one with that name. */
export default async function EditDemoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const creating = slug === "new";
  if (!creating && !isSlug(slug)) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect(`/demos?next=/demos/manage`);
  if (!viewer.owner) notFound();

  const demo = creating ? undefined : await getDemo(slug);
  if (!creating && !demo) notFound();

  const sp = await searchParams;
  return (
    <>
      <DemoBar viewer={viewer} current="manage" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">
            <Link href="/demos/manage">Demos</Link> / {creating ? "New" : slug}
          </div>
          <h1>{creating ? "New demo" : demo!.title}</h1>
        </div>
      </header>
      <section className="dm-section" aria-label={creating ? "New demo" : "Edit demo"}>
        <div className="dm-wrap">
          {/* Keyed on the save stamp: a successful save redirects back to this
              same route, which would otherwise keep the mounted editor — stale
              busy state, stale field values — instead of showing what was
              actually stored. Error redirects keep the key so typed values
              survive a validation bounce. */}
          <DemoEditor
            key={sp.saved ? `saved-${sp.saved}` : "edit"}
            mode={creating ? "create" : "edit"}
            slug={creating ? "" : slug}
            fields={fieldsFromDemo(demo ?? undefined)}
            error={sp.error}
            saved={Boolean(sp.saved)}
          />
        </div>
      </section>
    </>
  );
}
