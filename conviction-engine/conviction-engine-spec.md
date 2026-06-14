# Product Spec — Conviction Engine

*A tool that lets product managers feed AI-accelerated development with outcome-focused, monetizable opportunities — at the pace that capacity now demands.*

**Status:** MVP spec for build in Claude Code
**Audience for this doc:** the developer / Claude Code agent building it, and the PM defining it

-----

## 1. What this is (and what it is not)

When AI collapses the cost of building, the bottleneck moves upstream — from *coordinating output* to *deciding what is worth building*. Most PM tooling was built for the old constraint (tracking and shipping). This is built for the new one: **discriminating between bets quickly enough to keep up with AI development velocity, without becoming a feature factory.**

**This is a conviction engine, not a backlog tracker.** Its job is to take a PM’s raw idea and refuse to let it become a spec until it has traced a defensible line from business strategy down to an evidenced, monetizable opportunity. The output is not “a spec, faster.” It is **a ranked, monetizable, evidence-flagged opportunity with its reasoning attached.**

The product resolves a deliberate tension: **speed** comes from AI doing the scaffolding and pressure-testing instantly; **discipline** comes from AI refusing to let the PM skip the evidence rungs. Velocity *and* outcome-focus, because the fast part is the thinking, not the shipping.

### The one non-negotiable principle

> **The AI interrogates and structures the PM’s evidence. It never invents it.**

The moment the tool fabricates a willingness-to-pay number or a customer need, it has become a *more persuasive* feature factory — guesses laundered into a roadmap. Every AI-generated value the PM did not supply and the system could not ground must be explicitly marked `unverified / hypothesis`. This rule governs every screen and every gate below.

### The second non-negotiable principle

> **No opportunity reaches the stakeholder dashboard on assumptions. Promotion requires validation from two source types: sourced public/secondary data *and* direct conversations with the target personas.**

The whole failure mode this guards against is the assumption that never gets tested — a confident roadmap built on what the PM *believes* customers want. So validation is not a flag; it is a **promotion gate** (see §4a). The customer’s problem, and the customer’s own objectives/KRs the opportunity claims to serve, must each be corroborated by public evidence *and* primary research before the opportunity can leave the PM workspace. The AI can **source the public data and prepare/structure the conversations** — draft the interview guide, name the personas to reach, organize the findings — but it **cannot have the conversations for you**, and it must never mark a claim `validated` that lacks both source types. **Invalidation is a success:** when a conversation kills an assumption, the tool just saved AI-development capacity from being spent on a phantom problem.

-----

## 2. The spine (core domain model)

Every object in the system hangs off one chain. Each item is an **investment opportunity**, never “a feature,” and it must trace up this chain to exist.

```
Strategy
  → Business Outcome        (the OKR; lagging; what leadership funds against)
    → Customer Outcome      (what the customer achieves; has a LEADING proxy)
      → Opportunity         (an evidenced, decomposed, monetizable problem)
        → Bet               (a candidate solution at a defined risk tier)
          → Spec            (the handoff artifact for AI-enabled coding)
```

### Two load-bearing relationships to encode explicitly

1. **Customer Outcome *earns* Business Outcome.** These are not siblings. The customer outcome is the engine; the business outcome is the result. A bet is judged on whether it plausibly moves the *customer* outcome — never on whether it “feels like revenue.” Chasing the business outcome directly (upsell banners, monetization nudges) is the failure mode the model exists to prevent.
1. **Lagging OKR needs a leading proxy.** The business outcome (e.g. “+$5M cross-sell ARR”) is lagging — it appears quarters after the work, so no team can steer on it weekly. Each **Customer Outcome therefore carries a leading proxy metric** the team *can* observe (e.g. median workflow completion time, tasks/active user/week, % steps automated). **Teams steer on the proxy; leadership tracks the OKRs.** Without the proxy, “outcome focus” decays into vibes.

-----

## 3. Entities and fields

> These are the data model. The “gate fields” on `Opportunity` are the conviction layer — they are the product.

### Strategy

|Field        |Type  |Notes                                                              |
|-------------|------|-------------------------------------------------------------------|
|`id`         |id    |                                                                   |
|`title`      |string|e.g. “Grow the base by becoming the system customers expand within”|
|`description`|text  |how we intend to win                                               |

### BusinessOutcome

|Field                                  |Type                    |Notes                                        |
|---------------------------------------|------------------------|---------------------------------------------|
|`id`                                   |id                      |                                             |
|`strategyId`                           |ref → Strategy          |                                             |
|`okrStatement`                         |string                  |e.g. “+$5M incremental cross-sell ARR / year”|
|`targetValue` / `currentValue` / `unit`|number / number / string|                                             |
|`metricType`                           |enum                    |`lagging` (default for OKRs)                 |
|`timeframe`                            |string                  |                                             |

### CustomerOutcome

|Field                                       |Type                    |Notes                                                                                                |
|--------------------------------------------|------------------------|-----------------------------------------------------------------------------------------------------|
|`id`                                        |id                      |                                                                                                     |
|`businessOutcomeId`                         |ref → BusinessOutcome   |the **“earns”** edge                                                                                 |
|`title`                                     |string                  |e.g. “Do 2x the work per person” / “Reduce costly payroll errors”                                    |
|`description`                               |text                    |                                                                                                     |
|`proxyMetricName`                           |string                  |the **leading** metric teams steer on                                                                |
|`proxyCurrent` / `proxyTarget` / `proxyUnit`|number / number / string|                                                                                                     |
|`proxyDirection`                            |enum                    |`increase` / `decrease`                                                                              |
|`earnsNarrative`                            |text                    |how this outcome converts into the business outcome                                                  |
|`targetPersonaIds`                          |ref[] → Persona         |whose objective this is — who validation must reach                                                  |
|`objectiveValidationStatus`                 |enum                    |`assumption` / `validated` / `invalidated` — is this genuinely the customer’s OKR, or our projection?|


> **Design note:** the set of Customer Outcomes is *discoverable*, not fixed at setup. The interrogation will surface missing ones (e.g. a payroll-accuracy idea reveals that “reduce costly errors” was a missing outcome — it is a *risk* outcome, not a *throughput* one). The model must allow adding a Customer Outcome mid-flow.

### Opportunity  *(the conviction object)*

|Field                                |Type                      |Notes                                                                                                         |
|-------------------------------------|--------------------------|--------------------------------------------------------------------------------------------------------------|
|`id`                                 |id                        |                                                                                                              |
|`customerOutcomeId`                  |ref → CustomerOutcome     |the ladder; required to clear gates                                                                           |
|`parentOpportunityId`                |ref → Opportunity | null  |**decomposition**: a fuzzy class splits into rankable children                                                |
|`title`                              |string                    |                                                                                                              |
|`problemStatement`                   |text                      |                                                                                                              |
|`status`                             |enum                      |`idea` → `in_interrogation` → `in_validation` → `validated` → `funded`; or `parked` / `invalidated`           |
|`targetPersonaIds`                   |ref[] → Persona           |the personas this opportunity’s claims must be validated against                                              |
|**— Value-creation gate —**          |                          |*Is the problem real?*                                                                                        |
|`isKnown`                            |bool + evidence note      |                                                                                                              |
|`isPervasive`                        |bool + evidence note      |how many customers, usage data                                                                                |
|`isUrgent`                           |bool + evidence note      |                                                                                                              |
|`proxyImpactEstimate`                |number + `confidence` enum|expected movement on the Customer Outcome’s proxy                                                             |
|**— Value-capture gate —**           |                          |*Will they pay, and does it route to the OKR?*                                                                |
|`revenueMechanism`                   |enum                      |`direct_upsell` / `seat_usage_expansion` / `retention_churn_prevention` / `adoption_enabling`                 |
|`willingnessToPay`                   |number                    |                                                                                                              |
|`wtpEvidenceStatus`                  |enum                      |**`hypothesis`** / `evidenced` — defaults to `hypothesis`                                                     |
|`wtpEvidenceNotes`                   |text                      |what would move it to `evidenced`                                                                             |
|`revenueContributionEstimate`        |number                    |$ toward the BusinessOutcome target                                                                           |
|**— Validation gate (promotion) —**  |                          |*Is it corroborated, or assumed?* (see §4a)                                                                   |
|`problemValidationStatus`            |enum                      |`assumption` / `validated` / `invalidated` — the problem is real for these personas                           |
|`validationRecordIds`                |ref[] → ValidationRecord  |the actual evidence behind the statuses above                                                                 |
|`validationGatePassed`               |bool (derived)            |true only when problem **and** laddered objective each have ≥1 public + ≥1 conversation source supporting them|
|**— Scoring (derived, decomposed) —**|                          |see §4                                                                                                        |
|`convictionComponents`               |object                    |the sub-scores, never a single opaque number                                                                  |

### Bet

|Field                  |Type               |Notes                                                |
|-----------------------|-------------------|-----------------------------------------------------|
|`id`                   |id                 |                                                     |
|`opportunityId`        |ref → Opportunity  |                                                     |
|`title` / `description`|string / text      |                                                     |
|`riskTier`             |enum               |`low` / `medium` / `high` — **risk-split lives here**|
|`scope`                |text               |                                                     |
|`estimatedCapacity`    |number (team-weeks)|feeds the dashboard’s “capacity consumed”            |


> **Risk-split rule:** when an idea contains both a low-risk slice and a high-risk slice (e.g. *detect-and-recommend* vs. *autonomously act*), it becomes **two Bets**, not one. Never anchor a high-conviction slice to a high-risk one. High-risk bets wait behind real trust evidence.

### Spec

|Field    |Type     |Notes                                |
|---------|---------|-------------------------------------|
|`id`     |id       |                                     |
|`betId`  |ref → Bet|only `funded` bets reach here        |
|`content`|text     |the handoff doc for Claude Code / dev|

### Persona

|Field        |Type  |Notes                                    |
|-------------|------|-----------------------------------------|
|`id`         |id    |                                         |
|`name`       |string|e.g. “Payroll Manager”, “VP People Ops”  |
|`role`       |string|their job-to-be-done context             |
|`description`|text  |who they are; why they hold the objective|


> Personas are *who you validate with.* An opportunity or customer outcome is only as validated as the conversations held with the personas it claims to serve.

### ValidationRecord

|Field       |Type  |Notes                                                                                                                              |
|------------|------|-----------------------------------------------------------------------------------------------------------------------------------|
|`id`        |id    |                                                                                                                                   |
|`validates` |ref   |the CustomerOutcome or Opportunity (or a specific claim on it) being corroborated                                                  |
|`claim`     |string|the exact assertion under test (e.g. “payroll managers experience this weekly”, “2x throughput is their stated OKR”, “WTP ≈ $X/yr”)|
|`sourceType`|enum  |**`public_data`** / **`customer_conversation`** — the gate needs both                                                              |
|`sourceRef` |text  |for `public_data`: citation / url / report; for `customer_conversation`: `personaId`, # conversations, date                        |
|`finding`   |enum  |`validated` / `invalidated` / `inconclusive`                                                                                       |
|`notes`     |text  |what was learned; for AI-sourced public data, marked as such and never treated as a substitute for a conversation                  |

-----

## 4. The interrogation (the core loop)

This is the magic moment. PM drops in a raw idea; the tool runs it through fixed gates and returns a structured, ranked Opportunity. **Every gate is a question the AI asks — and a place it may surface a gap, never fill one with fiction.**

|#|Gate                                       |What the AI does                                                                                                                                                                                                                                                            |What it must NOT do                                                                                                         |
|-|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
|1|**Ladder**                                 |Map the idea to an existing Customer Outcome. If none fits, flag that an outcome may be **missing** and propose it for the PM to confirm.                                                                                                                                   |Force-fit to an outcome that doesn’t apply                                                                                  |
|2|**Proxy**                                  |Confirm the laddered outcome has a leading proxy and estimate impact on it.                                                                                                                                                                                                 |Invent a proxy value                                                                                                        |
|3|**Decompose**                              |Detect when the “opportunity” is actually a *portfolio* (e.g. “anomalies” = rate outliers + policy violations + data slips + fraud). Split into child Opportunities.                                                                                                        |Score a vague bundle                                                                                                        |
|4|**Value creation**                         |Test known / pervasive / urgent / moves-proxy, attaching evidence the PM provides.                                                                                                                                                                                          |Assert pervasiveness without data                                                                                           |
|5|**Value capture**                          |Separate “is it useful” from “will they pay.” Require a `revenueMechanism`.                                                                                                                                                                                                 |Conflate love with willingness-to-pay                                                                                       |
|6|**WTP evidence**                           |Record WTP and **flag it `hypothesis` until evidenced**; state what evidence would change that.                                                                                                                                                                             |Generate a confident number                                                                                                 |
|7|**Validation** *(promotion gate — see §4a)*|Source public/secondary data **and** drive primary conversations with the target personas; mark each core claim `validated` / `invalidated` / `inconclusive`. **Blocks promotion until the problem and the laddered objective each have both source types supporting them.**|Mark anything `validated` without a real conversation; treat AI-sourced public data as a substitute for talking to customers|
|8|**Risk-split**                             |Separate low-risk slices from high-risk ones into distinct Bets.                                                                                                                                                                                                            |Bundle them                                                                                                                 |
|9|**Rank**                                   |Compute the decomposed conviction score (below).                                                                                                                                                                                                                            |Collapse it into one opaque number                                                                                          |

### 4a. The validation gate (the promotion function)

This is the gate that stops assumptions from becoming roadmap. An opportunity sits in the PM workspace as long as its core claims are `assumption`. It can only be promoted to `validated` — and therefore only becomes fundable and dashboard-visible — when the **promotion bar** is met.

**The bar (both source types, on both core claims):**

- **The problem** (it is real, pervasive, and urgent *for the target personas*) has ≥1 `public_data` record **and** ≥1 `customer_conversation` record with a supporting `finding`.
- **The customer’s objective/KR** the opportunity ladders to (the Customer Outcome’s `objectiveValidationStatus`) is corroborated the same way — confirming it is genuinely *their* OKR, not our projection onto them.

**Pragmatic edges:**

- **WTP may remain `hypothesis`** and still clear the gate (you often price after a build), but it is surfaced honestly on the dashboard. The problem and objective may **not** remain assumptions.
- **`inconclusive`** does not pass. **`invalidated` routes the opportunity to the `invalidated` status — and that is a win**, logged and visible, because it just spared real development capacity.
- **Division of labour:** the AI sources and summarizes public data, drafts the persona-specific interview guide, names who to reach, and structures the returned notes into ValidationRecords. The **human holds the conversations.** The AI may never fabricate a conversation finding or upgrade a claim’s status on public data alone.

Never a single mystery number. Always shown as its parts:

- **Outcome alignment** — does it ladder cleanly?
- **Proxy impact** — expected movement × confidence
- **Evidence strength** — `hypothesis` ↔ `evidenced`
- **Validation strength** — assumption ↔ validated, and how many personas / sources back it
- **Revenue contribution** — $ toward the OKR, by mechanism
- **Risk** (inverse) — from the bet’s tier
- **Capacity cost** — team-weeks, for the dashboard’s portfolio math

-----

## 5. The two surfaces

These are **not the same screen.** Keeping them separate is what makes the dashboard trustworthy.

### A. PM Workspace (private, messy, pre-conviction)

Where raw ideas land and get interrogated. Shows everything pre-promotion: `idea`, `in_interrogation`, `in_validation`, `parked`, and the `invalidated` graveyard (kept visible — disproven assumptions are a record of capacity saved). This is the PM’s thinking space; it is *supposed* to be noisy.

### B. Stakeholder Dashboard (the funding artifact)

Shows **only opportunities that have passed the validation gate** (`validated` / `funded`). This is the output of the conviction engine, and it earns leadership’s trust precisely because nothing reaches it that hasn’t traced the full spine *and* been corroborated by public data plus real customer conversations. **Piping unfiltered or merely-assumed ideas here turns it back into the backlog everyone ignores — do not.**

For each opportunity it shows, at a glance:

- the **Customer Outcome** it ladders to, and expected **proxy** movement
- **revenue mechanism** and **$ contribution** toward the OKR
- **validation status** — how the problem and the customer’s objective were corroborated: which personas were spoken to, how many, and what public sources back it (a one-line “validated by N conversations + M sources” so a stakeholder can trust the rank without digging)
- **evidence strength** — the WTP `hypothesis` vs. `evidenced` flag, **shown honestly** (a confident rank that hides that WTP is still a guess is the laundering we are guarding against — *show the doubt*)
- **risk tier** and **capacity cost**

Two groupings matter more than the flat list:

1. **By Customer Outcome** — “everything pointed at *reduce costly payroll errors*, and the capacity it would consume.” Reveals when teams crowd one outcome while a strategic one is starved.
1. **By revenue mechanism** — how much of the ranked backlog is direct upsell vs. retention vs. adoption-enabling. This is the **portfolio-balance** view a VP funds against — the answer to “feed the beast *wisely*.” (Designing in `adoption_enabling` and `retention` mechanisms prevents the tool from degrading into a pure monetization machine that starves the work which *enables* future revenue.)

-----

## 6. MVP scope — build for the org, ship for one team

Model the org-wide cascade in the data layer so it generalizes (and can be sold later), but **ship the MVP for a single product team.** Prove the loop helps one PM before building strategy cascades, permissions, and portfolio roll-ups across teams.

### Build order

1. **Cascade setup** — capture Strategy → Business Outcome (OKR) → Customer Outcome + proxy. Mostly static config; the context everything reasons against. *Build first because nothing ladders without it.*
1. **Opportunity interrogation workflow** — the gates in §4, returning a structured ranked Opportunity. **This is the magic moment; it is the product. Build it second and make it excellent.**
1. **Validation capture & gate** — Persona + ValidationRecord, AI-assisted public-data sourcing, interview-guide generation, and the promotion bar that blocks `validated` until both source types back the problem and the objective (§4a). *Without this, the dashboard is just confident guessing.*
1. **Ranked opportunity output** — the validated Opportunity object with its decomposed conviction components.
1. **Stakeholder dashboard** — surface B, with both groupings, validation status, and honest evidence flags. Closes the loop back up to the business outcome.
1. **Spec handoff** — turn a `funded` Bet into the doc handed to Claude Code.

### Explicitly OUT of scope for MVP

- Multi-team cascades, roll-ups, and permissions (model for them; don’t build them yet)
- Any **autonomous** action by the tool
- **Live integrations into the customer’s or company’s internal systems** (usage telemetry, CRM, billing). Note: AI-assisted *public* data sourcing and manual capture of conversation notes **are in scope** — they are the validation gate.
- Anything that lets the AI write or upgrade evidence the PM didn’t supply, or mark a claim `validated` without a real conversation

-----

## 7. Worked example (the model’s expected output)

Use this to sanity-check the build. Raw idea in → conviction object out.

**Raw idea:** “An agentic tool that lets payroll managers review payroll data, surface anomalies, and either flag for human correction or auto-correct.”

The interrogation produces:

- **Ladder:** doesn’t fit “2x throughput.” Surfaces a **missing Customer Outcome — “reduce costly payroll errors”** (a *risk/accuracy* outcome). Proxy: $ of errors caught pre-payment / review time on flagged items.
- **Decompose:** “anomalies” is a portfolio → rate outliers, policy violations, data-entry slips, fraud. Rank by frequency × cost × detectability; lead with the top class.
- **Value creation:** errors carry hard costs (overpayments, penalties, rework, trust) → known, pervasive, urgent: strong, *pending evidence from the customer’s own correction/off-cycle data*.
- **Value capture:** `direct_upsell` (paid add-on); WTP plausibly high because fear of a six-figure mistake is a sharp buying trigger — **flagged `hypothesis`** until 5 payroll managers describe their last bad run.
- **Risk-split:** **Bet A** = detect + recommend (low risk, ship now). **Bet B** = autonomous correction on narrow, proven-safe categories (high risk, waits behind trust evidence).
- **Validation (promotion gate):** stays in the workspace until both fire — **public data** (industry error-rate / penalty benchmarks, payroll-compliance reports) *and* **conversations** with ≥5 payroll managers confirming the problem is weekly-painful *and* that “reduce costly errors” is genuinely an objective they’re measured on. If the managers shrug, it’s `invalidated` — and that’s the tool working.

**Verdict the tool produces:** *fund the detect-and-recommend slice of the single highest-value anomaly class* — not “an agent that reviews payroll.” That narrowing **is** the conviction layer earning its keep.

-----

## 8. Definition of done for the MVP

A PM can configure a cascade, drop in a raw idea, be walked through all nine gates with evidence captured and unverified values honestly flagged, **be blocked from promoting an opportunity until the problem and the customer’s objective are each corroborated by public data and a real conversation with the target persona** (and have invalidated assumptions logged as wins), produce a validated Opportunity split into risk-tiered Bets, see it appear on a stakeholder dashboard grouped by outcome and by revenue mechanism with its validation status visible, and export a funded Bet as a spec — **and at no point did the tool invent or validate evidence the PM did not provide.**
