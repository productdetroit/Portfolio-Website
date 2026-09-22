import type { ReactNode } from "react";
import BrandMark from "@/components/BrandMark";

/** Per-product page content for the /building portfolio.
 *
 *  The index at /building renders one card per entry; /building/[slug] renders
 *  the same entry in full. Both read this list, so adding product 03 means
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
  slug: "tophand" | "motoradvisor";
  /** Key into getBuildLog().products[].productId. Equal to `slug` today, but
   *  the route and the register key are different things — the same reason
   *  ProductConfig keeps `jiraProject` and `ticketPrefix` apart. */
  productId: "tophand" | "motoradvisor";
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
