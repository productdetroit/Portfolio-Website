# Product screenshots — provenance and constraints

Every image here is captured from each product's **seeded demo tenant**, never a
live one. TopHand's first customer is a working dairy-goat farm in Michigan;
its records have no business on a public page. MotorAdvisor's shop data is
seeded too (Motor City Auto Care, William Hearst and the rest are fictional).

| File | What it shows | Source |
|---|---|---|
| `tophand.png` | The cut recommendation for a demo field — three gates, quality target in RFV, and the reasoning behind the call | `localhost` demo mode (no `DATABASE_URL`/`AUTH_SECRET`) |
| `motoradvisor-phone-ask.webp` | Chat on the phone: the owner's complaint in plain language, the advisor naming the four A/C bulletins to start from | Demo video v2, frame at 0:38 |
| `motoradvisor-phone-verdict.webp` | The work order's repair-or-replace card: a $285 repair against a $1,095–$2,320 trade-in value, "worth repairing" | Demo video v2, frame at 1:34 |
| `motoradvisor-phone-approve.webp` | The shop-branded estimate page on the customer's phone, $1,315.35 total, Approve / Decline | Demo video v2, frame at 1:46 |

## MotorAdvisor: where the phone shots come from

`G:\My Drive\MotorAdvisor\Demo\MotorAdvisor-demo-full-1080p-v2.mp4` (21 Sep
2026) is a 1920×1080 walkthrough in which every scene is the installed
home-screen app inside an iPhone frame on the left and a caption on the right.
Each shot is one frame from it, cropped to the phone's screen below the status
bar:

```
ffmpeg -ss <t> -i <video> -frames:v 1 -vf "crop=432:862:206:130" out.png
ffmpeg -i out.png -c:v libwebp -quality 88 out.webp      # ~5× smaller than PNG
```

The crop starts at the app bar on purpose. The status bar above it carries the
iOS screen-recording indicator (red pill), and the caption panel to the right
of the phone carries the `SHOP INTELLIGENCE POWERED BY MOTOR.COM` lockup,
which the vendor-naming rule below forbids on a public page.

**One redaction, disclosed here.** The approval frame shows the seeded
customer's email, `bob@gmail.com`, under "Prepared for". That is a seed value
that could be a real person's address, so the one line is painted over with
the card's own background colour (`#F8F7FC`, sampled from the frame). Nothing
else in any shot is altered. The right fix is a seed email on `example.com`
in `apps/web/lib/demoSeed.ts` in the motor repo, then a recapture.

Four iPhone screenshots of the Jobs board from 18 Sep (`IMG_2931`–`2934`,
1320×2868) exist in Downloads; only 2931 is clean. The others were taken while
hunting the MOT-338/342/343/345 reseed bugs and show "No vehicle yet" cards.
The 17 Sep screen recording predates the phone navigation and shows the
`Powered by MOTOR DaaS` line in Safari; do not use it.

## The vendor-naming rule, and the agreed exceptions

The handoff's public-facing constraint says the two licensed upstream data
providers are described **by category, never named**, in anything published.
Both apps name them in their own UI, so framing matters:

- **Cropped out:** the desktop app bar rendered `Powered by MOTOR DaaS ·
  sandbox data`; the phone app bar carries only the MotorAdvisor wordmark,
  which is the product's name and stays. The video's caption panel names
  motor.com and is cropped out.
- **Kept, deliberately:** `Repair or replace · Black Book: 2010 Honda Civic
  LX` sits inline with the section heading, and the card's footnotes say
  "Black Book values by trim". Removing them means removing the
  repair-or-replace verdict, which is the differentiator that card argues
  for. **Joe approved keeping it, 17 Aug 2026.** Do not "fix" this.
- **Avoided:** work-order frames whose column header reads `MOTOR BOOK TIME`
  (the diagnostic-operations table). Pick a scroll position without it.

Also worth knowing, if you recapture: the login screen renders the full
`SHOP INTELLIGENCE POWERED BY MOTOR.COM` lockup, and the seeded demo
conversations name the provider seven times in `apps/web/lib/demoSeed.ts`.

## How the older captures were taken

MotorAdvisor is a single-page app — the board and a job swap in place with no
per-job URL — so a desktop capture needs a click, not a navigation. The retired
desktop shot and `tophand.png` were taken with headless Chrome driven over CDP
against a profile holding a logged-in session, then cropped to remove the
Next.js dev badge.
