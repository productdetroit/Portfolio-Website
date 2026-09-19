import Link from "next/link";
import DemoBar from "@/components/DemoBar";
import { site } from "@/content/site";
import { safeNext } from "@/lib/demos/paths";
import { getViewer, type Viewer } from "@/lib/demos/session";
import { requestLink } from "./actions";

export const dynamic = "force-dynamic";

type Search = { sent?: string; error?: string; next?: string };

const ERRORS: Record<string, string> = {
  email: "That doesn't look like an email address.",
  expired: "That link has expired — they last 15 minutes. Request a fresh one.",
  used: "That link has already been used. Request a fresh one.",
  invalid: "That link isn't valid. Request a fresh one.",
  send: "The email couldn't be sent just now. Try again in a minute, or reply to the invitation.",
};

function SignIn({ sent, error, next }: Search) {
  return (
    <header className="dm-masthead">
      <div className="dm-wrap dm-narrow">
        <div className="dm-kicker">Private</div>
        <h1>Demos</h1>
        {sent ? (
          <>
            <p className="dm-lede">Check your inbox.</p>
            <p>
              If that address has been invited, a sign-in link is on its way. It works once and expires in 15
              minutes. Nothing arrived? Look in spam, then{" "}
              <Link href={`/demos?next=${encodeURIComponent(next ?? "/demos")}`}>try again</Link>.
            </p>
          </>
        ) : (
          <>
            <p className="dm-lede">Working demos of what I&rsquo;m building, shared by invitation.</p>
            <p>Enter the email address you were invited with and I&rsquo;ll send you a sign-in link.</p>
            <form action={requestLink} className="dm-form">
              <input type="hidden" name="next" value={next ?? "/demos"} />
              <label htmlFor="dm-email">Email</label>
              <div className="dm-form-row">
                <input
                  id="dm-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  placeholder="you@company.com"
                />
                <button type="submit" className="dm-btn">
                  Send link
                </button>
              </div>
              {error && ERRORS[error] ? (
                <p className="dm-error" role="alert">
                  {ERRORS[error]}
                </p>
              ) : null}
            </form>
            <p className="dm-sub">
              Not invited yet? <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </>
        )}
      </div>
    </header>
  );
}

function Index({ viewer }: { viewer: Viewer }) {
  return (
    <>
      <DemoBar viewer={viewer} current="index" />
      <header className="dm-masthead">
        <div className="dm-wrap">
          <div className="dm-kicker">Private</div>
          <h1>Demos</h1>
          <p className="dm-lede">
            {viewer.demos.length === 0
              ? "Nothing is shared with this address yet."
              : "What you've been invited to see. Each one has a walkthrough and a way to try it yourself."}
          </p>
        </div>
      </header>
      {viewer.demos.length > 0 ? (
        <section className="dm-section" aria-label="Your demos">
          <div className="dm-wrap">
            <div className="dm-list">
              {viewer.demos.map((d) => (
                <Link key={d.slug} href={`/demos/${d.slug}`} className="dm-card">
                  <div className="dm-card-top">
                    <h2>{d.title}</h2>
                    {d.updated ? <span className="dm-date">Updated {d.updated}</span> : null}
                  </div>
                  {d.summary ? <p>{d.summary}</p> : null}
                  <span className="dm-card-cta">
                    {d.video ? "Watch and try it" : "Open"} &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="dm-section" aria-label="No demos">
          <div className="dm-wrap dm-narrow">
            <p>
              You&rsquo;re signed in as <strong>{viewer.email}</strong>, but no demo lists that address. If you
              were expecting one, <a href={`mailto:${site.email}`}>let me know</a> which address you used.
            </p>
          </div>
        </section>
      )}
    </>
  );
}

export default async function DemosPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const viewer = await getViewer();
  if (!viewer) return <SignIn sent={sp.sent} error={sp.error} next={safeNext(sp.next)} />;
  return <Index viewer={viewer} />;
}
