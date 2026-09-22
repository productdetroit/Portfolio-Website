"use client";

import { useEffect, useRef, useState } from "react";
import { inviteLink } from "@/app/demos/access/actions";

type Props = { slug: string; email: string };

type State =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "copied" }
  | { kind: "shown"; link: string }
  | { kind: "error"; error: string };

/** "Copy link" on an invitation row. Asks the server for the person's
 *  personal link (never written to the page, so it isn't in the HTML or a
 *  URL) and puts it on the clipboard. Where the clipboard refuses — Safari
 *  after an await, a non-secure origin — the link appears in a field that
 *  selects itself so it can still be copied by hand. */
export default function CopyInviteLink({ slug, email }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    if (state.kind === "busy") return;
    setState({ kind: "busy" });
    let result: Awaited<ReturnType<typeof inviteLink>>;
    try {
      result = await inviteLink(slug, email);
    } catch {
      result = { ok: false, error: "Couldn't reach the server. Try again." };
    }
    if (!result.ok) {
      setState({ kind: "error", error: result.error });
      return;
    }
    try {
      await navigator.clipboard.writeText(result.link);
      setState({ kind: "copied" });
      timer.current = window.setTimeout(() => setState({ kind: "idle" }), 3000);
    } catch {
      setState({ kind: "shown", link: result.link });
    }
  }

  const label = state.kind === "copied" ? "Copied" : state.kind === "busy" ? "Copying…" : "Copy link";

  return (
    <span className="dm-copy" aria-live="polite">
      <button type="button" className="dm-link-btn" onClick={copy} disabled={state.kind === "busy"}>
        {label}
      </button>
      {state.kind === "shown" ? (
        <input
          className="dm-copy-field"
          type="text"
          readOnly
          value={state.link}
          aria-label={`Invitation link for ${email}`}
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.currentTarget.select()}
          autoFocus
        />
      ) : null}
      {state.kind === "error" ? <span className="dm-copy-note dm-copy-error">{state.error}</span> : null}
    </span>
  );
}
