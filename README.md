# productdetroit.com

**© 2026 Joe Ross / Product Detroit LLC. All rights reserved.** This repository
is public so the build process it documents can be verified — not for reuse. No
license is granted to copy, modify, or redistribute the code or content.

Next.js 16 (App Router, TypeScript) portfolio site for Joe Ross / Product Detroit LLC.
Ported from the original static `index.html` with **no content or visual changes**.

Backlog: Jira project `PDW` · Spec: Confluence space `PD`

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure

```
app/
  layout.tsx              nav, footer, fonts, GA4, metadata
  page.tsx                home — composes the sections
  globals.css             the original stylesheet, ported verbatim
  messaging-terms/        ⚠ placeholder — see "Before DNS cutover"
  privacy/                ⚠ placeholder — see "Before DNS cutover"
components/
  Nav.tsx  Footer.tsx  Sections.tsx  LegalPage.tsx
content/
  site.ts                 all copy, links, career, press, proof stats
  legal.ts                policy text (placeholder)
lib/                      reserved for the build log providers (PDW-4)
```

**All copy lives in `content/site.ts`.** Edit text there, not in components. The
components are presentational only.

## Page titles

One convention, defined once and applied by the root layout's title template:

- **Homepage** — `site.metaTitle` verbatim (the `<title>`-only variant; OG/Twitter
  tags use `site.title`, per update-spec §5.3)
- **Every other page** — declares only its short name (`title: "Building"`); the
  template in `site.titleTemplate` appends `— Joe Ross, Product Detroit`
- Next.js does **not** apply the template to OG/Twitter tags, so per-route
  metadata spells out the full title for those (see `app/building/page.tsx`)

Don't rename titles casually: GA4's "Page title" dimension creates a new row for
every distinct historical title, permanently splitting that page's data. Analyze
by "Page path and screen class" instead.

## Deploying

The Vercel project already exists: `portfolio-website`
(`prj_Ly1uukxwVUcebdwjE7puKMhyCsAr`, team `team_QPNvbUaSuTv0tNOvAo4Tt7Xg`).
Its one previous deployment failed because the repo held a bare `index.html` —
Vercel detected no framework and had nothing to build. That is now fixed.

1. Push this tree to the GitHub repo
2. In Vercel → project → Settings → Git, connect that repo
3. Framework preset: **Next.js** (auto-detected). Leave build command, output
   directory, and install command on their defaults — do not override them
4. Push to `main` → production deploy. Every PR gets a preview URL

Confirm afterwards that the project reports a non-null `framework` and
`live: true`; that is the PDW-2 acceptance criterion.

## Private demos (`/demos`)

Invitation-only space for sharing product demos — a walkthrough video, links
to the live app and MCP, and instructions — with named people. Not in the
nav, `noindex`, and nothing private is in this (public) repo: demo content
lives in the private Vercel Blob store `productdetroit-demos`.

**Inviting people.** Owners open `/demos/access`, pick a demo, and send an
invitation: email, name, subject and a personal message. The email goes out
from `joe@productdetroit.com` (Joe himself; sign-in links use `demos@`) with the message verbatim
and an *Open the demo* button — a personal link, valid 14 days, that signs
them in for 30 days. The same page shows who's been invited, whether they've
signed in and opened the demo, with **Resend** and **Revoke**. Invites are
one file each in Blob (`demos/_invites/<demo>/<email>.json`); revoking
deletes the file, which kills the link and drops the demo from any live
session on its next page load. A demo's `access:` list in `demo.md` still
works for rules like `@motor.com`.

**Signing in later.** Anyone invited (or on a rule) can enter their email at
`/demos` for a one-time sign-in link (15 minutes, single use). Both kinds of
link land on a page with a **Continue** button rather than signing in on the
GET — corporate mail gateways pre-fetch every link in an email, and would
otherwise spend it. Sessions are 30-day HttpOnly cookies scoped to `/demos`.
Access is re-checked against the live manifest and invites on every request.
Video plays straight from Blob via a presigned URL that expires after four
hours. Every sign-in (with how: link or invite) and demo open is logged.

**Publishing a demo.** Owners open `/demos/manage` → **New demo**: URL name,
title, summary, links, the write-up in markdown, optional access rules, and
the video. The video uploads from the browser straight to the private Blob
store (multipart, with a progress bar — a Vercel function only accepts
~4.5 MB, so it never passes through one); the token route at
`/demos/manage/upload` hands out an upload token only to owners and only
for `demos/<slug>/<safe-name>`. Saving writes `demo.md` and prunes any
replaced video. Edit and Delete live on the same page.

The CLI still works on the same layout — a folder *outside this repo*
holding `demo.md` (copy `scripts/demo-template/demo.md`) and the video it
names:

```bash
npm run demo -- publish ../demos/motor-quote     # slug = folder name
npm run demo -- list
npm run demo -- remove motor-quote
```

Re-running `publish` overwrites the demo and deletes leftover files. The
frontmatter `access:` list takes full addresses or bare `@domain` rules.
Needs `BLOB_READ_WRITE_TOKEN` in `.env.local` (`vercel env pull`).

**Environment** (`lib/demos/config.ts`): `DEMO_SESSION_SECRET` (≥32 chars),
`DEMO_OWNER_EMAILS` (comma-separated; owners see everything),
`RESEND_API_KEY`, optional `DEMO_INVITE_FROM` (invitations; default Joe Ross <joe@productdetroit.com>) and `DEMO_FROM_EMAIL` (sign-in links; default
`Joe Ross <demos@productdetroit.com>` — the domain must be verified in
Resend). In `next dev` without `RESEND_API_KEY`, the sign-in link is printed
to the terminal instead of sent.

**Code.** `lib/demos/` — `access.ts` (rules), `invites.ts` (invite shape,
defaults, email rendering), `manifest.ts` (`demo.md` parser), `tokens.ts`
(jose: link / invite / session), `session.ts` (cookie → viewer), `store.ts`
(Blob), `email.ts`, `report.ts` (access log). Pure modules have tests.

## ⚠ Before DNS cutover (PDW-10)

`/messaging-terms` and `/privacy` currently render **placeholder text**. Both
URLs are cited in TopHand's Twilio toll-free SMS registration. If they serve
placeholder copy — or 404 — on the live domain, SMS delivery is at risk.

The real text was not in the static `index.html`; it lives on the Google Sites
property. Copy it across verbatim into `content/legal.ts`, then delete the
`isPlaceholder` flag on each document. The pages render a visible warning
banner until you do.

Both routes are set to `noindex` so they can't be indexed while incomplete.
Remove that once the real policy text is in.

## What changed in the port

Nothing visual. For the record:

- Repeating content (7 proof stats, 7 pillars, 3 career entries, 7 press items)
  moved from hand-written markup into typed arrays in `content/site.ts`
- `<iframe>` gained a `title` for accessibility
- External links gained `rel="noopener noreferrer"`
- GA4 loads via `next/script` with `afterInteractive` instead of a raw tag
- Two new routes for the compliance pages, which did not previously exist here
- Added a `.legal` block to `globals.css`; the original CSS is otherwise untouched

## Optional follow-up: self-hosted fonts

Fonts load from Google Fonts via a stylesheet link, matching the original. To
self-host them (removes a render-blocking third-party request and eliminates
font layout shift), delete the three `--font-*` declarations at the top of
`globals.css` and supply the same variable names from `next/font/google` in
`layout.tsx`:

```tsx
import { DM_Serif_Display, DM_Mono, Lato } from "next/font/google";

const dmSerif = DM_Serif_Display({ weight: "400", style: ["normal", "italic"],
  subsets: ["latin"], variable: "--font-dm-serif", display: "swap" });
const dmMono = DM_Mono({ weight: ["400", "500"],
  subsets: ["latin"], variable: "--font-dm-mono", display: "swap" });
const lato = Lato({ weight: ["300", "400", "700"],
  subsets: ["latin"], variable: "--font-lato", display: "swap" });

// then: <html lang="en" className={`${dmSerif.variable} ${dmMono.variable} ${lato.variable}`}>
```

Drop the three `<link>` tags in `<head>` at the same time. This was written and
tested against, but left off by default because it requires build-time network
access to Google Fonts.

## Next

`/building` — the live build-log scoreboard — is PDW-7. It needs the providers
and aggregator in `lib/buildlog/` first (PDW-4, PDW-5). See the Confluence spec.
