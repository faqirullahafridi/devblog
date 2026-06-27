import type { TemplateDef } from "../templates-config";

export type DummyTeamMember = { name: string; role: string; bio: string };
export type DummyBlogPost = { title: string; date: string; excerpt: string };
export type DummyFaq = { q: string; a: string };
export type DummyService = { title: string; desc: string; price?: string };

export type RichDemoContent = {
  brand: string;
  tagline: string;
  headline: string;
  subheadline: string;
  intro: string;
  cta: string;
  secondaryCta: string;
  aboutTitle: string;
  aboutBody: string;
  services: DummyService[];
  features: Array<{ title: string; body: string }>;
  projects: Array<{ name: string; tag: string; desc: string; year: string }>;
  stats: Array<{ value: string; label: string }>;
  pricing: Array<{ name: string; price: string; period: string; features: string[]; featured?: boolean }>;
  testimonials: Array<{ quote: string; author: string; role: string; company: string }>;
  team: DummyTeamMember[];
  timeline: Array<{ year: string; title: string; org: string; detail: string }>;
  skills: string[];
  faq: DummyFaq[];
  blogPosts: DummyBlogPost[];
  clients: string[];
  processSteps: Array<{ step: string; title: string; desc: string }>;
  ctaBand: { title: string; subtitle: string };
};

const CLIENTS = [
  "Meridian Bank", "Northwind Traders", "Contoso Ltd", "Fabrikam Inc",
  "Adventure Works", "Tailwind Co", "Alpine Group", "Horizon Health",
  "Urban Nest", "Clearview Legal", "Beacon Analytics", "Riverstone Capital",
];

const TEAM_FIRST = ["James", "Sarah", "Michael", "Emily", "David", "Olivia", "Daniel", "Sophia", "Matthew", "Isabella"];
const TEAM_LAST = ["Mitchell", "Chen", "Brooks", "Turner", "Hayes", "Patel", "Foster", "Reed", "Coleman", "Nguyen"];
const ROLES = ["Creative Director", "Lead Developer", "Brand Strategist", "Product Designer", "Project Manager", "Marketing Lead"];

function hash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 16777619);
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function slugWords(slug: string): string[] {
  return slug.split("-").filter((w) => w.length > 2 && !["html", "css", "free", "template", "website", "page", "download"].includes(w));
}

function brandFromSlug(slug: string, h: number): string {
  const words = slugWords(slug);
  if (slug.includes("chatbot")) return pick(["Dialogue", "ReplyKit", "Converse AI", "Promptly"], h);
  if (slug.includes("dashboard")) return pick(["Pulseboard", "Metric Hub", "OpsView", "Signal Desk"], h, 1);
  if (slug.includes("machine-learning") || slug.includes("ml")) return pick(["Tensor Lane", "Model Craft", "Gradient Works"], h, 2);
  if (slug.includes("pricing")) return pick(["Tierstack", "Planbase", "Rateframe"], h, 3);
  if (slug.includes("onboarding")) return pick(["FirstRun", "SetupFlow", "Kickoff"], h, 4);
  if (slug.includes("pitch")) return pick(["Deckline", "Founder Kit", "Slidecraft"], h, 5);
  if (slug.includes("minimal")) return pick(["Plainform", "Quiet Studio", "Mono Works"], h, 6);
  if (slug.includes("developer")) return pick(["Alex Mercer", "Jordan Blake", "Sam Okonkwo"], h, 7);
  if (slug.includes("designer")) return pick(["Elena Voss", "Marcus Hale", "The Atelier"], h, 8);
  if (slug.includes("creative")) return pick(["Frame & Form", "Visual Archive", "Studio Nine"], h, 9);
  if (slug.includes("consulting") || slug.includes("business")) return pick(["Sterling Advisory", "Keystone Partners", "Summit Consulting"], h, 10);
  if (words.length >= 2) return `${pick(["North", "Blue", "Summit", "Harbor", "Prime", "Nova"], h)} ${titleCase(words[0])}`;
  if (slug.includes("ai")) return pick(["Neural Path", "Cortex Labs", "Synapse AI", "Mindframe"], h);
  if (slug.includes("saas")) return pick(["Cloudstack", "Flowbase", "Metricly", "Shipfast"], h, 2);
  if (slug.includes("agency")) return pick(["Redwood Creative", "Parallel Agency", "Column Studio"], h, 4);
  if (slug.includes("startup")) return pick(["Launchpad", "Zero Day", "First Mile", "Venture Kit"], h, 5);
  if (slug.includes("resume") || slug.includes("cv")) return pick(["Alex Morgan", "Jordan Lee", "Taylor Kim", "Riley Chen"], h, 6);
  return `${pick(["North", "Blue", "Studio", "Summit", "Harbor", "Atlas", "Lumen", "Oak"], h)} ${pick(["Lane", "Works", "Collective", "Digital", "Partners", "Labs"], h, 1)}`;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function categoryServices(categoryId: string, h: number, brand: string): DummyService[] {
  const pools: Record<string, DummyService[]> = {
    portfolio: [
      { title: "Brand Identity", desc: "Logo systems, color palettes, and typography that hold up across print and digital.", price: "From $3,200" },
      { title: "UI/UX Design", desc: "Wireframes through high-fidelity prototypes for web and mobile products.", price: "From $5,500" },
      { title: "Art Direction", desc: "Campaign visuals, photography direction, and social asset templates.", price: "From $2,800" },
    ],
    "saas-landing-pages": [
      { title: "Workflow Automation", desc: "Connect your stack with 200+ integrations and no-code trigger rules.", price: "From $29/mo" },
      { title: "Analytics Dashboard", desc: "Real-time KPIs, cohort reports, and exportable board-ready summaries.", price: "From $49/mo" },
      { title: "Team Collaboration", desc: "Shared workspaces, comments, and role-based permissions for growing teams.", price: "From $19/mo" },
    ],
    "ai-landing-pages": [
      { title: "Model Training", desc: "Fine-tune LLMs on your data with guardrails and evaluation dashboards.", price: "From $0.002/1k tokens" },
      { title: "API Deployment", desc: "Production endpoints with autoscaling, logging, and 99.9% uptime SLA.", price: "From $99/mo" },
      { title: "Prompt Studio", desc: "Version, test, and ship prompts with A/B metrics and rollback support.", price: "Included in Pro" },
    ],
    "agency-websites": [
      { title: "Brand Strategy", desc: "Positioning workshops, competitive audits, and messaging frameworks.", price: "From $4,500" },
      { title: "Web Design", desc: "Custom responsive sites with CMS integration and accessibility baked in.", price: "From $8,000" },
      { title: "Content & SEO", desc: "Copywriting, metadata, and technical SEO for launch-day visibility.", price: "From $2,200" },
    ],
    "business-websites": [
      { title: "Advisory", desc: "Executive coaching and operational reviews for mid-market leadership teams.", price: "From $350/hr" },
      { title: "Implementation", desc: "Hands-on project delivery with clear milestones and weekly reporting.", price: "From $12k" },
      { title: "Training", desc: "Workshops for sales, ops, and product teams — on-site or remote.", price: "From $4,800" },
    ],
    "startup-pages": [
      { title: "Early Access", desc: "Priority onboarding, founder Slack channel, and roadmap input.", price: "Free during beta" },
      { title: "Growth Tools", desc: "Referral tracking, waitlist analytics, and launch email sequences.", price: "From $39/mo" },
      { title: "Investor Updates", desc: "Automated monthly reports your backers actually read.", price: "From $19/mo" },
    ],
    "product-launch": [
      { title: "Launch Kit", desc: "Press page, email templates, and social assets ready to customize.", price: "Included" },
      { title: "Waitlist CRM", desc: "Segment signups, send drip campaigns, and track conversion sources.", price: "From $29/mo" },
      { title: "Countdown Page", desc: "Teaser site with share cards and referral unlock mechanics.", price: "One-time $199" },
    ],
    "resume-websites": [
      { title: "Frontend", desc: "React, TypeScript, design systems, and performance optimization.", price: "8+ years" },
      { title: "Backend", desc: "Node, PostgreSQL, REST/GraphQL APIs, and cloud infrastructure.", price: "6+ years" },
      { title: "Leadership", desc: "Team mentoring, sprint planning, and cross-functional stakeholder work.", price: "4+ years" },
    ],
    "landing-pages": [
      { title: "Lead Capture", desc: "High-converting forms with spam protection and CRM handoff.", price: "Setup included" },
      { title: "Social Proof", desc: "Testimonial blocks, logo strips, and trust badges that convert.", price: "Setup included" },
      { title: "Analytics", desc: "Event tracking, heatmaps, and weekly performance summaries.", price: "From $9/mo" },
    ],
  };
  const base = pools[categoryId] ?? pools["landing-pages"];
  return base.map((s, i) => ({
    ...s,
    title: i === 0 ? s.title : `${pick(["Advanced", "Premium", "Enterprise", "Custom"], h, i)} ${s.title}`,
    desc: s.desc.replace("your", brand.split(" ")[0] + "'s").replace("teams", "teams at " + brand),
  }));
}

function categoryIntro(categoryId: string, brand: string, headline: string, h: number): string {
  const intros: Record<string, string[]> = {
    portfolio: [
      `Selected projects spanning brand identity, product design, and campaign work. This ${headline.toLowerCase()} layout puts your case studies front and center with editorial typography and generous whitespace.`,
      `A portfolio built for designers who let the work speak. Large imagery, minimal chrome, and a structure that scales from four projects to forty.`,
    ],
    "saas-landing-pages": [
      `${brand} gives product teams a single workspace for roadmaps, docs, and customer feedback. Over 2,400 companies ship faster with our platform — from seed-stage startups to public SaaS leaders.`,
      `Stop juggling five tools to launch a feature. ${brand} unifies analytics, onboarding, and support in one dashboard your whole team will actually use.`,
    ],
    "ai-landing-pages": [
      `${brand} puts production-ready machine learning in every developer's toolkit. Train models, deploy APIs, and monitor drift — without hiring a dedicated ML team.`,
      `From prototype to production in days, not quarters. ${brand} handles infrastructure so you can focus on the product your users are waiting for.`,
    ],
    "agency-websites": [
      `We partner with ambitious brands on strategy, design, and development — under one roof since 2012. ${brand} has delivered 180+ launches across fintech, health, and consumer.`,
      `Creative work that moves metrics. Our team of ${12 + (h % 8)} specialists turns briefs into campaigns, sites, and systems clients are proud to share.`,
    ],
    "business-websites": [
      `${brand} advises mid-market companies on operations, growth, and digital transformation. Clear scopes, accountable teams, and outcomes you can measure in the first quarter.`,
      `Professional services without the boilerplate. We combine senior consultants with hands-on implementers so recommendations become results.`,
    ],
    "startup-pages": [
      `We're building the infrastructure layer fintech founders wish existed at seed stage. Join ${400 + (h % 600)} teams on the waitlist before our public launch.`,
      `${brand} is in private beta with founders from YC, Techstars, and indie hackers worldwide. Early access closes when we hit ${500 + (h % 200)} seats.`,
    ],
    "resume-websites": [
      `Senior full-stack engineer with 8+ years shipping web products at scale. Previously at Stripe and Notion. Based in Austin, open to remote senior roles and select contract work.`,
      `Product-minded developer specializing in React, Node, and design systems. I lead small teams, write clear docs, and care deeply about accessibility.`,
    ],
    "product-launch": [
      `Eighteen months in stealth. One product we couldn't stop thinking about. ${brand} launches ${pick(["this fall", "Q4", "next month", "soon"], h)} — get on the list for early pricing.`,
      `The waitlist is open. We're sharing progress weekly, demo videos monthly, and a launch-day discount for everyone who signed up early.`,
    ],
    "landing-pages": [
      `A focused landing page built to convert: clear value proposition, credible social proof, and a single call-to-action. Customize copy and colors, ship this week.`,
      `Everything you need for a campaign launch — hero, features, testimonials, and FAQ — in clean HTML you own outright.`,
    ],
  };
  const pool = intros[categoryId] ?? intros["landing-pages"];
  return pick(pool, h);
}

export function getRichDemoContent(template: TemplateDef): RichDemoContent {
  const h = hash(template.slug);
  const brand = brandFromSlug(template.slug, h);
  const words = slugWords(template.slug);
  const topic = words.length ? titleCase(words.slice(0, 2).join(" ")) : template.categoryTitle;
  const headline = template.title.replace(/—.*/, "").trim();
  const intro = categoryIntro(template.categoryId, brand, headline, h);

  const projects = [
    { name: `${pick(["Meridian", "Northwind", "Alpine", "Harbor", "Summit"], h)} Rebrand`, tag: "Branding", desc: "Complete visual identity for a Series B fintech — logo, guidelines, marketing site, and pitch deck.", year: "2024" },
    { name: `${pick(["Clearview", "Urban", "Beacon", "Riverstone"], h, 1)} Platform`, tag: "Product UI", desc: "Admin redesign that cut onboarding time by 40% and reduced support tickets in Q1.", year: "2023" },
    { name: `${pick(["Tailwind", "Contoso", "Fabrikam"], h, 2)} Commerce`, tag: "E-commerce", desc: "Headless storefront with custom checkout, subscriptions, and international shipping rules.", year: "2023" },
    { name: `${pick(["Horizon", "Adventure", "Alpine"], h, 3)} Mobile`, tag: "Mobile", desc: "Cross-platform app with offline mode — 120k downloads and 4.8★ average in six months.", year: "2022" },
  ];

  const team = Array.from({ length: 4 }, (_, i) => ({
    name: `${pick(TEAM_FIRST, h, i)} ${pick(TEAM_LAST, h, i + 2)}`,
    role: pick(ROLES, h, i),
    bio: pick([
      "15 years in brand and digital. Former Pentagram. Based in NYC.",
      "Full-stack engineer. React, Node, PostgreSQL. Open source contributor.",
      "Award-winning product designer. Previously at Airbnb and Figma.",
      "Growth marketer with $40M+ in managed ad spend across B2B SaaS.",
    ], h, i),
  }));

  const faq: DummyFaq[] = [
    { q: `Is ${brand} right for ${topic.toLowerCase()} projects?`, a: `Yes. This template is structured for ${template.categoryTitle.toLowerCase()} with sections you can enable or remove in minutes.` },
    { q: "What's included in the download?", a: "index.html, styles.css, and all referenced image URLs. Fully editable — no proprietary lock-in." },
    { q: "Can I use this for client work?", a: "Absolutely. MIT licensed for personal and commercial projects, including client deliverables." },
    { q: "How do I customize the palette?", a: "Edit CSS variables at the top of styles.css. Most themes use 4–6 variables for the entire site." },
    { q: "Do I need a backend?", a: "No. Static HTML/CSS works on Netlify, Vercel, cPanel, S3, or any standard web host." },
  ];

  const blogPosts: DummyBlogPost[] = [
    { title: `How we approach ${topic.toLowerCase()} design`, date: "Mar 12, 2024", excerpt: `Notes from three recent ${template.categoryTitle.toLowerCase()} launches — what worked, what we'd change, and the metrics we tracked.` },
    { title: "Building accessible forms that still convert", date: "Feb 3, 2024", excerpt: "WCAG patterns we use on every project: focus states, error copy, and keyboard flows that feel polished." },
    { title: `Typography choices for ${brand}`, date: "Jan 18, 2024", excerpt: "Why we paired serif headlines with sans body copy — and how to swap fonts without breaking the layout." },
  ];

  const pricingBase = template.categoryId.includes("saas") || template.categoryId.includes("ai")
    ? [
        { name: "Starter", price: "$0", period: "forever", features: ["1 workspace", "Basic analytics", "Community support", "5 API calls/min"] },
        { name: "Pro", price: `$${29 + (h % 40)}`, period: "per seat/month", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom integrations"], featured: true },
        { name: "Enterprise", price: "Custom", period: "annual contract", features: ["SSO & SAML", "Dedicated CSM", "SLA 99.99%", "On-prem option"] },
      ]
    : [
        { name: "Essential", price: `$${990 + (h % 5) * 500}`, period: "one-time", features: ["Single page", "Basic sections", "Email support", "Source files"] },
        { name: "Professional", price: `$${2400 + (h % 8) * 300}`, period: "one-time", features: ["Multi-section", "All components", "30-day support", "Commercial license"], featured: true },
        { name: "Retainer", price: `$${800 + (h % 4) * 200}`, period: "per month", features: ["Ongoing updates", "Priority revisions", "Analytics review", "Quarterly refresh"] },
      ];

  return {
    brand,
    tagline: pick([
      `${topic} — done properly.`,
      "Clarity. Craft. Conversion.",
      "Built for teams who ship.",
      "Where strategy meets execution.",
      `The ${template.categoryTitle.toLowerCase()} standard.`,
    ], h),
    headline,
    subheadline: template.shortDescription,
    intro,
    cta: template.categoryId.includes("resume") ? "Download résumé PDF" : pick(["Start free trial", "Book a consultation", "View our work", "Get early access", "Request a quote"], h),
    secondaryCta: pick(["See case studies", "Watch demo", "Read documentation", "Contact sales", "Browse work"], h, 1),
    aboutTitle: pick(["About us", "Our story", "Who we are", "The studio", "Background"], h, 2),
    aboutBody: intro + (h % 2 === 0 ? ` We work with clients who value craft over templates.` : ` Every engagement starts with listening — then we design and build.`),
    services: categoryServices(template.categoryId, h, brand).slice(0, 3 + (h % 2)),
    features: template.features.slice(0, 6).map((f, i) => ({
      title: f.split(" ").slice(0, 5).join(" "),
      body: f,
    })),
    projects,
    stats: [
      { value: `${120 + (h % 880)}+`, label: pick(["Projects delivered", "Happy clients", "Active users", "Countries served"], h) },
      { value: `${4 + (h % 12)} yrs`, label: "In business" },
      { value: `${92 + (h % 8)}%`, label: pick(["Client retention", "Satisfaction rate", "On-time delivery"], h, 3) },
      { value: `${(h % 50) + 10}k`, label: pick(["Monthly users", "Downloads", "Waitlist signups"], h, 4) },
    ],
    pricing: pricingBase,
    testimonials: [
      { quote: `We launched our ${topic.toLowerCase()} site in eleven days. The structure is professional — not a generic theme with our logo pasted on.`, author: `${pick(TEAM_FIRST, h, 5)} ${pick(TEAM_LAST, h, 6)}`, role: "Founder", company: pick(CLIENTS, h) },
      { quote: `Bounce rate dropped 38% after switching to this layout. Prospects mention the site on sales calls now.`, author: `${pick(TEAM_FIRST, h, 7)} ${pick(TEAM_LAST, h, 8)}`, role: "Marketing Director", company: pick(CLIENTS, h, 1) },
      { quote: "Clean markup, sensible class names, easy handoff to our dev team. Exactly what agency work should look like.", author: `${pick(TEAM_FIRST, h, 9)} ${pick(TEAM_LAST, h, 0)}`, role: "Creative Lead", company: pick(CLIENTS, h, 2) },
    ],
    team,
    timeline: [
      { year: "2024", title: pick(["Senior Product Designer", "Staff Engineer", "Head of Design"], h), org: pick(CLIENTS, h, 3), detail: "Led redesign of core product experience serving 2M+ monthly active users." },
      { year: "2021", title: "Product Designer", org: pick(CLIENTS, h, 4), detail: "Shipped mobile app from zero to 500k downloads; established component library." },
      { year: "2018", title: "UI Developer", org: pick(CLIENTS, h, 5), detail: "Built design system adopted across 12 product squads; cut UI debt by half." },
    ],
    skills: [...new Set([...template.stack, ...template.tags.slice(0, 5)])],
    faq,
    blogPosts,
    clients: CLIENTS.slice(h % 4, (h % 4) + 5).concat(CLIENTS.slice(0, Math.max(0, 5 - (5 - (h % 4))))).slice(0, 5),
    processSteps: [
      { step: "01", title: "Discovery", desc: "Goals, audience, and competitive landscape — documented before design starts." },
      { step: "02", title: "Design", desc: "Wireframes and high-fidelity mockups reviewed in weekly working sessions." },
      { step: "03", title: "Build", desc: "Semantic HTML, performant CSS, and cross-browser QA on real devices." },
      { step: "04", title: "Launch", desc: "Deployment, analytics, and thirty days of post-launch support included." },
    ],
    ctaBand: {
      title: pick([`Ready to launch your ${topic.toLowerCase()}?`, "Let's build something great.", "Start your project today.", `Join ${1200 + (h % 800)}+ teams already using ${brand}.`], h, 6),
      subtitle: pick(["No credit card required.", "Free consultation — no obligation.", "Response within one business day.", "Ship in under a week with this template."], h, 7),
    },
  };
}

/** Backward-compatible wrapper */
export function getDemoContent(template: TemplateDef) {
  const rich = getRichDemoContent(template);
  return {
    headline: rich.headline,
    subheadline: rich.subheadline,
    cta: rich.cta,
    secondaryCta: rich.secondaryCta,
    stats: rich.stats,
    features: rich.features.map((f, i) => ({ ...f, icon: ["◆", "◇", "○", "□", "△", "☆"][i % 6] })),
    projects: rich.projects,
    pricing: rich.pricing,
    testimonials: rich.testimonials,
    team: rich.team,
    faq: rich.faq,
    blogPosts: rich.blogPosts,
    clients: rich.clients,
    brand: rich.brand,
    tagline: rich.tagline,
    intro: rich.intro,
  };
}
