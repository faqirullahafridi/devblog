import { article } from "./blog-article-builder.mjs";

/** @typedef {{ categorySlug: string; title: string; slug: string; excerpt: string; content: string; featuredImage: string; tags?: string[]; isFeatured?: boolean; seoTitle?: string; metaDescription?: string; publishAt?: string }} BlogPost */

/** @type {BlogPost[]} */
export const BLOG_POSTS = [
  // ── APIs ──────────────────────────────────────────────────────────────
  {
    categorySlug: "apis",
    title: "Why we stopped putting filters in query strings for internal APIs",
    slug: "internal-api-filter-design-tradeoffs",
    excerpt:
      "Our list endpoints got slow and confusing. Moving complex filters to POST bodies fixed pagination bugs and made logs readable again.",
    featuredImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop",
    tags: ["rest", "api-design", "backend"],
    isFeatured: true,
    content: article({
      lede: `Last spring our dashboard started timing out on the projects list. The endpoint looked innocent: \`GET /api/projects?status=active&owner=12&tag=payments&sort=-updated\`. Under load, every combination produced a different cache key, our CDN ignored the response, and support could not reproduce customer issues from access logs alone. We did not switch to GraphQL. We kept REST and made a boring change that fixed three separate bugs in one week.`,
      sections: [
        {
          title: "When GET lists stop being cache-friendly",
          paragraphs: [
            `Public read endpoints still use GET — that part did not change. A blog post or product catalog with one or two query params (\`?page=2&limit=20\`) stays cacheable and predictable. Internal admin tools are different. Our projects list accumulated six optional filters, three sort fields, and free-text search. Each permutation became a unique URL in Varnish, so nothing hit cache even when two PMs looked at nearly the same view.`,
            `Worse, some clients URL-encoded filters differently. \`tag=payments,infra\` and \`tag=payments%2Cinfra\` parsed the same in application code but produced different log lines. When finance asked why "the same report" returned different row counts, we spent an afternoon diffing query strings instead of fixing data.`,
          ],
        },
        {
          title: "The POST /search split we adopted",
          paragraphs: [
            `We drew a line: **simple lists stay on GET**, but **anything with more than two filter dimensions moves to \`POST /api/projects/search\`**. The body holds filters, cursor, and sort. Logs store a hash of the body when we need audit trails, and OpenAPI documents the request schema so TypeScript clients get compile-time checks.`,
            `The search handler shares the same repository layer as the old GET list. We did not fork business logic — only the transport shape changed. That made the migration a two-day refactor instead of a rewrite.`,
          ],
          code: {
            lang: "json",
            body: `{
  "filters": {
    "status": ["active", "paused"],
    "ownerId": 12,
    "tags": ["payments"]
  },
  "sort": [{ "field": "updatedAt", "dir": "desc" }],
  "cursor": "eyJpZCI6NDQyfQ",
  "limit": 50
}`,
          },
        },
        {
          title: "Pagination finally became honest",
          paragraphs: [
            `Offset pagination with five filters was returning duplicates after rows shifted between pages. A project moved from \`paused\` to \`active\` between page 2 and page 3; it appeared twice in export CSVs that ops used for billing reconciliation.`,
            `Cursor pagination with a stable sort in the JSON body fixed it. The cursor encodes the last seen \`(updatedAt, id)\` tuple, so inserts and status changes do not shuffle earlier pages. We documented that exports must use the search endpoint with \`limit=500\` and follow cursors until empty — never raw offset loops.`,
          ],
        },
        {
          title: "Validation got explicit instead of tribal",
          paragraphs: [
            `OpenAPI models the search request. Clients stopped sending \`status=Active\` vs \`status=active\` and wondering why results differed. Enum validation returns 400 with a field path, not an empty list that looks like "no data."`,
            `We added a CI check that regenerates the SDK from the spec on every PR. When someone adds a filter, the schema change is visible in the diff. New hires read one YAML file instead of asking in Slack which params are actually supported.`,
          ],
          table: {
            headers: ["Filter dimension", "GET allowed?", "Notes"],
            rows: [
              ["Single status", "Yes", "`?status=active` stays on GET"],
              ["Owner + status", "Yes", "Two dimensions max on list route"],
              ["Tags + date range + sort", "No", "Use POST /search"],
              ["Full-text search", "No", "Always POST body"],
            ],
          },
        },
        {
          title: "Database indexes matched reality",
          paragraphs: [
            `With fifty query-string permutations, we guessed at composite indexes. Postgres \`pg_stat_statements\` showed the top ten filter tuples only after we logged normalized search bodies. We added \`(status, owner_id, updated_at DESC)\` for the common admin view and dropped two unused partial indexes that slowed writes.`,
            `Query planning meetings got shorter because the logged JSON body matched what the ORM generated. No more "works on my machine with three params" surprises in staging.`,
          ],
        },
        {
          title: "What we tell new teams",
          paragraphs: [
            `Document both styles in the API guide so new hires do not cargo-cult GET everywhere. Public integrations keep cache-friendly reads. Internal admin tools prefer the search endpoint. If your list endpoint has grown six optional query params, try a one-week experiment: log the top ten param combinations, check slow-query reports, and see whether a search body would simplify indexing. Often the answer is yes.`,
          ],
        },
      ],
      takeaway:
        "Keep GET for simple, cacheable reads; move multi-dimensional filters to a documented POST search body so pagination, validation, and indexes stay aligned with how clients actually query.",
      credit:
        "Photo: [Christina @ wocintechchat.com](https://unsplash.com/photos/macbook-pro-on-table-beside-white-imac-and-magic-mouse-hFn_1x7K_wY) on Unsplash",
    }),
  },

  // ── Blogging ──────────────────────────────────────────────────────────
  {
    categorySlug: "blogging",
    title: "Publishing twice a month beat my daily posting streak",
    slug: "twice-monthly-blogging-rhythm",
    excerpt:
      "I burned out chasing daily posts. A slower cadence with an outline template produced better traffic and fewer half-finished drafts.",
    featuredImage:
      "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["writing", "content", "habits"],
    content: article({
      lede: `I tried a 30-day blogging streak in 2024. By day eleven I was rewriting introductions at midnight and shipping posts I would not put on a resume. Traffic went up briefly, then flatlined — readers could tell which pieces I cared about. Now I publish twice a month, always on Tuesday mornings, and the archive finally reads like something I would recommend to a colleague.`,
      sections: [
        {
          title: "Why daily posting broke my quality bar",
          paragraphs: [
            `The streak started as a challenge in a Discord server. Day one felt great. Day eight I published a generic "top ten VS Code extensions" list because I had nothing else in the hopper. It got clicks from Hacker News briefly, then zero comments and a bounce rate over 80% in Plausible.`,
            `I deleted that post six weeks later. The harm was not the bad article alone — it trained me to equate publishing with progress. Half-finished drafts piled up in Obsidian while I chased word count. My better posts, the ones about debugging session cookies behind Vercel, sat unpublished because they needed two more hours I did not have on a streak night.`,
          ],
        },
        {
          title: "The outline template I still use",
          paragraphs: [
            `Every post starts in the same Google Doc with four headings: **Problem in one sentence**, **What I tried**, **What actually worked**, and **One link**. The problem line forces specificity — "our admin preview broke CSP" beats "thoughts on web dev." The wrong approach section saves me from sounding like I always knew the answer.`,
            `The link at the end is usually a doc, tool, or PR I referenced. Readers email me less often asking for context because the source is right there. Filling that template takes about twenty minutes before I write prose.`,
          ],
          bullets: [
            "Problem in one sentence (who has it, when)",
            "What I tried (including the wrong approach)",
            "What actually worked (code, screenshot, or checklist)",
            "One link to a tool or doc I used",
          ],
        },
        {
          title: "Batching research, draft, and edit days",
          paragraphs: [
            `Scheduling matters as much as the template. I batch research on Friday afternoon — read source code, collect metrics, screenshot dashboards. Saturday I draft without editing. Monday night I edit with fresh eyes and cut at least 15% of the words. Tuesday at 9am Eastern the post goes live and I share it once on Mastodon and LinkedIn.`,
            `No heroics, no midnight publishes. If a draft is not ready Monday, I skip the Tuesday slot instead of shipping garbage. Missing one date per quarter has never hurt growth; shipping mediocrity did.`,
          ],
          table: {
            headers: ["Day", "Task", "Time box"],
            rows: [
              ["Friday", "Research + outline", "90 min"],
              ["Saturday", "First draft", "2 hours"],
              ["Monday", "Edit + title/SEO", "90 min"],
              ["Tuesday", "Publish + one share", "30 min"],
            ],
          },
        },
        {
          title: "Specific titles beat generic guides",
          paragraphs: [
            `For a developer blog, specificity wins in search console. "How we fixed session cookies behind Vercel" outperformed "Complete Guide to Web Development" by 4x in organic clicks over ninety days. Titles can be practical without being clickbait — state the situation, not the hype.`,
            `I keep a swipe file of posts I clicked this month. Almost none start with "Ultimate" or "Complete." They start with a bug, a bill, or a conversation someone avoided.`,
          ],
        },
        {
          title: "One category before you branch",
          paragraphs: [
            `If you are starting out, pick one category you would happily talk about at lunch — APIs, CSS, career, whatever you already debug at work. Write three posts in that lane before branching. Your archive looks coherent when someone lands on /blog from a single article.`,
            `Topical focus also helps later if you monetize or apply for AdSense. Reviewers scroll an index page; scattered AI-ish listicles raise flags. Three solid war stories in one lane signal a real author.`,
          ],
        },
        {
          title: "Twice a month is enough to compound",
          paragraphs: [
            `Twelve posts a year sounds small until you realize each one can rank for years. My April post on filter design still brings newsletter signups. Consistency at a humane pace beat the burst-and-burn streak. Start the brag-doc habit for your own archive: every published URL, one line on what problem it solved. Promotion conversations and traffic audits both get easier.`,
          ],
        },
      ],
      takeaway:
        "A twice-monthly rhythm with a fixed outline and batch schedule produces better posts than daily streaks — specificity and editing time matter more than publish frequency.",
      credit: "Photo: [Pixabay](https://www.pexels.com/photo/pen-on-notebook-261662/) on Pexels",
    }),
  },

  // ── Career Development ──────────────────────────────────────────────────
  {
    categorySlug: "career-development",
    title: "The junior-to-mid promotion conversation I avoided for too long",
    slug: "junior-to-mid-promotion-conversation",
    excerpt:
      "Waiting for my manager to notice my work did not work. A simple brag document and a quarterly check-in changed the trajectory.",
    featuredImage:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop",
    tags: ["career", "management", "growth"],
    content: article({
      lede: `Eighteen months into my first full-time role I was doing mid-level tickets — migrations, on-call rotations, mentoring interns — but my title still said Junior. I assumed performance reviews would catch up. They did not, because my manager was juggling hiring and had no single document summarizing my impact. A brag doc and a direct ninety-day plan changed the trajectory four months later.`,
      sections: [
        {
          title: "Waiting to be noticed does not work",
          paragraphs: [
            `Review season arrived and my manager had forty bullet points from six reports. Mine blended into "shipped features" and "good collaborator." The work that actually moved metrics — the connection pool change, the onboarding doc QA still uses — lived in merged PRs nobody opened during calibration.`,
            `I was not angry at my manager. The system rewards what is easy to recall in a thirty-minute calibration slot. Invisible work stays invisible unless you make it legible.`,
          ],
        },
        {
          title: "Building a brag document that managers trust",
          paragraphs: [
            `A senior engineer suggested a **brag document**: a running list of shipped work, incidents I helped resolve, and cross-team collaborations. Not fluffy adjectives — links to PRs, incident postmortems, and customer threads. I created a Notion page and updated it every Friday for ten minutes.`,
            `Each entry followed the same shape: **date**, **what shipped or resolved**, **metric or quote if available**, **link**. "Helped team" did not count. "Wrote onboarding doc linked in #qa twice last month" did.`,
          ],
          bullets: [
            "Led Postgres pool change: API p95 800ms → 220ms (PR #412)",
            "Onboarding doc for QA hires — linked in Slack twice in March",
            "On-call coverage two weeks; one SEV-2 resolved in 40 minutes",
          ],
        },
        {
          title: "The 1:1 where I stopped being vague",
          paragraphs: [
            `Before my next 1:1 I sent three bullets from the brag doc — not as a demand, but as context. I asked what mid-level looked like on our ladder and where I already matched versus gaps. The conversation shifted from "keep doing great work" to a concrete list: own a service area, drive a small design doc, present at guild meeting.`,
            `We agreed on a **ninety-day plan** with those expectations written in the doc. My manager could forward it to their manager without reconstructing the story from memory.`,
          ],
        },
        {
          title: "Ninety days with explicit milestones",
          paragraphs: [
            `Month one I owned error budgets for the billing service and wrote a one-page design doc for retry logic. Month two I presented the doc at backend guild — terrifying, but on the plan. Month three I mentored a new intern through their first production PR.`,
            `I updated the brag doc after each milestone so review was not a archaeology project. When calibration came, the evidence was already on the page. I got the title bump on month four.`,
          ],
          table: {
            headers: ["Expectation", "Evidence I collected"],
            rows: [
              ["Own a service area", "Billing retries design doc + on-call notes"],
              ["Drive a design doc", "Guild presentation slides + PR thread"],
              ["Mentorship", "Intern PR #501 review summary"],
              ["Impact metrics", "p95 latency chart from Datadog"],
            ],
          },
        },
        {
          title: "What I would tell junior me",
          paragraphs: [
            `Start the brag doc now, even if promotion feels far away. Performance reviews, referral letters, and interview prep all pull from the same material. Update every Friday before you log off — ten minutes, no perfectionism.`,
            `Promotion conversations get less awkward when the facts are already written. You are not bragging; you are helping your manager do their job in a crowded calendar.`,
          ],
        },
        {
          title: "After the title change",
          paragraphs: [
            `The title did not magically change my day job — I was already doing the work. What changed was bandwidth to say no to randomization and credibility in cross-team meetings. I still maintain the brag doc every Friday. Mid-level is not a finish line; it is a clearer contract about scope.`,
            `Two years later I mentor juniors on the same template. The ones who show up with links beat the ones who say they are "ready" without evidence. Calibration rooms are loud and fast; your manager needs ammunition, not vibes.`,
          ],
        },
      ],
      takeaway:
        "Maintain a fact-based brag document with links and metrics, then align with your manager on written mid-level expectations — waiting for review season to notice your work is slower than making impact legible.",
      credit:
        "Photo: [Brooke Cagle](https://unsplash.com/photos/group-of-people-sitting-indoors-hFWRk4F-0nU) on Unsplash",
    }),
  },

  // ── Cloud Computing ─────────────────────────────────────────────────────
  {
    categorySlug: "cloud-computing",
    title: "Three line items on our first real AWS bill",
    slug: "first-aws-bill-surprises",
    excerpt:
      "NAT gateways, orphaned EBS volumes, and idle RDS instances showed up after we left the free tier. Here is what we changed.",
    featuredImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop",
    tags: ["aws", "cloud", "cost"],
    content: article({
      lede: `Our staging environment was "just for demos," so nobody watched costs. Then finance forwarded a $640 invoice for a month we barely used the app. Three line items explained most of it — none were secrets, all were boring. Fixing them taught us cloud adulthood faster than any certification.`,
      sections: [
        {
          title: "NAT Gateway hourly charges dominated",
          paragraphs: [
            `Two private subnets routed outbound traffic through NAT gateways in \`us-east-1\`. The gateways cost more than the EC2 instances themselves — roughly $0.045/hour each plus per-GB processing. Staging workers pulled Docker images and npm packages through NAT all day while engineers were asleep.`,
            `We moved non-sensitive staging workers to public subnets with tight security groups — only 443 outbound to known registries. Production kept private subnets but added **VPC endpoints for S3** so artifact uploads did not hairpin through NAT.`,
            `The change felt risky until we drew the subnet map on a whiteboard. Staging had no PCI data and no customer PII — the NAT tax was pure habit from copying production topology verbatim.`,
          ],
        },
        {
          title: "EBS volumes outlived their instances",
          paragraphs: [
            `Terraform destroyed EC2 nodes but left 200 GB of EBS volumes "just in case." AWS bills \`available\` volumes forever at about $0.10/GB-month. Nobody noticed until Cost Explorer showed \`EC2 - Other\` climbing while instance count stayed flat.`,
            `A weekly cron runs \`aws ec2 describe-volumes --filters Name=status,Values=available\` and posts anything older than seven days to #infra-alerts. Deleting orphaned volumes is scary once; automating the nag is not.`,
          ],
          code: {
            lang: "bash",
            body: `aws ec2 describe-volumes \\
  --filters Name=status,Values=available \\
  --query 'Volumes[*].[VolumeId,Size,CreateTime]' \\
  --output table`,
          },
        },
        {
          title: "RDS we forgot to stop",
          paragraphs: [
            `Integration tests hit a \`db.t3.medium\` running 24/7. Snapshots ran Friday; nobody stopped the instance over weekends. \`stop-db-instance\` with automated \`start-db-instance\` Monday morning saved roughly 30% on that line item alone.`,
            `Production RDS stays always-on — this was purely non-prod discipline. The mistake was treating staging databases like pets with infinite budget.`,
          ],
        },
        {
          title: "Tagging so Cost Explorer could shame the right team",
          paragraphs: [
            `We tagged everything with \`Environment\` and \`Owner\`. Cost allocation reports finally answered "who spun this up?" without a Slack archaeology thread. Terraform modules now require tags or \`apply\` fails in CI.`,
          ],
          table: {
            headers: ["Surprise", "Monthly cost (approx)", "Fix"],
            rows: [
              ["Dual NAT gateways", "$220", "Endpoints + subnet layout"],
              ["Orphan EBS 200 GB", "$20", "Weekly available-volume cron"],
              ["Idle RDS t3.medium", "$85", "Weekend stop/start"],
              ["Untagged resources", "—", "Required tags in Terraform"],
            ],
          },
        },
        {
          title: "The unglamorous monthly ritual",
          paragraphs: [
            `None of this is clever architecture — it is finance hygiene. On the first Monday of each month someone pulls last month's bill, sorts by service, and posts the top three rows in #engineering. If a row is new or up 20%, we assign an owner before standup ends.`,
            `Before you add a second region or microservice, run the same sort. The top three rows usually point at fixes cheaper than rewriting architecture.`,
            `We screenshot Cost Explorer filters and attach them to the Slack post so nobody argues about date ranges. Boring process beats surprise invoices every time.`,
          ],
        },
        {
          title: "What we still watch",
          paragraphs: [
            `Data transfer between AZs, idle Elastic IPs, and old AMIs in shared accounts still sneak in. We set a billing alarm at 80% of budget — not to block work, but to force a conversation before finance forwards the PDF again.`,
            `Last quarter cross-AZ traffic spiked when a worker started reading S3 through the wrong endpoint. VPC endpoints paid back their setup time in one invoice cycle. The lesson repeats: staging is not free because nobody demos on Friday.`,
          ],
        },
        {
          title: "Sharing the bill review with engineers",
          paragraphs: [
            `Finance used to send PDFs only to our EM. Now one engineer joins the monthly review rotation. Seeing dollar amounts next to resource names changes behavior faster than wiki pages about tagging policy. New hires learn cost awareness before they provision their first sandbox.`,
            `The first rotation volunteer deleted three orphaned volumes and saved more than the hour they spent in Cost Explorer. That story spread faster than any policy doc.`,
          ],
        },
      ],
      takeaway:
        "After the free tier, NAT gateways, orphaned EBS volumes, and always-on non-prod RDS dominate surprise bills — tag resources, automate orphan detection, and review Cost Explorer monthly.",
      credit: "Photo: [NASA](https://unsplash.com/photos/photo-of-outer-space-Q1p7bh3SHj8) on Unsplash",
    }),
  },

  // ── Cybersecurity ───────────────────────────────────────────────────────
  {
    categorySlug: "cybersecurity",
    title: "A missing Content-Security-Policy header cost us a weekend",
    slug: "csp-header-xss-lesson",
    excerpt:
      "A stored XSS in a comment field slipped past React escaping because of a legacy admin preview. CSP would have limited the blast radius.",
    featuredImage:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop",
    tags: ["security", "csp", "xss"],
    content: article({
      lede: `A security researcher emailed us on a Friday: they could run JavaScript in an old admin preview pane that rendered raw HTML from comments. Modern public pages escaped output correctly; the preview iframe did not. Severity was medium — admin-only — but embarrassing. We patched the sanitizer within hours; CSP took a week and taught us more about our frontend than any audit spreadsheet.`,
      sections: [
        {
          title: "How the preview pane diverged from production",
          paragraphs: [
            `The public comment thread used React with escaped text nodes. The admin preview was a legacy iframe that called \`dangerouslySetInnerHTML\` before we renamed it — literally \`innerHTML = comment.body\` in a jQuery-era helper nobody touched for two years. Stored XSS payload in a comment rendered live when a moderator opened preview.`,
            `The researcher demonstrated \`fetch\` exfiltration to their server. Real attackers would have targeted session cookies; ours were HttpOnly, which limited impact but did not excuse the bug.`,
            `The preview route was not in our security scan scope because it lived under \`/admin/legacy\`. That gap is closed now — internal URLs get the same DAST pass as public ones.`,
          ],
        },
        {
          title: "Immediate patch vs defense in depth",
          paragraphs: [
            `We routed preview through the same DOMPurify config as production within hours. That closed the hole. The longer fix was **Content-Security-Policy** so the next missed sanitizer would not execute arbitrary scripts.`,
            `CSP is defense in depth, not a substitute for sanitization. We kept both.`,
          ],
          code: {
            lang: "",
            body: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; frame-ancestors 'none';`,
          },
        },
        {
          title: "Rolling CSP without breaking analytics",
          paragraphs: [
            `Inline Google Tag Manager snippets violated \`script-src 'self'\` immediately. We used **Report-Only** mode first, collected violations in a small endpoint backed by a week of logs, then moved allowed scripts to external files or nonces.`,
            `Report-Only headers looked like this until we were confident:`,
          ],
          code: {
            lang: "",
            body: `Content-Security-Policy-Report-Only: default-src 'self'; report-uri /api/csp-report`,
          },
        },
        {
          title: "Lessons I keep repeating to new hires",
          paragraphs: [
            `Escape on output per context — HTML, URL, JavaScript — not one global filter. Admin tools need the same bar as public routes; attackers scan \`/admin\` paths too. CSP violation logs surfaced three other inline scripts we forgot about in email template previews.`,
          ],
          numbered: [
            "Escape on output per context (HTML, URL, JS)",
            "CSP is defense in depth, not a substitute for sanitization",
            "Admin tools need the same bar as public routes",
            "Start with Report-Only before enforce mode",
          ],
        },
        {
          title: "What our violation log caught",
          paragraphs: [
            `One week of reports showed stray \`onclick=\` handlers in an old settings page and a CDN script loaded over HTTP on staging. Neither was exploitable the same way as the preview bug, but enforce mode would have broken releases until fixed. Report-Only paid for itself before we flipped the switch.`,
          ],
          table: {
            headers: ["Violation source", "Action"],
            rows: [
              ["GTM inline script", "Moved to external file"],
              ["Legacy onclick in settings", "Refactored to addEventListener"],
              ["HTTP CDN on staging", "Upgraded to HTTPS"],
              ["Preview iframe", "DOMPurify + removed innerHTML"],
            ],
          },
        },
        {
          title: "If you have not sent CSP headers yet",
          paragraphs: [
            `Start with report-only this sprint. Wire a tiny POST endpoint that logs JSON reports, deploy the header on staging, click through your app for an hour, fix what screams. Enforce on admin first, then public — our order reduced weekend pages from on-call.`,
            `We kept Report-Only on marketing pages an extra week because a third-party chat widget loaded scripts from two domains we forgot about. Fixing that in enforce mode would have blocked launches. Patience in report mode is cheaper than rollback panic.`,
          ],
        },
        {
          title: "The weekend timeline we wish we had skipped",
          paragraphs: [
            `Friday: researcher email. Saturday: hotfix sanitizer + report-only deploy. Sunday: triage violation logs and remove inline handlers. Monday: enforce on admin, staging green. Tuesday: enforce on public. Document the sequence in your runbook so the next XSS report is boring instead of heroic.`,
            `Our postmortem action item was simple: legacy admin routes must use the same render path as production or be deleted. Two iframe previews died that week.`,
          ],
        },
      ],
      takeaway:
        "Patch XSS at the sanitizer immediately, then deploy CSP in Report-Only mode to find stray scripts before enforcement — admin preview routes deserve the same escaping rules as public pages.",
      credit:
        "Photo: [Adi Goldstein](https://unsplash.com/photos/blue-and-white-light-illustration-FQBJs_XxsAM) on Unsplash",
    }),
  },

  // ── Data Science ────────────────────────────────────────────────────────
  {
    categorySlug: "data-science",
    title: "Pandas groupby mistakes from my first stakeholder demo",
    slug: "pandas-groupby-demo-mistakes",
    excerpt:
      "Double-counting users after a merge almost shipped to leadership. A few groupby habits now save me before every presentation.",
    featuredImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop",
    tags: ["pandas", "python", "analytics"],
    content: article({
      lede: `I once presented a chart showing "daily active users" that was wrong by 18%. I had merged events with a promotions table on \`user_id\` without deduplicating promo rows. Every click counted twice for users enrolled in multiple campaigns. Leadership almost budgeted off the chart; a QA analyst spot-checking user 42 saved us.`,
      sections: [
        {
          title: "The merge that duplicated users",
          paragraphs: [
            `Events had one row per click. Promotions had one row per user per campaign — so power users appeared three times. Inner join on \`user_id\` tripled their events before \`groupby\`. The line chart looked exciting. It was fiction.`,
            `The fix was not exotic: dedupe promotions to one row per user for that analysis, or merge on \`(user_id, campaign_id)\` when campaign mattered. I chose dedupe because the slide title said "daily active users," not "daily active enrollments."`,
          ],
        },
        {
          title: "Checklist before any notebook hits Slack",
          paragraphs: [
            `Now I run the same checklist before exporting a PNG to Google Slides. It takes twelve minutes and has prevented two other merge bugs this quarter.`,
          ],
          numbered: [
            "Use explicit .agg() — never assume count means unique users",
            "Validate row counts after merges: assert len(merged) <= len(left) when one-to-many is intentional",
            "Spot-check one user manually: filter raw events for ID 42, compare to aggregated row",
            "Export the pandas or SQL code in the slide appendix for audit",
          ],
        },
        {
          title: "Explicit groupby instead of implicit counts",
          paragraphs: [
            `Stakeholders care about trends, not clever pivots. A boring correct chart beats a flashy wrong one.`,
          ],
          code: {
            lang: "python",
            body: `daily = (
    events.assign(day=events["ts"].dt.date)
    .groupby("day", as_index=False)
    .agg(
        active_users=("user_id", "nunique"),
        events=("event_id", "count"),
    )
)
assert daily["active_users"].max() <= events["user_id"].nunique()`,
          },
        },
        {
          title: "When to use nunique vs count",
          paragraphs: [
            `\`count\` includes duplicate user rows after a bad merge. \`nunique\` on \`user_id\` answers "how many people" for DAU. For revenue or events totals, \`count\` or \`sum\` on event ids is correct — but only if the grain of the dataframe matches the definition on the slide title.`,
            `I write the definition in a comment at the top of every notebook: "DAU = distinct user_id with any event, UTC day boundary." If the chart title and comment disagree, I fix before plotting.`,
            `Leadership once asked why DAU dipped on a promo day — the answer was dedupe logic, not product failure. Being able to replay the notebook cell in the meeting beat hand-waving.`,
          ],
          table: {
            headers: ["Metric", "Aggregation", "Common mistake"],
            rows: [
              ["Daily active users", "nunique(user_id)", "count after bad merge"],
              ["Total events", "count(event_id)", "sum of duplicated rows"],
              ["Revenue", "sum(amount)", "joining on wrong grain"],
              ["Conversion rate", "ratio at user grain", "averaging daily rates"],
            ],
          },
        },
        {
          title: "Spot-check one user every time",
          paragraphs: [
            `Pick a user id you know — internal tester, your own account, user 42. Filter raw events, hand-count for one day, compare to the aggregated row. Mismatch means stop, do not present. This feels junior; it is how QA caught my 18% error in a five-minute side-by-side.`,
            `We added a "sanity row" to the slide appendix: user 42, March 3, raw count vs aggregated. Executives rarely read it; analysts always do.`,
          ],
        },
        {
          title: "Data science as careful counting",
          paragraphs: [
            `Product analytics is mostly careful counting with good labels. Treat every merge like a code review: what is the grain, what duplicates, what does the stakeholder think the column means? The appendix code in slides turned into a trust signal — finance started asking for it proactively.`,
            `I still present the checklist slide before the chart in executive meetings. Five minutes of methodology saves forty minutes of "where did this number come from?" later. Wrong charts erode trust faster than late delivery.`,
          ],
        },
        {
          title: "Notebook hygiene that stuck",
          paragraphs: [
            `Every notebook gets a top cell with metric definition, data source, and refresh timestamp. I name files \`2024-03-dau-events.ipynb\` instead of \`analysis_final_v3.ipynb\`. Small habits, but auditors and future-you will thank the person who wrote them.`,
            `Shared drives fill with "copy of copy" notebooks. Naming discipline is the cheapest deduplication tool we have.`,
          ],
        },
      ],
      takeaway:
        "Before stakeholder demos, dedupe merge keys, use nunique for user counts, assert row counts after joins, and spot-check one user — most analytics bugs are duplicated rows, not wrong formulas.",
      credit:
        "Photo: [Luke Chesser](https://unsplash.com/photos/graphs-of-performance-analytics-on-a-laptop-screen-JKUTrJ4vK00) on Unsplash",
    }),
  },

  // ── Database ────────────────────────────────────────────────────────────
  {
    categorySlug: "database",
    title: "When third normal form slowed us down more than denormalization",
    slug: "normalization-vs-denormalization-tradeoff",
    excerpt:
      "A reporting query joined nine tables. We duplicated two columns with a clear invalidation rule and cut report time from 12s to 400ms.",
    featuredImage:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop",
    tags: ["database", "modeling", "performance"],
    content: article({
      lede: `Our inventory report joined products, warehouses, shipments, line items, and three lookup tables. Correct? Yes. Fast? No — twelve seconds on production data during month-end close when finance refreshed dashboards every few minutes. We denormalized two columns onto a snapshot table with a documented trigger and cut report time to under half a second. Purists winced; finance stopped paging us.`,
      sections: [
        {
          title: "Why the normalized query hurt at month-end",
          paragraphs: [
            `The SQL was textbook 3NF. Every attribute lived where it belonged. Postgres spent most of the twelve seconds joining \`shipments\` to \`warehouses\` to \`products\` for labels that changed rarely — warehouse name and last shipped timestamp.`,
            `Explain analyze showed nested loops on a wide fact table because we filtered snapshots by date while joining dimension tables for display columns. Indexes helped marginally; the join count was the problem.`,
            `Finance refreshed the dashboard every few minutes during close. Twelve seconds felt like an outage when twelve analysts had the same tab open.`,
          ],
        },
        {
          title: "What we denormalized and what stayed canonical",
          paragraphs: [
            `We copied **\`warehouse_name\`** and **\`last_shipped_at\`** onto \`inventory_snapshots\`. The normalized \`warehouses\` and \`shipments\` tables remain the source of truth; snapshot columns are derived read models.`,
            `Rules we wrote in the same design doc: denormalize only for read-heavy paths with measurable pain; one source of truth stays normalized; document invalidation in the migration that adds columns.`,
          ],
        },
        {
          title: "Trigger-based refresh instead of hope",
          paragraphs: [
            `If you cannot explain how stale data gets refreshed, do not ship the shortcut. We used a trigger when shipments close:`,
          ],
          code: {
            lang: "sql",
            body: `CREATE OR REPLACE FUNCTION refresh_inventory_snapshot()
RETURNS trigger AS $$
BEGIN
  UPDATE inventory_snapshots s
  SET
    warehouse_name = w.name,
    last_shipped_at = NEW.shipped_at
  FROM warehouses w
  WHERE s.product_id = NEW.product_id
    AND s.warehouse_id = NEW.warehouse_id
    AND w.id = NEW.warehouse_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_inventory_snapshot
AFTER UPDATE ON shipments
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'closed')
EXECUTE FUNCTION refresh_inventory_snapshot();`,
          },
        },
        {
          title: "Measuring before and after",
          paragraphs: [
            `We captured p95 report latency in Grafana before touching schema — 12.4s at the 95th percentile. After backfill and trigger deploy, p95 dropped to 380ms on the same hardware. No application code changed except removing joins from the report query.`,
            `We kept the old query behind a feature flag for one week. Side-by-side screenshots in the PR convinced skeptics the numbers were real.`,
          ],
          table: {
            headers: ["Metric", "Before", "After"],
            rows: [
              ["Report p95 latency", "12.4s", "380ms"],
              ["Tables joined", "9", "1 (+ indexes)"],
              ["Stale label incidents", "0", "0 (6 months)"],
              ["Migration risk", "—", "Documented trigger"],
            ],
          },
        },
        {
          title: "When we say no to denormalization",
          paragraphs: [
            `Write-heavy paths still read normalized tables. We rejected duplicating price onto line items because pricing changes hourly and marketing runs flash sales — invalidation would be harder than the join. Normalization stays the default; denormalization is a performance tool with maintenance cost.`,
            `If the column changes more than once a week under business pressure, keep it normalized until you can automate refresh with confidence.`,
          ],
        },
        {
          title: "Documenting the tradeoff for the next hire",
          paragraphs: [
            `The migration file includes a comment block: why columns exist, trigger name, backfill script, and "do not edit warehouse_name on snapshots manually." Six months later a new engineer asked in Slack; they got a link to the migration instead of folklore.`,
            `We also added a one-page ADR in the repo docs folder. Purists still prefer normalized queries for ad-hoc exploration — that is fine. The snapshot table is for the report, not the source of truth for edits.`,
            `ADRs age better than Slack threads when someone asks why a column looks redundant.`,
          ],
        },
        {
          title: "Backfill without locking finance out",
          paragraphs: [
            `Backfill ran in batches off-peak with \`statement_timeout\` raised only for the migration role. Finance could still refresh dashboards; they just saw old latency until batch three completed. Communicate the window — silent migrations create phantom "regressions" in Slack when latency jumps back down.`,
            `Batch size was ten thousand snapshot rows. We logged progress to Grafana so on-call knew the trigger was still running and not stuck.`,
          ],
        },
      ],
      takeaway:
        "Normalize by default; denormalize display columns onto read-heavy snapshots only with measured pain, a canonical source of truth, and automated invalidation you can explain in the migration.",
      credit:
        "Photo: [Tim Gouw](https://unsplash.com/photos/closeup-photo-of-computer-keyboard-mCuh3aaCQzk) on Unsplash",
    }),
  },

  // ── DevOps ──────────────────────────────────────────────────────────────
  {
    categorySlug: "devops",
    title: "GitHub Actions workflows our team actually runs on every PR",
    slug: "github-actions-pr-workflows-that-stick",
    excerpt:
      "We deleted half our CI jobs. Lint, typecheck, unit tests, and a preview deploy are what remain — and PRs merge faster.",
    featuredImage:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&auto=format&fit=crop",
    tags: ["ci-cd", "github-actions", "devops"],
    isFeatured: true,
    content: article({
      lede: `We once had fourteen GitHub Actions workflows firing on every push. Contributors waited twenty minutes for green checks. Flaky E2E tests blocked typo fixes. Morale dropped. We cut to four required checks, moved heavy E2E to nightly, and PR velocity went up because developers trust that red means something real.`,
      sections: [
        {
          title: "The CI sprawl problem",
          paragraphs: [
            `Each squad added a workflow when they felt pain — Lighthouse, bundle size, SQL lint, duplicate code detection, three different E2E suites. None were bad alone. Together they meant every one-line README fix waited behind a Playwright flake in staging.`,
            `Median time-to-green was nineteen minutes. Developers pushed "fix ci" commits without reading logs. Branch protection required ten checks; people admin-merged anyway.`,
            `We surveyed the team: which checks caught real bugs in the last ninety days? Four names appeared on every list. The rest were delete candidates.`,
          ],
        },
        {
          title: "Four jobs that block merge",
          paragraphs: [
            `We deleted half the workflows and demoted the rest to informational or nightly. Required checks now fit on one slide for onboarding.`,
            `Median time-to-green dropped from nineteen minutes to about six. That single metric convinced leadership the deletions were safe.`,
          ],
          table: {
            headers: ["Job", "Purpose", "Typical time"],
            rows: [
              ["lint", "ESLint + Prettier diff", "45s"],
              ["typecheck", "tsc --noEmit", "90s"],
              ["test", "Unit tests + coverage threshold", "2m"],
              ["preview", "Deploy PR to Vercel preview", "3m"],
            ],
          },
        },
        {
          title: "Minimal workflow we copy into new repos",
          paragraphs: [
            `Frozen lockfile installs, cache keyed by \`pnpm-lock.yaml\`, and \`--run\` so Vitest exits in CI. No matrix until we need it.`,
          ],
          code: {
            lang: "yaml",
            body: `on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test -- --run`,
          },
        },
        {
          title: "Nightly and release paths for heavy work",
          paragraphs: [
            `E2E against staging runs on a cron at 2am UTC. Failures page #qa but do not block typo PRs. Production releases run a smoke suite before promote — different trust bar than every push.`,
            `Branch protection enforces only the four PR jobs. Everything else posts Slack with a yellow icon. Contributors learned the difference within a week.`,
            `Release smoke tests include login, checkout, and one refund path — fifteen minutes total. Enough to catch deploy misconfig, not enough to delay hotfixes.`,
          ],
        },
        {
          title: "Coverage threshold without gaming",
          paragraphs: [
            `Unit tests must stay above 72% line coverage on \`src/\` — low enough to avoid snapshot theater, high enough to catch deleted tests. Coverage drops block merge; spikes do not earn badges. We removed per-file gates that encouraged meaningless asserts.`,
            `When coverage dipped, the fix was almost always a missing test on a new util — not a rush to cover dead UI branches. The threshold matches how much unit tests actually protect our monorepo.`,
          ],
        },
        {
          title: "How to audit your own CI",
          paragraphs: [
            `List jobs by median duration from GitHub insights. Ask whether each one must block merge. If it failed last week, did anyone fix root cause or just re-run? Flaky required checks are worse than no checks — they train ignore reflexes.`,
            `Export the last thirty days of workflow runs and sort by failure rate. Anything above 5% failure without a fix ticket gets demoted from required. We found two E2E suites failing mostly on timeout, not assertions.`,
          ],
        },
        {
          title: "What we added back slowly",
          paragraphs: [
            `One workflow returned as informational only: bundle size comment on PRs over 5% delta. Teams opt in to watching it. Restraint kept trust in the four reds that still matter.`,
            `We revisit the required list quarterly. If a new check blocked more than two merges with false positives, it gets demoted or fixed. CI governance is a product decision — optimize for merge confidence, not checkbox count.`,
            `New hires get a five-minute walkthrough in week one: run \`pnpm test\` locally before push, read the four required checks, ignore yellow Slack bots unless you touched that area. Time-to-first-PR dropped when we stopped implying every workflow was mandatory.`,
          ],
        },
      ],
      takeaway:
        "Block merge on lint, typecheck, unit tests, and preview deploy; move flaky E2E to nightly — CI that developers trust beats fourteen workflows nobody waits for.",
      credit:
        "Photo: [Yancy Min](https://unsplash.com/photos/a-computer-screen-with-a-bunch-of-code-on-it-842ofHC6MaI) on Unsplash",
    }),
  },

  // ── Django ──────────────────────────────────────────────────────────────
  {
    categorySlug: "django",
    title: "Django ORM patterns that kept N+1 queries out of our admin",
    slug: "django-orm-n-plus-one-admin",
    excerpt:
      "List displays were killing the database until we standardized select_related, prefetch_related, and queryset annotations.",
    featuredImage:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop",
    tags: ["django", "orm", "performance"],
    content: article({
      lede: `Our Django admin order list showed customer name, warehouse, and line-item count. Innocent \`list_display\` — except each row fired three extra queries. With two hundred orders the page executed six hundred SQL statements and sales demos stalled. We standardized \`get_queryset\` patterns and admin feels like part of the product again.`,
      sections: [
        {
          title: "How list_display hides N+1",
          paragraphs: [
            `\`list_display\` calls callables per row. \`obj.customer.name\` looks innocent; it hits the database once per row if \`customer\` is not selected. Add \`warehouse.code\` and a \`line_count\` property that queries \`obj.lines.count()\` and you have three queries per row.`,
            `django-debug-toolbar in local dev showed the spike immediately. Production did not have toolbar — only slow pages during demos when execs stood behind sales.`,
            `Silk profiling on staging confirmed the same pattern with realistic row counts. Local dev with ten rows lied; two hundred rows told the truth.`,
          ],
        },
        {
          title: "The ModelAdmin pattern we copy everywhere",
          paragraphs: [
            `\`select_related\` for foreign keys, \`annotate\` for counts, \`@admin.display(ordering=...)\` so column sorts push work to SQL.`,
            `Copy this skeleton into every new admin class before you add the first custom column — retrofitting queryset optimization is always slower than starting right.`,
          ],
          code: {
            lang: "python",
            body: `from django.contrib import admin
from django.db.models import Count

class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "warehouse_code", "line_count")

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("customer", "warehouse")
            .annotate(line_count=Count("lines"))
        )

    @admin.display(ordering="customer__name")
    def customer_name(self, obj):
        return obj.customer.name

    @admin.display(ordering="warehouse__code")
    def warehouse_code(self, obj):
        return obj.warehouse.code

    @admin.display(ordering="line_count")
    def line_count(self, obj):
        return obj.line_count`,
          },
        },
        {
          title: "prefetch_related for many-to-many and reverse FKs",
          paragraphs: [
            `When \`list_display\` shows tags or related notes, \`prefetch_related("tags")\` on the queryset beats per-row \`.all()\`. For inline-heavy changelists we avoid inlines on the list view entirely — open the change form for details.`,
            `Rule of thumb: if the callable crosses a relationship, the relationship belongs in \`get_queryset\`.`,
            `Prefetch objects let you filter related rows — we prefetch only active tags so inactive labels never appear in sales demos.`,
          ],
        },
        {
          title: "Catching regressions before merge",
          paragraphs: [
            `We run django-debug-toolbar locally with \`DEBUG=True\` on a anonymized dump. CI includes \`nplusone\` lint rules on admin modules — new loops that touch the ORM inside templates fail review. Not perfect, but it blocked two regressions last quarter.`,
            `PR template includes a checkbox: "If you touched admin, attach debug toolbar query count." Empty checkbox, empty merge — harsh but effective for a team that demos from admin weekly.`,
          ],
          table: {
            headers: ["Pattern", "Use when", "Avoid"],
            rows: [
              ["select_related", "ForeignKey / OneToOne", "ManyToMany"],
              ["prefetch_related", "Reverse FK / M2M", "Simple FK label"],
              ["annotate(Count())", "Counts in list_display", "obj.relation.count() in loop"],
              ["@admin.display(ordering=)", "Sortable columns", "Python sort on full queryset"],
            ],
          },
        },
        {
          title: "Admin is part of the product surface",
          paragraphs: [
            `Internal does not mean unimportant. Sales used admin during live demos; slow admin felt like a slow product. Treat every new \`ModelAdmin\` as requiring \`get_queryset\` review the same way we review public API serializers.`,
            `We added admin list performance to our quarterly SLO review alongside public API latency. The first quarter after the change, zero demo complaints about "loading orders."`,
          ],
        },
        {
          title: "Quick audit script for existing admins",
          paragraphs: [
            `Search the codebase for \`list_display\` without \`get_queryset\` override in the same class — our grep-powered backlog. Fix the top three traffic admins first. Order list went from 620 queries to 4; that alone justified the sprint.`,
            `Add django-debug-toolbar to local settings for anyone touching admin. We paste the before/after query count into the PR description. Reviewers know to reject callables that hit the ORM without queryset hints.`,
            `Start with OrderAdmin, UserAdmin, and whichever model sales opens in every demo — fix pain where humans actually look.`,
          ],
        },
        {
          title: "Inline and changelist performance",
          paragraphs: [
            `Heavy inlines on changelist pages multiply queries further. We moved line-item editing to the change form only and added pagination defaults of 25 rows. Sales still gets customer name and warehouse in the list; they open one order when details matter. Faster list, same demo story.`,
            `TabularInline on the changelist looked convenient in prototypes. Production data taught us convenience and performance rarely share a row.`,
          ],
        },
      ],
      takeaway:
        "Override get_queryset with select_related, prefetch_related, and annotate for counts — list_display callables that touch relations will N+1 unless you push joins into SQL.",
      credit:
        "Photo: [Hitesh Choudhary](https://unsplash.com/photos/macbook-pro-on-brown-wooden-table-za6s_1OCpW8) on Unsplash",
    }),
  },

  // ── Flutter ─────────────────────────────────────────────────────────────
  {
    categorySlug: "flutter",
    title: "Field inspection app with Flutter: offline-first lessons",
    slug: "flutter-offline-field-inspection-app",
    excerpt:
      "Technicians needed forms without signal. Hive, background sync, and pessimistic UI states made the difference.",
    featuredImage:
      "https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["flutter", "mobile", "offline"],
    content: article({
      lede: `We built a Flutter app for warehouse technicians photographing damaged pallets. Wi-Fi was spotty in the back of the building. Version one assumed always-online — uploads failed silently and users rage-quit. Version two went offline-first with Hive, a sync queue, and explicit UI states. Technicians stopped calling help desk; Android shipped first, iOS two weeks later on the same sync layer.`,
      sections: [
        {
          title: "Why always-online failed in the field",
          paragraphs: [
            `Technicians tapped Submit, saw a spinner, walked toward signal, and assumed success. The API returned 502; we logged nothing client-side. Drafts lived only in widget state — navigate away, data gone. Support tickets spiked the week after rollout.`,
            `Field apps are UX problems disguised as mobile problems. Assume offline first; celebrate when sync completes.`,
            `Warehouse managers told us technicians skipped photo steps when upload felt unreliable. Data quality suffered before we fixed sync — not because the camera was bad, because trust was broken.`,
          ],
        },
        {
          title: "Local storage with Hive and UUID keys",
          paragraphs: [
            `Each inspection gets a client-generated UUID before any network call. Hive boxes store JSON maps keyed by that id so retries are idempotent on the server. Photos write to app documents directory with the same id in the filename.`,
            `We chose Hive over sqflite for speed of iteration — schema was small. If we rebuilt today with heavier relational queries, sqflite might win; the offline pattern would stay the same.`,
          ],
        },
        {
          title: "Sync queue with exponential backoff",
          paragraphs: [
            `A background worker listens to connectivity changes via \`connectivity_plus\`. When online, it drains the queue oldest-first. Failures increment \`attempt_count\` and schedule retry with backoff capped at five minutes. Permanent 4xx marks Failed with tap-to-retry — user decides whether to edit or discard.`,
          ],
          code: {
            lang: "dart",
            body: `enum SyncState { draft, uploading, synced, failed }

class InspectionTile extends StatelessWidget {
  const InspectionTile({super.key, required this.item});

  final Inspection item;

  @override
  Widget build(BuildContext context) {
    final icon = switch (item.syncState) {
      SyncState.draft => Icons.edit_outlined,
      SyncState.uploading => Icons.cloud_upload_outlined,
      SyncState.synced => Icons.check_circle_outline,
      SyncState.failed => Icons.error_outline,
    };
    return ListTile(
      leading: Icon(icon),
      title: Text(item.palletId),
      subtitle: Text(item.syncState.name),
    );
  }
}`,
          },
        },
        {
          title: "Pessimistic UI states users understand",
          paragraphs: [
            `Never an infinite spinner. Draft, Uploading, Synced, Failed — each with icon and subtitle. Failed rows stay tappable to open detail and retry. Technicians learned the vocabulary in one shift; help desk scripts reference the same four words.`,
          ],
          table: {
            headers: ["State", "User meaning", "Action"],
            rows: [
              ["Draft", "Saved on device only", "Edit freely"],
              ["Uploading", "Sync in progress", "Wait or stay on screen"],
              ["Synced", "On server", "Read-only optional"],
              ["Failed", "Server rejected or timeout", "Tap to retry"],
            ],
          },
        },
        {
          title: "Camera and compression via platform channels",
          paragraphs: [
            `Flutter's camera plugin worked but photos were huge on older Android devices. A thin platform channel on Android used CameraX with JPEG quality 85; iOS used UIImage compression. Same Dart API, smaller uploads when sync finally ran.`,
            `Average photo size dropped from 4.2 MB to 900 KB. Sync queue drain time fell proportionally on 3G fallback in the parking lot.`,
          ],
        },
        {
          title: "Single codebase, staged platform rollout",
          paragraphs: [
            `Android shipped to forty devices first. We fixed sync edge cases in production without iOS TestFlight noise. Two weeks later iOS joined with the same \`SyncRepository\` — only camera channel differed. Offline-first logic lived in pure Dart tests without golden files.`,
            `Technicians on iOS never knew Android went first. That was the point — sync bugs should not be platform lottery.`,
          ],
        },
        {
          title: "Metrics that proved the pivot",
          paragraphs: [
            `Failed silent submits dropped from dozens per day to near zero visible Failed states that users resolved themselves. Average time-to-sync after reconnect went under ninety seconds. That mattered more than frame rates for this audience.`,
            `We track sync success rate per warehouse zone — Wi-Fi dead zones show up in data before facilities hears complaints. Product prioritized AP placement in zone C from that chart, not from gut feel.`,
            `Dart unit tests mock \`ConnectivityResult.none\` and assert queue behavior without device farms. We run them on every PR alongside widget tests for the four sync states. Regressions in retry logic caught twice before release.`,
          ],
        },
      ],
      takeaway:
        "Field Flutter apps need client UUIDs, local persistence, a connectivity-aware sync queue, and four explicit UI states — assume offline and make failure visible instead of spinning forever.",
      credit:
        "Photo: [Tom Swinnen](https://www.pexels.com/photo/selective-focus-photography-of-person-using-huawei-nexus-6p-1092644/) on Pexels",
    }),
  },
];
