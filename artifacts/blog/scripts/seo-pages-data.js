/** Static SEO payloads for prerendered HTML (non-JS crawlers). */

export const SITE_ORIGIN = "https://www.techventry.com";

/** @typedef {{ path: string, title: string, description: string, h1: string, h2: string, paragraphs: string[] }} SeoPage */

/** @type {SeoPage[]} */
export const HUB_SEO_PAGES = [
  {
    path: "/",
    title: "TechVentry — Developer Hub, Tools & Tutorials",
    description:
      "Articles, free dev tools, templates, and learning paths on TechVentry. Tutorials and utilities for web, Python, and JavaScript developers.",
    h1: "TechVentry developer knowledge hub",
    h2: "Articles, tools, and learning paths for builders",
    paragraphs: [
      "TechVentry helps developers learn, build, and ship better software. We publish clear tutorials and guides on web development, Python, JavaScript, APIs, and databases.",
      "You can search the article archive, use free browser tools, copy snippets, and follow step-by-step learning paths.",
      "Our tools include JSON formatters, JWT decoders, regex testers, hash generators, SQL helpers, and more. Everything runs locally in your browser.",
      "Templates and references give you quick starting points. Interview prep pages group questions by topic so you can study with focus.",
      "The site is built for daily use. Pages load fast, links are easy to scan, and each section has a clear purpose.",
      "Start on the homepage for featured posts, open the tools hub for utilities, or pick a learning path when you want a guided plan.",
    ],
  },
  {
    path: "/about",
    title: "About TechVentry — Mission & Developer Hub",
    description:
      "Learn what TechVentry is, who it serves, and how our tutorials, tools, and learning paths help developers ship better code.",
    h1: "About TechVentry",
    h2: "Built for developers who care about craft",
    paragraphs: [
      "TechVentry is an independent site for developers who value clear writing and practical examples.",
      "We publish tutorials, maintain free tools, and organize references, snippets, and learning paths in one place.",
      "Our goal is simple: help you solve real problems on real projects without noise or hype.",
      "You will find articles on frontend and backend topics, plus guides on testing, security, and team workflows.",
      "Tools run in the browser so you can debug tokens, format JSON, and test regex safely.",
      "If you are new here, read this page first, then explore search, tools, or learn from the main menu.",
    ],
  },
  {
    path: "/search",
    title: "Search Articles — TechVentry Tutorials",
    description:
      "Search TechVentry for tutorials and guides on web dev, Python, JavaScript, DevOps, APIs, and software engineering topics.",
    h1: "Search TechVentry articles",
    h2: "Find tutorials and technical guides fast",
    paragraphs: [
      "Use this page to search the TechVentry article archive by keyword or phrase.",
      "Results include recent posts, popular guides, and deep dives across frontend, backend, and platform topics.",
      "Each article focuses on one problem, explains the idea in plain language, and shows code you can reuse.",
      "Search works well when you know the topic but not the exact post title.",
      "Pair search with tags and categories when you want to browse instead of query.",
      "Bookmark useful results and share links with your team during code reviews or onboarding.",
    ],
  },
  {
    path: "/tools",
    title: "Free Developer Tools — JSON, JWT & More",
    description:
      "Free browser tools on TechVentry: JSON formatter, JWT decoder, regex tester, hash generator, SQL formatter, and more.",
    h1: "Free developer tools",
    h2: "Browser utilities for daily dev work",
    paragraphs: [
      "TechVentry tools help with small jobs that come up every day in development.",
      "Format JSON, decode JWT tokens, test regex patterns, convert timestamps, and generate UUIDs in seconds.",
      "You can also preview Markdown, format SQL, compare text diffs, and build TypeScript types from JSON.",
      "All tools run in your browser. Your input stays on your device, which is safer for tokens and private data.",
      "Each tool page includes a short guide with tips, common mistakes, and links to related articles.",
      "Open the tool you need from the grid above, or browse the full list from the tools menu anytime.",
    ],
  },
  {
    path: "/templates",
    title: "Developer Templates — Browse on TechVentry",
    description:
      "Browse developer templates on TechVentry: landing pages, dashboards, portfolios, and UI layouts you can preview and adapt.",
    h1: "Developer templates library",
    h2: "Starter layouts and UI patterns to preview",
    paragraphs: [
      "The templates hub lists curated layouts you can study before starting a new project.",
      "Browse by category, see trending picks, and preview demos to compare structure and styling choices.",
      "Templates are learning aids. They show how teams arrange navigation, hero sections, pricing blocks, and dashboards.",
      "You can adapt ideas to React, Vue, plain HTML, or any stack you prefer.",
      "Use templates with our articles when you need notes on accessibility, performance, or responsive design.",
      "Return often to see new additions and compare patterns across different product types.",
    ],
  },
  {
    path: "/learn",
    title: "Learning Paths — TechVentry Developer Hub",
    description:
      "Structured learning paths on TechVentry for languages, frontend, databases, DevOps, APIs, testing, and security topics.",
    h1: "Structured learning paths",
    h2: "Step-by-step courses from basics to practice",
    paragraphs: [
      "Learning paths are ordered lesson lists that take you from core ideas to hands-on tasks.",
      "Paths cover languages, frontend stacks, databases, DevOps basics, API design, testing, and security.",
      "Each chapter links to tools, snippets, and references so you can practice right after reading.",
      "Move at your own pace. Finish exercises before you jump ahead to the next chapter.",
      "Paths work well with interview prep when you are studying for a new role.",
      "Pick a category below, open lesson one, and follow the sequence to the end of the path.",
    ],
  },
  {
    path: "/refs",
    title: "Dev Cheatsheets — Git, HTTP, SQL & More",
    description:
      "Quick cheatsheets on TechVentry for Git, HTTP codes, Python, JavaScript, SQL, CSS, regex, terminal, VS Code, and JWT auth.",
    h1: "Developer reference cheatsheets",
    h2: "Quick lookups for syntax and commands",
    paragraphs: [
      "References on TechVentry are short pages you can open during coding sessions.",
      "Look up Git commands, HTTP status codes, language syntax, SQL snippets, CSS helpers, and regex examples.",
      "You will also find terminal tips, editor shortcuts, and JWT auth notes in one index.",
      "Use references when you know the task but forgot the exact flag or function name.",
      "They pair well with longer tutorials when you need a fast reminder instead of a full lesson.",
      "Bookmark the index and jump to the sheet you use most during daily work.",
    ],
  },
  {
    path: "/snippets",
    title: "Code Snippets — Copy-Paste on TechVentry",
    description:
      "Copy-paste snippets on TechVentry for fetch calls, React hooks, Express middleware, SQL, Bash, TypeScript, and common dev tasks.",
    h1: "Copy-paste code snippets",
    h2: "Small examples for everyday coding tasks",
    paragraphs: [
      "The snippets library holds focused code blocks you can paste into your project and edit.",
      "Find examples for HTTP requests, debouncing, React hooks, Express middleware, SQL upserts, and shell scripts.",
      "Each snippet notes when to use it and what pitfalls to avoid.",
      "Snippets save time when you need working boilerplate without pulling in a large library.",
      "Browse by topic when you build features, review pull requests, or onboard new teammates.",
      "Combine snippets with references and tools to test and refine the code you copy.",
    ],
  },
  {
    path: "/interview",
    title: "Interview Prep — Q&A by Topic | TechVentry",
    description:
      "Interview prep on TechVentry with technical and behavioral questions for JavaScript, Python, SQL, React, TypeScript, and Node.js.",
    h1: "Developer interview preparation",
    h2: "Practice questions grouped by skill area",
    paragraphs: [
      "Interview prep pages collect questions you may hear in technical screens and onsite loops.",
      "Topics include JavaScript, Python, SQL, React, TypeScript, Node.js, system design basics, and behavioral prompts.",
      "Answers focus on clear reasoning, trade-offs, and how you debug real problems.",
      "Study one topic at a time instead of mixing too many areas in a single session.",
      "Use learning paths to rebuild weak areas before you mock-interview with a friend.",
      "Return to weak topics weekly so answers stay fresh before your interview date.",
    ],
  },
  {
    path: "/ai",
    title: "AI Studio — Chat, Debug & Explain Code",
    description:
      "TechVentry AI Studio for chat, debug help, code explainers, generators, converters, SQL tips, and API design feedback.",
    h1: "AI developer assistant studio",
    h2: "Focused AI modes for daily coding tasks",
    paragraphs: [
      "AI Studio groups tools for chat, debugging, explanation, generation, conversion, and optimization.",
      "Pick a mode that matches your task, paste code or an error, and iterate on the response.",
      "Modes stay short and practical so you can move fast during feature work or incident response.",
      "Validate AI output in the playground or with unit tests before you merge changes.",
      "Cross-check suggestions with our articles and references when accuracy matters most.",
      "Bookmark the modes you use often so you can open them from the AI hub in one click.",
    ],
  },
  {
    path: "/playground",
    title: "Code Playgrounds — HTML, Python & SQL",
    description:
      "Browser playgrounds on TechVentry for HTML, CSS, JavaScript, Python, and SQL. Test ideas, share snippets, and learn by doing.",
    h1: "Interactive code playgrounds",
    h2: "Run HTML, Python, and SQL experiments online",
    paragraphs: [
      "Playgrounds let you test code without creating a full local project first.",
      "Use the HTML sandbox for layout tests, the Python runner for quick scripts, and the SQL view for query practice.",
      "Save snippets when you want a link to share with teammates or post in community threads.",
      "Playgrounds pair well with tutorials when you follow along with examples from an article.",
      "They also help during interviews prep when you want to sketch an algorithm quickly.",
      "Open a playground from the cards below and start with the default template provided.",
    ],
  },
  {
    path: "/roadmaps",
    title: "Developer Roadmaps — Career Guides",
    description:
      "Developer roadmaps on TechVentry with a generator that maps your level to target roles, skills, topics, and next steps.",
    h1: "Developer roadmaps and career guides",
    h2: "Plan skills for your next role",
    paragraphs: [
      "Roadmaps show which skills to build for roles like frontend, backend, or full-stack engineering.",
      "The generator asks about your level and target job, then suggests topics and practice ideas.",
      "Use roadmaps as a guide, not a strict checklist. Adapt steps to your stack and team needs.",
      "Link out to learning paths and references when a topic needs deeper study.",
      "Review your roadmap before performance talks, job searches, or mentorship sessions.",
      "Update it when you change goals so your plan matches the work you want next.",
    ],
  },
  {
    path: "/challenges",
    title: "Coding Challenges — Practice on TechVentry",
    description:
      "Coding challenges on TechVentry with levels, categories, and a leaderboard. Practice problem solving outside production pressure.",
    h1: "Coding challenges",
    h2: "Level-based practice with a leaderboard",
    paragraphs: [
      "Challenges give you short programming tasks to sharpen skills between project deadlines.",
      "Browse by difficulty or topic, read the prompt, and submit your approach when you are ready.",
      "The leaderboard adds light motivation if you enjoy comparing progress with other learners.",
      "Use challenges with interview prep when you want timed practice on core patterns.",
      "Review references when a task exposes a gap in syntax or standard library knowledge.",
      "Short daily sessions often beat long cram sessions before interviews or reviews.",
    ],
  },
  {
    path: "/jobs",
    title: "Developer Jobs Board — TechVentry",
    description:
      "Browse developer jobs on TechVentry by category and role. See company, location, and requirements in one place.",
    h1: "Developer jobs board",
    h2: "Open roles filtered by category",
    paragraphs: [
      "The jobs board lists open developer roles so you can scan options without tab overload.",
      "Filter by category or stack to find posts that match your skills and location preferences.",
      "Each listing includes a short summary, company name, and key requirements.",
      "Read the full post before you apply so you can tailor your resume and cover note.",
      "Pair job browsing with interview prep and roadmaps when you plan a career move.",
      "Check back on a schedule because new roles are added regularly.",
    ],
  },
  {
    path: "/api-sources",
    title: "API Sources Directory — TechVentry",
    description:
      "Curated API sources on TechVentry. Compare providers, docs quality, auth models, and use cases for your next integration.",
    h1: "Curated API sources directory",
    h2: "Find APIs and compare integration options",
    paragraphs: [
      "API Sources lists public APIs and data providers you can evaluate for new features.",
      "Entries note docs quality, auth style, rate limits, and common use cases.",
      "Use the directory during design reviews, hackathons, or prototype sprints.",
      "Compare two providers side by side before you lock in a vendor or dataset.",
      "Link to our articles and AI API mode when you need client code or error handling tips.",
      "Bookmark providers you test often so your team shares the same reference links.",
    ],
  },
  {
    path: "/community",
    title: "Developer Community Q&A — TechVentry",
    description:
      "Ask questions, share answers, and browse tags on the TechVentry developer community. Learn from real engineering threads.",
    h1: "Developer community Q and A",
    h2: "Get help and share answers by tag",
    paragraphs: [
      "Community pages host questions and answers from developers working on real codebases.",
      "Post clear titles, minimal repro steps, and tags so others can find and help with your thread.",
      "Browse by tag when you want to learn from solved problems in your stack.",
      "Good answers link to tutorials, snippets, or tools on TechVentry when they add context.",
      "Helping others also sharpens how you explain trade-offs and debug steps.",
      "Follow tags you care about and check back for new posts during your weekly learning time.",
    ],
  },
  {
    path: "/resources",
    title: "Curated Dev Resources — TechVentry",
    description:
      "Hand-picked docs, tools, and communities on TechVentry. Trusted links for daily engineering work and team onboarding.",
    h1: "Curated developer resources",
    h2: "Trusted docs, tools, and communities",
    paragraphs: [
      "Resources collects external links our team finds useful in day-to-day engineering work.",
      "Find official docs, open source projects, communities, and learning sites in grouped lists.",
      "Use this hub when you onboard to a new stack or refresh a team reading list.",
      "We skip spam-heavy lists and focus on sources that stay maintained over time.",
      "Pair external links with on-site learning paths when you want both depth and speed.",
      "Suggest missing gems through contact if you find a source the list should include.",
    ],
  },
  {
    path: "/contact",
    title: "Contact TechVentry — Feedback & Help",
    description:
      "Contact TechVentry for questions, corrections, feedback, or partnerships. We read messages and reply when we can.",
    h1: "Contact TechVentry",
    h2: "Send questions, fixes, or partnership notes",
    paragraphs: [
      "Use this page to reach the TechVentry team with questions, bug reports, or topic ideas.",
      "Include links, steps to reproduce, and screenshots when you report a tool or article issue.",
      "We welcome fixes to typos, unclear sections, and accessibility problems in our content.",
      "Partnership and sponsorship notes are fine here too. Add context about your proposal.",
      "For privacy requests, read the privacy policy linked in the site footer before you write.",
      "We try to respond in a reasonable time, but volume can vary during busy release weeks.",
    ],
  },
];
