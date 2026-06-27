import type { LearnChapter } from "../types";

export const devopsGitChapters: LearnChapter[] = [
  {
    pathSlug: "devops-git",
    slug: "git-intro",
    title: "Introduction to Git",
    description: "Version control concepts, repositories, commits, and why Git dominates modern development.",
    level: "beginner",
    minutes: 8,
    content: `## What version control solves

Without version control, code folders become \`project_final_v2_REAL.zip\`. **Git** tracks every change to files over time: who changed what, when, and why. You can compare versions, revert mistakes, branch for experiments, and merge work from a team without emailing zip files.

Git is **distributed**: every clone is a full copy of history. You commit locally, then sync with **remotes** like GitHub or GitLab.

## Core concepts

- **Repository (repo)** — Project folder plus \`.git\` metadata directory
- **Commit** — Snapshot of tracked files with a message and unique hash
- **Branch** — Movable pointer to a line of commits
- **Remote** — Another copy of the repo (usually on a server)
- **Working tree** — Files on disk you edit
- **Staging area (index)** — Selected changes ready for the next commit

## The basic workflow

\`\`\`bash
git clone https://github.com/org/app.git
cd app
# edit files
git status
git add src/main.ts
git commit -m "Add health check endpoint"
git push origin main
\`\`\`

\`git add\` stages changes; \`git commit\` records them; \`git push\` uploads to remote.

## What Git tracks

Git tracks **content**, not folders empty of files. Use \`.gitignore\` to exclude \`node_modules/\`, \`.env\`, build artifacts, and OS junk so they never get committed.

Binary files (images, videos) bloat history—consider Git LFS or external storage for large assets.

## Commit messages

Good messages explain **why**, not only what:

\`\`\`
Fix rate limiter off-by-one on window boundary

The previous bucket key used floor(ms/60000) inconsistently
with Redis TTL, causing occasional 429s for valid traffic.
\`\`\`

Imperative subject line (~50 chars), blank line, body for context. Future you and code review depend on this.

## History as a graph

Commits form a **DAG** (directed acyclic graph). Merge commits join branches; **rebase** replays commits on another base for linear history—team policy chooses style.

## Remotes and collaboration

\`origin\` is the default remote name. **Pull** fetches and integrates (\`git pull\` = fetch + merge/rebase). **Fetch** downloads without merging—safe preview.

Pull requests (PRs) on hosting platforms review changes before merging to \`main\`.

## Git vs GitHub

**Git** is the tool; **GitHub/GitLab/Bitbucket** host remotes, PRs, CI, and issues. Learn Git locally first; hosting adds collaboration UX.

## Safety habits

- Commit small, logical units
- Pull before long work sessions
- Never force-push shared branches without team agreement
- Do not commit secrets—rotate if leaked

## Installing and configuring

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
\`\`\`

Identity attaches to commits. Use SSH keys or credential helpers for authentication.

Git feels complex because it models real collaboration problems. Start with clone, status, add, commit, push—and grow into branches and remotes as you need them.`,
  },
  {
    pathSlug: "devops-git",
    slug: "daily-workflow",
    title: "Daily Git Workflow",
    description: "Status, diff, add, commit, pull, and push—the commands you use every day.",
    level: "beginner",
    minutes: 9,
    content: `## Starting your day

Sync with the team before writing code:

\`\`\`bash
git checkout main
git pull --rebase origin main
git checkout feature/my-task
git rebase main
\`\`\`

Rebasing your feature branch on fresh \`main\` reduces merge surprises later. Some teams prefer merge commits—follow project convention.

## Inspecting state

\`\`\`bash
git status          # modified, staged, untracked
git diff            # unstaged changes
git diff --staged   # staged vs last commit
git log --oneline -10
\`\`\`

**status** answers "what would commit do?" **diff** shows line-level changes—read before every commit.

## Staging selectively

Stage everything:

\`\`\`bash
git add .
\`\`\`

Stage parts interactively:

\`\`\`bash
git add -p src/auth.ts
\`\`\`

Split unrelated changes into separate commits—easier review and cleaner bisect when hunting bugs.

## Committing

\`\`\`bash
git commit -m "Validate email on signup form"
\`\`\`

Amend only unpushed commits for typos:

\`\`\`bash
git commit --amend
\`\`\`

Never amend commits others already pulled.

## Pushing

\`\`\`bash
git push -u origin feature/my-task
\`\`\`

First push sets upstream (\`-u\`) so later \`git push\` / \`git pull\` know the remote branch.

If rejected, someone else pushed first—fetch, rebase or merge, resolve conflicts, push again.

## Stash when interrupted

\`\`\`bash
git stash push -m "WIP auth refactor"
git checkout hotfix/typo
# later
git checkout feature/my-task
git stash pop
\`\`\`

Stash saves dirty working tree temporarily without committing half-baked work.

## Viewing history

\`\`\`bash
git show abc1234
git log --graph --decorate --oneline --all
git blame src/config.ts
\`\`\`

**blame** maps lines to commits—use kindly; context matters.

## Ignoring noise

\`.gitignore\` patterns:

\`\`\`
node_modules/
dist/
.env
*.log
.DS_Store
\`\`\`

If a file was committed before ignoring:

\`\`\`bash
git rm --cached .env
\`\`\`

## Aliases (optional)

\`\`\`bash
git config --global alias.co checkout
git config --global alias.st status
git config --global alias.lg "log --oneline --graph -15"
\`\`\`

## PR-ready checklist

- Tests pass locally
- No debug \`console.log\` or commented code
- Meaningful commit messages
- Branch rebased on latest \`main\`
- Self-review diff on GitHub

Daily Git is rhythm: pull, change, diff, stage, commit, push, open PR. Automate tests in CI so push confidence stays high.`,
  },
  {
    pathSlug: "devops-git",
    slug: "branches-merging",
    title: "Branches & Merging",
    description: "Feature branches, merge vs rebase, pull requests, and resolving conflicts.",
    level: "intermediate",
    minutes: 11,
    content: `## Why branches exist

A **branch** is a named pointer to a commit. \`main\` stays deployable; **feature branches** isolate work:

\`\`\`bash
git checkout -b feature/newsletter-signup
# work, commit
git push -u origin feature/newsletter-signup
\`\`\`

Open a pull request (PR) for review; CI runs tests; merge when approved.

## Branch naming

Conventions help automation:

- \`feature/short-description\`
- \`fix/login-redirect\`
- \`chore/deps-bump\`

Avoid long-lived branches diverging months from \`main\`.

## Merge strategies

**Merge commit** preserves full history:

\`\`\`bash
git checkout main
git merge feature/newsletter-signup
\`\`\`

Creates a merge commit with two parents—truthful but busy graphs.

**Squash merge** on GitHub combines all branch commits into one on \`main\`—clean history, loses granular commits on main (still on the PR).

**Rebase merge** replays commits linearly onto \`main\`—no merge commit if fast-forward or rebase policy.

Pick one team standard; mixing confuses bisect.

## Rebase locally

\`\`\`bash
git checkout feature/x
git fetch origin
git rebase origin/main
\`\`\`

Replays your commits on top of latest \`main\`. Conflicts pause rebase—fix files, \`git add\`, \`git rebase --continue\`.

**Golden rule**: do not rebase commits already pushed to a shared branch others use—rewrite history breaks their clones.

## Pull request workflow

1. Push branch
2. Open PR with description, screenshots, test plan
3. Address review comments with new commits or fixups
4. Green CI required
5. Merge and delete remote branch

Protect \`main\`: require reviews, disallow force push, require status checks.

## Conflicts

When two edits touch the same lines:

\`\`\`
<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 10000;
>>>>>>> feature/x
\`\`\`

Edit to final intent, remove markers, \`git add\`, continue merge or rebase. Talk to the other author if logic conflict is unclear.

## Release and hotfix branches

**Gitflow** (optional): \`develop\`, \`release/*\`, \`hotfix/*\`. Many teams simplify to **trunk-based**: short branches off \`main\`, feature flags for incomplete work.

Hotfix: branch from production tag, fix, merge to \`main\` and cherry-pick to release if needed.

## Tags and releases

\`\`\`bash
git tag -a v1.2.0 -m "June release"
git push origin v1.2.0
\`\`\`

Tags mark deployable points; CI builds artifacts from tags or SHA.

## Deleting branches

\`\`\`bash
git branch -d feature/x          # local, merged
git push origin --delete feature/x
\`\`\`

Housekeeping prevents stale branch lists.

Branches enable parallel work; merges integrate it. Prefer small PRs, frequent integration with \`main\`, and clear conflict resolution over heroic merge weeks.`,
  },
  {
    pathSlug: "devops-git",
    slug: "undo-fixes",
    title: "Undoing & Fixing Mistakes",
    description: "Restore files, revert commits, reset safely, and recover lost work.",
    level: "intermediate",
    minutes: 10,
    content: `## Panic is optional

Everyone commits to the wrong branch, pushes secrets, or deletes lines they needed. Git keeps objects reachable for a while—**reflog** and careful commands recover most mistakes if you act before garbage collection.

## Discard unstaged changes

\`\`\`bash
git restore path/to/file.ts
git restore .   # all files in working tree
\`\`\`

Older syntax: \`git checkout -- file\`. **restore** is clearer for "make file match last commit."

## Unstage

\`\`\`bash
git restore --staged file.ts
\`\`\`

Removes from index; keeps working tree edits.

## Undo last commit

Keep changes staged:

\`\`\`bash
git reset --soft HEAD~1
\`\`\`

Keep changes unstaged:

\`\`\`bash
git reset HEAD~1
\`\`\`

Drop commit and changes (**destructive**):

\`\`\`bash
git reset --hard HEAD~1
\`\`\`

Never \`--hard\` on pushed commits without team coordination.

## Revert on shared history

Create a new commit that undoes a old one—safe for public branches:

\`\`\`bash
git revert abc1234
git revert main..feature-branch   # revert merge range carefully
\`\`\`

Use **revert** for production fixes; **reset** only on local unpushed work.

## Fix commit message or contents (unpushed)

\`\`\`bash
git commit --amend -m "Correct message"
\`\`\`

Add forgotten file to last commit:

\`\`\`bash
git add forgotten.ts
git commit --amend --no-edit
\`\`\`

## Recover "lost" commits

\`\`\`bash
git reflog
git checkout -b recovery abc1234
\`\`\`

Reflog lists HEAD movements (~90 days default)—find hash before reset, branch from it.

## Cherry-pick

Apply one commit elsewhere:

\`\`\`bash
git cherry-pick def5678
\`\`\`

Useful for backporting fixes from \`main\` to release branch.

## Cleaning untracked files

\`\`\`bash
git clean -fdn   # dry run
git clean -fd    # delete untracked files/dirs
\`\`\`

Dangerous—confirm with \`-n\` first.

## Secrets committed

1. Remove file and rotate the secret immediately
2. \`git rm --cached secret.env\`, commit
3. History still contains secret—use \`git filter-repo\` or BFG Repo-Cleaner
4. Force push only after team ack; invalidate old credentials

Prevention beats surgery: pre-commit hooks scanning for keys.

## When merge went wrong

\`\`\`bash
git merge --abort
git rebase --abort
\`\`\`

During conflict, abort returns to pre-operation state.

## bisect for regressions

\`\`\`bash
git bisect start
git bisect bad
git bisect good v1.0.0
# test each step; git bisect good/bad
git bisect reset
\`\`\`

Binary search finds breaking commit efficiently.

Git's undo tools are powerful and sharp. Prefer **revert** on shared branches, **reflog** when you think data is gone, and never force-push \`main\` without a runbook.`,
  },
  {
    pathSlug: "devops-git",
    slug: "terminal-basics",
    title: "Terminal Essentials",
    description: "Navigate the shell, chain commands, and work efficiently alongside Git.",
    level: "beginner",
    minutes: 10,
    content: `## The terminal in dev workflow

GUIs cover some tasks; the **terminal** (shell) remains the hub for Git, package managers, servers, and deploy scripts. Fluency means fewer context switches and reproducible commands you can paste into docs and CI.

macOS and Linux use **bash** or **zsh**; Windows developers often use WSL or Git Bash for Unix-like tools.

## Navigation and listing

\`\`\`bash
pwd                 # print working directory
ls -la              # list including hidden
cd ~/projects/app
cd ..               # parent directory
\`\`\`

Tab completion completes paths and commands—use it constantly.

## Creating and removing

\`\`\`bash
mkdir -p src/utils
touch README.md
cp file.ts file.backup.ts
mv oldname.ts newname.ts
rm unwanted.log     # careful: no trash bin
\`\`\`

## Viewing files

\`\`\`bash
cat package.json
less long.log       # scroll; q to quit
head -n 20 file.ts
tail -f app.log     # follow live logs
\`\`\`

## Pipes and redirection

**Pipe** sends stdout to another command:

\`\`\`bash
git log --oneline | head -5
pnpm test 2>&1 | tee test-output.log
\`\`\`

Redirect to files:

\`\`\`bash
echo "export NODE_ENV=development" >> .env.local
command > out.txt 2> err.txt
\`\`\`

## Environment variables

\`\`\`bash
export PORT=3000
echo $PORT
NODE_ENV=production node server.js   # inline for one command
\`\`\`

Shell profile (\`.zshrc\`, \`.bashrc\`) sets PATH and aliases persistently.

## Search

\`\`\`bash
grep -r "TODO" src/
find . -name "*.tsx" -not -path "./node_modules/*"
\`\`\`

Modern **ripgrep** (\`rg\`) is faster—many editors wrap it.

## Processes and ports

\`\`\`bash
ps aux | grep node
kill 12345
lsof -i :3000        # macOS: who listens on 3000
\`\`\`

Stop runaway dev servers before starting new ones on the same port.

## curl and HTTP

\`\`\`bash
curl -I https://example.com
curl -s http://localhost:3000/api/health | jq .
\`\`\`

Quick API checks without opening Postman.

## Package scripts

\`\`\`bash
pnpm install
pnpm --filter @workspace/blog run dev
npm run build
\`\`\`

Read \`package.json\` scripts— they encode project conventions.

## Permissions

\`\`\`bash
chmod +x scripts/deploy.sh
\`\`\`

Executable bit required for shebang scripts (\`#!/usr/bin/env bash\`).

## SSH and Git

\`\`\`bash
ssh -T git@github.com
ssh-add ~/.ssh/id_ed25519
\`\`\`

Keys authenticate Git over SSH without passwords each push.

## Multiplexing with tmux

**tmux** keeps sessions alive across disconnects—run server in one pane, logs in another, editor in a third. Learning basic split and attach pays off on remote servers.

## Safety

- Read commands before Enter—especially \`rm -rf\`
- Quote paths with spaces: \`cd "My Project"\`
- Prefer project scripts over ad-hoc destructive ops

The terminal is not magic—it is a text interface to the same files your editor shows. Comfort here speeds every Git and deploy step that follows.`,
  },
  {
    pathSlug: "devops-git",
    slug: "env-secrets",
    title: "Environment Variables & Secrets",
    description: "Configure apps safely across dev, staging, and production without leaking credentials.",
    level: "intermediate",
    minutes: 10,
    content: `## Configuration vs secrets

**Configuration** might be debug flags, public API base URLs, feature toggles—often committed in \`.env.example\` without sensitive values.

**Secrets** are passwords, database URLs, JWT signing keys, OAuth client secrets—never in git, never in client-side bundles.

Twelve-factor apps read config from the **environment** at runtime, not hardcoded constants.

## Local .env files

\`\`\`bash
# .env.example (committed)
DATABASE_URL=postgres://localhost:5432/myapp_dev
RESEND_API_KEY=

# .env (gitignored)
DATABASE_URL=postgres://user:pass@localhost:5432/myapp_dev
RESEND_API_KEY=re_xxxxxxxx
\`\`\`

Load with dotenv libraries on startup. Document every variable in \`.env.example\` so new developers know what to set.

## .gitignore and leaks

Ensure \`.env\`, \`*.pem\`, \`credentials.json\` are ignored. Use \`git secrets\` or pre-commit scanners. If leaked, **rotate immediately**—history may still contain the old value.

## Production secret storage

Use platform secret managers:

- **Vercel / Netlify** environment variables in dashboard
- **AWS Secrets Manager / SSM Parameter Store**
- **HashiCorp Vault**
- **Doppler**, **1Password Secrets Automation**

Inject at deploy time; operators never paste prod secrets into Slack.

## NODE_ENV and stages

\`\`\`
NODE_ENV=production
APP_ENV=staging
\`\`\`

Distinguish build optimization (\`NODE_ENV\`) from deployment stage (\`APP_ENV\`)—staging should behave like prod (real TLS, real email sandbox) without touching prod data.

## Database URLs

\`\`\`
postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
\`\`\`

Separate databases per environment. Read-only credentials for analytics replicas.

## Client vs server variables

In Vite/React, only \`VITE_\` prefixed vars embed in browser bundles—**never** put private keys there. Server-side only vars stay on the API process.

## Defaults and validation

Fail fast on boot if required vars missing:

\`\`\`javascript
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
\`\`\`

Zod or envalid schemas catch typos early.

## Rotating secrets

Schedule rotation for API keys and DB passwords. Dual-read periods (accept old and new JWT signing keys briefly) avoid downtime during rotation.

## CI/CD secrets

GitHub Actions **secrets** inject into workflows—mask in logs. Fork PRs do not receive secrets; protect \`main\` workflows accordingly.

## Principle of least privilege

Production DB user should not have SUPERUSER or DROP DATABASE. API keys scoped to minimum permissions (send email only, not billing).

## Local parity

Docker Compose can load \`.env\` for Postgres and Redis locally matching prod topology without prod credentials.

Environment discipline separates professional deployments from "works on my machine" incidents. Treat secrets like radioactive material—handled in controlled containers, never loose in repos or screenshots.`,
  },
  {
    pathSlug: "devops-git",
    slug: "code-review",
    title: "Code Review Practices",
    description: "Give and receive constructive review, use diffs effectively, and maintain quality.",
    level: "intermediate",
    minutes: 10,
    content: `## Purpose of review

**Code review** catches bugs, spreads knowledge, and enforces standards before code hits \`main\`. It is not performance theater—it is shared ownership of quality. Reviewers ask "will this work in prod?" and "will the next developer understand this?"

Small PRs review faster and merge safer than 2,000-line dumps.

## Author responsibilities

Before requesting review:

- Self-review the diff on GitHub—remove stray edits
- Write PR description: problem, approach, test plan, screenshots for UI
- Link issue/ticket; note migrations or env var changes
- Ensure CI green

Respond to comments with commits or replies—do not take feedback personally.

## Reviewer responsibilities

- Read description and diff within reasonable SLA
- Distinguish **blockers** (correctness, security) from **nits** (naming, optional refactors)
- Ask questions instead of dictating when uncertain
- Approve when you'd trust this running at 2 a.m.

Use suggestion feature for trivial fixes; author applies in one click.

## What to look for

- **Correctness** — Edge cases, null handling, race conditions
- **Security** — Injection, authz gaps, exposed secrets
- **Tests** — Meaningful coverage for new logic
- **Performance** — N+1 queries, unbounded loops
- **API contracts** — Breaking changes documented
- **Observability** — Errors logged with context, not swallowed

## Diff tools

GitHub/GitLab side-by-side diffs; locally:

\`\`\`bash
git diff main...feature/x
git log main..feature/x --oneline
\`\`\`

Three-dot diff shows branch changes since diverging from main.

Text diff tools help compare outputs and configs during review.

## Review comments that help

Instead of "this is wrong," try "What happens if \`userId\` is null here? The handler might 500." Specific, actionable, kind.

Use labels: **nit**, **optional**, **blocking**.

## Automated checks

Lint, typecheck, tests, security scan in CI are first reviewers—humans focus on design. Do not merge red CI without explicit risk acceptance.

## Style guides

Automate formatting (Prettier, ESLint)—debate style less in review. Architectural patterns belong in team docs or ADRs.

## Knowledge sharing

Review teaches both directions—junior authors learn patterns; senior reviewers learn domain from fresh eyes.

Rotate reviewers to avoid bottlenecks and silos.

## Merging etiquette

Author merges when approved (or maintainer does). Delete branch after merge. Watch deploy; be ready to revert if metrics spike.

## When to push back on scope

If PR scope creeps ("while I'm here"), ask to split follow-ups—review quality drops on kitchen-sink PRs.

Good review culture ships reliable software and grows the team. Optimize for learning and clarity, not gatekeeping.`,
  },
  {
    pathSlug: "devops-git",
    slug: "deployment-basics",
    title: "Deployment Basics",
    description: "Build pipelines, hosting options, health checks, and safe release habits.",
    level: "intermediate",
    minutes: 11,
    content: `## From commit to production

**Deployment** moves running software to an environment users reach. Modern flows: push to \`main\` → CI builds and tests → artifact deploys to staging → promote to production with monitoring.

Manual FTP uploads still exist; automation reduces human error and makes rollback repeatable.

## Environments

Typical ladder:

1. **Local** — developer machine
2. **Preview** — per-PR ephemeral URL (Vercel, Netlify)
3. **Staging** — prod-like config, fake or anonymized data
4. **Production** — real users and data

Parity matters: staging without SSL or with tiny datasets hides bugs until launch.

## CI/CD outline

**Continuous Integration** runs tests on every push. **Continuous Delivery/Deployment** ships passing builds automatically or with approval.

Example GitHub Actions sketch:

\`\`\`yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm test && pnpm build
      - run: deploy.sh   # platform-specific
\`\`\`

Cache dependencies; fail fast on lint before expensive e2e.

## Build artifacts

For Node APIs: compile TypeScript, bundle if needed, docker image with lockfile install. For static SPAs: \`vite build\` → upload \`dist/\` to CDN.

Immutable artifacts tagged by git SHA enable precise rollback.

## Hosting patterns

- **Static + serverless** — Frontend on CDN; API as functions (Vercel, Cloudflare Workers)
- **Containers** — Docker on Kubernetes, ECS, Fly.io
- **PaaS** — Heroku-style \`git push\` deploy
- **VPS** — SSH + systemd + nginx (more ops burden)

Choose based on team size, scale, and budget—not hype.

## Database migrations in deploy

Run migrations **before** switching traffic to new code expecting new schema—or use expand/contract pattern for zero downtime:

1. Deploy code reading old and new columns
2. Migrate data
3. Deploy code writing only new columns
4. Drop old columns later

Never edit applied migration files; add new ones.

## Health checks and readiness

\`\`\`
GET /health → 200 { "ok": true, "db": "connected" }
\`\`\`

Load balancers remove unhealthy instances. **Readiness** waits for migrations/warmup; **liveness** detects deadlocks.

## Rolling and canary releases

**Rolling** — replace instances gradually. **Canary** — send 5% traffic to new version, watch errors, then full promote. **Blue-green** — switch traffic between two identical stacks.

Feature flags decouple deploy from release—ship code dark, enable per tenant.

## Rollback

Keep previous artifact. Revert git commit or redeploy last SHA. Database rollbacks are hard—forward-fix preferred with compatible migrations.

Document runbook: who approves, how to flip traffic, communication template.

## Monitoring after deploy

Watch error rate, latency p95, saturation. Alerts on SLO breaches—not every blip. Logs structured with request IDs correlate user reports.

## Secrets in deploy

Inject via platform env, not baked into images. Separate prod/staging credentials.

## Checklist before first prod

- HTTPS enforced
- Backups tested
- Rate limits and auth on admin routes
- Error tracking (Sentry) configured
- Domain DNS and TTL understood

Deployment is not a finale—it is a loop: ship small, observe, iterate. Git branches end in merge; merges end in running software users trust.`,
  },
];
