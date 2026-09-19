import { notFound, redirect } from "next/navigation";
import DemoBar from "@/components/DemoBar";
import DemoMarkdown from "@/components/DemoMarkdown";
import { isSlug } from "@/lib/demos/manifest";
import { getViewer } from "@/lib/demos/session";
import { recordView, videoUrl } from "@/lib/demos/store";

export const dynamic = "force-dynamic";

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect(`/demos?next=${encodeURIComponent(`/demos/${slug}`)}`);

  /* Not on this viewer's list → 404, not 403: a demo they weren't invited
     to shouldn't be confirmed to exist. */
  const demo = viewer.demos.find((d) => d.slug === slug);
  if (!demo) notFound();

  const [src] = await Promise.all([
    videoUrl(demo),
    recordView(viewer.email, demo.slug).catch((err: unknown) =>
      console.error("[demos] view log failed:", err instanceof Error ? err.message : err),
    ),
  ]);

  return (
    <>
      <DemoBar viewer={viewer} current="demo" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">Demo</div>
          <h1>{demo.title}</h1>
          {demo.summary ? <p className="dm-lede">{demo.summary}</p> : null}
          {demo.updated ? <p className="dm-sub">Updated {demo.updated}</p> : null}
        </div>
      </header>

      {src ? (
        <section className="dm-section" aria-label="Walkthrough">
          <div className="dm-wrap">
            {/* The URL is signed and expires in a few hours — reload the page for a fresh one. */}
            <video className="dm-video" controls preload="metadata" playsInline src={src} />
          </div>
        </section>
      ) : null}

      {demo.links.length > 0 ? (
        <section className="dm-section" aria-label="Links">
          <div className="dm-wrap">
            <div className="dm-links">
              {demo.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="dm-btn">
                  {l.label} &#8599;
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {demo.body ? (
        <section className="dm-section" aria-label="Instructions">
          <div className="dm-wrap">
            <DemoMarkdown markdown={demo.body} />
          </div>
        </section>
      ) : null}
    </>
  );
}
