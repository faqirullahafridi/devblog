import type { LucideIcon } from "lucide-react";
import { Laptop, Monitor, Smartphone, Terminal } from "lucide-react";

export type IdePlatform = "windows" | "mac" | "linux" | "web";

export type IdeDownload = {
  platform: IdePlatform;
  label: string;
  url: string;
};

export type IdeCategory = "editors" | "full-ide" | "jetbrains" | "terminal" | "mobile";

export type IdeDef = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: IdeCategory;
  pricing: string;
  icon: LucideIcon;
  features: string[];
  bestFor: string[];
  website: string;
  downloads: IdeDownload[];
  relatedHref?: string;
};

export const IDE_CATEGORIES: Record<IdeCategory, { title: string; description: string }> = {
  editors: {
    title: "Lightweight editors",
    description: "Fast, extensible editors — great for web, scripts, and daily coding.",
  },
  "full-ide": {
    title: "Full IDEs",
    description: "All-in-one environments with deep debugging and project tooling.",
  },
  jetbrains: {
    title: "JetBrains IDEs",
    description: "Language-focused IDEs with refactoring, inspections, and databases built in.",
  },
  terminal: {
    title: "Terminal editors",
    description: "Keyboard-driven editors for SSH, servers, and minimal setups.",
  },
  mobile: {
    title: "Platform IDEs",
    description: "Official toolchains for iOS, Android, and native mobile development.",
  },
};

export const IDES: IdeDef[] = [
  {
    slug: "vscode",
    name: "Visual Studio Code",
    tagline: "The most popular code editor",
    description:
      "Microsoft's free, open-source editor with a massive extension marketplace. Excellent for JavaScript, TypeScript, Python, and full-stack web development.",
    category: "editors",
    pricing: "Free",
    icon: Monitor,
    features: [
      "IntelliSense autocomplete and inline docs",
      "Built-in Git, terminal, and debugger",
      "Thousands of extensions (ESLint, Prettier, Docker, etc.)",
      "Remote SSH, WSL, and Dev Containers",
      "Live Share for pair programming",
      "Settings Sync across machines",
    ],
    bestFor: ["Web development", "JavaScript / TypeScript", "Python", "Beginners and pros"],
    website: "https://code.visualstudio.com",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://code.visualstudio.com/docs/?dv=win64user" },
      { platform: "mac", label: "macOS", url: "https://code.visualstudio.com/docs/?dv=osx" },
      { platform: "linux", label: "Linux", url: "https://code.visualstudio.com/docs/?dv=linux64_deb" },
    ],
    relatedHref: "/refs/vscode-shortcuts",
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "AI-native code editor",
    description:
      "A VS Code–based editor built for AI-assisted development. Chat with your codebase, apply multi-file edits, and use agents for refactors and debugging.",
    category: "editors",
    pricing: "Freemium",
    icon: Laptop,
    features: [
      "AI chat grounded in your project context",
      "Inline edits and multi-file Composer",
      "Familiar VS Code UI and extensions",
      "Tab completion tuned for code",
      "Privacy modes for sensitive codebases",
      "MCP and custom model support",
    ],
    bestFor: ["AI-assisted coding", "Rapid prototyping", "Refactors across files", "Full-stack developers"],
    website: "https://cursor.com",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://cursor.com/download" },
      { platform: "mac", label: "macOS", url: "https://cursor.com/download" },
      { platform: "linux", label: "Linux", url: "https://cursor.com/download" },
    ],
  },
  {
    slug: "zed",
    name: "Zed",
    tagline: "High-performance multiplayer editor",
    description:
      "A fast, Rust-built editor with native performance, built-in collaboration, and optional AI features. Growing ecosystem for web and systems work.",
    category: "editors",
    pricing: "Free",
    icon: Monitor,
    features: [
      "Extremely fast startup and typing response",
      "Built-in collaborative editing",
      "Git integration and language servers (LSP)",
      "Vim mode and themes",
      "Optional AI assistant integration",
      "Clean, minimal interface",
    ],
    bestFor: ["Performance-focused devs", "Pair programming", "Rust / Go / web", "Vim users wanting GUI speed"],
    website: "https://zed.dev",
    downloads: [
      { platform: "mac", label: "macOS", url: "https://zed.dev/download" },
      { platform: "linux", label: "Linux", url: "https://zed.dev/download" },
    ],
  },
  {
    slug: "sublime-text",
    name: "Sublime Text",
    tagline: "Speed and simplicity",
    description:
      "A polished, lightweight editor known for speed, multiple cursors, and a distraction-free UI. Popular for quick edits and polyglot scripting.",
    category: "editors",
    pricing: "Paid (evaluation)",
    icon: Monitor,
    features: [
      "Blazing-fast search and file switching",
      "Multiple selections and powerful Goto Anything",
      "Command palette for every action",
      "Syntax highlighting for many languages",
      "Package Control ecosystem",
      "Distraction-free writing mode",
    ],
    bestFor: ["Quick edits", "Large files", "Minimal UI fans", "Multi-language scripting"],
    website: "https://www.sublimetext.com",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://www.sublimetext.com/download" },
      { platform: "mac", label: "macOS", url: "https://www.sublimetext.com/download" },
      { platform: "linux", label: "Linux", url: "https://www.sublimetext.com/download" },
    ],
  },
  {
    slug: "visual-studio",
    name: "Visual Studio",
    tagline: "Microsoft's full IDE",
    description:
      "Enterprise-grade IDE for .NET, C++, and Azure workloads. Deep debugging, profilers, and Windows-centric tooling — separate from VS Code.",
    category: "full-ide",
    pricing: "Freemium (Community free)",
    icon: Laptop,
    features: [
      "Advanced debugger and diagnostic tools",
      "First-class .NET, C#, and C++ support",
      "Azure integration and cloud publishing",
      "UI designers for desktop and mobile",
      "IntelliCode AI suggestions",
      "Solution-wide refactoring",
    ],
    bestFor: [".NET / C# development", "C++ on Windows", "Enterprise apps", "Game dev with Unity (optional)"],
    website: "https://visualstudio.microsoft.com",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://visualstudio.microsoft.com/downloads/" },
      { platform: "mac", label: "Visual Studio for Mac (retired)", url: "https://visualstudio.microsoft.com/vs/mac/" },
    ],
  },
  {
    slug: "intellij-idea",
    name: "IntelliJ IDEA",
    tagline: "Flagship Java & Kotlin IDE",
    description:
      "JetBrains' core IDE with intelligent code analysis, refactoring, and framework support for JVM languages and beyond.",
    category: "jetbrains",
    pricing: "Freemium (Community free)",
    icon: Laptop,
    features: [
      "Deep Java, Kotlin, and Scala support",
      "Smart refactorings and inspections",
      "Built-in database tools and HTTP client",
      "Spring, Jakarta EE, and Maven/Gradle integration",
      "Debugger with hot reload",
      "Plugins for almost any stack",
    ],
    bestFor: ["Java / Kotlin backends", "Spring Boot", "Android (with plugin)", "Enterprise JVM"],
    website: "https://www.jetbrains.com/idea/",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://www.jetbrains.com/idea/download/" },
      { platform: "mac", label: "macOS", url: "https://www.jetbrains.com/idea/download/" },
      { platform: "linux", label: "Linux", url: "https://www.jetbrains.com/idea/download/" },
    ],
  },
  {
    slug: "pycharm",
    name: "PyCharm",
    tagline: "Python IDE done right",
    description:
      "Dedicated Python IDE with virtualenv/poetry support, scientific tools, and Django/Flask integrations.",
    category: "jetbrains",
    pricing: "Freemium (Community free)",
    icon: Laptop,
    features: [
      "Virtual environments and package managers",
      "Django, Flask, and FastAPI templates",
      "Jupyter notebook integration",
      "Database and SQL console",
      "Test runner (pytest, unittest)",
      "Remote interpreters and Docker",
    ],
    bestFor: ["Python development", "Data science", "Django / Flask APIs", "Learning Python"],
    website: "https://www.jetbrains.com/pycharm/",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://www.jetbrains.com/pycharm/download/" },
      { platform: "mac", label: "macOS", url: "https://www.jetbrains.com/pycharm/download/" },
      { platform: "linux", label: "Linux", url: "https://www.jetbrains.com/pycharm/download/" },
    ],
    relatedHref: "/refs/python",
  },
  {
    slug: "webstorm",
    name: "WebStorm",
    tagline: "JavaScript & TypeScript IDE",
    description:
      "JetBrains IDE tuned for frontend and Node.js — React, Vue, Angular, and modern tooling out of the box.",
    category: "jetbrains",
    pricing: "Paid (30-day trial)",
    icon: Laptop,
    features: [
      "First-class React, Vue, and Angular support",
      "Built-in ESLint, Prettier, and npm scripts",
      "HTTP client and REST tools",
      "Debugger for Node and browsers",
      "TypeScript intelligence",
      "Git and monorepo workflows",
    ],
    bestFor: ["React / Vue / Angular", "Node.js backends", "TypeScript projects", "Frontend teams"],
    website: "https://www.jetbrains.com/webstorm/",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://www.jetbrains.com/webstorm/download/" },
      { platform: "mac", label: "macOS", url: "https://www.jetbrains.com/webstorm/download/" },
      { platform: "linux", label: "Linux", url: "https://www.jetbrains.com/webstorm/download/" },
    ],
    relatedHref: "/refs/javascript",
  },
  {
    slug: "neovim",
    name: "Neovim",
    tagline: "Modern Vim fork",
    description:
      "Extensible terminal editor with Lua configuration, LSP support, and a rich plugin ecosystem (LazyVim, NvChad, etc.).",
    category: "terminal",
    pricing: "Free",
    icon: Terminal,
    features: [
      "Modal editing — fast once learned",
      "Built-in LSP and Treesitter support",
      "Lua-based configuration",
      "Remote editing over SSH",
      "Huge plugin community",
      "Low resource usage on servers",
    ],
    bestFor: ["Terminal workflows", "SSH / remote servers", "Keyboard-centric devs", "Minimal environments"],
    website: "https://neovim.io",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://github.com/neovim/neovim/releases" },
      { platform: "mac", label: "macOS (Homebrew)", url: "https://brew.sh" },
      { platform: "linux", label: "Linux packages", url: "https://github.com/neovim/neovim/blob/master/INSTALL.md" },
    ],
    relatedHref: "/refs/terminal",
  },
  {
    slug: "android-studio",
    name: "Android Studio",
    tagline: "Official Android IDE",
    description:
      "Google's IDE for Android and Kotlin Multiplatform, built on IntelliJ. Includes emulators, layout editor, and Play publishing tools.",
    category: "mobile",
    pricing: "Free",
    icon: Smartphone,
    features: [
      "Android emulator and device manager",
      "Layout editor and Jetpack Compose previews",
      "Kotlin-first tooling",
      "APK / AAB build and signing",
      "Profiler for CPU, memory, and network",
      "Google Play integration",
    ],
    bestFor: ["Android apps", "Kotlin mobile", "Jetpack Compose", "Mobile UI work"],
    website: "https://developer.android.com/studio",
    downloads: [
      { platform: "windows", label: "Windows", url: "https://developer.android.com/studio#downloads" },
      { platform: "mac", label: "macOS", url: "https://developer.android.com/studio#downloads" },
      { platform: "linux", label: "Linux", url: "https://developer.android.com/studio#downloads" },
    ],
  },
  {
    slug: "xcode",
    name: "Xcode",
    tagline: "Apple platform IDE",
    description:
      "Apple's IDE for iOS, macOS, watchOS, and visionOS apps. Includes SwiftUI previews, simulators, and App Store tooling.",
    category: "mobile",
    pricing: "Free",
    icon: Smartphone,
    features: [
      "Swift and SwiftUI development",
      "iOS / macOS simulators",
      "Interface Builder and Instruments profiler",
      "TestFlight and App Store Connect",
      "Source control and CI integration",
      "Metal and game debugging",
    ],
    bestFor: ["iOS / macOS apps", "Swift development", "Apple ecosystem", "Mobile UI with SwiftUI"],
    website: "https://developer.apple.com/xcode/",
    downloads: [
      { platform: "mac", label: "Mac App Store", url: "https://apps.apple.com/app/xcode/id497799835" },
    ],
  },
];

export const IDES_PAGE = {
  title: "IDEs & Code Editors",
  description:
    "Compare editors, download official builds, and read setup guides with extensions, shortcuts, and workflow tips for each environment.",
};

export function getIdeHref(slug: string) {
  return `/ides/${slug}`;
}

export function getIdeBySlug(slug: string) {
  return IDES.find((i) => i.slug === slug);
}

export const IDE_SLUGS = IDES.map((i) => i.slug);

export const IDE_CATEGORY_ORDER: IdeCategory[] = [
  "editors",
  "full-ide",
  "jetbrains",
  "terminal",
  "mobile",
];
