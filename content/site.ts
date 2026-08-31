/** Content ported verbatim from the original static index.html. */

export const site = {
  name: "ProductDetroit.com",
  title: "Joe Ross — Executive Product Leader",
  /** <title> tag only — OG tags keep `title` (spec §5.3). */
  metaTitle: "Joe Ross — Chief Product Officer | PE-Backed SaaS, AI, Payments",
  /** Suffix applied to every non-homepage <title> via the root layout's
   *  title template. Pages declare only their short name (e.g. "Building"). */
  titleTemplate: "%s — Joe Ross, Product Detroit",
  heroSub:
    "30+ years leading product at PE-backed SaaS companies, a Fortune 5 enterprise, and founder-led businesses — as founding CPO at both WorkForce Software ($68M→$150M ARR, acquired by ADP for $1.2B) and BS&A Software, building the product function from scratch at each and scaling the cloud SaaS business.",
  /** Both contact routes converge on the same first step. */
  ctaClose: "Either way, it starts with the same twenty minutes.",
  url: "https://productdetroit.com",
  email: "joe@productdetroit.com",
  phone: "+12482852821",
  phoneDisplay: "248.285.2821",
  gaId: "G-0YHENY8VWK",
  videoEmbed: "https://www.youtube.com/embed/ausaOPHSpNU",
  links: {
    linkedin: "https://linkedin.com/in/josephrross",
    resume: "https://productdetroit.com/joe-ross-resume.pdf",
    adplist: "https://adplist.org/mentors/joe-ross",
    calendly: "https://calendly.com/productdetroit",
  },
} as const;

/** Root-relative so they work from /building as well as the home page. */
export const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#career", label: "Career" },
  { href: "/#press", label: "Press" },
  { href: "/building", label: "Building" },
  { href: "/consulting", label: "Consulting" },
  { href: "/#contact", label: "Contact" },
];

/** Contact-section routing (consulting-spec §8): once Consulting is in the
 *  nav, the section must serve both audiences — engagements to /consulting,
 *  roles to the résumé — or the consulting page leaks its own traffic. */
export type CtaRoute = {
  label: string;
  text: string;
  cta: string;
  /** Internal path, or omit when `resume` renders the ResumeLink instead. */
  href?: string;
  resume?: boolean;
};

export const ctaRoutes: CtaRoute[] = [
  {
    label: "Engagements",
    text: "Product leadership for your company — fixed scope, fixed fee, defined outcome.",
    href: "/consulting",
    cta: "Explore Consulting →",
  },
  {
    label: "Roles",
    text: "Exploring CPO and VP Product roles at PE-backed SaaS companies in the $50M–$300M ARR range.",
    resume: true,
    cta: "Download Résumé ↓",
  },
];

/** `numberHtml` contains inline <span> units and is rendered as authored HTML.
 *  `small` renders the number at reduced size — for long text stats that would
 *  otherwise wrap awkwardly in the display slot (update-spec §6.2). */
export type ProofStat = { numberHtml: string; desc: string; small?: boolean };

export const proofStats: ProofStat[] = [
  {
    numberHtml: "$1.2<span>B</span>",
    desc: "WorkForce Software acquired by ADP · Oct 2024",
  },
  {
    numberHtml: "$68<span>→</span>$150<span>M</span>",
    desc: "ARR doubled at WorkForce Software · 2016–2023",
  },
  {
    numberHtml: "2x Founding <span>CPO</span>",
    desc: "Built the product function from scratch at both WorkForce Software and BS&A",
    small: true,
  },
  {
    numberHtml: "2x Rev · 4x <span>EBITDA</span>",
    desc: "Scaled BS&A revenue 2x+ and EBITDA ~4x as founding CPO",
    small: true,
  },
];

export type Pillar = { tag: string; title: string; text: string };

export const pillars: Pillar[] = [
  {
    tag: "Founding Product Leader",
    title: "Twice built from zero.",
    text:
      "Founding CPO at two PE-backed companies — I've created the product management practice from scratch where none existed, assembling the team, governance, and operating model, then scaling each into a growth engine that delivered material enterprise value, including a $1.2B exit.",
  },
  {
    tag: "World-Class Teams",
    title: "Teams that win awards.",
    text:
      "Built product organizations recognized among the world's finest — WorkForce Software's product & design team earned a spot on Comparably's Top 50 Best Product + Design Departments (2022), a global list alongside Microsoft and Amazon. Great teams make great products.",
  },
  {
    tag: "Revenue Impact",
    title: "Product as a growth engine.",
    text:
      "Every product investment decision I've made has been anchored in revenue impact — doubling ARR at WorkForce Software, quadrupling EBITDA at BS&A, and contributing directly to a $1.2B exit.",
  },
  {
    tag: "AI Leadership",
    title: "AI built into the core.",
    text:
      "Not just AI features — an AI operating model. In a tight partnership with the CTO, I designed BS&A's first AI strategy, shipped its first AI-powered customer features, and led an AI-first cultural shift — reshaped the software development lifecycle into an AI-native SDLC and drove AI tooling adoption across every engineering team.",
  },
  {
    tag: "M&A & Integration",
    title: "A repeatable acquisition playbook.",
    text:
      "Four acquisitions across three companies — Per-Se at McKesson, Workplace and FoKo Retail at WorkForce, and Boyce Systems at BS&A — each integrated into the product portfolio and, where it mattered, migrated onto cloud. Comfortable in the room for diligence and investor meetings, including WorkForce's $1.2B exit to ADP.",
  },
  {
    tag: "Cloud Scale",
    title: "Making cloud the better choice.",
    text:
      "Focused product investment on making BS&A's cloud SaaS product clearly better than its on-premise predecessor — innovative new capabilities that accelerated customer adoption and scaled the live cloud base. Backed initiatives to improve implementation margin and lower the cost to support cloud customers, feeding the company's multi-year value-creation plan.",
  },
  {
    tag: "Customer Obsession",
    title: "Grounded in customer signal.",
    text:
      "Built BS&A's in-app customer feedback and CSAT engine from scratch — measurably reduced the cloud detractor rate and turned at-risk strategic accounts into promoters. Stood up the Customer Advisory Board to validate the roadmap directly with the people who run on it.",
  },
];

export type CareerEntry = {
  dates: string; company: string; role: string;
  /** Authored HTML (may contain <strong>). Not user input. */
  descriptionHtml: string; tag: string; highlight: boolean;
};

export const career: CareerEntry[] = [
  {
    dates: "2024 — 2026",
    company: "BS&A Software",
    role: "Chief Product Officer · Interim CRO (H1 2025)",
    descriptionHtml:
      "Joined as founding CPO at a founder-led municipal ERP company following a major private-equity investment by Serent Capital. Built the product function from scratch — team, governance, tooling, and PM playbook. Helped more than double company revenue while nearly quadrupling EBITDA — driven by on-premise to cloud migration, new products, and implementation-margin work. Shipped BS&A's first AI products and co-led, with our Head of Payments and CTO, the launch of the company's first native integrated payments product — now a core growth engine — while partnering with the CTO to drive an AI-first cultural shift — transforming the SDLC into an AI-native SDLC to accelerate ideation to deployment — and aligning product investments to support the company's five-year growth strategy.",
    tag: "Serent Capital PE-Backed · GovTech · Municipal ERP",
    highlight: true,
  },
  {
    dates: "2016 — 2023",
    company: "WorkForce Software",
    role: "VP, Global Product Management → Chief Product Officer (2021)",
    descriptionHtml:
      "Brought in by the new CEO following Insight Partners' investment to create and lead the company's first product management practice as the founder exited; promoted to Chief Product Officer in January 2021. Led global product strategy for an enterprise SaaS platform spanning 85+ countries, doubling ARR from $68M to $150M with 1,100 enterprise customers and 6.3M active users. Built a 30-person product organization recognized as one of the world's best. Expanded the portfolio through M&A — integrating Workplace (UK) and leading the build/buy/partner evaluation behind acquiring FoKo Retail (Canada) to add an employee-experience capability. Partnered with CEO and investment bankers on funding and strategic exit — product investments contributed directly to WorkForce Software's acquisition by ADP in October 2024 for <strong>$1.2 billion in cash</strong>. Participated in investor roadshows, ADP executive meetings, and due diligence leading to the transaction.",
    tag: "PE-Backed · Enterprise WFM SaaS · Acquired by ADP $1.2B",
    highlight: true,
  },
  {
    dates: "2006 — 2016",
    company: "McKesson Corporation",
    role: "Director, Product Management & Innovation",
    descriptionHtml:
      "Led $56M P&L across pharmacy systems, POS, mobile, and payment processing at a Fortune 5 healthcare enterprise. Doubled revenue, tripled EBITDA, and captured ~25% retail pharmacy market share. Sunset a 35-year-old product while retaining 70% of the customer base.",
    tag: "Fortune 5 · Healthcare Technology",
    highlight: false,
  },
];

/** Accounts for 1994–2006 without a fourth career card (spec §6.3). */
export const careerEarlier =
  "Earlier: 1994–2006 — employee #4 at Ideal Technology Solutions through its roll-up into LDMI and Talk America, building a $10M application-services business and shifting it from 80% project revenue to 80% recurring.";

export type PressItem = { date: string; title: string; text: string; href: string; cta: string };

export const press: PressItem[] = [
  {
    date: "Comparably · 2022",
    title: "Top 50 Product & Design Department",
    text:
      "WorkForce Software's product and design department — built and led by Joe — was named to Comparably's Top 50 Best Product + Design Departments, a global list alongside Microsoft, Amazon, and HubSpot.",
    href:
      "https://www.comparably.com/articles/best-product-design-departments-2022/",
    cta: "Read Recognition →",
  },
  {
    date: "May 2024",
    title: "BS&A Appoints Joe Ross as CPO",
    text:
      "BS&A Software announced Joe Ross as Chief Product Officer — hired to build the company's first formal product function from the ground up and lead product strategy across its municipal ERP portfolio.",
    href:
      "https://www.einpresswire.com/article/711272270/bs-a-software-appoints-joe-ross-as-new-chief-product-officer",
    cta: "Read Press Release →",
  },
  {
    date: "October 2024",
    title: "ADP Acquires WorkForce Software for $1.2B",
    text:
      "The company Joe led as CPO from 2016–2023 was acquired by ADP for approximately $1.2 billion in cash — one of the largest enterprise HCM acquisitions of the year. Joe participated directly in the due diligence and executive meetings that led to the transaction.",
    href:
      "https://www.prnewswire.com/news-releases/adp-acquires-workforce-software-302276464.html",
    cta: "Read Press Release →",
  },
  {
    date: "February 2025",
    title: "Boyce Systems Acquisition Integration",
    text:
      "BS&A acquired Boyce Systems and its Keystone software. Joe led the product integration onto the BS&A cloud platform, delivering MVP feature parity and defining the contract, pricing, and migration strategy.",
    href:
      "https://www.businesswire.com/news/home/20250218810114/en/BSA-Expands-Municipal-ERP-Leadership-with-Acquisition-of-Boyce-Systems-Strengthening-Its-Presence-in-Indiana-and-the-Midwest",
    cta: "Read Press Release →",
  },
  {
    date: "LinkedIn · February 2025",
    title: "#TwoLeadersOneVision",
    text:
      "Joe and CTO Greg Heil publicly shared their product & technology leadership philosophy — reflecting the tight CPO/CTO partnership that drove BS&A's engineering velocity, AI transformation, and product execution.",
    href:
      "https://www.linkedin.com/posts/josephrross_twoleadersonevision-activity-7297675998651658240-q9e3",
    cta: "View on LinkedIn →",
  },
  {
    date: "October 2025",
    title: "BS&A Launches AI Assistant",
    text:
      "BS&A Software publicly launched its AI strategy at the Engage 2025 user conference, including Invoice Entry AI and Conversational Reporting — the culmination of Joe's AI product strategy and monetization framework built during his tenure.",
    href:
      "https://www.einpresswire.com/article/882884796/bs-a-software-introduces-ai-assistant-to-its-saas-platform-for-local-governments",
    cta: "Read Press Release →",
  },
  {
    date: "GovTech 100 · 2025 & 2026",
    title: "BS&A Software — Back-to-Back GovTech 100",
    text:
      "BS&A Software earned GovTech 100 recognition in both 2025 and 2026 under Joe's product leadership — the industry's premier recognition for companies most likely to have a significant impact on the government technology market.",
    href:
      "https://www.einpresswire.com/article/897501452/bs-a-software-named-to-2026-govtech-100-for-second-year-for-saas-innovation-and-outstanding-service-to-local-government",
    cta: "Read Press Release →",
  },
];
