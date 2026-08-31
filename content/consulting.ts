/** /consulting page content (consulting-spec v1). Copy is final — ported
 *  verbatim from the approved reference (consulting-page.html); edit here,
 *  not in the route.
 *
 *  Deliberate omissions per spec §1: no fees/rates/prices anywhere, and no
 *  career statistics — the record lives on the homepage and is linked, not
 *  restated. Do not add either when editing. */

export const consultingMeta = {
  /** Short name only — the root layout's title template appends the suffix. */
  title: "Consulting",
  /** OG/Twitter don't inherit the template, so they spell it out (spec §3). */
  fullTitle: "Consulting — Joe Ross, Product Detroit",
  description:
    "Product leadership engagements for software companies that have outgrown running product on instinct. Fixed scope, fixed fee, defined end.",
} as const;

export const masthead = {
  kicker: "Consulting",
  /** H1 renders as: headBefore <em>headEm</em> headAfter */
  headBefore: "Product leadership, for a fixed scope and a ",
  headEm: "defined",
  headAfter: " outcome.",
  lede:
    "I build the product function at software companies that have outgrown running product on instinct — and tie every product investment to a revenue or margin outcome the board can see.",
  /** Must match the CTA band's button word for word (spec §5.8). */
  ctaLabel: "Schedule 20 minutes",
  sub: "Or email joe@productdetroit.com.",
} as const;

export type Symptom = { lead: string; text: string };

export const symptoms: Symptom[] = [
  {
    lead: "Every meaningful product decision still routes through one person.",
    text:
      "Usually the founder, sometimes the largest customer. It worked for years. It is now the constraint on how fast the company can grow, and everyone can feel it except the person in the middle of it.",
  },
  {
    lead: "There's a roadmap, but nobody can explain it in business terms.",
    text:
      "Which items win new business, which protect the base, which defend margin, which are table stakes nobody gets credit for. Every prioritization argument starts from zero, and the loudest voice usually wins.",
  },
  {
    lead: "Sales is making promises product hasn't validated.",
    text:
      "Deals close on commitments that arrive in engineering as a surprise, and the next quarter gets consumed absorbing them.",
  },
  {
    lead: "Decisions get made on opinion because there's no evidence.",
    text:
      "Nobody can say whether the last release is being used, by whom, or whether it changed retention. Every roadmap argument is a matter of taste.",
  },
  {
    lead: "Engineering capacity is the ceiling.",
    text:
      "Real customer problems die in the backlog, not because they were wrong but because capacity was finite. Product spends its judgment on triage instead of on what's worth building.",
  },
  {
    lead: "Something was acquired and nobody knows what to do with it.",
    text:
      "The deal closed. The product, pricing, contract, and migration questions did not.",
  },
  {
    lead: "The board is asking about AI and the answer isn't ready.",
    text:
      "Or worse: AI features shipped, adoption is climbing, and gross margin is drifting in a direction nobody has modeled.",
  },
];

export const fitQualifiers: Symptom[] = [
  {
    lead: "B2B software companies,",
    text: "roughly $10M to $300M in ARR.",
  },
  {
    lead: "PE-backed, founder-led, or recently both.",
    text:
      "Most of my work follows an investment, a founder transition, or an acquisition.",
  },
  {
    lead: "An executive sponsor who wants the real answer,",
    text: "not confirmation of one they already have.",
  },
  {
    lead: "Willingness to change how decisions get made,",
    text: "not just what's on the roadmap.",
  },
];

export const fitProse = [
  "Engagements are fixed scope and fixed fee, with a defined end. I quote a number after a discovery call, once I understand what has to be true when I'm finished. I'd rather do one thing completely than be loosely attached to five.",
  "I take on a small number of clients at a time, and every engagement ends with your team running what was built. If it only works while I'm there, it didn't work.",
];

export type Engagement = {
  title: string;
  /** DM Mono, terracotta, uppercase — durations do the filtering work that
   *  price used to (spec §1); never replace with a fee. */
  duration: string;
  /** First paragraph is the "when it fits" and renders in ink when `fit`
   *  isn't disabled; the rest render muted. */
  paragraphs: string[];
  /** Clay-ruled italic note. Authored HTML (may contain <a>). Not user input. */
  proofHtml?: string;
};

export type EngagementGroup = {
  heading: string;
  intro?: string;
  cards: Engagement[];
};

export const engagementGroups: EngagementGroup[] = [
  {
    heading: "Diagnosis",
    intro: "Most engagements begin here, and it's a complete piece of work on its own.",
    cards: [
      {
        title: "Product diagnostic",
        duration: "2 weeks",
        paragraphs: [
          "You know something is wrong with how product operates but the diagnosis is contested. Or you're about to invest in a new hire, a reorg, or a platform bet, and want an outside read first.",
          "I work with your product, engineering, sales, and executive team, read the roadmap and the last two quarters of delivery, and sit in on the meetings where decisions actually get made. You get a written assessment of what's constraining product, what it's costing in revenue or margin terms, and a sequenced plan — including what you should do yourselves.",
        ],
      },
    ],
  },
  {
    heading: "Operating machinery",
    intro: "The systems that make product decisions repeatable after I leave.",
    cards: [
      {
        title: "Product investment governance",
        duration: "4–6 weeks",
        paragraphs: [
          "You have a product team and a roadmap, and still can't answer a board question about why you're building what you're building. Adding something mid-quarter costs nothing, so everything gets added.",
          "I install an annual product investment plan aligned to the budget and strategy you already build — denominated in capacity rather than a list of initiatives, because a list absorbs infinite additions and a fixed pool cannot. Alongside it, a product-led quarterly business review in two halves: what was planned versus completed and whether the work produced the outcome it was funded to produce, then next quarter's plan with tradeoffs worked live until there's executive commitment.",
          "Two safeguards keep it from decaying: a written tiebreak naming who decides when executives don't align, and a defined path for genuine in-quarter change.",
        ],
        proofHtml:
          "Best installed in Q3 or Q4, alongside next year's planning cycle.",
      },
      {
        title: "Product instrumentation and customer signal",
        duration: "6–8 weeks",
        paragraphs: [
          "You cannot answer basic questions about your own product — which capabilities are used and by whom, which customers are at risk and why, what the field is losing deals on.",
          "I instrument the product for usage and adoption, stand up in-app feedback and CSAT, and bring together the signal you already generate but don't synthesize: support themes, win/loss reasons, churn and expansion patterns. The instrumentation is the easy half. The work that matters is defining what each signal means, what thresholds trigger action, and how the evidence feeds your investment decisions — so it changes what gets funded rather than filling a dashboard nobody opens.",
        ],
        proofHtml:
          "This is not a tool implementation. The platform — Pendo or another — is an input. What I install is the decision system around it.",
      },
      {
        title: "Product function build",
        duration: "90 days",
        paragraphs: [
          "There is no product function, or there are product managers without an operating model around them. Often following an investment, a founder transition, or a step-change in scale.",
          "Operating model, governance, roles and hiring profiles, planning and prioritization rhythm, discovery practice, and the tooling to support it — built alongside your team rather than handed over as a design, because a product function that arrives as a document does not survive its first quarter. You end with a working function and either a hired product leader or a credible plan to hire one.",
        ],
      },
    ],
  },
  {
    heading: "In the seat",
    cards: [
      {
        title: "Fractional CPO",
        duration: "1–2 days/week · 3-month minimum",
        paragraphs: [
          "You need senior product leadership in the room now — for a board cycle, a transition, a turnaround, or while you search for a permanent CPO.",
          "I hold the seat: strategy, roadmap, executive and board communication, team leadership, and the hard calls. I represent product to your board and your investors, and I set a successor up to inherit something that works rather than a vacuum.",
        ],
      },
      {
        title: "Advisory retainer",
        duration: "Monthly · 3-month minimum",
        paragraphs: [
          "Standing access for a CEO or product leader. Regular working sessions, board and investor preparation, and availability between them.",
        ],
      },
    ],
  },
  {
    heading: "Transactions",
    cards: [
      {
        title: "Post-acquisition product integration",
        duration: "8–12 weeks",
        paragraphs: [
          "A deal closed and the product questions are open: portfolio strategy, overlap, pricing and packaging, contract structure, migration path, and what to tell customers and the field.",
          "I run the product side of integration and leave you with a decided strategy that has an owner and a timeline, not a set of options.",
        ],
      },
      {
        title: "Pre-deal product diligence",
        duration: "3–5 days",
        paragraphs: [
          "You're evaluating an acquisition and need a product read that goes past the demo and the deck.",
          "Roadmap credibility, technical debt exposure, product organization strength, pricing durability, retention and expansion mechanics, and the realistic cost and timeline of integration — in a written memo with the risks that matter and the questions worth asking before signing. An AI readiness assessment can be added.",
        ],
      },
    ],
  },
];

/** §5.5 — prose paragraphs are authored HTML (contain <strong>). AI cards
 *  reuse the engagement card component but carry no ink "fit" paragraph. */
export const aiLayer = {
  kicker: "The AI layer",
  heading: "AI reaches the P&L in three places",
  paragraphsHtml: [
    "AI is how this work gets done now, and it's a third place product decisions reach the P&amp;L. It augments every engagement above and is rarely the whole of one — but it is often the reason a company calls.",
    "<strong>Most companies have someone watching one of the three.</strong> Engineering cost — capacity, velocity, the development lifecycle — usually sits with the CTO. Revenue — differentiated features that win deals — sits partly with product. Cost of goods sold — inference expense against gross margin — frequently sits with no one, until it shows up in a valuation conversation.",
    "That third one matters more than it appears. SaaS businesses are valued on 75 to 85 percent gross margins. AI features convert fixed-cost revenue into variable-cost revenue. Bundle inference into an existing seat price to drive adoption, which is what nearly everyone does, and the business quietly moves toward a different multiple bracket. For a sponsor-backed company, that isn't a product problem. It's a thesis problem.",
    "I work on this from the product and P&amp;L side rather than the infrastructure side. Pricing a feature whose cost moves with usage is a different discipline from pricing a seat, and most product leaders have never had to do it.",
  ],
  cards: [
    {
      title: "AI P&L diagnostic",
      duration: "3 weeks",
      paragraphs: [
        "Where AI sits in your product today, what it costs per feature, per customer, and per workflow, what it's doing to gross margin, and where the exposure is concentrated.",
      ],
    },
    {
      title: "AI-native software development lifecycle",
      duration: "8–10 weeks",
      paragraphs: [
        "Baseline current adoption, redesign the lifecycle around AI-assisted development, drive adoption across teams, and hand over a measurement framework.",
      ],
      proofHtml:
        'I run this model myself, in the open. <a href="/building">See the build log</a>.',
    },
    {
      title: "AI monetization and margin",
      duration: "6–8 weeks",
      paragraphs: [
        "Cost model, packaging architecture — bundled, credit-based, or tiered — a cost-reduction roadmap built with engineering, and a margin governance rhythm so the gains don't erode.",
      ],
    },
  ] satisfies Engagement[],
} as const;

/** §5.6 — First / Then / Finally, not 01 / 02 / 03: the content is a
 *  sequence, but the words carry it better than numbered markers. */
export type ProcessStep = { label: string; heading: string; text: string };

export const processSteps: ProcessStep[] = [
  {
    label: "First",
    heading: "A conversation",
    text:
      "Twenty minutes. You describe what's happening; I tell you whether it's something I can help with and what I'd want to look at. No deck.",
  },
  {
    label: "Then",
    heading: "Mutual NDA",
    text:
      "Before we discuss anything specific to your business. Happy to work under your paper.",
  },
  {
    label: "Finally",
    heading: "A written proposal",
    text:
      "Scope, deliverables, timeline, what I need from you, and a fixed fee. If the honest answer is that you don't need me, you'll get that instead.",
  },
];

export const scopeNote =
  "Not UX or design services. Not fractional CTO or engineering management. Not machine learning infrastructure. Not cloud cost tooling. Not recruiting. Not a strategy deck that ends at the deck.";

export const principles: Symptom[] = [
  {
    lead: "Fixed scope, fixed fee, defined end.",
    text: "You should know what you're buying and when it's finished.",
  },
  {
    lead: "A small number of clients.",
    text: "This work requires being genuinely present.",
  },
  {
    lead: "Your people run it after I leave.",
    text: "If it only works while I'm there, it didn't work.",
  },
  {
    lead: "Straight answers.",
    text:
      "Including when the answer is that the problem you asked me to solve isn't the one you have.",
  },
];

export const ctaBand = {
  heading: "Start with a conversation.",
  text:
    "Twenty minutes to describe what's happening and hear whether it's something I can help with. If there's a fit, you'll get a written proposal with a fixed scope and a fixed fee.",
  /** Must match the masthead button word for word (spec §5.8). */
  ctaLabel: "Schedule 20 minutes",
} as const;
