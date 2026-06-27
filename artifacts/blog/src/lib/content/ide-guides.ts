export const IDE_GUIDES: Record<string, string> = {
  vscode: `## First-time setup

1. Download from [code.visualstudio.com](https://code.visualstudio.com)
2. Install recommended extensions: **ESLint**, **Prettier**, **GitLens**
3. Open folder: File → Open Folder
4. Terminal: \`Ctrl+\`\` (macOS: \`Cmd+\`\`)

## Essential settings

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.autoSave": "onFocusChange"
}
\`\`\`

## Keyboard shortcuts

See our [VS Code shortcuts reference](/refs/vscode-shortcuts).

## Workflows

| Task | How |
|------|-----|
| Debug Node | Run → Start Debugging (F5) |
| Multi-root | File → Add Folder to Workspace |
| Remote SSH | Install Remote-SSH extension |

## Learn more

- [JavaScript path](/learn/javascript-fundamentals/intro)
- [Git path](/learn/devops-git/git-intro)`,

  cursor: `## Getting started with Cursor

Cursor is built on VS Code — your extensions and keybindings transfer over.

1. Download from [cursor.com](https://cursor.com)
2. Sign in and choose your AI model preferences
3. Open your project folder

## AI features

| Feature | Use for |
|---------|---------|
| **Chat** | Questions about your codebase |
| **Composer** | Multi-file edits and refactors |
| **Tab** | Inline code completion |

## Best practices

- Keep sensitive secrets out of prompts
- Review AI-generated code before committing
- Use \`.cursorignore\` for \`node_modules\`, \`.env\`

## Related

- [VS Code guide](/ides/vscode) — same base editor
- [JavaScript learning path](/learn/javascript-fundamentals/intro)`,

  pycharm: `## PyCharm setup

1. Download **Community** (free) or **Professional** (Django, DB tools)
2. Create project → choose Python interpreter
3. PyCharm auto-detects \`venv\` in project root

## Key features to learn

- **Run configurations** — click green play next to \`if __name__\`
- **Debugger** — breakpoints, variable inspector
- **Database tool** — connect to PostgreSQL (Professional)
- **Terminal** — built-in, auto-activates venv

## Recommended workflow

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
\`\`\`

## Learn Python on devblog

- [Python Backend path](/learn/python-backend/intro)
- [Python reference](/refs/python)`,

  "intellij-idea": `## IntelliJ IDEA for Java/Kotlin

Community Edition is free for JVM development. Ultimate adds Spring, Docker, and advanced DB tools.

## Setup

1. Install JDK 17+ (Eclipse Temurin recommended)
2. File → New → Project → Java/Kotlin
3. Let IntelliJ index the project (progress bar bottom)

## Power features

- **Refactor → Rename** (Shift+F6) — safe across project
- **Find Usages** (Alt+F7)
- **Maven/Gradle** integration in right sidebar
- **Database** panel for SQL

## Spring Boot tip

Use Spring Initializr (start.spring.io), import as Maven/Gradle project.`,

  webstorm: `## WebStorm for JavaScript/TypeScript

Optimized for React, Node, and modern frontend stacks.

## Setup

1. Open project with \`package.json\`
2. Let WebStorm install dependencies (\`npm install\`)
3. Enable ESLint: Settings → Languages → JavaScript → Code Quality → ESLint

## Features

- **Smart completion** for imports and types
- **Built-in HTTP client** — test APIs without Postman
- **npm scripts** in package.json gutter icons
- **Debugger** for Node and Chrome

## Learn

- [React path](/learn/frontend-react/intro)
- [JavaScript path](/learn/javascript-fundamentals/intro)`,

  neovim: `## Neovim for terminal editing

Neovim is a modal editor — different from VS Code but extremely fast once learned.

## Install

\`\`\`bash
# macOS
brew install neovim
# Ubuntu
sudo apt install neovim
\`\`\`

## Starter config

Use a pre-built config to avoid weeks of setup:

- **LazyVim** — batteries included
- **NvChad** — beautiful defaults

## Modal basics

| Mode | Purpose | Enter with |
|------|---------|------------|
| Normal | Navigate, commands | Esc |
| Insert | Type text | i, a |
| Visual | Select text | v |

## Learn

- [Terminal reference](/refs/terminal)
- [Git path](/learn/devops-git/terminal-basics)`,

  "android-studio": `## Android Studio setup

1. Download from developer.android.com
2. Run setup wizard — installs SDK, emulator
3. Create Virtual Device (AVD) for testing

## Project structure

\`\`\`
app/src/main/
  java/...     # Kotlin/Java source
  res/         # layouts, strings, drawables
  AndroidManifest.xml
\`\`\`

## Kotlin first

Google recommends Kotlin for new Android apps. Use Jetpack Compose for modern UI.

## Emulator tips

- Enable hardware acceleration (HAXM / Hyper-V)
- Use "Cold Boot" if emulator acts stuck`,

  xcode: `## Xcode for Apple development

macOS only. Install from Mac App Store (large download ~12GB+).

## First app

1. File → New → Project → iOS App
2. Choose SwiftUI interface
3. Select simulator (iPhone 15)
4. Click Run (▶)

## Key tools

| Tool | Purpose |
|------|---------|
| Simulator | Test without device |
| Instruments | Performance profiling |
| TestFlight | Beta distribution |

## SwiftUI preview

Use Canvas (Editor → Canvas) for live UI preview while coding.`,

  zed: `## Zed editor

Fast Rust-based editor with collaboration built in. Download from [zed.dev](https://zed.dev).

## Getting started

1. Install for macOS or Linux
2. Open folder — Zed uses LSP for language intelligence
3. Enable Vim mode in settings if desired

## Tips

- Use command palette (Cmd+Shift+P) for all actions
- Built-in Git panel in the status bar
- Try collaborative editing for pair sessions

## Learn

- [JavaScript path](/learn/javascript-fundamentals/intro)`,

  "sublime-text": `## Sublime Text

Ultra-fast editor for quick edits and large files.

## Setup

1. Install Package Control (packagecontrol.io)
2. Install packages: LSP, Prettier, GitSavvy
3. Learn **Goto Anything** (Cmd+P) and **multiple cursors** (Cmd+D)

## Why developers keep it

- Opens huge files instantly
- Minimal UI distraction
- Powerful search across project (Cmd+Shift+F)

## Related

- [VS Code](/ides/vscode) for full IDE features`,

  "visual-studio": `## Visual Studio (not VS Code)

Full Microsoft IDE for .NET, C++, and Azure — much heavier than VS Code.

## Editions

| Edition | Best for |
|---------|----------|
| Community | Free — students, open source, individuals |
| Professional | Small teams |
| Enterprise | Large organizations |

## Setup

1. Run installer — select workloads: **.NET desktop**, **ASP.NET**, or **C++**
2. Sign in for license
3. Clone repo → Build → Run (F5)

## When to choose VS Code instead

Web/JS/Python/Node projects — VS Code is lighter. Use Visual Studio for deep .NET debugging and Windows desktop apps.`,
};

export function getIdeGuide(slug: string) {
  return IDE_GUIDES[slug] ?? "";
}
