# Conviction Engine

A conviction engine for product managers: it takes a raw idea and refuses to let
it become a dev spec until it has traced a defensible line from business strategy
→ outcome → **validated** opportunity → bet. The output is a ranked, monetizable,
validated opportunity — **not "a spec, faster."**

The source of truth is `conviction-engine-spec.md`; `CLAUDE.md` holds the
guardrails. This README only covers running what is built.

## Stack

- Next.js (App Router) + TypeScript
- SQLite + Prisma (local-first)
- Tailwind CSS
- `@anthropic-ai/sdk` for interrogation calls (Step 2+; key from `ANTHROPIC_API_KEY`)

## Setup

```bash
npm install
cp .env.example .env        # DATABASE_URL defaults to local SQLite
npm run db:push             # create the SQLite schema
npm run db:seed             # optional: load the worked-example cascade (spec §7)
npm run dev                 # http://localhost:3000  → /cascade
```

Useful scripts: `npm run db:studio` (browse data), `npm run db:reset`
(wipe + reseed), `npm run build`.

## Build progress

Built **one step end-to-end at a time** (CLAUDE.md build order). Current state:

- [x] **Step 1 — Cascade setup.** Strategy → Business Outcome (lagging OKR) →
      Customer Outcome with a required leading proxy. The `/cascade` surface.
- [ ] Step 2 — Opportunity interrogation workflow (the 9 gates)
- [ ] Step 3 — Validation capture & gate (Persona, ValidationRecord, promotion bar)
- [ ] Step 4 — Ranked opportunity output
- [ ] Step 5 — Stakeholder dashboard
- [ ] Step 6 — Spec handoff

## Notes on the data model

- **Org-wide, single-team slice.** The schema models `Organization` → `Team` so
  it generalizes to many teams later (spec §6), but the MVP UI operates as one
  seeded team. `src/lib/team.ts` is the scoping seam.
- **Load-bearing edges are enforced.** A Customer Outcome *earns* a Business
  Outcome (required FK), and every Customer Outcome must carry a leading proxy
  metric — the create action rejects a save without one.
- **Enums are app-validated strings.** SQLite has no native enums; allowed values
  live in `src/lib/enums.ts`.
- `objectiveValidationStatus` starts at `assumption` and is only ever flipped by
  the structurally-enforced validation gate (Step 3) — never by hand here.
