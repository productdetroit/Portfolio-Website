"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import type { EditorFields } from "@/lib/demos/editor";
import { safeVideoName } from "@/lib/demos/video";
import { removeDemo, saveDemo } from "@/app/demos/manage/actions";

type Props = {
  mode: "create" | "edit";
  slug: string;
  fields: EditorFields;
  error?: string;
  saved?: boolean;
};

type Upload = { name: string; pct: number; done: boolean; error?: string };

/** The demo form. Every field is a plain input posting to the saveDemo
 *  server action — except the video, which the browser uploads straight to
 *  Blob before the form submits (see app/demos/manage/upload). The upload's
 *  filename then rides along in the hidden `video` field. */
export default function DemoEditor({ mode, slug: initialSlug, fields, error, saved }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [slug, setSlug] = useState(initialSlug);
  const [video, setVideo] = useState(fields.video);
  const [up, setUp] = useState<Upload | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    if (submitter?.dataset.delete) return; // deleting — never upload first
    const file = fileRef.current?.files?.[0];
    if (!file) return; // nothing to upload — let the server action run
    e.preventDefault();
    const name = safeVideoName(file.name);
    if (!name) {
      setUp({ name: file.name, pct: 0, done: false, error: "Use an .mp4, .mov, .webm or .m4v file." });
      return;
    }
    if (mode === "create" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setUp({ name, pct: 0, done: false, error: "Set the URL name first — the video is stored under it." });
      return;
    }
    setBusy(true);
    setUp({ name, pct: 0, done: false });
    try {
      await upload(`demos/${slug}/${name}`, file, {
        access: "private",
        handleUploadUrl: "/demos/manage/upload",
        multipart: true,
        onUploadProgress: ({ percentage }) => setUp({ name, pct: Math.round(percentage), done: false }),
      });
      setUp({ name, pct: 100, done: true });
      setVideo(name);
      if (videoRef.current) videoRef.current.value = name;
      if (fileRef.current) fileRef.current.value = ""; // don't post the file to the action
      formRef.current?.requestSubmit();
    } catch (err) {
      setBusy(false);
      setUp({ name, pct: 0, done: false, error: err instanceof Error ? err.message : "Upload failed." });
    }
  }

  return (
    <form ref={formRef} action={saveDemo} onSubmit={onSubmit} className="dm-editor">
      <input type="hidden" name="mode" value={mode} />
      <input ref={videoRef} type="hidden" name="video" value={video} readOnly />

      {saved ? (
        <p className="dm-banner" role="status">
          Saved. <a href={`/demos/${slug}`}>View the demo</a> or <a href="/demos/access">invite someone</a>.
        </p>
      ) : null}
      {error ? (
        <p className="dm-banner dm-banner-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="dm-two">
        <div>
          <label htmlFor="ed-slug">URL name</label>
          {mode === "create" ? (
            <input
              id="ed-slug"
              name="slug"
              type="text"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="motor-quote"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              autoComplete="off"
            />
          ) : (
            <>
              <input id="ed-slug" type="text" value={slug} readOnly aria-readonly className="dm-readonly" />
              <input type="hidden" name="slug" value={slug} />
            </>
          )}
          <p className="dm-hint">
            productdetroit.com/demos/<strong>{slug || "…"}</strong>
          </p>
        </div>
        <div>
          <label htmlFor="ed-updated">Updated</label>
          <input id="ed-updated" name="updated" type="date" defaultValue={fields.updated} />
          <p className="dm-hint">Shown on the card; newest first.</p>
        </div>
      </div>

      <label htmlFor="ed-title">Title</label>
      <input id="ed-title" name="title" type="text" required defaultValue={fields.title} placeholder="MotorAdvisor — quote-to-invoice walkthrough" />

      <label htmlFor="ed-summary">Summary</label>
      <input id="ed-summary" name="summary" type="text" defaultValue={fields.summary} placeholder="One line under the title." />

      <label htmlFor="ed-file">Video</label>
      <div className="dm-video-field">
        {video && !up ? (
          <p className="dm-hint">
            Current: <strong>{video}</strong> — choose a file to replace it, or{" "}
            <button
              type="button"
              className="dm-link-btn dm-danger"
              onClick={() => {
                setVideo("");
                if (videoRef.current) videoRef.current.value = "";
              }}
            >
              remove it
            </button>
            .
          </p>
        ) : null}
        <input id="ed-file" ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v" disabled={busy} />
        {up ? (
          <div className="dm-progress" aria-live="polite">
            <div className="dm-progress-bar" style={{ width: `${up.pct}%` }} />
            <span>
              {up.error ? up.error : up.done ? `Uploaded ${up.name} — saving…` : `Uploading ${up.name}… ${up.pct}%`}
            </span>
          </div>
        ) : (
          <p className="dm-hint">Goes straight to private storage from your browser; large files are fine. Save when it finishes.</p>
        )}
      </div>

      <label htmlFor="ed-links">Links</label>
      <textarea id="ed-links" name="links" rows={3} defaultValue={fields.links} placeholder={"Open the live app | https://…\nMCP endpoint | https://…"} />
      <p className="dm-hint">One per line, <code>Label | https://…</code>. Shown as buttons above the write-up.</p>

      <label htmlFor="ed-body">Write-up</label>
      <textarea id="ed-body" name="body" rows={18} defaultValue={fields.body} />
      <p className="dm-hint">Markdown: headings, lists, tables, code blocks, links.</p>

      <label htmlFor="ed-access">Also allow by rule (optional)</label>
      <textarea id="ed-access" name="access" rows={2} defaultValue={fields.access} placeholder={"@motor.com\nsomeone@example.com"} />
      <p className="dm-hint">
        One per line. Invitations from the <a href="/demos/access">Invitations</a> page are the usual way in; rules are for whole companies.
      </p>

      <div className="dm-editor-actions">
        <button type="submit" className="dm-btn" disabled={busy}>
          {busy ? "Working…" : mode === "create" ? "Create demo" : "Save changes"}
        </button>
        {mode === "edit" ? (
          <button
            type="submit"
            formAction={removeDemo}
            formNoValidate
            data-delete="1"
            className="dm-link-btn dm-danger"
            disabled={busy}
            onClick={(e) => {
              if (!confirm(`Delete /demos/${slug} and its video? Invitations stay in the log but stop working.`)) e.preventDefault();
            }}
          >
            Delete demo
          </button>
        ) : null}
      </div>
    </form>
  );
}
