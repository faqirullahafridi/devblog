import { article } from "./blog-article-builder.mjs";

/** @type {import("./blog-posts-data-part1.mjs").BLOG_POSTS extends infer T ? T extends readonly (infer U)[] ? U[] : never : never[]} */
export const BLOG_POSTS_PART3 = [
  // ── Productivity Tools ──────────────────────────────────────────────────
  {
    categorySlug: "productivity-tools",
    title: "Terminal tools I use daily (not the trendy ones)",
    slug: "daily-terminal-tools-developers",
    excerpt:
      "fzf, ripgrep, and a simple note file beat installing a new productivity app every month.",
    featuredImage:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop",
    tags: ["terminal", "productivity", "tools"],
    content: article({
      lede: `I used to reinstall my dotfiles every time a new productivity app trended on Hacker News. Raycast clones, note apps with bi-directional links, task managers that sync across seven devices — I tried them all. None stuck. What did stick was a small set of terminal tools I already had installed, plus a plain text file on my desktop. Boring tools win because they compose with everything else in my workflow and never need a subscription.`,
      sections: [
        {
          title: "Why trendy tools fail me",
          paragraphs: [
            `Productivity software sells a fantasy: one app will organize your entire life. In practice, each new app adds a sync layer, a login, and a learning curve. When I am debugging production at 4 p.m., I do not want to open a separate window to find a command I ran yesterday. I want muscle memory.`,
            `The tools below are not exciting. They have no landing pages with gradient backgrounds. They have been stable for years, work offline, and cost nothing. That is the point.`,
          ],
        },
        {
          title: "ripgrep: search without waiting",
          paragraphs: [
            `**ripgrep (\`rg\`)** replaced \`grep -r\` in my daily workflow within a week. It respects \`.gitignore\` by default, skips binary files intelligently, and is fast enough that I never hesitate to search the whole repo.`,
            `My most common patterns:`,
          ],
          bullets: [
            `\`rg "TODO|FIXME" src/\` — find debt before a release`,
            `\`rg -l "useEffect" --type tsx\` — list files matching a hook (great before refactors)`,
            `\`rg -C 3 "error code" docs/\` — context around error references in documentation`,
          ],
          paragraphs: [
            `The speed difference matters psychologically. When search is instant, you search more often. When search is slow, you guess — and guessing causes bugs.`,
            `I alias \`rg\` in shell history so failed greps become learning moments: the last search is one Ctrl+R away. That sounds trivial until you realize how often "what was that env var called?" interrupts flow.`,
          ],
        },
        {
          title: "fzf: fuzzy finding everything",
          paragraphs: [
            `**fzf** is a fuzzy finder I bind to shell history (Ctrl+R), file navigation, and git branch switching. Typing three characters of a branch name beats scrolling through \`git branch\` output.`,
            `A simple file jump alias lives in my shell config:`,
          ],
          code: {
            lang: "bash",
            body: `# ~/.bashrc or ~/.zshrc
export FZF_DEFAULT_COMMAND='rg --files --hidden --follow --glob "!.git/*"'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"

# Jump to any file under the project root
ff() { fd . | fzf | xargs -r \${EDITOR:-vim}; }`,
          },
          paragraphs: [
            `Combined with **fd** (a faster \`find\`), I rarely type full paths. This saves more time per day than any GUI launcher I tried.`,
          ],
        },
        {
          title: "jq and curl: API inspection without Postman",
          paragraphs: [
            `**jq** parses JSON from the terminal. When an endpoint returns a nested blob, I pipe through jq instead of opening Postman, clicking through tabs, and losing the exact request I used.`,
          ],
          code: {
            lang: "bash",
            body: `# List IDs from a paginated response
curl -s "https://api.example.com/v1/items?limit=50" \\
  | jq '.data[].id'

# Pretty-print and filter in one step
curl -s -H "Authorization: Bearer $TOKEN" /api/user \\
  | jq '{ name: .profile.displayName, roles: .permissions[].role }'`,
          },
          paragraphs: [
            `For quick checks during development, terminal inspection is faster than GUI tools. For sharing with teammates, I paste the one-liner in Slack — reproducible and copy-pasteable.`,
          ],
        },
        {
          title: "A plain notes.txt beats another app",
          paragraphs: [
            `I keep **\`~/notes.txt\`** open in a terminal tab or editor split. Every morning I write three priorities, one line each. No sync, no tags, no "second brain" philosophy — just text.`,
            `Why it works: zero friction to edit, grep-able from the terminal, and never conflicts across devices because it lives on the machine I am actually working on. For meeting notes I append timestamps. At end of week I archive the file to \`notes-2026-06-25.txt\` and start fresh.`,
            `The best productivity system is the one you actually open every morning. A text file opens in milliseconds.`,
          ],
        },
        {
          title: "git worktree for parallel work",
          paragraphs: [
            `**git worktree** lets me check out a second branch in a separate directory without stashing current work. When a hotfix lands while I am mid-refactor, I add a worktree, fix the bug, push, and delete the worktree — my main checkout never moved.`,
          ],
          code: {
            lang: "bash",
            body: `git worktree add ../myproject-hotfix main
cd ../myproject-hotfix
# fix, commit, push
git worktree remove ../myproject-hotfix`,
          },
          paragraphs: [
            `This replaced my old habit of \`git stash\` chains that inevitably lost context. Worktrees cost a bit of disk space and save hours of mental reload.`,
          ],
        },
        {
          title: "Pick five and go deep",
          paragraphs: [
            `My rule now: **five tools, learned deeply, ignore the rest until something breaks.** ripgrep, fzf, jq, a notes file, and git worktree cover 90% of my daily friction. The remaining 10% is not worth a new app install.`,
            `I revisit the list once a year during a quiet week — not every time a new launcher trends. If a tool has not earned a place in that annual review, it does not get installed. That discipline sounds strict; in practice it frees attention for the work that actually pays.`,
            `If you are shopping for productivity software this week, try the opposite: pick one terminal tool from this list, use it exclusively for fourteen days, then decide. Depth beats breadth every time.`,
          ],
        },
      ],
      takeaway:
        "Reliable terminal tools with muscle memory beat a rotating stack of trendy apps. Pick a small set, learn them deeply, and stop reinstalling your workflow every month.",
      credit:
        "Photo: [Maximalfocus](https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-8hgm6mKK04U) on Unsplash",
    }),
  },

  // ── React ───────────────────────────────────────────────────────────────
  {
    categorySlug: "react",
    title: "We replaced three useEffects with one form submit handler",
    slug: "react-useeffect-to-event-handler-refactor",
    excerpt:
      "Syncing state on every keystroke caused cascade renders. Colocating updates in onSubmit simplified the component.",
    featuredImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop",
    tags: ["react", "hooks", "refactoring"],
    isFeatured: true,
    content: article({
      lede: `Our settings form had three separate \`useEffect\` hooks — one watching \`name\`, one watching \`email\`, one watching \`timezone\`. Each effect called \`validateField\` and updated error state. Typing an email address triggered three effect passes, three state updates, and a noticeable lag on slower devices. The fix was not a new validation library. We moved validation into event handlers where the user action already lives.`,
      sections: [
        {
          title: "The problem: effects mirroring state",
          paragraphs: [
            `The original component treated validation as a side effect of state changes. Every keystroke updated \`values\`, which re-ran effects, which called \`setErrors\`. React had to reconcile error state on every character — even when the user was nowhere near submitting.`,
            `React's own documentation describes \`useEffect\` for synchronizing with **external systems**: subscriptions, browser APIs, third-party widgets. Deriving validation errors from form state you already control is not an external system. It is logic that belongs in the event that caused the change.`,
          ],
        },
        {
          title: "What the old code looked like",
          paragraphs: [
            `Three effects, three dependency arrays, three opportunities for stale closures:`,
          ],
          code: {
            lang: "tsx",
            body: `// Before — validation as effects (simplified)
useEffect(() => {
  setErrors((e) => ({ ...e, name: validateName(values.name) }));
}, [values.name]);

useEffect(() => {
  setErrors((e) => ({ ...e, email: validateEmail(values.email) }));
}, [values.email]);

useEffect(() => {
  setErrors((e) => ({ ...e, timezone: validateTimezone(values.timezone) }));
}, [values.timezone]);`,
          },
          paragraphs: [
            `Profiler showed six commits per keystroke in the email field: \`values\` update, three effect runs, three \`setErrors\` calls, plus child re-renders from context. Users on mid-range Android phones felt it.`,
            `The sluggishness was worst when autofill populated two fields at once — three effects fired in the same tick, and React batched poorly with our custom debounce wrapper from an older PR.`,
          ],
        },
        {
          title: "The refactor: validate on submit and blur",
          paragraphs: [
            `We moved full validation to \`handleSubmit\` and field-level checks to \`onBlur\` for accessibility (screen readers announce errors after the user leaves a field). Keystrokes no longer trigger validation unless the field was already marked invalid.`,
          ],
          code: {
            lang: "tsx",
            body: `function SettingsForm() {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateAll(values);
    setErrors(next);
    if (Object.keys(next).length === 0) save(values);
  }

  function handleBlur(field: keyof typeof values) {
    setErrors((err) => ({ ...err, [field]: validators[field](values[field]) }));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        onBlur={() => handleBlur("email")}
        aria-invalid={!!errors.email}
      />
      {errors.email && <span role="alert">{errors.email}</span>}
      <button type="submit">Save</button>
    </form>
  );
}`,
          },
        },
        {
          title: "Profiler numbers after the change",
          paragraphs: [
            `React Profiler on the same interaction path:`,
          ],
          bullets: [
            `Keystrokes in email field: **1 commit** (values only) instead of 6`,
            `Blur on email field: **2 commits** (values already set + errors update)`,
            `Submit with invalid form: **2 commits** (validateAll + errors)`,
            `Submit with valid form: **3 commits** (validate, clear errors, save callback)`,
          ],
          paragraphs: [
            `Half the commits per interaction is a meaningful win on low-end hardware. More importantly, the component reads linearly: events cause updates, not invisible effect chains.`,
          ],
        },
        {
          title: "When effects still make sense in forms",
          paragraphs: [
            `We kept one effect: syncing \`values\` from server props when \`userId\` changes (a true external sync). Autosave to localStorage on an interval also belongs in an effect — the browser storage API is external.`,
            `Rule of thumb we posted in our frontend guild doc: **if the logic runs because the user did something, put it in an event handler.** If it runs because the component mounted or props changed from outside, consider an effect.`,
            `That one-sentence rule ended most "should this be an effect?" threads in Slack.`,
          ],
        },
        {
          title: "Team conventions that stuck",
          paragraphs: [
            `After this refactor we added a lightweight ESLint comment in PR templates: "List any new \`useEffect\` hooks and what external system they sync with." Empty answers get questioned in review.`,
            `We also added a short internal doc with before/after Profiler screenshots — visual proof helps skeptics more than another blog post about hooks. New hires read it during onboarding week.`,
            `Junior developers on the team reported the form code was easier to trace. That aligns with React's direction — event handlers as the default, effects as the exception. The next form we touched took half the review cycles because the pattern was already familiar.`,
          ],
        },
      ],
      takeaway:
        "Form validation belongs in event handlers, not useEffect. Submit and blur give you fewer renders, clearer data flow, and code the next developer can follow without drawing an effect dependency graph.",
      credit:
        "Photo: [Lautaro Andreani](https://unsplash.com/photos/macbook-pro-on-white-table-8hgm6mKK04U) on Unsplash",
    }),
  },

  // ── Resume Building ─────────────────────────────────────────────────────
  {
    categorySlug: "resume-building",
    title: "What three hiring managers said about developer resumes",
    slug: "hiring-managers-developer-resume-feedback",
    excerpt:
      "Metrics beat buzzwords. One page beat three. Links beat embedded skill bars.",
    featuredImage:
      "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["resume", "career", "hiring"],
    content: article({
      lede: `I sent my resume to three engineering managers I trust — two at mid-size SaaS companies, one at a late-stage startup — and asked a blunt question: "What makes you keep reading past ten seconds?" Their answers overlapped more than I expected. None mentioned fancy templates. All mentioned clarity, proof, and respect for the reader's time.`,
      sections: [
        {
          title: "Lead with outcomes, not responsibilities",
          paragraphs: [
            `Every manager said the same thing in different words: **show impact, not job description copy.**`,
          ],
          bullets: [
            `Weak: "Worked on the API team maintaining microservices."`,
            `Strong: "Reduced checkout API errors 34% by adding idempotency keys and retry-safe clients."`,
            `Weak: "Responsible for frontend development using React."`,
            `Strong: "Shipped a React dashboard used by 12k monthly active admins; cut page load time from 4.2s to 1.1s by code-splitting and image optimization."`,
          ],
          paragraphs: [
            `Numbers do not need to be perfect. "Roughly 30% fewer support tickets" beats no number. If you truly have no metric, describe scope: "Owned auth migration affecting 400 enterprise tenants."`,
          ],
        },
        {
          title: "One page until you have ten-plus years",
          paragraphs: [
            `Two managers said they rarely read page two on a first pass. One page forces prioritization — which is the exercise. If everything is important, nothing is.`,
            `Cut older internships unless they are directly relevant. Move conference talks and side projects to a "Selected work" section with links instead of paragraphs. Save the three-page CV for academic roles; industry hiring moves fast.`,
            `One manager said a second page of open-source contributions is fine **if** the first page already shows employment impact — not if page one is thin and page two is a laundry list of hackathon badges.`,
          ],
        },
        {
          title: "Links that actually work",
          paragraphs: [
            `**GitHub with a pinned repository** beats "proficient in Git." Managers click pins. Empty profiles or tutorial forks signal lack of curation.`,
            `**Portfolio sites** help when they load fast on mobile and show one or two real projects with a sentence of context each. A portfolio that takes eight seconds to load on LTE hurts more than no portfolio.`,
            `**LinkedIn** is fine as a secondary link. The resume should stand alone — do not write "see LinkedIn for details" where impact bullets should be.`,
          ],
        },
        {
          title: "Kill the skill percentage bars",
          paragraphs: [
            `All three managers independently mocked skill bars: "JavaScript — 85%." Nobody knows what the percentage means. Some find them silly; most ignore them entirely.`,
            `Replace with a short grouped list if you must:`,
          ],
          bullets: [
            `Languages: TypeScript, Python, Go`,
            `Frameworks: React, Node.js, Django`,
            `Infrastructure: AWS (ECS, RDS), Terraform, GitHub Actions`,
          ],
          paragraphs: [
            `Better yet, let your project bullets prove skills. "Built CI pipeline in GitHub Actions" demonstrates more than "GitHub Actions — 90%."`,
          ],
        },
        {
          title: "Tailor the top third honestly",
          paragraphs: [
            `Recruiters skim the header and first role. **Match three keywords from the job post** — frameworks you have actually shipped, not tutorials started.`,
            `One manager said: "I look for overlap in the first screen. If the post says Postgres and your top bullet mentions Mongo only, I might still read on — but the bar goes up."`,
            `Honesty matters. Listing Kubernetes because you ran \`kubectl get pods\` once will collapse in a phone screen. List what you can discuss for twenty minutes.`,
          ],
        },
        {
          title: "Format and readability details",
          paragraphs: [
            `Consensus on formatting:`,
          ],
          numbered: [
            `PDF export — never .docx with broken fonts on the hiring manager's machine`,
            `Single column — sidebar templates break on some applicant tracking systems`,
            `11–12pt body font, clear section headers, consistent date formatting (MM/YYYY or Month YYYY, not both)`,
            `No photo required in US/UK tech hiring — saves space for bullets`,
          ],
          paragraphs: [
            `Write for skim first, depth second. Bold company names and metrics. Use parallel structure: verb + what + result.`,
          ],
        },
        {
          title: "What happens after the skim",
          paragraphs: [
            `If the top third hooks them, managers read the middle for trajectory: promotions, increasing scope, consistent tenure or honest explanations for gaps. A six-month stint after a layoff with one line of context is fine. Three six-month stints without context raises questions.`,
            `One manager keeps a simple rubric: impact evidence, scope growth, communication signals (docs, postmortems, cross-team projects). If two of three are strong, they schedule a phone screen even when the stack is not a perfect match.`,
            `The resume's job is not to list every technology you touched. It is to earn a conversation where you can tell the rest of the story.`,
          ],
        },
      ],
      takeaway:
        "Metrics beat buzzwords, one page beats three, and working links beat decorative skill bars. Tailor the top third honestly and write for recruiters who skim in ten seconds.",
      credit:
        "Photo: [Lukas](https://www.pexels.com/photo/shallow-focus-photography-of-black-ballpoint-pen-on-notebook-590016/) on Pexels",
    }),
  },

  // ── SEO ─────────────────────────────────────────────────────────────────
  {
    categorySlug: "seo",
    title: "Technical SEO fixes that moved our docs site up 12 positions",
    slug: "technical-seo-docs-site-wins",
    excerpt:
      "Canonical tags, XML sitemap cleanup, and Core Web Vitals on mobile — no keyword stuffing required.",
    featuredImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop",
    tags: ["seo", "web", "performance"],
    content: article({
      lede: `Our documentation site ranked page three for our own product name. Embarrassing for a team that ships developer tools. We skipped blog spam, paid backlinks, and keyword-stuffed landing pages. Instead we fixed plumbing: canonical URLs, a clean sitemap, sensible title templates, and mobile Core Web Vitals. Six weeks later, branded search terms moved up roughly twelve positions and indexed pages more than doubled.`,
      sections: [
        {
          title: "Duplicate URLs were splitting signals",
          paragraphs: [
            `Google was indexing \`/docs\`, \`/docs/\`, and \`/docs/index.html\` as separate URLs with duplicate content. Each variant accumulated its own thin backlink profile. Search Console showed "Duplicate without user-selected canonical" warnings on dozens of paths.`,
            `We added canonical tags via our static site generator layout and enforced trailing-slash policy at the CDN:`,
          ],
          code: {
            lang: "html",
            body: `<link rel="canonical" href="https://docs.example.com/guides/quickstart" />`,
          },
          paragraphs: [
            `301 redirects consolidated the rest. We also fixed hreflang-free duplicate paths created by an old \`/en/\` prefix experiment that had been abandoned but still linked from external blog posts.`,
            `Within two crawl cycles, duplicate warnings dropped sharply. Branded queries stopped competing with themselves across three URL shapes.`,
          ],
        },
        {
          title: "Sitemap cleanup removed noise",
          paragraphs: [
            `Our auto-generated XML sitemap accidentally included staging URLs, paginated tag pages with no unique content, and \`/404\` fallbacks from a misconfigured build step. Crawlers spent budget on junk.`,
            `We rebuilt the sitemap to include only indexable pages:`,
          ],
          bullets: [
            `Published guides and API reference pages`,
            `Stable category hubs with unique intros`,
            `Excluded: draft routes, auth-gated admin previews, query-param filter URLs`,
          ],
          paragraphs: [
            `Search Console "Pages" report showed indexed pages rising from ~180 to ~410 over six weeks — not because we published 230 new pages, but because crawlers found real content instead of duplicates and dead ends.`,
            `We resubmitted the sitemap after each docs release instead of waiting for discovery alone. That shaved days off indexing for new guides that product marketing announced on launch day.`,
          ],
        },
        {
          title: "Title templates humans would click",
          paragraphs: [
            `Every page had inherited \`Document\` as the title from a template bug. We introduced a consistent pattern:`,
          ],
          code: {
            lang: "text",
            body: `{page title} | Product Docs`,
          },
          paragraphs: [
            `Rules: primary keyword in the first 40 characters, total length under 60 characters where possible, no year stuffing ("Best Guide 2026 2026"). Meta descriptions summarize the first actionable paragraph — not a keyword list.`,
            `Click-through rate on branded queries improved modestly. Titles that read like help articles outperform titles that read like SEO experiments.`,
            `We A/B tested title length in Search Console for two high-traffic pages — shorter titles with the product name first won clicks without changing body copy.`,
          ],
        },
        {
          title: "Core Web Vitals on mobile",
          paragraphs: [
            `Mobile LCP was failing on guide pages with hero illustrations. Two fixes mattered most:`,
          ],
          numbered: [
            `Removed \`loading="lazy"\` from above-the-fold hero images — lazy loading delayed LCP candidates`,
            `Subset fonts with \`unicode-range\` and preloaded the woff2 file used in the hero heading — saved ~200ms on median mobile`,
          ],
          paragraphs: [
            `We also resized hero assets to max 1200px width instead of serving 2400px PNGs. INP was already passing; CLS needed explicit width/height on code block containers.`,
            `Search Console Core Web Vitals report moved from "Needs improvement" to "Good" on mobile for the docs property — not a ranking guarantee, but a signal we were no longer fighting our own assets.`,
            `Crux data lagged Real User Monitoring by weeks — we trusted our RUM dashboard for iteration and Search Console for trend confirmation.`,
          ],
        },
        {
          title: "Internal linking and crawl depth",
          paragraphs: [
            `Deep reference pages sat four clicks from home with no inbound links. We added a "Related guides" block generated from shared tags and linked category hubs from the footer.`,
            `Breadcrumb structured data (\`BreadcrumbList\`) helped SERP display but the bigger win was crawl paths: every important page reachable within three clicks from \`/docs\`.`,
            `We also fixed orphan pages left over from a renamed section — old slugs 301 to new paths so external Stack Overflow links still flowed PageRank to the right destination.`,
          ],
        },
        {
          title: "Structured data without spam",
          paragraphs: [
            `We added \`Article\` schema on guides (headline, dateModified, author) and \`SoftwareApplication\` on the product overview. No fake review stars, no FAQ schema on pages without real FAQs.`,
            `Rich results are optional. Correct HTML, fast pages, and unique titles do the heavy lifting for developer documentation sites.`,
          ],
        },
        {
          title: "What we deliberately did not do",
          paragraphs: [
            `No AI-generated glossary pages. No reciprocal link exchanges. No hiding text in CSS. Those tactics might spike traffic briefly; they do not build trust with developers searching for accurate answers.`,
            `We also skipped rewriting every page title for keyword variants of our product name. One clear title per page outperformed five near-duplicate URLs targeting "tutorial," "guide," and "docs" separately.`,
            `SEO for docs is mostly **correct HTTP semantics and performance**. Write titles a human engineer would click from a Google results page. Keep URLs stable across releases. Measure in Search Console, fix the boring stuff, repeat.`,
          ],
        },
      ],
      takeaway:
        "Technical SEO for developer docs is plumbing: canonical URLs, a honest sitemap, readable titles, and mobile Core Web Vitals. Fix those before chasing keywords or backlinks.",
      credit:
        "Photo: [Carlos Muza](https://unsplash.com/photos/turned-on-gray-laptop-computer-QkCv8qgsvPc) on Unsplash",
    }),
  },

  // ── Software Engineering ────────────────────────────────────────────────
  {
    categorySlug: "software-engineering",
    title: "Code review comments that changed how our team ships",
    slug: "code-review-comments-team-shipping",
    excerpt:
      "Nitpicks moved to linters. Reviews focus on behavior, tests, and rollback plans.",
    featuredImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop",
    tags: ["code-review", "engineering", "process"],
    content: article({
      lede: `Our pull requests used to drown in style debates. Tab width, import order, variable naming opinions — endless threads that delayed merges without improving reliability. A quarter of comments were auto-fixable nits. We moved nits to linters, adopted review prompts focused on behavior, and started praising good tests in public. Merge time dropped and incident anxiety around releases went down with it.`,
      sections: [
        {
          title: "Automate the nits, keep humans for judgment",
          paragraphs: [
            `Prettier and ESLint run in CI on every push. PRs fail if formatting drifts. Reviewers stopped commenting "add semicolon" because the bot already blocked merge.`,
            `We documented a **human-only review checklist** in the repo CONTRIBUTING file. If a comment does not touch behavior, tests, operability, or learning — it probably belongs in a linter rule instead.`,
            `Optional: auto-assign reviewers by CODEOWNERS so the right domain expert sees database migrations before merge — automation routing humans, not replacing them.`,
          ],
        },
        {
          title: "Four questions we ask on every review",
          paragraphs: [
            `These prompts replaced vague "looks good" approvals:`,
          ],
          bullets: [
            `**What user-visible behavior changes?** Forces the author to state intent in the PR description; reviewers verify it matches the diff.`,
            `**How would I break this?** Edge cases, null inputs, race conditions, permission boundaries.`,
            `**Can we roll back without a migration?** Flag dangerous one-way schema changes before merge, not during an incident.`,
            `**Do tests assert behavior, not mocks of behavior?** Mock-heavy tests that never exercise real integration gave us false confidence twice last year.`,
          ],
        },
        {
          title: "Comments that teach instead of gatekeep",
          paragraphs: [
            `"Consider extracting this if it grows" beats "wrong pattern." The first invites discussion; the second shuts it down.`,
            `We encourage **suggestive comments** with reasoning: "This N+1 query will hurt when accounts have 500 projects — could we batch here?" links to a doc or previous incident if one exists.`,
            `When someone writes a clear test that catches a subtle bug, reviewers react with a thumbs-up and sometimes call it out in Slack. Reinforcement works better than only pointing at mistakes.`,
          ],
        },
        {
          title: "Small PRs merge; giants rot",
          paragraphs: [
            `We target **under 400 lines changed** per PR where possible. Same-day merges became normal for focused fixes. PRs over 800 lines wait in queue, accumulate merge conflicts, and get rubber-stamped under deadline pressure — the worst combination.`,
            `Large features ship as stacked PRs behind a feature flag: schema migration, backend API, frontend shell, polish. Each piece reviewable in twenty minutes.`,
            `Authors attach "how to test" steps in the PR body — reviewers on another timezone should not guess which seed data to load.`,
          ],
        },
        {
          title: "Review SLAs and ownership",
          paragraphs: [
            `Each pod has a rotating **review shepherd** for the week — not the only reviewer, but accountable for clearing the queue within one business day. Stale PRs ping the channel after 24 hours.`,
            `Authors mark PRs as draft until self-review is done: description filled, screenshots attached, checklist ticked. Reviewers reject empty "please review" requests politely but firmly.`,
          ],
        },
        {
          title: "Security and observability get explicit passes",
          paragraphs: [
            `PRs touching auth, payments, or PII get a second reviewer from a short security roster — not bureaucracy, two pairs of eyes on sensitive paths.`,
            `New endpoints must log structured fields and expose metrics or tracing spans before merge. "We will add monitoring later" is a blocked phrase unless there is a tracked follow-up ticket in the same sprint.`,
            `Post-incident, we link the PR that introduced the bug in the postmortem — not to blame, but so reviewers see which questions would have caught it.`,
          ],
        },
        {
          title: "Culture compounds",
          paragraphs: [
            `Good review culture is a shipping advantage. Teams that review for learning deploy more calmly. Incidents still happen, but fewer start with "we merged Friday at 5 p.m. with no tests."`,
            `We track median time-to-first-review and time-to-merge in our engineering metrics dashboard — not to punish speed, but to spot when queues stall. When median review time doubled during a hiring freeze, we temporarily lowered the small-PR threshold and unblocked the pipeline.`,
            `If your reviews feel like performance reviews, reset: automate style, ask the four questions, praise good work, and keep diffs small enough to read before lunch.`,
          ],
        },
      ],
      takeaway:
        "Move nits to linters and review for behavior, tests, and rollback safety. Small PRs, teaching comments, and explicit praise for good tests beat gatekeeping — and they ship faster.",
      credit:
        "Photo: [Christina @ wocintechchat.com](https://unsplash.com/photos/macbook-pro-on-table-beside-white-imac-and-magic-mouse-hFn_1x7K_wY) on Unsplash",
    }),
  },

  // ── Tech News ───────────────────────────────────────────────────────────
  {
    categorySlug: "tech-news",
    title: "HTTP/3 support in our CDN: what actually changed for users",
    slug: "http3-cdn-rollout-real-impact",
    excerpt:
      "QUIC reduced tail latency on mobile networks in our metrics — not magic, but measurable on high packet loss routes.",
    featuredImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop",
    tags: ["http", "networking", "cdn"],
    content: article({
      lede: `Our CDN enabled HTTP/3 (QUIC) by default last quarter. Marketing called it "the future of the web." I ignored the press release and opened our Real User Monitoring dashboard instead. The story is more nuanced than a headline: meaningful gains on unstable mobile networks, noise-level differences on desktop fiber, and a few enterprise firewall surprises during rollout.`,
      sections: [
        {
          title: "What HTTP/3 actually is",
          paragraphs: [
            `HTTP/3 runs over **QUIC**, a transport protocol built on UDP instead of TCP. It combines TLS 1.3 handshake with connection setup, supports multiplexing without head-of-line blocking at the transport layer, and can migrate connections when a user's IP changes — common when switching from Wi-Fi to cellular mid-session.`,
            `Browsers negotiate it automatically when the CDN advertises \`Alt-Svc: h3\`. Clients fall back to HTTP/2 or HTTP/1.1 when UDP 443 is blocked.`,
            `If you have never inspected protocol version in DevTools, enable the Network column — it is the fastest sanity check that rollout actually reached real browsers.`,
          ],
        },
        {
          title: "What improved in our metrics",
          paragraphs: [
            `After four weeks of parallel HTTP/2 and HTTP/3 serving, RUM showed:`,
          ],
          bullets: [
            `**p95 load time on mobile LTE in Southeast Asia** dropped ~9% on asset-heavy pages (large JS bundles, hero images)`,
            `**Connection recovery** on lossy networks improved — fewer full timeouts when users switched Wi-Fi to cellular mid-request`,
            `**Time to first byte variance** narrowed on high packet-loss routes; median TTFB changed little, tail improved`,
          ],
          paragraphs: [
            `The gains align with QUIC's design goals: better behavior when packets drop, not magically faster servers.`,
            `We exported weekly CSVs from RUM and shared them in #infra — tying protocol changes to charts prevented "HTTP/3 saved us" stories without evidence.`,
          ],
        },
        {
          title: "What did not change",
          paragraphs: [
            `**Desktop users on fiber** saw noise-level differences — often within measurement error. If your audience is mostly office workers on stable connections, HTTP/3 alone will not transform Core Web Vitals.`,
            `**First-time visitors** still pay DNS lookup and TLS costs. HTTP/3 helps most on **subsequent requests** and **connection reuse** when users navigate across pages on the same origin.`,
            `**Origin server CPU** did not decrease. The CDN terminated QUIC at the edge; our API origin still did the same work.`,
          ],
        },
        {
          title: "Rollout ops we would repeat",
          paragraphs: [
            `We kept HTTP/2 enabled in parallel for two weeks and monitored error rates segmented by protocol version. A dashboard panel tracked:`,
          ],
          numbered: [
            `HTTP/3 request share vs HTTP/2 fallback rate`,
            `4xx/5xx rates split by protocol (watch for UDP-related failures)`,
            `p75/p95 LCP by country and connection type`,
          ],
          paragraphs: [
            `Gradual enablement by region let us catch issues before global default. Feature flags at the CDN edge beat a big-bang toggle.`,
          ],
        },
        {
          title: "Enterprise firewall friction",
          paragraphs: [
            `**UDP 443 must be allowed** through corporate firewalls. A handful of enterprise users hit fallback to HTTP/2 — acceptable — but two customers reported security appliances logging QUIC as "unknown UDP" and throttling it.`,
            `Support documented a bypass path: disable HTTP/3 for their account via CDN config until their network team allowlisted QUIC. Long term, firewall vendors are catching up; short term, expect tickets.`,
            `We added a status-page note during rollout so CS could link enterprise customers to a one-paragraph explanation instead of improvising answers.`,
          ],
        },
        {
          title: "How we communicate tech news internally",
          paragraphs: [
            `We sent engineering a one-page summary: metrics, caveats, rollback steps. We sent marketing approved sentences tied to numbers we could defend. "Faster for mobile users on unreliable networks" is accurate. "HTTP/3 makes your site instant" is not.`,
            `Tech news is useful when tied to **your** dashboards. Enable the feature, measure for a week against a baseline, keep or rollback with data. Protocol upgrades are infrastructure wins, not product launches.`,
          ],
        },
        {
          title: "Should you enable it now?",
          paragraphs: [
            `If your CDN offers HTTP/3 with sensible defaults and you have RUM segmented by geography, yes — try it. Cost is usually low; upside concentrates on mobile and emerging markets.`,
            `Compare one week baseline vs one week HTTP/3 default in the same regions. We almost rolled back globally until we filtered India and Southeast Asia — that is where QUIC earned its keep for us.`,
            `If you lack observability, fix that first. You will not know whether QUIC helped or whether an unrelated deploy moved numbers. Measure, then narrate.`,
            `Our rollback plan was a CDN toggle — no redeploy required — which made the experiment low risk.`,
          ],
        },
      ],
      takeaway:
        "HTTP/3 improved tail latency on mobile and lossy networks in our data, not on desktop fiber. Enable it with parallel HTTP/2, watch UDP firewall edge cases, and judge tech news against your own RUM dashboards.",
      credit:
        "Photo: [NASA](https://unsplash.com/photos/photo-of-outer-space-Q1p7bh3SHj8) on Unsplash",
    }),
  },

  // ── Web Development ─────────────────────────────────────────────────────
  {
    categorySlug: "web-development",
    title: "Contact forms on a static site without running our own backend",
    slug: "static-site-contact-forms-serverless",
    excerpt:
      "Netlify Forms worked until spam hit. A small serverless handler with honeypot and rate limit solved it.",
    featuredImage:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&auto=format&fit=crop",
    tags: ["static-sites", "forms", "serverless"],
    content: article({
      lede: `Our marketing site is static on Vercel — fast, cheap, no server to patch. Product wanted a contact form with custom fields and on-brand styling without spinning up Express or paying for a full CRM integration on day one. We tried hosted form services, hit spam on a simpler integration, and landed on a single serverless API route with a honeypot, rate limiting, and email delivery via Resend.`,
      sections: [
        {
          title: "Why static sites still need forms",
          paragraphs: [
            `Static hosting excels at caching HTML and assets at the edge. It does not run long-lived processes. Forms require a POST handler somewhere — browser to server — to validate input, send email or store a lead, and return a response.`,
            `Options: third-party embeds (Typeform, Formspree), platform-native forms (Netlify Forms), or a tiny serverless function on the same provider as the site. We wanted full UI control, so embeds were out after the first design review.`,
            `The handler lives next to the site repo — one deploy pipeline, one rollback lever when spam rules need tuning.`,
          ],
        },
        {
          title: "Attempt one: hosted form SaaS",
          paragraphs: [
            `A hosted service worked in an afternoon — iframe or script embed, submissions in a dashboard. Brand rejected it: wrong fonts, limited field layout, extra cookie banner for the vendor's domain.`,
            `Lesson: **evaluate design constraints before picking infrastructure.** Cheap integration means their UI, not yours.`,
          ],
        },
        {
          title: "Attempt two: Netlify Forms and the spam wave",
          paragraphs: [
            `On a previous project, Netlify Forms was fine until bots found the endpoint. Hundreds of garbage submissions per day, no granular rate control on the free tier, filtering in the dashboard became a chore.`,
            `For the Vercel site we skipped repeating that pattern and went straight to a custom handler where we own validation and abuse controls. The upfront hour building the route paid for itself the first week spam bots returned.`,
          ],
        },
        {
          title: "The serverless handler we shipped",
          paragraphs: [
            `One \`POST /api/contact\` route on Vercel validates JSON, checks a honeypot field, rate limits by IP, and sends mail through Resend:`,
          ],
          code: {
            lang: "typescript",
            body: `export async function POST(req: Request) {
  const body = await req.json();

  // Honeypot — bots fill hidden "website" field
  if (body.website) return Response.json({ ok: true });

  if (!body.email || !body.message) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  await resend.emails.send({
    to: process.env.ADMIN_EMAIL!,
    from: process.env.FROM_EMAIL!,
    replyTo: body.email,
    subject: \`Contact from \${body.name ?? "visitor"}\`,
    text: body.message,
  });

  return Response.json({ ok: true });
}`,
          },
          paragraphs: [
            `The frontend hides \`website\` with CSS off-screen and \`aria-hidden\`. Humans never see it; simple bots fill everything.`,
          ],
        },
        {
          title: "Rate limiting with Upstash Redis",
          paragraphs: [
            `Email providers will suspend you if bots hammer send. We added **10 submissions per IP per hour** using Upstash Redis sliding window counters. Over-limit requests return \`429\` with \`Retry-After\`.`,
            `Legitimate users rarely hit the cap. Spam volume dropped to near zero combined with the honeypot. Logs go to our existing observability stack for anomaly alerts.`,
            `We log submission metadata (timestamp, user agent hash, no message body) for thirty days — enough to tune limits without storing PII in Redis.`,
          ],
        },
        {
          title: "Frontend integration on the static pages",
          paragraphs: [
            `The contact page is a React component calling \`fetch("/api/contact", { method: "POST", ... })\`. Same origin — no CORS headaches. Loading and error states are inline; success shows a thank-you message without navigation.`,
            `We validate email format client-side for UX and server-side for safety. Never trust the browser.`,
            `Accessibility: focus moves to the success alert on submit so screen reader users hear confirmation without hunting for a toast in the corner.`,
          ],
        },
        {
          title: "Cost and maintenance reality",
          paragraphs: [
            `The function cold-starts in under a second — acceptable for a contact form. Resend free tier covers our volume. Redis costs pennies at our traffic. Total overhead: one env var file, one route file, one React form component.`,
            `We document env vars in \`.env.example\` (\`ADMIN_EMAIL\`, \`FROM_EMAIL\`, \`RESEND_API_KEY\`, Upstash URL/token) so staging deploys do not silently drop submissions.`,
            `Static does not mean formless. One small function beats maintaining a full backend for three fields. When volume grows, swap Resend for a CRM webhook — the handler boundary stays the same.`,
            `Until then, three fields and one route are enough for most marketing sites.`,
          ],
        },
      ],
      takeaway:
        "Static sites can ship custom contact forms with one serverless route, a honeypot, IP rate limiting, and transactional email. Own the UI and abuse controls instead of fighting spam in a hosted dashboard.",
      credit:
        "Photo: [Kelly Sikkema](https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-3GZNqL0i0a4) on Unsplash",
    }),
  },
];
