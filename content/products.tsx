import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import type { ProductId } from "@/lib/buildlog/products";

/** Per-product page content for the /building portfolio.
 *
 *  The index at /building renders one card per entry; /building/[slug] renders
 *  the same entry in full. Both read this list, so adding a product means
 *  adding one entry here rather than a block of JSX in two places.
 *
 *  This is AUTHORED content. Every number that can drift lives in the build
 *  log (lib/buildlog) and is read live; the only figure kept here is the test
 *  count, which no provider reports yet.
 */

/** A highlight's detail is a node, not a string: two MotorAdvisor entries
 *  link out to the public MCP developer docs. */
export type Highlight = [name: string, detail: ReactNode];

export type Product = {
  /** Route segment: /building/[slug]. */
  slug: ProductId;
  /** Key into getBuildLog().products[].productId. Equal to `slug` today, but
   *  the route and the register key are different things — the same reason
   *  ProductConfig keeps `jiraProject` and `ticketPrefix` apart. */
  productId: ProductId;
  /** "Product 01" — the kicker on both the card and the detail page. */
  index: string;
  name: string;
  /** Completes the headline: "{name} — {thesis}". */
  thesis: string;
  /** Detail-page meta line, under the H1. */
  meta: string;
  domain: string;
  audience: string;
  status: string;
  /** Card copy: one or two sentences, the commercial claim only. */
  summary: string;
  /** Not in the build log yet — no provider reports a suite count. */
  tests?: number;
  /** 16:9 card thumbnail, cropped out of the existing product shot. */
  card: {
    img: string;
    alt: string;
    objectPosition: string;
    width: number;
    height: number;
  };
  url: string;
  ctaLabel: string;
  /** Detail page only — deliberately left off the cards so they stay
   *  uniform. */
  logo?: ReactNode;
  /** OG/Twitter description for the detail route. */
  description: string;
  story: ReactNode;
  figure: ReactNode;
  /** True when the figure runs full width under the story instead of beside
   *  it — three phones in a half-width column are unreadable. */
  figureFullWidth?: boolean;
  highlights: Highlight[];
};

const TOPHAND_HIGHLIGHTS: Highlight[] = [
  [
    "Installable PWA",
    "Next.js, React, TypeScript and Tailwind, with a Serwist service worker so it keeps working in a field with no signal.",
  ],
  [
    "Multi-tenant from the ground up",
    "Account → farm scoping on every query, Postgres row-level security behind it as defence in depth, and a registry that fails the build if a new table doesn’t declare its tenancy.",
  ],
  [
    "Plans, add-ons and feature gating",
    "A capability-key registry resolving entitlements per account.",
  ],
  [
    "Satellite field mapping",
    "Mapbox GL with draw tools, Turf for automatic acreage, and field boundaries parsed straight from deed text by AI.",
  ],
  [
    "AI enrichment the farmer confirms",
    "Anthropic’s Claude API fills in researchable values as editable suggestions — never auto-committed, because a wrong estimate silently accepted is worse than a blank field.",
  ],
  [
    "Condition-gated timing engine",
    "Weather and crop state reconciled into a cutting-window recommendation — the difference between recording the past and acting on the present.",
  ],
  [
    "Notifications that land somewhere",
    "Twilio SMS (consent-gated, toll-free verified) and Resend transactional email, each deep-linked to the record that triggered it.",
  ],
  [
    "Hands-free in the field",
    "ElevenLabs text-to-speech reads recommendations aloud for a farmer whose hands are full.",
  ],
  ["Serverless Postgres on Neon", "With photo storage on Vercel Blob."],
  ["1,078 tests", "Across 89 files, run on every branch."],
];

const MOTORADVISOR_HIGHLIGHTS: Highlight[] = [
  [
    "Responsive, installable web app",
    "Next.js, React and TypeScript end to end — no second language anywhere in the stack — shipped as a standalone home-screen app with a phone-first work order.",
  ],
  [
    "Conversational AI layer",
    "Anthropic’s Claude API running an agentic tool loop over task-shaped tools, so the model asks a question rather than walking a catalogue.",
  ],
  [
    "AI model gateway",
    "Model choice is deterministic app code — a tested router sends mechanical turns to a cheaper model — then the Vercel AI Gateway picks the best-cost provider serving that model, with automatic failover. The app decides what; the gateway decides who.",
  ],
  [
    "Vision at the counter",
    "A photo of the VIN plate or the odometer cluster is read by Claude and lands in the vehicle field or the valuation’s mileage field — no retyping a 17-character VIN off a door jamb.",
  ],
  [
    "Vehicle telemetry over Bluetooth OBD-II",
    "Raw adapter exchanges captured from the browser with Web Bluetooth and parsed server-side by a leaf package, behind a read-only command allowlist — nothing on the bus can change vehicle state.",
  ],
  [
    "Custom remote MCP server, two credential types",
    <>
      Stateless streamable HTTP with OAuth 2.1, PKCE and dynamic client
      registration for connector journeys, plus API keys for developers who
      paste one into a client &mdash; sixteen tools, the same ones the app
      uses. The reference is public, the endpoint isn&rsquo;t:{" "}
      <a
        href="https://motoradvisor.app/dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        motoradvisor.app/dev <span aria-hidden="true">&#8599;</span>
      </a>{" "}
      documents every tool with a worked request and response; calling one
      takes a credential.
    </>,
  ],
  [
    "Self-serve developer portal with paid plans",
    "Sign-up to API key in one flow, Stripe subscription checkout on every tier, and two independent meters — because a deterministic lookup and a synthesized repair plan differ in cost by orders of magnitude, one rate either loses money or prices lookups out of the market.",
  ],
  [
    "Developer docs that stay current",
    <>
      <a
        href="https://motoradvisor.app/dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        motoradvisor.app/dev <span aria-hidden="true">&#8599;</span>
      </a>{" "}
      rebuilds automatically as the platform changes, so a builder wiring up
      the MCP server is always reading live documentation, not a stale wiki.
    </>,
  ],
  [
    "Two licensed data-as-a-service integrations",
    "Repair data and vehicle valuation, HMAC-signed, and deliberately blind to each other in code so one vendor’s failure modes never reach the other.",
  ],
  [
    "Attested answers",
    "Every output carries a provenance record naming the MOTOR citations behind it and when they were observed — grounding you can inspect, stated plainly as provenance rather than a signature.",
  ],
  [
    "Multi-tenant by shop",
    "Each shop carries its own labor, tax and supplies rates, its own branding, and its own connected payment account.",
  ],
  [
    "Integrated payments",
    "Stripe Connect: the shop is merchant of record, a platform fee rides each invoice, and the customer pays on a shop-branded page via Stripe Elements.",
  ],
  [
    "Documents that leave the building",
    "Printable and emailable PDF quotes, and QR-coded pay links.",
  ],
  [
    "Architecture enforced by the build",
    "Ten framework-free packages whose module boundaries are policed by sixteen dependency-cruiser rules with negative controls — a rule that isn’t proven to fail when violated isn’t a rule.",
  ],
  [
    "1,824 tests, offline fixture replay",
    "Across 157 files. The whole suite runs with no network at all.",
  ],
];

const ONWARD_HIGHLIGHTS: Highlight[] = [
  [
    "Two surfaces, one product",
    "A static marketing site carrying the valuation estimator and its API, and a Next.js 15 marketplace app on Auth.js and Drizzle behind it — separate deployments, one npm workspace, one backlog.",
  ],
  [
    "A valuation estimator that refuses to guess",
    "A three-layer taxonomy — buckets, sectors, hand-curated aliases — matched deterministically with no fuzzy fallback. An unmatched trade returns low confidence and says so; it never quietly lands in a default bucket, because a confident wrong multiple is worse than an honest shrug.",
  ],
  [
    "A data model that keeps the homepage’s promise",
    "The page offers an estimate without asking who you are, so estimates are an append-only table with no PII columns and none may ever be added. Identity is a separate opt-in, written in the same transaction as its consent row — channel, scope, timestamp, and the exact version of the consent language shown.",
  ],
  [
    "Documents encrypted before they leave the app",
    "Ciphertext in Vercel Blob, per-document keys wrapped in Neon under a versioned master key. Rotation rewraps every live key and never touches a blob; without the key the store refuses to work rather than falling back to plaintext.",
  ],
  [
    "The build refuses to ship without its secrets",
    "A preview or production build fails on a missing auth secret, mail key, document master key or blob store — and says what breaks without each, rather than deploying a site whose signed-in routes silently redirect.",
  ],
  [
    "A seeded demo cast, quarantined",
    "Personas confined to one demo domain that reset cleanly, plus a dev sign-in that writes a session row directly — and refuses to run against a production environment or any connection string resolving to the production host.",
  ],
  [
    "An autonomous triage agent, contained in code",
    "It sweeps a Slack channel, investigates each report against the codebase, files a Jira ticket and replies in thread. Every limit is a line of code rather than a sentence in a prompt: a read-only clone whose push URL is disabled, no shell and no file-writing tool at all, one channel and threads only, one Jira project, purpose-scoped tokens checked against a scope canary, and circuit breakers on tickets, turns, dollars and wall clock.",
  ],
  [
    "Identity verification and payments",
    "Stripe Identity on the accounts that need to be real, because the whole market rests on a stranger being who they say they are.",
  ],
  ["552 tests", "Across 48 files, run on every branch against a real Postgres."],
];

const WRITEHOME_HIGHLIGHTS: Highlight[] = [
  [
    "A framework-free core the phone will share",
    "Formats, capacities, the enhancement prompt, the diff and the brand geometry live in a package with no React, no SDKs and no secrets — so the Expo app, when it comes, imports the same rules rather than reimplementing them a second time in a second language.",
  ],
  [
    "Voice in, ink out",
    "Dictation through the phone’s own recognizer, then an AI pass that edits rather than authors — it tightens what you said to fit the card and shows you the diff. Without a key it falls back to a local tidy and tells you. Letter content is never stored: the letters table is metadata only, by design.",
  ],
  [
    "The reply is already in the box",
    "No return envelope goes in the mail. The pen writes a code at the foot of the note, and the recipient talks their reply at a URL that is already paid for — the thing that turns a one-way gift into correspondence.",
  ],
  [
    "Built for a 78-year-old on an iPad",
    "Gift checkout is a plain form POST that completes with JavaScript switched off, and so is the page where a recipient hands over their address. The hard constraint wasn’t the pen; it was the buyer.",
  ],
  [
    "Address entry that takes seconds",
    "Places autocomplete as the sender types, then USPS CASS validation of what they picked. Nothing is stored, and without the key the app falls back to typing six fields.",
  ],
  [
    "Recovery by phone without storing a phone number",
    "An HMAC of the number under a server secret, linked to book codes; the texted code is hashed, ten minutes, five tries. A sender gets their postage back on a new phone, and the database never holds the number that did it.",
  ],
  [
    "One module decides what may reach the outside world",
    "Three environments told apart by a single variable, and every outbound path — mail, the pen vendor, live-mode payments, the database — asks the same guard first. On a preview, email goes to one test inbox with the real recipients noted in the body, the letter vendor is never called, and a live payment key is refused outright.",
  ],
  [
    "A database branch per pull request",
    "Created by the Neon integration when the PR opens, deleted when it closes, swept weekly. A preview build whose connection string resolves to the production host refuses to run, and the app repeats the check at runtime rather than trusting the build.",
  ],
  [
    "A support line that is a real phone number",
    "Toll-free and messaging-verified: calls ring a human for twenty seconds then take a transcribed voicemail, texts and voicemails arrive as email, and every webhook is signature-checked. No menu, no auto-reply.",
  ],
  ["89 tests", "Across 11 files, with no database and no keys."],
];

const BOOKEVENTS_HIGHLIGHTS: Highlight[] = [
  [
    "Resource pools, not seat counts",
    "The whole product. A booking draws weighted amounts from several pools at once — seats, staff, mats, kits, goats — and the tightest one binds. When a family of five can’t book, the shopper is told which constraint stopped them, in the merchant’s own words, instead of watching the button fail.",
  ],
  [
    "A schema built for the migration it hasn’t done yet",
    "A pool’s identity is shop-level from day one and only its capacity is per-occurrence, so sharing one pool across overlapping occurrences later is an additive migration rather than a merge of N rows and a rewrite of every consumption record.",
  ],
  [
    "Money only ever moves through Shopify Checkout",
    "One product per event, one variant per ticket type, synced on create, update and archive — and the capacity hold is taken before the cart, not after.",
  ],
  [
    "The storefront works out of the box",
    "A theme app embed plus a Cart and Checkout Validation Function, because the theme’s own Buy-it-now button is a second way to buy that skips the date, the attendee details and the hold. Hiding it in the UI isn’t enough; the function refuses the checkout.",
  ],
  [
    "Disruption handling as a first-class path",
    "A farm looks at a storm forecast at 6am and cancels tomorrow’s tour from a phone, with forty valid-looking tickets outstanding: cancel, bulk reschedule, refund, notify, and an audit trail of who did what.",
  ],
  [
    "Signed tickets, and a ledger of what was delivered",
    "Ticket codes are signed and revocable, and every send is recorded — so a refunded ticket stops working at the gate and someone can prove the email went out.",
  ],
  [
    "Every model call goes through one gateway",
    "No provider SDK is imported and no provider key is stored: one gateway key, one budget, one dashboard, and the model behind a feature is a configuration change rather than a dependency.",
  ],
  [
    "Eleven architecture decisions on the record",
    "Each ADR names the Jira issues it constrains and the vendor documentation it was verified against, with the date. A decision whose blast radius isn’t written down gets relitigated every time someone new reads the code — and here that someone is usually the model.",
  ],
  [
    "447 tests",
    "Across 61 files, including tenant-isolation and capacity-concurrency suites that run against a real Postgres rather than a mock.",
  ],
];

export const PRODUCTS: readonly Product[] = [
  {
    slug: "tophand",
    productId: "tophand",
    index: "Product 01",
    name: "TopHand",
    thesis: "the farm’s most knowledgeable hand.",
    meta: "tophand.ag · in active development · first customer: GoatLife Farm, Michigan",
    domain: "tophand.ag",
    audience: "Working farms",
    status: "In active development",
    summary:
      "A condition-gated timing engine that tells a farmer when to act, bridged to a coordination board that handles who does it. The wedge is money, not time.",
    tests: 1078,
    card: {
      img: "/shots/tophand.png",
      alt: "TopHand’s cut recommendation: three gates, a quality target and the reasoning behind the call",
      objectPosition: "left top",
      width: 1422,
      height: 904,
    },
    url: "https://tophand.ag",
    ctaLabel: "Visit tophand.ag",
    logo: <BrandMark size={52} bg="dark" />,
    description:
      "TopHand — a condition-gated timing engine bridged to a coordination board, built end to end by one person on an AI-native SDLC. A live build log straight from Jira, GitHub and Vercel.",
    story: (
      <>
        <p>
          Farm management software has a crowded middle: everyone sells
          record-keeping, and record-keeping is a chore farmers resent paying
          for. TopHand sells something no competitor pairs &mdash; a{" "}
          <span className="bl-ink">condition-gated timing engine</span> that
          tells a farmer <em>when</em> to act, bridged to a{" "}
          <span className="bl-ink">coordination board</span> that handles{" "}
          <em>who does it</em>.
        </p>
        <p>
          The wedge is money, not time. Cutting hay in the right window is
          worth <span className="bl-mono">$70&ndash;100</span> per ton in grade
          spread; every day of delay past peak costs roughly{" "}
          <span className="bl-mono">$9</span> per acre in quality loss. A tool
          that saves one cutting pays for itself for years. That&rsquo;s a
          different sales conversation than &ldquo;keep better records.&rdquo;
        </p>
        <p>
          When I found that my data model had quietly assumed hay was the only
          crop a farm grows, that became a Confluence spec, a nine-story epic,
          and a shipped migration &mdash; seven days from problem to
          production, with the whole thread traceable from the decision to the
          commit.
        </p>
        <p>
          My family runs a working dairy-goat farm in Michigan. It&rsquo;s the
          first tenant, the demo environment, and the reason I know which
          problems are real.
        </p>
        <p>
          TopHand exists to prove the operating model, not to raise capital.
          It&rsquo;s a live product with real users because that&rsquo;s the
          only honest way to test whether the method works.
        </p>
      </>
    ),
    figure: (
      <figure className="bl-shot">
        <img
          src="/shots/tophand.png"
          alt="TopHand&rsquo;s cut recommendation: three gates, a quality target and the reasoning behind the call"
          width={1422}
          height={904}
          loading="lazy"
        />
        <figcaption>
          TopHand &mdash; the call on a demo field. Three gates, a quality
          target in RFV, and the reasoning out loud: cut Thursday, or lose
          roughly four RFV points a day waiting.
        </figcaption>
      </figure>
    ),
    highlights: TOPHAND_HIGHLIGHTS,
  },
  {
    slug: "motoradvisor",
    productId: "motoradvisor",
    index: "Product 02",
    name: "MotorAdvisor",
    thesis: "the question becomes a repair order.",
    meta: "motoradvisor.app · in active development · independent repair shops",
    domain: "motoradvisor.app",
    audience: "Independent repair shops",
    status: "In active development",
    summary:
      "Turns a service writer’s question into a priced, bookable, payable repair order, and gates the repair against what the car is worth.",
    tests: 1824,
    card: {
      img: "/shots/motoradvisor-phone-verdict.webp",
      alt: "MotorAdvisor work order on a phone: the repair-or-replace card, a $285 repair against a $1,095 to $2,320 trade-in value, marked worth repairing",
      objectPosition: "center 30%",
      width: 470,
      height: 976,
    },
    url: "https://motoradvisor.app/login",
    ctaLabel: "Visit motoradvisor.app",
    /* Portfolio variant: the "powered by" attribution is removed and the
       wordmark reversed for the dark route — see
       public/brand/motoradvisor-logo-reversed.svg */
    logo: (
      <img
        src="/brand/motoradvisor-logo-reversed.svg"
        alt="MotorAdvisor"
        width={320}
        height={46}
      />
    ),
    description:
      "MotorAdvisor — a service writer’s question turned into a priced, bookable, payable repair order, gated against what the car is worth. A live build log straight from Jira, GitHub and Vercel.",
    story: (
      <>
        <p>
          A service writer standing at a counter has one question &mdash;{" "}
          <em>
            what&rsquo;s wrong with this car, what will it cost, and should we
            even do the work?
          </em>{" "}
          &mdash; and answering it today means crossing four systems and a
          phone call. MotorAdvisor turns that question into a{" "}
          <span className="bl-ink">
            priced, bookable, payable repair order
          </span>
          , in the conversation where it was asked.
        </p>
        <p>
          The bet isn&rsquo;t that shops want another database. It&rsquo;s that
          the repair decision is a{" "}
          <span className="bl-ink">single continuous act</span> &mdash;
          diagnose, price, decide, approve, pay &mdash; and that every product
          in this market breaks it into pieces and hands the seams to the shop.
        </p>
        <p>
          The part nobody does: it gates the repair against the car. A vehicle
          valuation sits alongside the estimate, so a{" "}
          <span className="bl-mono">$3,400</span> repair on a car worth{" "}
          <span className="bl-mono">$2,900</span> is a conversation the system
          starts rather than one the writer has to remember to have. That
          verdict is advisor-facing by default &mdash; telling a customer their
          car isn&rsquo;t worth fixing is the shop&rsquo;s call to make, in the
          shop&rsquo;s voice.
        </p>
        <p>
          Same operating model as TopHand, at a different scale: specs first,
          epics and stories, one story per pull request, every merge reviewed.
          Where it differs is the shape of the risk &mdash; two licensed
          upstream data providers that must stay strictly separate in the code,
          enforced as build rules with negative controls rather than as
          conventions anyone has to remember.
        </p>
      </>
    ),
    figure: (
      <figure className="bl-shot bl-shot-phones">
        {/* Three screens from the installed phone app, in the order the
            job moves: the question, the verdict, the customer's decision.
            Provenance and the vendor-naming rule: public/shots/README.md */}
        <div className="bl-phones">
          <img
            src="/shots/motoradvisor-phone-ask.webp"
            alt="MotorAdvisor chat on a phone: the owner's complaint in plain language, and the advisor's reply naming the four A/C bulletins to start from"
            width={470}
            height={976}
            loading="lazy"
          />
          <img
            src="/shots/motoradvisor-phone-verdict.webp"
            alt="MotorAdvisor work order on a phone: the repair-or-replace card, a $285 repair against a $1,095 to $2,320 trade-in value, marked worth repairing"
            width={470}
            height={976}
            loading="lazy"
          />
          <img
            src="/shots/motoradvisor-phone-approve.webp"
            alt="The shop-branded estimate page on the customer's phone: labor, parts, a $1,315.35 total, and an Approve this estimate button"
            width={470}
            height={976}
            loading="lazy"
          />
        </div>
        <figcaption>
          MotorAdvisor on the phone it actually runs on &mdash; one job in the
          demo shop. The complaint goes in as the customer said it; the
          estimate is weighed against what the car is worth; and the customer
          approves it on their own phone, in the shop&rsquo;s name.
        </figcaption>
      </figure>
    ),
    /* Three phones in a half-width column land around 100px each — the strip
       runs full width under the story instead. */
    figureFullWidth: true,
    highlights: MOTORADVISOR_HIGHLIGHTS,
  },
  {
    slug: "onward",
    productId: "onward",
    index: "Product 03",
    name: "Onward",
    thesis: "the owner who is leaving meets the one who is arriving.",
    meta: "onwardlegacy.com · in active development · small-business succession",
    domain: "onwardlegacy.com",
    audience: "Small business owners and buyers",
    status: "In active development",
    summary:
      "A succession marketplace that starts by answering the question an owner actually has — what is this worth? — without asking who they are. Identity is the opt-in, not the toll.",
    tests: 552,
    card: {
      img: "/shots/onward.webp",
      alt: "Onward’s homepage: “Legacies move forward” over the two entry points, one for an owner and one for a buyer",
      objectPosition: "center top",
      width: 1067,
      height: 600,
    },
    url: "https://onwardlegacy.com",
    ctaLabel: "Visit onwardlegacy.com",
    description:
      "Onward — a small-business succession marketplace that answers what a business is worth before it asks who you are. A live build log straight from Jira, GitHub and Vercel.",
    story: (
      <>
        <p>
          Most small businesses never change hands. The owner is ready, the
          business is sound, and there is no mechanism &mdash; brokers work the
          top of the market, and below that line an owner is left asking a
          question nobody will answer for free:{" "}
          <em>what is this actually worth?</em>
        </p>
        <p>
          Onward answers it first and asks who you are second. The estimator on
          the homepage runs without a sign-up, and the{" "}
          <span className="bl-ink">data model enforces that promise</span>{" "}
          rather than merely honouring it: estimates are append-only, carry no
          identifying columns, and none may ever be added. Identity is a
          separate opt-in written in the same transaction as its consent
          record. Lead capture is switched off in configuration until there is
          a backend that can do both halves atomically.
        </p>
        <p>
          Behind the estimate is the part brokers do: a readiness plan, a
          listing, buyer qualification, diligence, an LOI, encrypted document
          exchange, and the messages in between &mdash; both sides of the
          table, in one product.
        </p>
        <p>
          The engineering decision I&rsquo;d point at is the triage agent. It
          reads a Slack channel, investigates each report against the code,
          files a ticket and answers in thread. It began as a scheduled task
          inside my own session, holding my credentials, with{" "}
          &ldquo;read-only&rdquo; and its circuit breakers written as{" "}
          <em>sentences in a Markdown file</em>. Now every one of those limits
          is a line of code: a checkout it cannot push from, no shell and no
          file-writing tool at all, one channel, one project, tokens that are
          refused if they are broad enough to read a user profile. What the
          model still owns is judgment. The containment is what bounds the
          damage when judgment fails &mdash; and that is the lesson worth
          carrying into someone else&rsquo;s organization.
        </p>
      </>
    ),
    figure: (
      <figure className="bl-shot">
        <img
          src="/shots/onward.webp"
          alt="Onward&rsquo;s homepage: &ldquo;Legacies move forward&rdquo; over the two entry points, one for an owner and one for a buyer"
          width={1067}
          height={600}
          loading="lazy"
        />
        <figcaption>
          Onward &mdash; the public front door. Two doors, not one: the owner
          deciding whether to sell and the person who wants to run it are
          different products wearing one brand.
        </figcaption>
      </figure>
    ),
    highlights: ONWARD_HIGHLIGHTS,
  },
  {
    slug: "writehome",
    productId: "writehome",
    index: "Product 04",
    name: "Write Home",
    thesis: "speak a letter; it arrives in ink.",
    meta: "writehome.ink · in active development · consumer",
    domain: "writehome.ink",
    audience: "Families, at a distance",
    status: "In active development",
    summary:
      "Talk into your phone for two minutes; a machine writes it out in pen, stamps it, and USPS delivers it. The recipient’s reply is already paid for.",
    tests: 89,
    card: {
      img: "/shots/writehome.webp",
      alt: "Write Home’s homepage: “Say it out loud. It arrives in ink.” beside a handwritten note and its stamped envelope",
      objectPosition: "center top",
      width: 1120,
      height: 630,
    },
    url: "https://writehome.ink",
    ctaLabel: "Visit writehome.ink",
    description:
      "Write Home — a two-minute voice memo delivered as a real handwritten letter, with the reply already paid for. A live build log straight from Jira, GitHub and Vercel.",
    story: (
      <>
        <p>
          The other four products on this page are B2B. This one is my
          grandmother.
        </p>
        <p>
          The people most worth writing to are the least likely to be reached
          by another app: the letter has to arrive{" "}
          <span className="bl-ink">on paper, in pen, in the mail</span>, and
          nothing about receiving one can require the recipient to own, install
          or understand anything. So the product is a two-minute voice memo on
          the sender&rsquo;s side and an envelope on the other, with a machine
          and the postal service in between.
        </p>
        <p>
          Two decisions carry it. The first is that the AI edits and never
          authors &mdash; it tightens what you actually said to fit the card
          and shows you the diff, because a note your grandmother can tell was
          written by a model is worth less than no note. Letter content is
          never stored at all.
        </p>
        <p>
          The second is that the reply is already in the box. No return
          envelope: the pen writes a code at the foot of the note, and the
          recipient talks their answer at a URL that is already paid for. A
          gift that only travels one way is a card; one that comes back is
          correspondence.
        </p>
        <p>
          The hardest constraint here was never the pen. It was building a
          checkout a 78-year-old completes on an iPad &mdash; which is why the
          buying flow is a plain form that works with JavaScript switched off,
          and why the page where a recipient hands over their address needs no
          JavaScript either.
        </p>
      </>
    ),
    figure: (
      <figure className="bl-shot">
        <img
          src="/shots/writehome.webp"
          alt="Write Home&rsquo;s homepage: &ldquo;Say it out loud. It arrives in ink.&rdquo; beside a handwritten note and its stamped envelope"
          width={1120}
          height={630}
          loading="lazy"
        />
        <figcaption>
          Write Home &mdash; the promise stated in one line, and the product
          photographed as what it actually is: a note in pen and a stamped
          envelope, not a screen.
        </figcaption>
      </figure>
    ),
    highlights: WRITEHOME_HIGHLIGHTS,
  },
  {
    slug: "bookevents",
    productId: "bookevents",
    index: "Product 05",
    name: "Book Events",
    thesis: "the tightest constraint holds the gate.",
    meta: "bookevents.app · in active development · Shopify merchants",
    domain: "bookevents.app",
    audience: "Shopify merchants running events",
    status: "In active development",
    summary:
      "Event ticketing for Shopify built on resource pools rather than seat counts, so a farm, brewery or studio never oversells a family ticket it hasn’t got the staff for.",
    tests: 447,
    card: {
      img: "/shots/bookevents.webp",
      alt: "Book Events’ homepage: “Run the Event. Not the paperwork.” beside an occurrence card showing seats and kitchen staff as separate resource pools",
      objectPosition: "center top",
      width: 1084,
      height: 610,
    },
    url: "https://bookevents.app",
    ctaLabel: "Visit bookevents.app",
    description:
      "Book Events — Shopify event ticketing with resource-pool capacity, so the tightest real constraint holds the gate. A live build log straight from Jira, GitHub and Vercel.",
    story: (
      <>
        <p>
          Every event ticketing app counts seats. Almost no real venue is
          limited by seats. A farm dinner is limited by seats{" "}
          <em>and</em> kitchen staff; a pottery studio by wheels and kilns; a
          goat yoga class, genuinely, by goats. Sell a{" "}
          <span className="bl-ink">family of five</span> into a room that has
          the chairs but not the second cook, and the merchant finds out on the
          night.
        </p>
        <p>
          Book Events models capacity as{" "}
          <span className="bl-ink">resource pools</span>. A booking draws
          weighted amounts from several at once and the tightest one binds
          &mdash; and when it binds, the shopper is told which constraint
          stopped them, in the merchant&rsquo;s own words, rather than watching
          a button fail.
        </p>
        <p>
          It is an embedded Shopify app, which means the interesting problems
          are boundary problems. Money only moves through the merchant&rsquo;s
          own checkout, so events have to become products and ticket types
          variants and stay in sync. The theme&rsquo;s own Buy-it-now button is
          a second front door that skips the date, the attendee details and the
          capacity hold &mdash; so it isn&rsquo;t hidden, it&rsquo;s{" "}
          <span className="bl-ink">refused by a checkout validation
          function</span>, because a control you can only see in the UI is not
          a control.
        </p>
        <p>
          This is the product where the operating model shows up most plainly
          as documents. Eleven architecture decision records, each naming the
          Jira issues it constrains and the vendor documentation it was checked
          against, with the date. Written for a reader who will be an AI as
          often as a person &mdash; and a decision whose blast radius
          isn&rsquo;t on the record gets relitigated every single time.
        </p>
      </>
    ),
    figure: (
      <figure className="bl-shot">
        <img
          src="/shots/bookevents.webp"
          alt="Book Events&rsquo; homepage: &ldquo;Run the Event. Not the paperwork.&rdquo; beside an occurrence card showing seats and kitchen staff as separate resource pools, with a private table unavailable because staff, not seats, is the binding constraint"
          width={1084}
          height={610}
          loading="lazy"
        />
        <figcaption>
          Book Events &mdash; the argument made on the homepage itself. Seats
          are at 34 of 40 and kitchen staff at 1 of 2, so the private table is
          gone: staff is binding, not seats, and the shopper is told so.
        </figcaption>
      </figure>
    ),
    highlights: BOOKEVENTS_HIGHLIGHTS,
  },
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** The next product in the list, wrapping — drives the detail-page pager.
 *  Undefined when there is only one product, so the pager can drop the link. */
export function nextProduct(current: Product): Product | undefined {
  if (PRODUCTS.length < 2) return undefined;
  return PRODUCTS[(PRODUCTS.indexOf(current) + 1) % PRODUCTS.length];
}
