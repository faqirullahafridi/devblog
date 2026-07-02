/** Static SEO payloads for prerendered HTML (non-JS crawlers). */

export const SITE_ORIGIN = "https://www.techventry.com";

/** @typedef {{ path: string, title: string, description: string, h1: string, h2: string, paragraphs: string[] }} SeoPage */

/** @type {SeoPage[]} */
export const HUB_SEO_PAGES = [
  {
    path: "/",
    title: "TechVentry — Developer Knowledge Hub, Tools & Tutorials",
    description:
      "Articles, tutorials, free developer tools, templates, and learning paths on TechVentry — built for developers who care about code quality and shipping great software.",
    h1: "TechVentry developer knowledge hub",
    h2: "Articles, tools, templates, and learning paths for builders",
    paragraphs: [
      "TechVentry is a focused developer knowledge hub for tutorials, deep dives, and practical tools covering web development, Python, JavaScript, APIs, databases, and the craft of building reliable software.",
      "Browse in-depth articles and search the archive, use free browser-based utilities like JSON formatters and JWT decoders, copy vetted snippets, follow structured learning paths, and explore interview prep by topic.",
      "Every resource is designed to respect your time: clear structure, strong fundamentals, and production-minded examples you can apply on real projects today.",
      "Start with featured articles on the homepage, jump into the tools directory for everyday utilities, or open learning paths when you want a guided curriculum from basics to practice.",
    ],
  },
  {
    path: "/about",
    title: "About TechVentry — Developer Knowledge Hub & Mission",
    description:
      "Learn what TechVentry is, who it serves, and how our articles, tools, templates, and learning paths help working developers ship better software.",
    h1: "About TechVentry",
    h2: "A home for developers who care about craft",
    paragraphs: [
      "TechVentry is an independent developer knowledge hub created for builders who value clarity, fundamentals, and thoughtful engineering over hype.",
      "The site combines long-form tutorials, searchable articles, free in-browser tools, reference cheatsheets, copy-paste snippets, curated learning paths, and interview preparation materials.",
      "Our mission is to share practical knowledge you can use on real projects: patterns that scale, debugging workflows that save time, and explanations that make complex topics approachable.",
      "Whether you are learning a new stack, preparing for interviews, or looking up a quick command, TechVentry aims to be a dependable starting point in your daily workflow.",
    ],
  },
  {
    path: "/search",
    title: "Search TechVentry Articles — Tutorials & Developer Guides",
    description:
      "Search TechVentry for tutorials, guides, and technical articles on web development, Python, JavaScript, DevOps, APIs, and software engineering topics.",
    h1: "Search articles on TechVentry",
    h2: "Find tutorials, guides, and technical deep dives",
    paragraphs: [
      "Use TechVentry search to discover tutorials, opinion pieces, and technical guides across categories like frontend, backend, databases, security, and developer productivity.",
      "Results highlight recent and popular posts so you can quickly find answers to specific problems or explore a topic from first principles.",
      "Every article is written for working developers: concise intros, structured sections, and examples you can adapt in production codebases.",
      "Combine search with our references, snippets, and tools when you need a cheatsheet, copy-paste starter, or interactive utility alongside the long-form explanation.",
    ],
  },
  {
    path: "/tools",
    title: "Free Developer Tools Online — JSON, JWT, Regex & More",
    description:
      "Free browser-based developer tools on TechVentry: JSON formatter, JWT decoder, regex tester, hash generator, SQL formatter, and more — nothing leaves your device.",
    h1: "Free developer tools",
    h2: "Browser utilities for everyday engineering tasks",
    paragraphs: [
      "TechVentry tools run entirely in your browser. Format and validate JSON, decode JWT headers and payloads, test regular expressions, convert timestamps, generate UUIDs, hash text, preview Markdown, format SQL, compare diffs, and more.",
      "Each tool includes a practical guide explaining concepts, common mistakes, and when to reach for that utility in a real workflow.",
      "Because processing happens locally, sensitive tokens, payloads, and internal data never need to be sent to a server — ideal for quick debugging on client or API work.",
      "Open any tool from the directory, bookmark your favorites, and pair them with related articles surfaced on each tool page for deeper context.",
    ],
  },
  {
    path: "/templates",
    title: "Developer Templates & Starters — Browse on TechVentry",
    description:
      "Browse developer templates and starter layouts on TechVentry — landing pages, dashboards, portfolios, and UI patterns you can preview and adapt for projects.",
    h1: "Developer templates library",
    h2: "Preview starters, layouts, and UI patterns",
    paragraphs: [
      "The TechVentry templates hub collects curated starter layouts and UI patterns for developers who want a strong baseline before customizing.",
      "Filter by category, explore trending and new additions, and preview demos to see structure, typography, and component choices in context.",
      "Templates are meant as learning references and accelerators: study how navigation, hero sections, pricing tables, and dashboards are composed, then adapt the ideas to your stack.",
      "Pair template exploration with our articles and tools when you need guidance on accessibility, performance, or API integration for production deployments.",
    ],
  },
  {
    path: "/learn",
    title: "Developer Learning Paths — Structured Curricula on TechVentry",
    description:
      "Structured learning paths on TechVentry cover languages, frontend, databases, DevOps, APIs, testing, and security — from fundamentals to production-ready practice.",
    h1: "Structured learning paths",
    h2: "Curricula from zero to production practice",
    paragraphs: [
      "TechVentry learning paths are multi-chapter curricula organized by category: languages, frontend frameworks, databases, DevOps, APIs, testing, security, and more.",
      "Each path sequences lessons with explanations, exercises, and links to related tools, snippets, and references so you can practice immediately after reading.",
      "Paths are designed for self-paced study — start at chapter one, complete practice tasks, then advance when concepts feel solid rather than rushing through checklists.",
      "Use learning paths alongside interview prep and job listings when you are preparing for a role change or leveling up within your current team.",
    ],
  },
  {
    path: "/refs",
    title: "Developer Reference Cheatsheets — Git, HTTP, SQL & More",
    description:
      "Quick-reference cheatsheets on TechVentry for Git, HTTP status codes, Python, JavaScript, SQL, CSS, regex, terminal commands, VS Code shortcuts, and JWT auth.",
    h1: "Developer reference cheatsheets",
    h2: "Fast lookups for commands, syntax, and status codes",
    paragraphs: [
      "TechVentry references condense frequently needed facts into scannable cheatsheets you can open during development, code review, or incident response.",
      "Topics include Git workflows, HTTP semantics, language syntax highlights, SQL patterns, CSS helpers, regex examples, terminal commands, editor shortcuts, and JWT authentication notes.",
      "References complement longer tutorials: use them when you already understand the concept but need the exact flag, status code, or snippet name under time pressure.",
      "Bookmark the references index and jump to a specific guide from tool pages or learning paths when a lesson points you to deeper syntax details.",
    ],
  },
  {
    path: "/snippets",
    title: "Code Snippets Library — Copy-Paste Examples on TechVentry",
    description:
      "Copy-paste code snippets on TechVentry for fetch requests, React hooks, Express middleware, SQL queries, Bash scripts, TypeScript utilities, and everyday dev tasks.",
    h1: "Copy-paste code snippets",
    h2: "Battle-tested examples for common development tasks",
    paragraphs: [
      "The TechVentry snippets library collects small, focused code examples you can copy into projects when boilerplate would otherwise slow you down.",
      "Snippets span frontend and backend patterns: HTTP clients, debouncing, local storage hooks, Express middleware, JWT handling, SQL upserts, CSS layouts, Tailwind grids, and shell automation.",
      "Each snippet is paired with context about when to use it, pitfalls to avoid, and links to related references or tools for validation and debugging.",
      "Browse by topic when you are scaffolding a feature, reviewing a pull request, or teaching a teammate a pattern your team uses frequently.",
    ],
  },
  {
    path: "/interview",
    title: "Developer Interview Prep — Q&A by Topic on TechVentry",
    description:
      "Interview preparation on TechVentry with technical and behavioral questions for JavaScript, Python, SQL, React, TypeScript, Node.js, and system design basics.",
    h1: "Developer interview preparation",
    h2: "Technical and behavioral Q&A organized by topic",
    paragraphs: [
      "TechVentry interview prep groups questions by technology and theme so you can drill JavaScript, Python, SQL, React, TypeScript, Node.js, system design fundamentals, or behavioral scenarios.",
      "Answers emphasize how working engineers explain trade-offs, debug unfamiliar problems, and communicate design decisions — not memorized buzzwords.",
      "Use these pages for spaced repetition before onsite loops, pair them with learning paths when you need to rebuild fundamentals, and cross-link to references for syntax refreshers.",
      "Combine interview topics with challenges and playground exercises when you want to practice implementing ideas under mild time pressure.",
    ],
  },
  {
    path: "/ai",
    title: "AI Developer Assistant Studio — Chat, Debug & Explain Code",
    description:
      "TechVentry AI Studio helps you chat, debug, explain, generate, convert, optimize, and inspect SQL or API code — a focused assistant for daily development work.",
    h1: "AI developer assistant studio",
    h2: "Chat, debug, explain, generate, and optimize code",
    paragraphs: [
      "TechVentry AI Studio bundles focused modes for conversational help, stack trace debugging, code explanation, snippet generation, language conversion, performance suggestions, SQL help, and API design feedback.",
      "Each mode is tuned for developer workflows so prompts stay practical: reproduce an error, paste a function, or describe the outcome you need and iterate on the response.",
      "Use AI Studio alongside playground sandboxes when you want to validate generated code quickly, and cross-check suggestions against our references and articles for accuracy.",
      "The hub links to individual modes so you can bookmark the workflow you use most often during feature development or incident triage.",
    ],
  },
  {
    path: "/playground",
    title: "Code Playgrounds — HTML, CSS, JS, Python & SQL on TechVentry",
    description:
      "Interactive code playgrounds on TechVentry for HTML/CSS/JS, Python, and SQL — experiment, share snippets, and prototype ideas directly in the browser.",
    h1: "Interactive code playgrounds",
    h2: "Prototype HTML, Python, and SQL in the browser",
    paragraphs: [
      "TechVentry playgrounds let you experiment with front-end markup, Python scripts, and SQL queries without setting up a local project for every idea.",
      "Use the HTML/CSS/JS sandbox for layout prototypes, the Python runner for quick algorithm checks, and the SQL playground for query practice against sample schemas.",
      "Save and share snippets when you want feedback from teammates or want to link a reproducible example in documentation or community threads.",
      "Playgrounds pair naturally with AI explain modes, tutorial articles, and learning path exercises when you are studying a new language or validating homework-style problems.",
    ],
  },
  {
    path: "/roadmaps",
    title: "Developer Roadmaps — Role-Based Learning Guides on TechVentry",
    description:
      "Explore developer roadmaps on TechVentry including a generator that maps your current level to target roles with suggested skills, topics, and next steps.",
    h1: "Developer roadmaps and career guides",
    h2: "Plan skills from your current level to target roles",
    paragraphs: [
      "TechVentry roadmaps help you visualize skill progression for roles like frontend engineer, backend developer, full-stack builder, or platform-focused positions.",
      "The roadmap generator asks about your experience level and target role, then suggests ordered topics, practice ideas, and links to on-site learning paths and references.",
      "Roadmaps are guides rather than rigid checklists — adapt them to your stack, team needs, and timeline while tracking what you have already mastered.",
      "Revisit the hub when you change roles or when you want a structured refresh before performance reviews, job searches, or mentorship conversations.",
    ],
  },
  {
    path: "/challenges",
    title: "Coding Challenges & Leaderboard — Practice on TechVentry",
    description:
      "Practice coding challenges on TechVentry, track progress on the leaderboard, and sharpen problem-solving skills with tasks spanning difficulty levels and categories.",
    h1: "Coding challenges",
    h2: "Practice problems with difficulty levels and leaderboard",
    paragraphs: [
      "TechVentry challenges offer curated programming tasks that help you practice algorithms, language features, and pragmatic implementation skills outside production pressure.",
      "Browse by difficulty or category, work through problem statements, and compare progress on the community leaderboard when you want extra motivation.",
      "Challenges complement interview prep pages: use them for timed practice, then review explanations and references when a solution exposes a knowledge gap.",
      "Return regularly to build consistency — short daily attempts often outperform cramming before interviews or performance reviews.",
    ],
  },
  {
    path: "/jobs",
    title: "Developer Jobs Board — Open Roles Listed on TechVentry",
    description:
      "Browse developer job listings on TechVentry filtered by category and role type — discover open positions for engineers, with details on company, location, and requirements.",
    h1: "Developer jobs board",
    h2: "Open engineering roles with filters by category",
    paragraphs: [
      "The TechVentry jobs board aggregates open developer positions so you can scan opportunities by category, stack, and location without jumping between unrelated listing sites.",
      "Each posting includes company context, role summary, and requirements to help you decide quickly whether to invest time in a tailored application.",
      "Pair job browsing with interview prep paths and roadmaps when you are planning a transition — identify skill gaps early and study targeted topics before applying.",
      "Listings refresh on a schedule; check back often or combine with community discussions when you want peer insight about teams and interview processes.",
    ],
  },
  {
    path: "/api-sources",
    title: "Curated API Sources Directory — Integrations on TechVentry",
    description:
      "Discover curated API sources and integration options on TechVentry — compare providers, documentation quality, and use cases for your next project feature.",
    h1: "Curated API sources directory",
    h2: "Compare providers, docs, and integration use cases",
    paragraphs: [
      "TechVentry API Sources is a curated directory of public APIs and integration options grouped for developers evaluating providers for new features.",
      "Entries highlight documentation quality, common use cases, authentication models, and practical considerations before you commit to an vendor or open dataset.",
      "Use the directory during design phases, hackathons, or prototype sprints when you need reliable data or service endpoints without building everything in-house.",
      "Cross-link to our articles and AI API mode when you need help designing clients, handling errors, or writing tests around third-party integrations.",
    ],
  },
  {
    path: "/community",
    title: "Developer Community Q&A — Ask Questions on TechVentry",
    description:
      "Join the TechVentry developer community to ask questions, share answers, browse tags, and build reputation by helping others solve real engineering problems.",
    h1: "Developer community Q&A",
    h2: "Ask questions, share answers, and browse by tag",
    paragraphs: [
      "TechVentry community is a Q&A space where developers post concrete problems, share reproducible examples, and learn from answers tagged by technology or topic.",
      "Browse recent questions, filter by tag, inspect profiles, and contribute explanations when you have solved a similar bug or designed a comparable system.",
      "High-quality threads link to on-site tutorials, snippets, and tools so discussions stay actionable rather than turning into vague opinion debates.",
      "Participating regularly helps you articulate trade-offs, discover blind spots, and build reputation while helping others ship more reliable software.",
    ],
  },
  {
    path: "/resources",
    title: "Curated Developer Resources — Docs, Tools & Communities",
    description:
      "Hand-picked developer resources on TechVentry: official docs, open-source tools, communities, and references worth bookmarking for daily engineering work.",
    h1: "Curated developer resources",
    h2: "Docs, tools, and communities worth bookmarking",
    paragraphs: [
      "TechVentry resources collects external documentation, open-source projects, communities, and learning materials our editors find consistently useful in production work.",
      "Entries are grouped so you can quickly find trusted references for languages, frameworks, platforms, and career development without wading through SEO spam.",
      "Use this hub when onboarding to a new stack, building a team reading list, or replacing outdated bookmarks with maintained sources.",
      "Combine curated links with on-site learning paths and references when you want both external authority and TechVentry summaries in one study session.",
    ],
  },
  {
    path: "/contact",
    title: "Contact TechVentry — Questions, Feedback & Partnerships",
    description:
      "Contact the TechVentry team for questions, corrections, feedback, or partnership inquiries. We read every message and aim to respond thoughtfully.",
    h1: "Contact TechVentry",
    h2: "Questions, feedback, corrections, and partnerships",
    paragraphs: [
      "Reach out when you have questions about TechVentry content, spotted a technical error, want to suggest a topic, or are exploring a partnership or sponsorship conversation.",
      "Include links, screenshots, or reproduction steps when reporting issues in tools or tutorials — detailed reports help us fix problems faster for everyone.",
      "We welcome feedback on accessibility, clarity, and topics you want covered next, especially from working developers using the site in daily workflows.",
      "For privacy-related requests, you can also review our policy pages linked from the site footer before submitting sensitive information through the contact form.",
    ],
  },
];
