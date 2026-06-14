# CLAUDE.md — Conviction Engine

Read this first, every session. The full spec is in `conviction-engine-spec.md` — **that file is the source of truth; this file is the guardrails.** If code and spec ever disagree, stop and flag it.

## What we’re building

A conviction engine for product managers: it takes a raw idea and refuses to let it become a dev spec until it has traced a defensible line from business strategy → outcome → **validated** opportunity → bet. The output is a ranked, monetizable, validated opportunity — **not “a spec, faster.”** (spec §1)

## Non-negotiables — never violate

1. **The AI structures the PM’s evidence; it never invents it.** Any value the user didn’t supply and we can’t ground is marked `unverified / hypothesis`. (spec §1)
1. **Nothing reaches the stakeholder dashboard on assumptions.** Promotion to `validated` requires BOTH a `public_data` source AND a `customer_conversation` source — on BOTH the problem and the customer’s objective. (spec §1, §4a)
1. **The validation gate is structurally enforced, not cosmetic.** A `validated` status can only flip when an actual ValidationRecord of each source type exists and is attached. No checkbox a motivated PM can click through. (spec §4a)
1. **Workspace and dashboard are separate surfaces.** Only gate-passed opportunities reach the dashboard. (spec §5)
1. **Conviction is shown as decomposed components, never one opaque score.** (spec §4)

## The spine (domain model)

Strategy → Business Outcome (lagging OKR) → Customer Outcome (+ leading proxy) → Opportunity (validated) → Bet (risk-tiered) → Spec. Two load-bearing edges: the customer outcome *earns* the business outcome; every lagging OKR needs a leading proxy. Full entities and fields in spec §2–3.

## Build order — build ONE step end-to-end, then STOP and let me review. Do not scaffold ahead.

1. Cascade setup (Strategy → BusinessOutcome → CustomerOutcome + proxy)
1. Opportunity interrogation workflow (the 9 gates) ← the product; make it excellent
1. Validation capture & gate (Persona, ValidationRecord, the promotion bar)
1. Ranked opportunity output
1. Stakeholder dashboard (groupings + validation status + honest flags)
1. Spec handoff
   (spec §6)

## Out of scope for MVP

Multi-team cascades/permissions; any autonomous tool action; live integrations into customer/internal systems. (AI-assisted *public*-data sourcing and manual conversation-note capture ARE in scope — they are the validation gate.) Model the org-wide cascade in the schema so it generalizes, but build only the single-team slice. (spec §6)

## Suggested stack (swap if you prefer, but keep it simple and local-first)

- Next.js (App Router) + TypeScript
- SQLite + Prisma for persistence
- Tailwind for UI
- `@anthropic-ai/sdk` for the interrogation calls — model from a current Claude model string, API key from `ANTHROPIC_API_KEY` env var, never hardcoded

## Working agreements

- Commit per slice with a clear message.
- When a gate or field is ambiguous, **ask — don’t guess, and don’t invent product behavior.**
- The interrogation AI must say which gate each output addresses and flag every unverified value. It must never fabricate a validation finding or upgrade a claim’s status on public data alone.
