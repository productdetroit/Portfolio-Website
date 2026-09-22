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
Each shot is one frame from it, cropped to the whole device — bezel, status
bar and screen — at 470×976, with everything outside the bezel's rounded
outline made transparent so the phone sits on the dark route without a
rectangle of the video's blue behind it. The caption panel to the right of the
phone carries the `SHOP INTELLIGENCE POWERED BY MOTOR.COM` lockup, which the
vendor-naming rule below forbids on a public page; the crop excludes it.

```
# frame → device crop, alpha mask on a 68px-radius rounded rect,
# recording pill → Dynamic Island (see below)
ffmpeg -ss <t> -i <video> -frames:v 1 frame.png
ffmpeg -i frame.png -vf "crop=470:976:187:50,format=rgba,geq=..." device.png
ffmpeg -i device.png -c:v libwebp -quality 88 out.webp    # ~5× smaller than PNG
```

**Two edits to the pixels, disclosed here.**

1. The status bar in every frame shows the iOS screen-recording indicator: a
   wide black pill with a red dot where the Dynamic Island sits. It is painted
   out (white, the status bar's own colour) and a standard-width Dynamic
   Island drawn in its place (138×36 at the screen's centre). Time, signal,
   Wi-Fi and battery are the frame's own.
2. The approval frame shows the seeded customer's email, `bob@gmail.com`,
   under "Prepared for". That is a seed value that could be a real person's
   address, so the one line is painted over with the card's own background
   colour (`#F8F7FC`, sampled from the frame). The right fix is a seed email
   on `example.com` in `apps/web/lib/demoSeed.ts` in the motor repo, then a
   recapture.

Nothing else in any shot is altered.

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
