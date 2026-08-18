# Product screenshots — provenance and constraints

Both images are captured from each product's **seeded demo tenant**, never a
live one. TopHand's first customer is a working dairy-goat farm in Michigan;
its records have no business on a public page. MotorAdvisor's shop data is
seeded too (Terrence Hall, Alicia Fontaine and the rest are fictional).

| File | What it shows | Source |
|---|---|---|
| `tophand.png` | The cut recommendation for a demo field — three gates, quality target in RFV, and the reasoning behind the call | `localhost` demo mode (no `DATABASE_URL`/`AUTH_SECRET`) |
| `motoradvisor.png` | A work order mid-flow — conversation and composer on the right, priced approved diagnostics and the repair-or-replace verdict on the left | seeded demo shop, `/demo` board seed |

## The vendor-naming rule, and the one agreed exception

The handoff's public-facing constraint says the two licensed upstream data
providers are described **by category, never named**, in anything published.
Both apps name them in their own UI, so framing matters:

- **Cropped out:** the app bar renders `Powered by MOTOR DaaS · sandbox data`.
  Every capture of MotorAdvisor starts below it.
- **Kept, deliberately:** `Repair or replace · Black Book: 2010 Honda Civic LX`
  sits inline with the section heading. Removing it means removing the
  repair-or-replace verdict, which is the differentiator that card argues for.
  **Joe approved keeping it, 17 Aug 2026.** Do not "fix" this.

Also worth knowing, if you recapture: the login screen renders the full
`SHOP INTELLIGENCE POWERED BY MOTOR.COM` lockup, and the seeded demo
conversations name the provider seven times in `apps/web/lib/demoSeed.ts`. The
work-order view is the one that frames cleanly.

## How these were captured

MotorAdvisor is a single-page app — the board and a job swap in place with no
per-job URL — so the capture needs a click, not a navigation. Both were taken
with headless Chrome driven over CDP against a profile holding a logged-in
session, then cropped to remove the Next.js dev badge.
