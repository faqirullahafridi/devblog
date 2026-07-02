export type ResourceItem = {
  name: string;
  url: string;
  description: string;
  detail?: string;
};

export type ResourceCategory = {
  id: string;
  title: string;
  description: string;
  guide?: string;
  items: ResourceItem[];
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "techventry",
    title: "On this site",
    description: "Guides, tools, and reference material built into TechVentry.",
    guide: `This site is more than a blog — it bundles structured learning paths, browser-based utilities, copy-paste snippets, and quick-reference sheets alongside interview prep and IDE guides. Use these hubs when you want **curated, opinionated material** that stays close to how you actually work, without hunting through scattered bookmarks.

**Learning Paths** walk topic-by-topic from fundamentals to capstone projects. **Tools** run entirely in your browser — format JSON, decode JWTs, test regex, and more — so you never leave the tab. **Snippets** are short, tested code blocks you can drop into a project. **References** condense syntax and APIs into scannable pages. **Interview Prep** groups common questions by topic with concise answers. **IDEs & Editors** compare setup, shortcuts, and extensions for the editors you use daily.

Start with the hub that matches your immediate goal: learning something new, solving a one-off task, or refreshing memory before an interview. Each section links back to related blog posts where deeper dives exist. Bookmark the hubs you return to often — they are maintained alongside the blog and updated as the ecosystem changes.`,
    items: [
      {
        name: "Learning Paths",
        url: "/learn",
        description: "Structured courses from JavaScript fundamentals to DevOps and databases.",
        detail:
          "Use Learning Paths when you want a guided curriculum with chapters, exercises, and capstone projects rather than random tutorials. Each path estimates time to complete and builds concepts in order, so you can follow one track start to finish or jump to a chapter you need to refresh.",
      },
      {
        name: "Developer Tools",
        url: "/tools",
        description: "In-browser utilities — JSON formatter, JWT decoder, regex tester, and more.",
        detail:
          "Open Tools when you need a quick utility without installing software or signing up for another service. Everything runs locally in your browser, which makes it ideal for pasting sensitive payloads during debugging or formatting data mid-code-review.",
      },
      {
        name: "Snippets",
        url: "/snippets",
        description: "Copy-paste code for common patterns — fetch wrappers, hooks, SQL, and CLI tasks.",
        detail:
          "Reach for Snippets when you know what you want to build but do not want to re-type boilerplate from memory. Each snippet includes context on when it applies and links to related articles if you need the full explanation behind the pattern.",
      },
      {
        name: "References",
        url: "/refs",
        description: "Quick-reference sheets for languages, frameworks, and command-line tools.",
        detail:
          "Use References as a cheat sheet while coding — syntax lookups, flag lists, and API reminders without scrolling through full documentation. They are designed for scanning, not deep learning, so pair them with Learning Paths or official docs when you hit an unfamiliar concept.",
      },
      {
        name: "Interview Prep",
        url: "/interview",
        description: "Common technical interview questions grouped by topic with concise answers.",
        detail:
          "Visit Interview Prep when you are preparing for phone screens or onsite loops and want organized question banks with short, practical answers. Review by topic — algorithms, system design, language specifics — rather than grinding random lists without structure.",
      },
      {
        name: "IDEs & Editors",
        url: "/ides",
        description: "Setup guides, shortcuts, and extension picks for VS Code, Neovim, JetBrains, and more.",
        detail:
          "Check IDEs & Editors when you are setting up a new machine, switching editors, or optimizing your daily workflow. Each guide covers installation, essential extensions, keybindings, and tips specific to that editor so you spend less time configuring and more time shipping.",
      },
      {
        name: "API Sources",
        url: "/api-sources",
        description: "Curated directory of free public APIs — limits, docs, and integration notes.",
        detail:
          "Browse AI, jobs, email, databases, news, media, and auth APIs with plain-language explanations of how each works, typical environment variable names, and free tier limits.",
      },
    ],
  },
  {
    id: "docs",
    title: "Official Documentation",
    description: "Authoritative references for languages and frameworks.",
    guide: `Official documentation is the **source of truth** for any language, framework, or platform. When behavior is ambiguous, a tutorial disagrees with your runtime, or you need the exact signature of an API, the docs are where you go — not a Stack Overflow answer from three years ago.

Good docs reward a specific reading style. Start with the **getting-started** or **guides** section when you are new to a technology; switch to the **API reference** when you know what you are looking for and need parameters, return types, or edge-case behavior. Many projects also publish **migration guides** and **release notes** that explain breaking changes — read these before upgrading major versions.

Bookmark the docs for the stack you touch daily. MDN for web platform APIs, your framework's site for component and routing patterns, and your database docs for query syntax and indexing. Pair official docs with the References and Snippets on this site for faster day-to-day lookups, but trust the official source when correctness matters — especially for security, performance, and compatibility guarantees.`,
    items: [
      {
        name: "MDN Web Docs",
        url: "https://developer.mozilla.org",
        description: "HTML, CSS, JavaScript — the web standard reference.",
        detail:
          "Use MDN whenever you need authoritative answers about browser APIs, DOM methods, CSS properties, or JavaScript language features. It is the best first stop for cross-browser behavior, accessibility attributes, and modern web platform APIs like Fetch, Web Crypto, and Service Workers.",
      },
      {
        name: "React Docs",
        url: "https://react.dev",
        description: "Modern React with hooks and server components.",
        detail:
          "Consult the React docs when learning hooks, understanding server components, or debugging rendering and state-update behavior. The new react.dev site includes interactive examples and clear guidance on patterns that replaced class components and legacy lifecycle methods.",
      },
      {
        name: "Node.js Docs",
        url: "https://nodejs.org/docs",
        description: "Runtime APIs, streams, and modules.",
        detail:
          "Open Node.js docs when working with built-in modules like fs, http, stream, or worker_threads and you need exact API contracts. They are also essential for understanding the event loop, module resolution (CommonJS vs ESM), and version-specific features tied to your project's Node engine.",
      },
      {
        name: "Python Docs",
        url: "https://docs.python.org/3/",
        description: "Language reference and standard library.",
        detail:
          "Reach for Python docs when you need the standard library reference, language grammar, or details on typing, asyncio, and packaging. The library index is particularly useful for discovering built-in modules before reaching for a third-party package.",
      },
      {
        name: "PostgreSQL Docs",
        url: "https://www.postgresql.org/docs/",
        description: "SQL, indexing, and administration.",
        detail:
          "Use PostgreSQL docs when writing advanced SQL, designing indexes, configuring replication, or tuning performance. They explain planner behavior, data types, and extension APIs in depth — far beyond what general SQL tutorials cover.",
      },
      {
        name: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/",
        description: "Types, generics, and tooling.",
        detail:
          "Consult the TypeScript handbook when defining complex generics, configuring tsconfig, or understanding type narrowing and utility types. It is the definitive guide for making the compiler work for you instead of fighting error messages.",
      },
      {
        name: "Next.js Docs",
        url: "https://nextjs.org/docs",
        description: "App Router, server actions, and deployment.",
        detail:
          "Open Next.js docs when building full-stack React apps with file-based routing, server components, or edge deployment. They cover caching semantics, data fetching patterns, and framework-specific APIs that generic React docs do not address.",
      },
      {
        name: "Django Documentation",
        url: "https://docs.djangoproject.com/",
        description: "Models, views, admin, and ORM for Python web apps.",
        detail:
          "Use Django docs when structuring models, writing queries with the ORM, configuring middleware, or extending the admin. The topic guides walk through entire features (auth, forms, testing) in the order Django expects you to implement them.",
      },
      {
        name: "Rust Book",
        url: "https://doc.rust-lang.org/book/",
        description: "Ownership, borrowing, and idiomatic Rust.",
        detail:
          "Read the Rust Book when learning ownership, lifetimes, and error handling — concepts that do not map cleanly from other languages. It is the recommended path from zero to writing safe, concurrent systems code without a garbage collector.",
      },
      {
        name: "Go Documentation",
        url: "https://go.dev/doc/",
        description: "Language spec, standard library, and effective Go.",
        detail:
          "Consult Go docs when you need the language spec, package reference, or idiomatic patterns for concurrency with goroutines and channels. The Effective Go essay is especially valuable after you have basics down and want to write code that looks native to the ecosystem.",
      },
    ],
  },
  {
    id: "learning",
    title: "Learning Platforms",
    description: "Structured courses and interactive practice.",
    guide: `Learning platforms fill the gap between reading docs and **building real skill**. They provide sequencing — what to learn next — exercises with feedback, and often community support. The right platform depends on your learning style: video courses, reading with challenges, mentor review, or interview-style drills.

**Project-based paths** (like The Odin Project) suit developers who learn by shipping. **Exercise platforms** (Exercism, LeetCode) suit those who want repetition and measurable progress. **Broad curricula** (freeCodeCamp) work well when you are exploring or need a free, self-paced full-stack foundation. Mix platforms rather than committing to one: a course for structure, exercises for retention, and your own side projects for integration.

Set a weekly time budget and finish modules before jumping to the next shiny course. Pair external platforms with the Learning Paths on this site for topic-specific depth, and return to official docs once exercises introduce APIs you have not used before — that combination builds both breadth and accuracy.`,
    items: [
      {
        name: "freeCodeCamp",
        url: "https://www.freecodecamp.org",
        description: "Free full-stack curriculum and certifications.",
        detail:
          "Choose freeCodeCamp when you want a free, self-paced path from HTML/CSS through JavaScript, Python, and data structures with certifications to show progress. The projects at the end of each certification force you to apply concepts rather than only watch videos.",
      },
      {
        name: "The Odin Project",
        url: "https://www.theodinproject.com",
        description: "Project-based web dev path.",
        detail:
          "Use The Odin Project when you prefer learning by building real projects with curated resources instead of a single instructor's video course. It emphasizes reading docs, using Git, and deploying apps — habits that transfer directly to professional work.",
      },
      {
        name: "Exercism",
        url: "https://exercism.org",
        description: "Code exercises with mentor feedback.",
        detail:
          "Reach for Exercism when you want language-specific exercises with optional mentor feedback on your solutions. It is ideal for practicing idiomatic code in a new language after you have basics down from a course or the language docs.",
      },
      {
        name: "LeetCode",
        url: "https://leetcode.com",
        description: "Algorithm practice for interviews.",
        detail:
          "Use LeetCode when preparing for technical interviews that include algorithm and data-structure questions. Focus on understanding patterns (two pointers, BFS, dynamic programming) rather than memorizing solutions — quality of explanation matters more than problem count.",
      },
      {
        name: "Frontend Masters",
        url: "https://frontendmasters.com",
        description: "Deep-dive courses from industry practitioners.",
        detail:
          "Subscribe to Frontend Masters when you want expert-led deep dives into JavaScript, React, Node, CSS architecture, and performance from practitioners who build at scale. Best for intermediate developers ready to go beyond beginner tutorials.",
      },
      {
        name: "Scrimba",
        url: "https://scrimba.com",
        description: "Interactive screencasts you can pause and edit.",
        detail:
          "Try Scrimba when you learn best by coding along inside the lesson itself rather than switching between a video and your editor. Their interactive player lets you edit the instructor's code in place, which lowers friction for beginners.",
      },
      {
        name: "Khan Academy Computing",
        url: "https://www.khanacademy.org/computing",
        description: "Free intro courses in programming and algorithms.",
        detail:
          "Use Khan Academy when you are completely new to programming or need a gentle refresher on algorithms and computer science fundamentals. The pacing is slower and more visual than bootcamp-style platforms, which helps if math or logic concepts feel intimidating.",
      },
      {
        name: "Coursera",
        url: "https://www.coursera.org",
        description: "University-backed courses on CS, ML, and specializations.",
        detail:
          "Choose Coursera when you want structured courses from universities or companies with deadlines and certificates — especially for computer science theory, machine learning, or cloud certifications. Audit mode is free on many courses if you do not need the credential.",
      },
    ],
  },
  {
    id: "tools",
    title: "Developer Tools",
    description: "Utilities that speed up daily work.",
    guide: `Developer tools are the **infrastructure around your code** — version control, hosting, databases, API clients, and local environments. The right toolchain removes friction so you spend time on product logic instead of deployment scripts and manual testing.

Start with **Git + a hosting provider** (GitHub or similar) for every project, even solo work — history, branches, and CI are not optional at scale. Pick **one deployment platform** you understand well (Vercel, Railway, etc.) before spreading across many. For backends, managed Postgres (Supabase, Neon, RDS) beats self-hosting until you have a clear reason to operate your own database.

Use API clients like Postman or Bruno during integration work and keep collections in your repo or team workspace. Container tools (Docker) matter when you need reproducible environments across machines or teammates. Revisit your toolchain yearly: migrate if a tool saves hours per week, but avoid churn for marginal gains — stability helps more than chasing every new platform.`,
    items: [
      {
        name: "GitHub",
        url: "https://github.com",
        description: "Code hosting, PRs, and Actions CI.",
        detail:
          "Use GitHub as the default home for repositories, pull requests, code review, and CI with Actions. Even solo projects benefit from issue tracking, README hosting, and a clear history that collaborators or employers can inspect.",
      },
      {
        name: "Supabase",
        url: "https://supabase.com",
        description: "Postgres, auth, storage, and realtime.",
        detail:
          "Choose Supabase when you want a managed Postgres with built-in auth, row-level security, storage, and realtime subscriptions without assembling each piece yourself. It fits MVPs and production apps that center on a SQL database.",
      },
      {
        name: "Vercel",
        url: "https://vercel.com",
        description: "Frontend deployment and serverless.",
        detail:
          "Deploy to Vercel when shipping Next.js, static sites, or serverless API routes with preview deployments on every PR. The tight integration with frontend frameworks cuts deployment config to near zero for many teams.",
      },
      {
        name: "Railway",
        url: "https://railway.app",
        description: "Simple backend and database hosting.",
        detail:
          "Use Railway when you need to host a backend service, worker, or database with minimal DevOps overhead. It is a good fit for side projects and small APIs where Kubernetes or manual VPS setup would be overkill.",
      },
      {
        name: "Postman",
        url: "https://www.postman.com",
        description: "API testing and collections.",
        detail:
          "Open Postman when exploring, debugging, or documenting HTTP APIs — especially during integration with third-party services. Saved collections and environments make it easy to re-run the same requests across dev, staging, and production.",
      },
      {
        name: "Docker",
        url: "https://www.docker.com",
        description: "Containers for reproducible dev and deploy environments.",
        detail:
          "Adopt Docker when you need identical environments across laptops and servers, or when a project's dependencies are painful to install natively. Compose files also document how services connect, which helps onboarding new teammates.",
      },
      {
        name: "Neon",
        url: "https://neon.tech",
        description: "Serverless Postgres with branching.",
        detail:
          "Try Neon when you want serverless Postgres with database branching for preview environments and scale-to-zero on idle projects. Branching pairs well with per-PR preview apps so each feature gets an isolated database copy.",
      },
      {
        name: "Bruno",
        url: "https://www.usebruno.com",
        description: "Git-friendly open-source API client.",
        detail:
          "Use Bruno when you want API collections stored as plain files in your repository instead of a proprietary cloud sync. Teams that treat API requests as code alongside the backend often prefer Bruno over cloud-only clients.",
      },
      {
        name: "Fly.io",
        url: "https://fly.io",
        description: "Run full-stack apps close to users globally.",
        detail:
          "Deploy on Fly.io when you need VMs or containers running in multiple regions with low latency for global users. It suits WebSocket servers, Elixir/Phoenix apps, and backends that outgrow pure serverless limits.",
      },
    ],
  },
  {
    id: "design",
    title: "Design & UI",
    description: "Icons, fonts, and inspiration.",
    guide: `Design resources help you ship interfaces that look **intentional** without hiring a designer for every screen. Modern development often expects developers to handle spacing, typography, color, and component consistency — these tools make that feasible.

Start with a **component library or utility CSS** approach (Tailwind + shadcn/ui is a common stack) so you are not reinventing buttons and forms. Pick **one icon set** and stick with it for visual consistency. Use Google Fonts or system font stacks for typography unless brand guidelines specify otherwise.

For layout and polish, reference real products and design systems (Material, Apple HIG, or your company's design tokens) rather than improvising from scratch. Tools like Figma help when collaborating with designers or planning screens before you code. Accessibility is part of design — check contrast, focus states, and touch targets, not just aesthetics.`,
    items: [
      {
        name: "Lucide Icons",
        url: "https://lucide.dev",
        description: "Clean open-source icon set.",
        detail:
          "Use Lucide when you need consistent, MIT-licensed SVG icons with React, Vue, and Svelte packages. The set is large enough for most admin dashboards and marketing pages without mixing styles from multiple icon families.",
      },
      {
        name: "Google Fonts",
        url: "https://fonts.google.com",
        description: "Free web fonts.",
        detail:
          "Browse Google Fonts when choosing typography for a web project and you need free, easy-to-embed families with variable font options. Pair a distinct heading font with a readable body font, and limit yourself to two families to keep pages fast.",
      },
      {
        name: "Tailwind CSS",
        url: "https://tailwindcss.com",
        description: "Utility-first CSS framework.",
        detail:
          "Reach for Tailwind when you want rapid UI development with consistent spacing, colors, and responsive breakpoints without writing custom CSS files for every component. It pairs well with component libraries and design tokens in larger codebases.",
      },
      {
        name: "shadcn/ui",
        url: "https://ui.shadcn.com",
        description: "Copy-paste React components.",
        detail:
          "Use shadcn/ui when building React apps with Tailwind and you want accessible, customizable components you own in your repo — not an opaque npm package. Copy only the components you need and adapt styles to match your brand.",
      },
      {
        name: "Heroicons",
        url: "https://heroicons.com",
        description: "SVG icons from the makers of Tailwind CSS.",
        detail:
          "Choose Heroicons when you are already on Tailwind and want icons designed to match its visual weight and stroke style. Available in outline and solid variants with copy-paste SVG or React components.",
      },
      {
        name: "Figma",
        url: "https://www.figma.com",
        description: "Collaborative interface design and prototyping.",
        detail:
          "Open Figma when collaborating with designers, creating wireframes before coding, or maintaining a shared component library. Developers can inspect spacing, export assets, and copy CSS from designs without guessing measurements.",
      },
      {
        name: "Coolors",
        url: "https://coolors.co",
        description: "Palette generator and color scheme explorer.",
        detail:
          "Use Coolors when you need a cohesive color palette quickly — lock colors you like and generate harmonies for backgrounds, accents, and text. Export palettes to CSS variables or Tailwind config to keep design and code aligned.",
      },
      {
        name: "Can I Use",
        url: "https://caniuse.com",
        description: "Browser support tables for web platform features.",
        detail:
          "Check Can I Use before adopting a new CSS property, JavaScript API, or HTML element in production. It shows global usage percentages and known bugs so you can decide whether a polyfill or fallback is worth the effort.",
      },
    ],
  },
  {
    id: "news",
    title: "News & Communities",
    description: "Stay current and get help.",
    guide: `Tech moves fast; **news and communities** help you filter signal from noise and unblock problems when docs fall short. The goal is not to read everything — it is to maintain a small set of sources you check regularly and places where you can ask good questions.

**Aggregators** (Hacker News, Lobsters) surface trends and launch posts; use them for awareness, not as your only learning path. **Q&A sites** (Stack Overflow) excel when you have a specific error message or API question — search before you post, and write minimal reproducible examples when you do. **Communities** (Dev.to, Reddit, Discord servers) are better for career advice, tooling opinions, and early feedback on projects.

Budget time intentionally: 15–30 minutes a few times a week beats endless scrolling. When you find a useful discussion, save the link or distill notes into your own docs — community threads disappear behind paywalls and dead links. Combine community answers with official sources before copying security-sensitive or performance-critical code.`,
    items: [
      {
        name: "Hacker News",
        url: "https://news.ycombinator.com",
        description: "Tech news and discussions.",
        detail:
          "Browse Hacker News for startup launches, engineering blog posts, and high-signal discussions on programming and industry trends. The comments often contain practitioner perspectives you will not find in the article itself — read them when a topic matters to your work.",
      },
      {
        name: "Dev.to",
        url: "https://dev.to",
        description: "Developer blogging community.",
        detail:
          "Use Dev.to when you want approachable tutorials, career posts, and project write-ups from a broad developer audience. It is a good place to publish your own learning notes and get feedback without maintaining a full personal blog.",
      },
      {
        name: "Stack Overflow",
        url: "https://stackoverflow.com",
        description: "Q&A for programming problems.",
        detail:
          "Search Stack Overflow first when you hit a specific error, library quirk, or configuration issue. Accepted answers are not always current — check dates and comments — but the archive covers an enormous range of real-world problems already solved.",
      },
      {
        name: "Reddit r/programming",
        url: "https://www.reddit.com/r/programming/",
        description: "Programming news and links.",
        detail:
          "Follow r/programming for links to articles, papers, and releases across languages and paradigms. Treat it as a headline feed rather than deep discussion — click through to primary sources when something is relevant to your stack.",
      },
      {
        name: "Lobsters",
        url: "https://lobste.rs",
        description: "Invite-style tech link aggregator with thoughtful comments.",
        detail:
          "Read Lobsters when you want a smaller, often more technical comment section than larger aggregators. Topics lean toward systems programming, security, and engineering practice — useful if you prefer depth over volume.",
      },
      {
        name: "CSS-Tricks",
        url: "https://css-tricks.com",
        description: "Articles and almanac for HTML, CSS, and front-end craft.",
        detail:
          "Visit CSS-Tricks when working on layout, animation, or front-end techniques that need visual explanation. The almanac is a handy reference for CSS properties, and articles often cover real-world browser quirks.",
      },
      {
        name: "daily.dev",
        url: "https://app.daily.dev",
        description: "Personalized developer news feed and browser extension.",
        detail:
          "Install daily.dev when you want a curated stream of dev articles in a new-tab or mobile feed without manually checking dozens of blogs. Customize topics to match your stack so morning reading stays relevant instead of generic.",
      },
      {
        name: "Discord (The Programmer's Hangout)",
        url: "https://discord.com/invite/programming",
        description: "Real-time chat for help, pairing, and career talk.",
        detail:
          "Join a programming Discord when you want real-time help, accountability, or casual conversation with other developers. Use dedicated channels for your language or framework, and respect each server's rules about homework help and self-promotion.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Best Practices",
    description: "OWASP, auth, and secure coding.",
    guide: `Security is not a feature you bolt on at launch — it is a set of **habits** around auth, input handling, secrets, dependencies, and deployment configuration. These resources help you learn common failure modes and verify that your apps resist them.

Start with the **OWASP Top 10** to understand the most exploited web vulnerabilities (injection, broken auth, XSS, misconfiguration). Use **JWT.io** and your framework's auth docs together — tokens are easy to misuse. Run **dependency scanners** and subscribe to advisories for packages you ship. Check **Have I Been Pwned** for breached credentials in auth flows and encourage users to use unique passwords plus MFA.

Automate what you can: security headers (Mozilla Observatory), TLS (Let's Encrypt), and CI checks for known vulnerabilities. Assume secrets in client-side code are public, validate all input on the server, and log security events without storing sensitive data in logs. Revisit threat models when you add payments, PII, or admin tools — attack surface grows with every new endpoint.`,
    items: [
      {
        name: "OWASP Top 10",
        url: "https://owasp.org/www-project-top-ten/",
        description: "Most critical web security risks.",
        detail:
          "Read the OWASP Top 10 when designing or auditing a web application so you understand the most common and impactful vulnerabilities teams still ship. Use it as a checklist during code review and before penetration tests or compliance reviews.",
      },
      {
        name: "JWT.io",
        url: "https://jwt.io",
        description: "JWT debugger and introduction.",
        detail:
          "Use JWT.io to decode and inspect JSON Web Tokens during auth debugging — verify claims, expiration, and signing algorithm without writing throwaway scripts. Remember that JWTs are encoded, not encrypted; never put secrets in the payload.",
      },
      {
        name: "Have I Been Pwned",
        url: "https://haveibeenpwned.com",
        description: "Check email breaches.",
        detail:
          "Integrate or consult HIBP when building registration, login, or password-reset flows to reject or warn on passwords known from public breaches. It improves user security without storing plaintext passwords yourself.",
      },
      {
        name: "Mozilla Observatory",
        url: "https://observatory.mozilla.org",
        description: "HTTP security header scanner.",
        detail:
          "Run Mozilla Observatory against your staging or production URL to score security headers like CSP, HSTS, and X-Frame-Options. Fix high-priority findings before launch and re-scan after infrastructure changes.",
      },
      {
        name: "Snyk",
        url: "https://snyk.io",
        description: "Dependency vulnerability scanning.",
        detail:
          "Use Snyk in CI or locally when you need continuous scanning of npm, pip, Maven, and container images for known CVEs. It helps prioritize upgrades and documents risk for security-conscious teams and compliance audits.",
      },
      {
        name: "Let's Encrypt",
        url: "https://letsencrypt.org",
        description: "Free automated TLS certificates.",
        detail:
          "Deploy Let's Encrypt when your site or API needs HTTPS in production without paying for commercial certificates. Most modern hosting platforms integrate ACME automatically; use it anywhere you terminate TLS yourself.",
      },
      {
        name: "CVE Program",
        url: "https://www.cve.org",
        description: "Public catalog of known security vulnerabilities.",
        detail:
          "Search CVE when a security advisory mentions an identifier or you need authoritative details on a disclosed vulnerability affecting your dependencies. Cross-reference with your package manager and vendor advisories for remediation steps.",
      },
      {
        name: "OWASP Cheat Sheet Series",
        url: "https://cheatsheetseries.owasp.org",
        description: "Actionable secure-coding guides by topic.",
        detail:
          "Open the OWASP Cheat Sheet Series when implementing a specific feature — password storage, session management, file upload, SSRF prevention — and you want concise, actionable guidance rather than a full standard document.",
      },
    ],
  },
];

export const RESOURCES_PAGE = {
  title: "Developer Resources",
  description:
    "Curated external links plus our on-site learning hubs — each with guides on when and how to use every resource.",
};
