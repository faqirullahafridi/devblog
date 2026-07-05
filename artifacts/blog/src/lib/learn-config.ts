import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Database,
  Globe,
  Layers,
  Server,
  Braces,
  Palette,
  Wind,
  Box,
  Container,
  Cloud,
  Shield,
  TestTube,
  Binary,
  Coffee,
  Gem,
  Zap,
  Lock,
  Radio,
  Workflow,
  Terminal,
} from "lucide-react";

export type LearnCategory = {
  id: string;
  title: string;
  description: string;
};

export type LearnPath = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  estimatedHours?: number;
};

export const LEARN_CATEGORIES: LearnCategory[] = [
  { id: "languages", title: "Languages", description: "Core programming languages from zero to production." },
  { id: "frontend", title: "Frontend", description: "HTML, CSS, React, Vue, Next.js, and styling." },
  { id: "python", title: "Python & APIs", description: "Django, Flask, FastAPI, and Python backend patterns." },
  { id: "nodejs", title: "Node.js & JavaScript", description: "Server-side JS, Express, and full-stack Node." },
  { id: "databases", title: "Databases & ORMs", description: "SQL, MongoDB, Redis, Prisma, and Drizzle." },
  { id: "devops", title: "DevOps & Cloud", description: "Git, Docker, CI/CD, Linux, AWS, and deployment." },
  { id: "apis", title: "APIs & Auth", description: "REST, GraphQL, JWT, OAuth, and WebSockets." },
  { id: "cs", title: "CS & Testing", description: "Algorithms, data structures, and automated testing." },
  { id: "security", title: "Security & Platform", description: "Web security, Supabase, and safe defaults." },
];

export const LEARN_PATHS: LearnPath[] = [
  // Original 6
  { slug: "javascript-fundamentals", title: "JavaScript Fundamentals", description: "Complete course from first line of code to async APIs and a capstone project.", icon: Braces, category: "languages", estimatedHours: 4 },
  { slug: "python-backend", title: "Python Backend", description: "Python from zero through venv, HTTP, env config, and database access.", icon: Server, category: "python", estimatedHours: 3 },
  { slug: "web-apis", title: "Web APIs & HTTP", description: "HTTP, REST design, JSON APIs, JWT auth, rate limiting, and API testing.", icon: Globe, category: "apis", estimatedHours: 2 },
  { slug: "frontend-react", title: "React Frontend", description: "React from JSX through hooks, context, error boundaries, and TypeScript.", icon: Layers, category: "frontend", estimatedHours: 3 },
  { slug: "sql-databases", title: "SQL & Databases", description: "SQL from SELECT through JOINs, indexes, transactions, and PostgreSQL.", icon: Database, category: "databases", estimatedHours: 2 },
  { slug: "devops-git", title: "Git & DevOps Basics", description: "Git workflow, terminal, secrets, code review, and deployment fundamentals.", icon: Workflow, category: "devops", estimatedHours: 2 },
  // Languages (+5)
  { slug: "typescript-fundamentals", title: "TypeScript Fundamentals", description: "Types, interfaces, generics, and tooling from beginner to production.", icon: Code2, category: "languages", estimatedHours: 3 },
  { slug: "golang-intro", title: "Go (Golang) Intro", description: "Go syntax, goroutines, packages, and building CLI tools and APIs.", icon: Zap, category: "languages", estimatedHours: 3 },
  { slug: "rust-intro", title: "Rust Intro", description: "Ownership, borrowing, error handling, and safe systems programming basics.", icon: Gem, category: "languages", estimatedHours: 4 },
  { slug: "java-intro", title: "Java Intro", description: "Java syntax, OOP, collections, Maven, and Spring Boot overview.", icon: Coffee, category: "languages", estimatedHours: 3 },
  { slug: "csharp-dotnet", title: "C# & .NET", description: "C# fundamentals, LINQ, ASP.NET Core, and building REST APIs.", icon: Code2, category: "languages", estimatedHours: 3 },
  // Frontend (+4)
  { slug: "html-css-basics", title: "HTML & CSS Basics", description: "Semantic HTML, Flexbox, Grid, responsive design, and accessibility.", icon: Palette, category: "frontend", estimatedHours: 2 },
  { slug: "tailwind-css", title: "Tailwind CSS", description: "Utility-first CSS, responsive layouts, dark mode, and component patterns.", icon: Wind, category: "frontend", estimatedHours: 2 },
  { slug: "vue-fundamentals", title: "Vue.js Fundamentals", description: "Vue 3 composition API, reactivity, components, and Vue Router.", icon: Layers, category: "frontend", estimatedHours: 3 },
  { slug: "nextjs-fullstack", title: "Next.js Full Stack", description: "App Router, server components, API routes, and deployment on Vercel.", icon: Layers, category: "frontend", estimatedHours: 3 },
  // Python (+3)
  { slug: "django-web", title: "Django Web Development", description: "Models, views, templates, admin, and building a blog or API with Django.", icon: Server, category: "python", estimatedHours: 4 },
  { slug: "flask-apis", title: "Flask REST APIs", description: "Flask routes, blueprints, SQLAlchemy, and JSON API patterns.", icon: Server, category: "python", estimatedHours: 2 },
  { slug: "fastapi-modern", title: "FastAPI Modern APIs", description: "Type-hinted APIs, Pydantic validation, async routes, and OpenAPI docs.", icon: Zap, category: "python", estimatedHours: 2 },
  // Node.js (+2)
  { slug: "nodejs-fundamentals", title: "Node.js Fundamentals", description: "Modules, fs, path, events, streams, and npm ecosystem.", icon: Server, category: "nodejs", estimatedHours: 2 },
  { slug: "express-rest-apis", title: "Express REST APIs", description: "Routing, middleware, validation, sessions, and production Express apps.", icon: Globe, category: "nodejs", estimatedHours: 3 },
  // Databases (+4)
  { slug: "mongodb-nosql", title: "MongoDB & NoSQL", description: "Documents, queries, aggregation, indexes, and Mongoose with Node.", icon: Database, category: "databases", estimatedHours: 2 },
  { slug: "redis-caching", title: "Redis & Caching", description: "Key-value store, TTL, pub/sub, session storage, and cache patterns.", icon: Database, category: "databases", estimatedHours: 2 },
  { slug: "prisma-orm", title: "Prisma ORM", description: "Schema, migrations, relations, and type-safe queries with Prisma.", icon: Database, category: "databases", estimatedHours: 2 },
  { slug: "drizzle-postgres", title: "Drizzle & PostgreSQL", description: "SQL-first ORM, schema in TypeScript, migrations, and queries.", icon: Database, category: "databases", estimatedHours: 2 },
  // DevOps (+5)
  { slug: "docker-containers", title: "Docker & Containers", description: "Images, Dockerfile, compose, volumes, and containerizing apps.", icon: Container, category: "devops", estimatedHours: 2 },
  { slug: "kubernetes-intro", title: "Kubernetes Intro", description: "Pods, deployments, services, ingress, and running apps on K8s.", icon: Box, category: "devops", estimatedHours: 3 },
  { slug: "nginx-deployment", title: "Nginx & Reverse Proxy", description: "Static files, SSL termination, load balancing, and proxying APIs.", icon: Server, category: "devops", estimatedHours: 2 },
  { slug: "linux-server-basics", title: "Linux Server Basics", description: "SSH, users, permissions, systemd, logs, and server hardening.", icon: Terminal, category: "devops", estimatedHours: 2 },
  { slug: "ci-cd-github-actions", title: "CI/CD with GitHub Actions", description: "Workflows, tests on PR, build pipelines, and deploy automation.", icon: Workflow, category: "devops", estimatedHours: 2 },
  { slug: "aws-cloud-essentials", title: "AWS Cloud Essentials", description: "EC2, S3, RDS, Lambda overview, and deploying a full-stack app.", icon: Cloud, category: "devops", estimatedHours: 3 },
  // APIs (+4)
  { slug: "graphql-apis", title: "GraphQL APIs", description: "Schema, queries, mutations, resolvers, and Apollo Server basics.", icon: Globe, category: "apis", estimatedHours: 2 },
  { slug: "auth-sessions-jwt", title: "Auth: Sessions & JWT", description: "Cookies, sessions, JWT access/refresh tokens, and secure auth flows.", icon: Lock, category: "apis", estimatedHours: 2 },
  { slug: "oauth-social-login", title: "OAuth & Social Login", description: "OAuth 2.0 flows, Google/GitHub login, and protecting callbacks.", icon: Lock, category: "apis", estimatedHours: 2 },
  { slug: "websockets-realtime", title: "WebSockets & Realtime", description: "Socket.io, live updates, chat patterns, and scaling realtime apps.", icon: Radio, category: "apis", estimatedHours: 2 },
  // CS & Testing (+4)
  { slug: "testing-javascript", title: "Testing JavaScript", description: "Vitest, Jest, unit tests, mocks, and testing React components.", icon: TestTube, category: "cs", estimatedHours: 2 },
  { slug: "testing-python", title: "Testing Python", description: "pytest, fixtures, mocking, and testing Flask/FastAPI endpoints.", icon: TestTube, category: "cs", estimatedHours: 2 },
  { slug: "algorithms-basics", title: "Algorithms Basics", description: "Big O, sorting, searching, recursion, and common interview patterns.", icon: Binary, category: "cs", estimatedHours: 3 },
  { slug: "data-structures", title: "Data Structures", description: "Arrays, linked lists, stacks, queues, trees, and hash maps.", icon: Binary, category: "cs", estimatedHours: 3 },
  // Security (+2)
  { slug: "supabase-fullstack", title: "Supabase Full Stack", description: "Auth, Postgres, storage, RLS policies, and realtime with Supabase.", icon: Cloud, category: "security", estimatedHours: 2 },
  { slug: "cybersecurity-web", title: "Web Security", description: "OWASP Top 10, XSS, CSRF, SQL injection, headers, and secure coding.", icon: Shield, category: "security", estimatedHours: 2 },
];

export function getLearnHref(slug: string) {
  return `/learn/${slug}`;
}

export function getLearnPathBySlug(slug: string) {
  return LEARN_PATHS.find((p) => p.slug === slug);
}

export function getPathsByCategory(categoryId: string) {
  return LEARN_PATHS.filter((p) => p.category === categoryId);
}

export const LEARN_SLUGS = LEARN_PATHS.map((p) => p.slug);
