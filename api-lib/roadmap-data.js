// Auto-derived from roadmap-generator.ts
export const ROADMAP_GOALS = [
  "frontend-developer",
  "backend-developer",
  "full-stack-developer",
  "django-developer",
  "react-developer",
  "nodejs-developer",
  "devops-engineer",
  "qa-engineer",
  "data-engineer",
  "mobile-developer",
] ;



export const ROADMAP_LEVELS = ["beginner", "intermediate", "advanced"] ;

const GOAL_LABELS = {
  "frontend-developer": "Frontend Developer",
  "backend-developer": "Backend Developer",
  "full-stack-developer": "Full Stack Developer",
  "django-developer": "Django Developer",
  "react-developer": "React Developer",
  "nodejs-developer": "Node.js Developer",
  "devops-engineer": "DevOps Engineer",
  "qa-engineer": "QA Engineer",
  "data-engineer": "Data Engineer",
  "mobile-developer": "Mobile Developer",
};



const GOAL_STEPS = {
  "frontend-developer": [
    { key: "html-css", title: "HTML & CSS foundations", description: "Semantic markup, Flexbox, Grid, responsive design.", learnHref: "/learn/html-css-basics", weeksByLevel: { beginner: 3, intermediate: 1, advanced: 0.5 } },
    { key: "javascript", title: "JavaScript fundamentals", description: "Variables, functions, async, DOM, and ES modules.", learnHref: "/learn/javascript-fundamentals", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "react", title: "React & component architecture", description: "Hooks, state, routing, and TypeScript integration.", learnHref: "/learn/frontend-react", weeksByLevel: { beginner: 5, intermediate: 3, advanced: 2 } },
    { key: "tailwind", title: "Tailwind & design systems", description: "Utility CSS, dark mode, and accessible UI patterns.", learnHref: "/learn/tailwind-css", weeksByLevel: { beginner: 2, intermediate: 1, advanced: 0.5 } },
    { key: "portfolio", title: "Build portfolio projects", description: "Ship 2–3 case studies with live demos.", learnHref: "/templates/category/portfolio-templates", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "interview", title: "Frontend interview prep", description: "JS trivia, React patterns, and system design basics.", learnHref: "/interview/javascript", interviewTopic: "javascript", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
  ],
  "backend-developer": [
    { key: "python", title: "Python backend basics", description: "Syntax, venv, HTTP, and environment configuration.", learnHref: "/learn/python-backend", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "apis", title: "REST API design", description: "HTTP methods, status codes, validation, and OpenAPI.", learnHref: "/learn/web-apis", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "sql", title: "SQL & PostgreSQL", description: "Queries, joins, indexes, and transactions.", learnHref: "/learn/sql-databases", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "express", title: "Express / Node APIs", description: "Middleware, auth, sessions, and error handling.", learnHref: "/learn/express-rest-apis", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "auth", title: "Authentication patterns", description: "JWT, sessions, OAuth, and secure defaults.", learnHref: "/learn/auth-sessions-jwt", weeksByLevel: { beginner: 2, intermediate: 1, advanced: 1 } },
    { key: "deploy", title: "Deploy & monitor", description: "Docker, CI/CD, logging, and health checks.", learnHref: "/learn/docker-containers", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
  ],
  "full-stack-developer": [
    { key: "js", title: "JavaScript full stack", description: "Shared language across client and server.", learnHref: "/learn/javascript-fundamentals", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "react", title: "React frontend", description: "Modern UI with hooks and TypeScript.", learnHref: "/learn/frontend-react", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "node", title: "Node.js backend", description: "Express APIs, Drizzle ORM, PostgreSQL.", learnHref: "/learn/express-rest-apis", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "next", title: "Next.js full stack", description: "App Router, server components, API routes.", learnHref: "/learn/nextjs-fullstack", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "devops", title: "DevOps essentials", description: "Git, Docker, GitHub Actions deployment.", learnHref: "/learn/ci-cd-github-actions", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "challenges", title: "Practice coding challenges", description: "Build problem-solving muscle daily.", learnHref: "/challenges", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
  ],
  "django-developer": [
    { key: "python", title: "Python foundations", description: "Core syntax, packages, and virtual environments.", learnHref: "/learn/python-backend", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "django", title: "Django web development", description: "Models, views, templates, admin, and ORM.", learnHref: "/learn/django-web", weeksByLevel: { beginner: 5, intermediate: 3, advanced: 2 } },
    { key: "sql", title: "Database design", description: "PostgreSQL, migrations, and query optimization.", learnHref: "/learn/sql-databases", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "apis", title: "Django REST patterns", description: "Serializers, permissions, and API versioning.", learnHref: "/learn/web-apis", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "deploy", title: "Production deployment", description: "Gunicorn, static files, and environment secrets.", learnHref: "/learn/nginx-deployment", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
  ],
  "react-developer": [
    { key: "js", title: "Modern JavaScript", description: "ES6+, async/await, modules, and fetch.", learnHref: "/learn/javascript-fundamentals", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "react", title: "React deep dive", description: "Hooks, context, performance, error boundaries.", learnHref: "/learn/frontend-react", weeksByLevel: { beginner: 5, intermediate: 3, advanced: 2 } },
    { key: "typescript", title: "TypeScript with React", description: "Typed props, generics, and strict mode.", learnHref: "/learn/typescript-fundamentals", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "next", title: "Next.js production apps", description: "Routing, SSR, and deployment.", learnHref: "/learn/nextjs-fullstack", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "testing", title: "Testing React", description: "Vitest, Testing Library, and E2E basics.", learnHref: "/learn/testing-javascript", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
  ],
  "nodejs-developer": [
    { key: "js", title: "JavaScript & Node fundamentals", description: "Event loop, modules, streams, npm.", learnHref: "/learn/nodejs-fundamentals", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "express", title: "Express REST APIs", description: "Routing, middleware, validation, sessions.", learnHref: "/learn/express-rest-apis", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "sql", title: "PostgreSQL & Drizzle", description: "Schema design, migrations, and queries.", learnHref: "/learn/drizzle-postgres", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "auth", title: "Auth & security", description: "JWT, bcrypt, rate limiting, OWASP basics.", learnHref: "/learn/cybersecurity-web", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "docker", title: "Containerize Node apps", description: "Dockerfile, compose, and production config.", learnHref: "/learn/docker-containers", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
  ],
  "devops-engineer": [
    { key: "git", title: "Git & collaboration", description: "Branching, PRs, rebasing, and code review.", learnHref: "/learn/devops-git", weeksByLevel: { beginner: 2, intermediate: 1, advanced: 0.5 } },
    { key: "linux", title: "Linux server basics", description: "SSH, systemd, permissions, and logs.", learnHref: "/learn/linux-server-basics", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "docker", title: "Docker & containers", description: "Images, compose, volumes, networking.", learnHref: "/learn/docker-containers", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "k8s", title: "Kubernetes intro", description: "Pods, deployments, services, ingress.", learnHref: "/learn/kubernetes-intro", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "cicd", title: "CI/CD pipelines", description: "GitHub Actions, tests, and deploy automation.", learnHref: "/learn/ci-cd-github-actions", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "aws", title: "AWS cloud essentials", description: "EC2, S3, RDS, Lambda overview.", learnHref: "/learn/aws-cloud-essentials", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
  ],
  "qa-engineer": [
    { key: "testing-js", title: "JavaScript testing", description: "Vitest, mocks, and component tests.", learnHref: "/learn/testing-javascript", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "testing-py", title: "Python testing", description: "pytest, fixtures, API testing.", learnHref: "/learn/testing-python", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "apis", title: "API testing", description: "REST validation, Postman, contract tests.", learnHref: "/learn/web-apis", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "security", title: "Web security testing", description: "OWASP, XSS, CSRF, and secure headers.", learnHref: "/learn/cybersecurity-web", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "cicd", title: "CI test automation", description: "Run tests on every PR with GitHub Actions.", learnHref: "/learn/ci-cd-github-actions", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
  ],
  "data-engineer": [
    { key: "python", title: "Python for data", description: "Scripting, pandas basics, and ETL patterns.", learnHref: "/learn/python-backend", weeksByLevel: { beginner: 4, intermediate: 2, advanced: 1 } },
    { key: "sql", title: "Advanced SQL", description: "Window functions, CTEs, indexing, tuning.", learnHref: "/learn/sql-databases", weeksByLevel: { beginner: 4, intermediate: 3, advanced: 2 } },
    { key: "postgres", title: "PostgreSQL operations", description: "Backups, replication, and monitoring.", learnHref: "/learn/drizzle-postgres", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 2 } },
    { key: "docker", title: "Pipeline infrastructure", description: "Containerized jobs and orchestration.", learnHref: "/learn/docker-containers", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "aws", title: "Cloud data services", description: "S3, RDS, Lambda for data workflows.", learnHref: "/learn/aws-cloud-essentials", weeksByLevel: { beginner: 3, intermediate: 3, advanced: 2 } },
  ],
  "mobile-developer": [
    { key: "js", title: "JavaScript foundations", description: "Core language before mobile frameworks.", learnHref: "/learn/javascript-fundamentals", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 1 } },
    { key: "react", title: "React Native basics", description: "Components, navigation, and platform APIs.", learnHref: "/learn/frontend-react", weeksByLevel: { beginner: 5, intermediate: 3, advanced: 2 } },
    { key: "apis", title: "Mobile API integration", description: "REST clients, auth tokens, offline cache.", learnHref: "/learn/web-apis", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "testing", title: "Mobile testing", description: "Unit tests, E2E, and device matrix.", learnHref: "/learn/testing-javascript", weeksByLevel: { beginner: 2, intermediate: 2, advanced: 1 } },
    { key: "deploy", title: "App store deployment", description: "Build pipelines, signing, and release.", learnHref: "/learn/ci-cd-github-actions", weeksByLevel: { beginner: 3, intermediate: 2, advanced: 2 } },
  ],
};

export function generateRoadmapPayload(goal, currentLevel) {
  const templates = GOAL_STEPS[goal] ?? GOAL_STEPS["full-stack-developer"];
  const steps = templates.map((t) => ({
    key: t.key,
    title: t.title,
    description: t.description,
    learnHref: t.learnHref,
    interviewTopic: t.interviewTopic,
    estimatedWeeks: t.weeksByLevel[currentLevel] ?? t.weeksByLevel.beginner,
  }));
  const totalWeeks = Math.ceil(steps.reduce((s, step) => s + step.estimatedWeeks, 0));
  const label = GOAL_LABELS[goal] ?? goal;
  return {
    goal,
    currentLevel,
    title: `${label} Roadmap`,
    summary: `Personalized ${currentLevel} path to become a ${label}. Estimated ${totalWeeks} weeks at a steady pace.`,
    totalWeeks,
    steps,
    resources: [
      { title: "Learning Paths", href: "/learn", type: "course" },
      { title: "Interview Prep", href: "/interview", type: "interview" },
      { title: "Coding Challenges", href: "/challenges", type: "practice" },
      { title: "Developer Tools", href: "/tools", type: "tools" },
      { title: "Blog Articles", href: "/search", type: "articles" },
    ],
  };
}

