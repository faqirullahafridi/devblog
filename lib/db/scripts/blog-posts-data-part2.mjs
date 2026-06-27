import { article } from "./blog-article-builder.mjs";

/** @type {import("./blog-posts-data-part1.mjs").BLOG_POSTS extends infer T ? T extends readonly (infer U)[] ? U[] : never : never[]} */
export const BLOG_POSTS_PART2 = [
  // ── Freelancing ─────────────────────────────────────────────────────────
  {
    categorySlug: "freelancing",
    title: "How I price fixed-scope web projects without undercharging",
    slug: "freelance-fixed-scope-pricing",
    excerpt:
      "Hourly rates failed me on a marketing site with three revision rounds. A scope table and deposit structure fixed margins.",
    featuredImage:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop",
    tags: ["freelancing", "pricing", "business"],
    content: article({
      lede: `My second freelance client wanted "a simple five-page site." Simple became custom animations, a blog, Mailchimp integration, and three rounds of copy changes from someone who was not in the original scope. I quoted hourly, tracked every minute, and still lost money when the final invoice felt too high to send.

That project taught me that **hourly billing rewards scope creep** — the client has no reason to decide early, and you absorb the anxiety of an open-ended meter. Fixed-scope pricing with a signed deliverable table changed my margins and my sleep. Here is the structure I still use on marketing sites, small SaaS dashboards, and WordPress-to-static migrations.`,
      sections: [
        {
          title: "Why hourly failed me on fixed deliverables",
          paragraphs: [
            `Hourly works when the problem is genuinely unknown: research spikes, legacy codebase archaeology, or "we need someone embedded for two weeks." It fails when the outcome is concrete — five pages, a contact form, deploy to their hosting — but the path there is fuzzy in the client's head.`,
            `On that second project I under-estimated revisions because I assumed one feedback round per page. The stakeholder loop included a marketing manager, a founder, and a cousin who "does design." Each person had opinions. Hourly made me the bad guy every time I mentioned the clock.`,
            `Fixed scope shifts the conversation from "how long will this take?" to "what exactly are we buying?" That is a healthier question for both sides.`,
          ],
        },
        {
          title: "The scope table clients actually sign",
          paragraphs: [
            `Every quote now includes a table with three columns: deliverable, included revisions, and explicitly out of scope. No vague bullet like "modern design." Specifics:`,
          ],
          table: {
            headers: ["Deliverable", "Included revisions", "Out of scope"],
            rows: [
              ["5 static pages (home, about, services, blog index, contact)", "2 rounds per page", "Copywriting"],
              ["Contact form with email notification", "1 round", "CRM integration"],
              ["Deploy to client hosting + DNS handoff", "—", "Monthly maintenance"],
              ["Blog template (no CMS)", "1 round", "Training, content migration"],
            ],
          },
          paragraphs: [
            `Clients initial the PDF or click "approve" in the proposal tool. When round three of homepage tweaks arrives, I point to the table and open a change order — not as a threat, but as the agreed process.`,
          ],
        },
        {
          title: "The pricing formula I use",
          paragraphs: [
            `I estimate hours honestly, then apply a buffer and separate tooling costs:`,
          ],
          code: {
            lang: "text",
            body: `project_price = (estimated_hours × hourly_rate × 1.3) + flat_costs

flat_costs = domain + email tooling + stock assets + subcontractor fees`,
          },
          paragraphs: [
            `The **1.3 multiplier** is not greed — it covers unknowns: DNS quirks, staging credentials that expire, a plugin conflict on production only. On content-heavy sites I use 1.4. On a stack I have shipped ten times, 1.2.`,
            `I show the math in the proposal appendix for transparency. Some clients ask to remove the buffer; I explain it funds the revision rounds already in the table. Most accept when the alternative is hourly with no cap.`,
          ],
        },
        {
          title: "Deposits and payment milestones",
          bullets: [
            "**50% deposit** before work starts — no deposit, no calendar slot.",
            "**40%** on staging approval (client tests on a real URL, not localhost screenshots).",
            "**10%** before DNS cutover or repository transfer.",
            "Change orders: 100% upfront on the quoted hours before I touch them.",
          ],
          paragraphs: [
            `The first time I held a launch hostage for final payment felt awkward. The third time a client "forgot" to pay until after go-live, I was grateful for the rule. Freelancing is not only coding — it is cash flow management with a smile.`,
          ],
        },
        {
          title: "Change orders without burning relationships",
          paragraphs: [
            `A change order is a mini quote: description, hours, rate, delivery date. I send it the same day the request arrives, while context is fresh. Waiting a week makes the client feel nickel-and-dimed; same-day feels professional.`,
            `Example language: "Adding Mailchimp sync is out of the signed scope. I can add it for 6 hours at $X/hr, delivered by Thursday. Approve here to add it to the queue." Most clients appreciate clarity over a surprise line item on the final invoice.`,
            `I keep a Notion template so change orders take ten minutes. The goal is friction for scope creep, not friction for collaboration.`,
          ],
        },
        {
          title: "When I still quote hourly",
          paragraphs: [
            `Retainers for ongoing support (explicitly not feature development). Audits where I cannot know depth until I read the repo. Pairing with an in-house team. Everything else gets a fixed box with a lid.`,
            `If you are transitioning from hourly, pick one small project as a pilot. Under-scope slightly, deliver early, and use the testimonial to sell the next fixed quote. Confidence in your estimates comes from receipts, not spreadsheets.`,
          ],
        },
      ],
      takeaway:
        "Fixed-scope quotes with a signed deliverable table, a 30% time buffer, and deposit milestones protect margins better than hourly billing on well-defined web projects.",
      credit:
        "Photo: [Scott Graham](https://unsplash.com/photos/person-holding-pencil-near-laptop-computer-5fNmWej4tAA) on Unsplash",
    }),
  },

  // ── HTML/CSS ────────────────────────────────────────────────────────────
  {
    categorySlug: "html-css",
    title: "The flexbox gap that broke our card grid for two days",
    slug: "flexbox-gap-card-grid-debugging",
    excerpt:
      "Cards stretched to full row height because align-items defaulted to stretch. One line of CSS and a sketch on paper solved it.",
    featuredImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop",
    tags: ["css", "flexbox", "layout"],
    content: article({
      lede: `Design handed us a three-column card grid for a pricing page. Every card in a row matched the height of the tallest card — fine so far — but buttons and footers sat at random vertical positions. Short cards looked padded with empty space; tall cards clipped on mobile. We blamed the CMS, then the design system, then each other.

Two days later the fix was four lines of CSS and a sketch on paper. The culprit was not \`gap\` itself (we love \`gap\`). It was how **flex items stretch on the cross axis** when the card interior is also a flex column without a push-to-bottom footer.`,
      sections: [
        {
          title: "What we saw in the browser",
          paragraphs: [
            `The grid was a flex row with \`flex-wrap: wrap\` and \`gap: 1.25rem\`. Each card had a title, variable-length description, feature list, and a CTA button. Cards in the same row shared equal outer height because \`align-items\` defaults to \`stretch\`.`,
            `Inside each card we also used \`display: flex; flex-direction: column\`. The button was the last child — but it hugged the content above it instead of sitting on the card's bottom edge. Visually, the row looked "broken" because CTAs did not align across columns.`,
            `DevTools showed no overflow, no rogue margins, no absolute positioning. That made it worse; nothing looked obviously wrong.`,
          ],
        },
        {
          title: "The default nobody overrides",
          paragraphs: [
            `\`align-items: stretch\` on a row flex container means every item's cross-size (height, in a row) stretches to the tallest item. That is often what you want for equal-height cards. The bug was **inside** the card: children stacked from the top with no mechanism to consume leftover vertical space.`,
            `We briefly tried \`align-items: flex-start\` on the grid so short cards would shrink. That fixed button misalignment by making cards uneven heights — design rejected it immediately.`,
            `The real requirement: equal-height cards **and** footers pinned to the bottom. Flexbox can do both; we only had half the pattern.`,
          ],
        },
        {
          title: "The fix: margin-top auto on the footer",
          code: {
            lang: "css",
            body: `.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: stretch; /* equal-height cards */
}

.card {
  display: flex;
  flex-direction: column;
  flex: 1 1 280px; /* grow, shrink, min basis */
  min-width: 0;   /* prevent flex blowout from long words */
}

.card__body {
  flex: 1 0 auto;
}

.card__footer {
  margin-top: auto;
}`,
          },
          paragraphs: [
            `\`margin-top: auto\` on the footer eats all free space above it in a flex column, pushing the footer (and your CTA) to the bottom without JavaScript height measurement. This pattern works in every modern browser and survives CMS-authored content of different lengths.`,
          ],
        },
        {
          title: "Why gap was a red herring",
          paragraphs: [
            `We spent half a day toggling \`gap\` vs \`margin\` on children because someone read that older Safari had \`gap\` bugs in flex (mostly historical). Our targets were current Chrome and Firefox; \`gap\` was innocent.`,
            `If you are supporting very old flex implementations, test \`gap\` — but do not rip it out before you understand cross-axis alignment. Gap solves spacing between items; it does not solve footer pinning.`,
          ],
        },
        {
          title: "Sketching main axis vs cross axis",
          paragraphs: [
            `When flexbox confuses me, I draw boxes on paper. Horizontal arrow = main axis (direction of \`flex-direction\`). Vertical arrow = cross axis (where \`align-items\` applies).`,
            `For a row grid, main axis is left-right; cross axis is top-bottom. Stretch grows items along the cross axis. Inside the card, main axis is top-bottom; \`margin-top: auto\` pushes along that axis. Ten minutes of drawing saved two days of random CSS toggling.`,
          ],
          quote:
            "Flexbox bugs are usually alignment bugs. Read the spec sentence about the cross size of flex items before adding another wrapper div.",
        },
        {
          title: "Regression test in Storybook",
          paragraphs: [
            `We added a Storybook story with three cards: one line of body copy, a paragraph, and a long feature list. Visual regression catches footer drift. Design reviews the story, not production after deploy.`,
            `If you maintain a component library, document the **card + footer auto margin** pattern in your layout guidelines. The next developer will thank you when they do not reopen this ticket.`,
            `We also snapshot mobile at 375px width. Wrapped flex items sometimes stack to one column; the footer pattern still holds because each card remains its own flex column. Test both breakpoints before you close the layout ticket.`,
          ],
        },
      ],
      takeaway:
        "Equal-height flex cards need an inner column with margin-top: auto on the footer — align-items: stretch alone only stretches the outer shell, not your CTAs.",
      credit:
        "Photo: [Christina @ wocintechchat.com](https://unsplash.com/photos/macbook-pro-on-table-beside-white-imac-and-magic-mouse-hFn_1x7K_wY) on Unsplash",
    }),
  },

  // ── Interview Preparation ───────────────────────────────────────────────
  {
    categorySlug: "interview-preparation",
    title: "Technical interview prep without cramming LeetCode all night",
    slug: "technical-interview-prep-without-cramming",
    excerpt:
      "I passed backend loops by narrating tradeoffs out loud. A two-week plan beat marathon grinding.",
    featuredImage:
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["interviews", "career", "preparation"],
    content: article({
      lede: `I failed a FAANG phone screen after grinding fifty random LeetCode mediums in ten days. I could memorize solutions but froze when the interviewer changed a constraint. My code was silent; my thinking was invisible.

The next cycle I tried something calmer: **two weeks, ninety minutes a day**, focused on patterns I actually use at work and on **narrating tradeoffs out loud**. I passed three backend loops without an all-nighter. Cramming the night before made me sloppy; sleep and a repeatable plan made me coherent. The goal was not to become a competitive programmer — it was to look like the engineer they would want on a real ticket.`,
      sections: [
        {
          title: "What interviewers actually score",
          bullets: [
            "Can you clarify the problem before coding?",
            "Do you test examples and name edge cases?",
            "Can you improve brute force to something reasonable?",
            "Do you communicate when you are stuck?",
          ],
          paragraphs: [
            `No one hired me for memorizing \`Collections.sort\` syntax. They hired me for structured thinking under mild pressure. Once I treated interviews as **collaborative debugging sessions**, prep got narrower and more effective.`,
          ],
        },
        {
          title: "Week 1 — fundamentals out loud",
          numbered: [
            "**Arrays and hash maps** — two-sum variants, frequency counts, sliding window on strings. Speak complexity while you write.",
            "**Strings** — parse a simple log line, tokenize CSV-ish input, handle empty strings explicitly.",
            "**SQL** — joins on a sample schema, explain when an index helps, write a query that returns duplicates.",
            "**One timed mock** — Pramp or a friend; record yourself; cringe; improve.",
          ],
          paragraphs: [
            `Ninety minutes daily, not four hours on Saturday. Consistency beat intensity. I kept a single notebook of ten problems I could whiteboard from memory — not fifty I half-remembered.`,
            `If a problem took more than forty-five minutes with no insight, I read the solution, rewrote it from scratch the next day, and moved on. Ego-driven grinding on one hard graph problem was how I failed the first screen.`,
          ],
        },
        {
          title: "Week 2 — system flavor and behavior",
          numbered: [
            "Design a URL shortener on paper: storage, collisions, read-heavy traffic, analytics.",
            "Walk through debugging a slow API: symptoms → hypothesis → measurement → fix.",
            "Prepare three STAR stories: production incident, conflict with a teammate, project you are proud of.",
            "Write five questions to ask them about on-call, deploy frequency, and mentorship.",
          ],
          paragraphs: [
            `Backend loops often include a "light system design" or architecture discussion even for mid-level roles. Practicing out loud matters more than reading diagrams alone.`,
          ],
        },
        {
          title: "The narration script that helped",
          code: {
            lang: "text",
            body: `"I'll start with a brute-force approach to verify examples.
That is O(n²) because of the nested loop.
I can trade space for time with a hash map — O(n) single pass.
Let me check the empty input and duplicate keys before I code."`,
          },
          paragraphs: [
            `Saying this before typing saved me when I hit a syntax snag. The interviewer still saw progress. Silence reads as stuck even when you are thinking hard.`,
          ],
        },
        {
          title: "What I stopped doing",
          bullets: [
            "Random hard problems with no pattern tag.",
            "New problems the night before the interview.",
            "Comparing myself to people who grind 500 problems.",
            "Skipping SQL if the role mentions Postgres or MySQL.",
          ],
          paragraphs: [
            `LeetCode is a gym, not the sport. Train movements you need, not every machine in the building.`,
          ],
        },
        {
          title: "Day-before checklist",
          bullets: [
            "Review your STAR stories once — no new content.",
            "Test webcam, mic, and screen share.",
            "Prepare water and a quiet room; phone on silent.",
            "Sleep eight hours — fatigue costs more than one extra problem.",
          ],
          paragraphs: [
            `The day before my successful loop I walked instead of grinding. My brain needed consolidation, not input. Interviews reward clarity, not exhaustion.`,
          ],
        },
        {
          title: "After the loop — what to write down",
          paragraphs: [
            `Within an hour of hanging up, I jot topics asked, problems I stumbled on, and phrases that landed ("I'll verify with an example first"). That log becomes next cycle's study list instead of vague "do more LeetCode."`,
            `Rejections are data. One company wanted heavy graph theory; another cared about SQL and API design. Tailoring prep to the job description beats generic grinding. Two weeks of focused practice is enough for most mid-level screens if you already ship code daily.`,
          ],
        },
      ],
      takeaway:
        "A two-week plan of ninety focused minutes daily — patterns, narration, SQL, and one system sketch — beats marathon LeetCode cramming for most backend interviews.",
      credit:
        "Photo: [fauxels](https://www.pexels.com/photo/photo-of-people-having-discussion-3184292/) on Pexels",
    }),
  },

  // ── JavaScript ──────────────────────────────────────────────────────────
  {
    categorySlug: "javascript",
    title: "A closure bug in our setTimeout loop that only showed in production",
    slug: "javascript-closure-settimeout-loop-bug",
    excerpt:
      "Every button fired the last menu ID. var in a for loop plus async timing — classic, still painful.",
    featuredImage:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&auto=format&fit=crop",
    tags: ["javascript", "closures", "debugging"],
    isFeatured: true,
    content: article({
      lede: `We attached click handlers inside a \`for\` loop while building dynamic navigation menus. Locally, with three items, everything looked fine. Production had twelve menus across tenant subdomains; every click opened menu #11. QA filed "intermittent" twice before we reproduced it consistently.

The bug was a textbook **closure over a loop variable** — made worse because our legacy bundle still transpiled \`let\` to \`var\` for an old browser target. Closures are not academic; they are production incident fuel when timing and scope collide. The fix took twenty minutes once we understood it; finding it in a minified legacy chunk took two days.`,
      sections: [
        {
          title: "The code that looked fine in dev",
          code: {
            lang: "javascript",
            body: `// Simplified from our menu builder
for (var i = 0; i < menus.length; i++) {
  const button = document.querySelector(\`[data-menu="\${i}"]\`);
  button.addEventListener("click", () => openMenu(menus[i].id));
}`,
          },
          paragraphs: [
            `Three menus meant \`i\` ended at 2; if you clicked before wondering about closure, you might never notice. Twelve menus meant every handler closed over the **same** \`i\`, which equaled \`menus.length\` after the loop finished — hence the last ID every time.`,
          ],
        },
        {
          title: "Why var breaks the mental model",
          paragraphs: [
            `\`var\` is function-scoped, not block-scoped. All callbacks share one binding of \`i\`. \`let\` and \`const\` create a new binding per iteration in a \`for\` loop, which is why modern tutorials rarely show this bug — until your build target resurrects it.`,
            `We found it by logging \`i\` inside each callback after a slow 3G throttle. Fast machines masked the race between loop completion and first click.`,
            `The same pattern appears with \`setInterval\`, deferred DOM updates, and Promise chains built in loops. Any time a callback runs later, ask what variables it closes over.`,
          ],
        },
        {
          title: "Fixes we still teach new hires",
          code: {
            lang: "javascript",
            body: `// Preferred: block scope per iteration
for (const menu of menus) {
  const button = document.querySelector(\`[data-menu="\${menu.id}"]\`);
  button.addEventListener("click", () => openMenu(menu.id));
}

// Equivalent
menus.forEach((menu) => {
  const button = document.querySelector(\`[data-menu="\${menu.id}"]\`);
  button.addEventListener("click", () => openMenu(menu.id));
});

// Legacy IIFE if you must support ancient output
for (var i = 0; i < menus.length; i++) {
  ((menu) => {
    button.addEventListener("click", () => openMenu(menu.id));
  })(menus[i]);
}`,
          },
        },
        {
          title: "setTimeout loops share the same trap",
          code: {
            lang: "javascript",
            body: `// Broken: prints 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Fixed
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
          },
          paragraphs: [
            `Async callbacks defer execution until after the loop advances. Any shared \`var\` binding reads the final value. Interviewers love this; production teaches it with pager duty.`,
          ],
        },
        {
          title: "How we prevented regression",
          bullets: [
            "ESLint \`no-var\` enforced in CI.",
            "Raised minimum browser target so Babel stopped emitting \`var\` in loops.",
            "Unit test with twelve mocked menus asserting distinct IDs on click.",
            "Code review checklist item: handlers created inside loops.",
          ],
          paragraphs: [
            `The test felt silly until it caught a refactor that reintroduced \`var\` during a rush fix. Cheap insurance.`,
            `Add the repro case count to your PR template when touching event wiring — future you will forget why twelve mattered.`,
          ],
        },
        {
          title: "Debugging closure bugs faster",
          paragraphs: [
            `When behavior depends on "which iteration" but code uses a single index variable, sketch the binding timeline on paper. Mark when the loop finishes vs when events fire.`,
            `Log the captured value at handler creation time, not only at click time. If creation logs already show duplicates, you have a closure bug, not a DOM bug.`,
          ],
        },
        {
          title: "Teaching the team without shame",
          paragraphs: [
            `We turned this incident into a five-minute lunch talk: "loops plus listeners." No blame — the legacy Babel target was the surprise. Junior devs had only seen \`const\` in tutorials; production still emitted \`var\` in edge bundles.`,
            `Pair a lint rule with a story in the wiki. Rules without context feel petty; context without rules gets ignored. Our regression test with twelve menus is now the canonical example in onboarding docs.`,
            `If you inherit legacy bundles, grep the output for \`var \` in loop patterns during code review. Modern source can lie when targets are old. Source maps help, but a one-line integration test often finds the truth faster.`,
          ],
        },
      ],
      takeaway:
        "Event handlers and async callbacks created inside loops must close over per-iteration values — use const/let, for-of, forEach, or an IIFE, and test with more than three items.",
      credit:
        "Photo: [Danial Igdery](https://unsplash.com/photos/macbook-pro-on-white-table-HJ40yHUycmc) on Unsplash",
    }),
  },

  // ── Mobile Development ──────────────────────────────────────────────────
  {
    categorySlug: "mobile-development",
    title: "React Native vs native for a login-heavy banking companion app",
    slug: "react-native-vs-native-login-app",
    excerpt:
      "Biometrics and keychain integration tipped the scale. We shipped RN for Android first and Swift for iOS auth.",
    featuredImage:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop",
    tags: ["mobile", "react-native", "architecture"],
    content: article({
      lede: `Our client wanted biometric login on iOS and Android for a banking companion app — balances, card freeze, push alerts — with six months runway and a team that knew React deeply. One engineer knew Swift; nobody had shipped Kotlin recently. The debate was not "which is better" but **where hybrid saves schedule without failing security review**.

We shipped React Native for most screens, a native Swift module for iOS Keychain and Face ID, and a thin Kotlin bridge on Android for BiometricPrompt. Login-heavy flows tipped the scale toward native secure storage even when the UI was shared.`,
      sections: [
        {
          title: "Requirements that constrained the choice",
          bullets: [
            "Biometric login with fallback PIN.",
            "Tokens in secure enclave / Keystore — no AsyncStorage for secrets.",
            "App Store and Play security questionnaire.",
            "Shared design tokens with an existing React web dashboard.",
            "Six-month MVP with two mobile engineers.",
          ],
          paragraphs: [
            `Marketing wanted one codebase. Security wanted audited native crypto paths. We split the difference with explicit boundaries instead of pretending one framework wins everything.`,
          ],
        },
        {
          title: "Decision matrix we documented",
          table: {
            headers: ["Area", "Choice", "Why"],
            rows: [
              ["Android UI (post-auth)", "React Native", "Faster iteration; shared components with web tokens"],
              ["iOS Keychain + Face ID", "Native Swift module", "RN bridge wrapped secure enclave APIs"],
              ["Android BiometricPrompt", "Kotlin module", "Consistent with security audit expectations"],
              ["API client", "TypeScript package", "OpenAPI-generated client for web and mobile"],
              ["Push notifications", "RN + native handlers", "FCM/APNs setup needs platform code anyway"],
            ],
          },
        },
        {
          title: "Where React Native earned its keep",
          paragraphs: [
            `After authentication, most screens were lists, forms, and charts — perfect for RN. Hot reload shortened design review cycles. We reused typography and color tokens from the web design system, which kept brand consistency without re-implementing SwiftUI and Compose themes from scratch.`,
            `Crash rates on Android UI screens were comparable to pure native apps we had shipped before — once we stopped using unmaintained native modules and pinned versions in a monorepo.`,
          ],
        },
        {
          title: "Where native was non-negotiable",
          paragraphs: [
            `Storing refresh tokens in Keychain with **kSecAttrAccessibleWhenUnlockedThisDeviceOnly** and gating unlock behind LocalAuthentication was not something we trusted to a third-party RN wrapper without reading every line. The Swift module exposed three methods to JS: \`saveToken\`, \`getToken\`, \`clearSession\`.`,
            `Security review asked for screenshots of native code paths. Hybrid architecture made that possible without rewriting the entire app in Swift.`,
          ],
          code: {
            lang: "typescript",
            body: `// JS boundary stays tiny
import { NativeModules } from "react-native";

const { SecureAuth } = NativeModules;

export async function loginWithBiometrics(): Promise<Session> {
  const ok = await SecureAuth.authenticate();
  if (!ok) throw new Error("Biometric auth failed");
  return SecureAuth.restoreSession();
}`,
          },
        },
        {
          title: "Tests on real devices saved the launch",
          paragraphs: [
            `Simulators hide keyboard overlap on small Android phones — login fields disappeared behind the keyboard during demo week. Real devices also surfaced Face ID failures when users wore sunglasses indoors (true story).`,
            `We bought two mid-range Android phones and kept an older iPhone in the test bag. CI cannot catch every UX failure; device lab can.`,
          ],
        },
        {
          title: "Advice for the next team",
          bullets: [
            "Document which screens are RN vs native in the README — frustration week kills projects.",
            "Do not rewrite to Flutter mid-sprint; fix boundaries instead.",
            "Treat auth as a platform service, not a UI library problem.",
            "Schedule security review before feature freeze, not after.",
          ],
        },
        {
          title: "What we would do differently",
          paragraphs: [
            `We underestimated Android keyboard overlap on the PIN fallback screen and lost three days. Earlier device testing would have caught it before stakeholder demo.`,
            `We over-documented the bridge API in Notion but under-documented release signing steps. The next engineer should not need a Slack archaeology session to ship a hotfix to TestFlight.`,
            `Hybrid saved roughly eight weeks versus full native for our scope. If the product later needs heavy offline sync or GPU work, revisit — but login-heavy fintech companions rarely need Unity-level graphics on day one.`,
            `App Store review asked for a plain-language privacy nutrition label describing biometric data. Having security copy ready before submission avoided a last-minute scramble.`,
          ],
        },
      ],
      takeaway:
        "For login-heavy apps, hybrid architecture works when native modules own secrets and biometrics while React Native ships the authenticated UI fast.",
      credit:
        "Photo: [Yura Fresh](https://unsplash.com/photos/person-holding-black-iphone-7-9cQc0WR-3tI) on Unsplash",
    }),
  },

  // ── MySQL ───────────────────────────────────────────────────────────────
  {
    categorySlug: "mysql",
    title: "Indexes we added after slow query logs embarrassed us",
    slug: "mysql-indexes-from-slow-query-log",
    excerpt:
      "Composite indexes on (tenant_id, created_at) and covering indexes for dashboards dropped p95 from 4s to 80ms.",
    featuredImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop",
    tags: ["mysql", "indexes", "performance"],
    content: article({
      lede: `MySQL's slow query log flagged a statement running thousands of times per hour: \`SELECT * FROM events WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 50\`. Average latency: 3.8 seconds. p95 hit four seconds. Users called the app "laggy" while our API metrics looked fine — connection pool healthy, CPU low, cache hit rate decent.

The database was waiting on the wrong index. We fixed three hot queries with composite and covering indexes and dropped p95 to about **80 milliseconds** without upgrading hardware. Slow query logs are embarrassing and invaluable.`,
      sections: [
        {
          title: "Enabling the log in staging first",
          code: {
            lang: "sql",
            body: `SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.5;
SET GLOBAL log_queries_not_using_indexes = 'ON';`,
          },
          paragraphs: [
            `We reproduced production load in staging with \`long_query_time = 0.5\` seconds. Anything slower got captured. \`log_queries_not_using_indexes\` was noisy but surfaced full table scans early. Production got the same settings during a maintenance window after we had a fix ready.`,
          ],
        },
        {
          title: "EXPLAIN ANALYZE told the truth",
          code: {
            lang: "sql",
            body: `EXPLAIN ANALYZE
SELECT id, event_type, created_at
FROM events
WHERE tenant_id = 42
ORDER BY created_at DESC
LIMIT 50;`,
          },
          paragraphs: [
            `The planner scanned an index on \`created_at\`, read thousands of rows, filtered \`tenant_id\` as a post-filter, then sorted. We had an index on \`created_at\` from an older reporting feature and assumed it helped everyone. It hurt tenant-scoped dashboards.`,
            `Cardinality matters: if most rows share one tenant in dev, EXPLAIN lies. We reproduced with production-sized stats imported into staging before trusting the plan.`,
          ],
        },
        {
          title: "Composite index matching the filter and sort",
          code: {
            lang: "sql",
            body: `CREATE INDEX idx_events_tenant_created
ON events (tenant_id, created_at DESC);`,
          },
          paragraphs: [
            `Leading column \`tenant_id\` matches the equality predicate. \`created_at DESC\` aligns with \`ORDER BY created_at DESC\`, so MySQL can read the first fifty rows from the index without a filesort. This is textbook **leftmost prefix** design — the tenant filter must be selective enough; ours was.`,
            `If your equality column is low-cardinality, composite indexes may not help. Profile real tenant distribution before copying this pattern blindly.`,
          ],
        },
        {
          title: "Covering indexes for dashboard APIs",
          paragraphs: [
            `A second hot query selected \`id, event_type, created_at, payload_summary\` for a timeline widget. We extended the index:`,
          ],
          code: {
            lang: "sql",
            body: `CREATE INDEX idx_events_tenant_timeline
ON events (tenant_id, created_at DESC, event_type, payload_summary);`,
          },
          paragraphs: [
            `When all selected columns live in the index, InnoDB can satisfy the query index-only. We stopped selecting \`*\` in hot paths — fewer bytes over the wire and fewer surprise schema breaks when someone adds a JSON blob column.`,
          ],
        },
        {
          title: "Operational habits after the fix",
          bullets: [
            "Weekly review of top ten slow queries by total time (not just max time).",
            "Alert when p95 statement latency doubles week over week.",
            "Migration checklist: does this query have a matching index?",
            "Fix queries before buying a bigger RDS instance.",
          ],
          paragraphs: [
            `The 4s query consumed more user-visible latency than fifty obscure 200ms queries. Total time in the log ranks priorities better than gut feel.`,
            `Rank by total time, not peak time alone.`,
          ],
        },
        {
          title: "When indexes are not enough",
          paragraphs: [
            `One outlier needed pagination by cursor instead of \`OFFSET\` on a huge tenant. Indexes made the first pages fast; deep pages still hurt until we switched APIs to \`WHERE (tenant_id, created_at, id) < (?, ?, ?)\`.`,
            `Indexes are necessary, not sufficient. Query shape and API design still matter.`,
          ],
        },
        {
          title: "Measuring before and after",
          paragraphs: [
            `We screenshot \`EXPLAIN ANALYZE\` before and after each index in the runbook. Stakeholders do not care about B-tree depth, but they understand "4 seconds to 80 milliseconds" on the dashboard they use daily.`,
            `Also watch write latency. Composite indexes speed reads and slightly slow inserts on \`events\`. Our insert rate was low enough that the tradeoff was obvious. If you are insert-heavy, model that cost before adding five covering indexes.`,
            `The slow query log stays enabled in production with \`long_query_time = 1\` second now — noisy enough to catch regressions, quiet enough that PagerDuty does not hate us.`,
            `Before this incident, DB tuning was "someone else's sprint." Now every API engineer runs EXPLAIN on new list endpoints in staging. Culture change mattered as much as the DDL.`,
            `Share slow-query wins in team standup. Visibility keeps indexes from regressing when the next feature adds an innocent-looking \`ORDER BY\`.`,
          ],
        },
      ],
      takeaway:
        "Match composite indexes to equality filters plus sort columns, prefer covering indexes on hot SELECT lists, and let the slow query log rank fixes before scaling hardware.",
      credit:
        "Photo: [Alexandre Debiève](https://unsplash.com/photos/silver-imac-on-black-table-FVB82MIwLo8) on Unsplash",
    }),
  },

  // ── Node.js ─────────────────────────────────────────────────────────────
  {
    categorySlug: "nodejs",
    title: "Node streams kept a 2GB CSV import from crashing our API",
    slug: "nodejs-streams-large-csv-import",
    excerpt:
      "Reading the whole file into memory OOM'd the container. line-by-line parsing with backpressure finished in six minutes.",
    featuredImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop",
    tags: ["nodejs", "streams", "performance"],
    content: article({
      lede: `Marketing uploaded a 2.1 GB CSV of legacy contacts into our admin importer. The first implementation read the entire file into a string, split on newlines, and mapped rows to database inserts. It worked on a laptop with 16 GB RAM. In production our container limit was 512 MB. The process died; users saw 502; we got paged during lunch.

Node streams with line-by-line parsing and **backpressure-aware batching** finished the same import in six minutes with memory flat under 120 MB. Node shines at I/O-bound glue when you stop buffering whole uploads in RAM.`,
      sections: [
        {
          title: "The naive version that OOM'd",
          code: {
            lang: "javascript",
            body: `import { readFile } from "node:fs/promises";

const text = await readFile(path, "utf8");
const rows = text.split("\\n").slice(1).map(parseLine);
await insertAll(rows);`,
          },
          paragraphs: [
            `Simple, readable, catastrophic at scale. A 2.1 GB string plus split array plus parsed objects exceeded our cgroup memory limit. GC could not save us because everything was reachable at once.`,
          ],
        },
        {
          title: "Streaming line by line",
          code: {
            lang: "javascript",
            body: `import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

async function* lines(filePath) {
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    yield line;
  }
}

async function importCsv(filePath, onRow) {
  let isHeader = true;
  for await (const line of lines(filePath)) {
    if (isHeader) { isHeader = false; continue; }
    if (!line.trim()) continue;
    await onRow(parseLine(line));
  }
}`,
          },
          paragraphs: [
            `\`createReadStream\` reads chunks from disk; \`readline\` assembles lines without holding the full file. Memory stays proportional to chunk size and batch queue depth, not file size.`,
          ],
        },
        {
          title: "Batching inserts with backpressure",
          code: {
            lang: "javascript",
            body: `const BATCH_SIZE = 500;
let batch = [];

async function flush() {
  if (batch.length === 0) return;
  await db.insert(contacts).values(batch);
  batch = [];
}

async function onRow(row) {
  batch.push(row);
  if (batch.length >= BATCH_SIZE) {
    await flush();
  }
}`,
          },
          paragraphs: [
            `Five hundred rows balanced transaction overhead and memory. When the database slowed, we paused the read stream until the queue drained — classic **backpressure**. Without pause/resume, you buffer unbounded rows in memory and recreate the OOM.`,
          ],
        },
        {
          title: "pipeline and error handling",
          code: {
            lang: "javascript",
            body: `import { pipeline } from "node:stream/promises";

try {
  await importCsv(uploadPath, onRow);
  await flush();
} catch (err) {
  await markImportFailed(jobId, err);
  throw err;
} finally {
  await unlink(uploadPath);
}`,
          },
          paragraphs: [
            `\`pipeline\` forwards errors and destroys streams on failure. We recorded failed row numbers for partial imports instead of silent half-loads. Support could re-upload a corrected slice.`,
          ],
        },
        {
          title: "Progress reporting for humans",
          paragraphs: [
            `We emitted progress every 10,000 rows over SSE to the admin UI. Six minutes felt broken without feedback; a percentage bar made the same wait tolerable.`,
            `For ops, we logged throughput rows/sec and batch flush latency. If flush latency climbs, the bottleneck is database writes, not CSV parsing — scale clues without guessing.`,
            `Disk space on the pod mattered too: we streamed from a temp volume and deleted the file in \`finally\` so a failed import did not fill the node.`,
          ],
        },
        {
          title: "When to reach for workers instead",
          bullets: [
            "CPU-heavy transforms on each row (complex validation, geocoding).",
            "Files larger than disk budget on the API pod — move to object storage + worker.",
            "Imports that must survive API deploys — job queue with checkpointing.",
          ],
          paragraphs: [
            `Streams solved our immediate OOM. A year later we moved imports to a BullMQ worker for retries and isolation. Streams are step one; queues are step two when reliability requirements grow.`,
          ],
        },
        {
          title: "Lessons for the next large upload",
          paragraphs: [
            `Validate CSV headers on the first row before processing thousands of lines. We wasted an hour importing rows with shifted columns because marketing exported from Excel with a merged header cell.`,
            `Set a max upload size at the reverse proxy and return 413 with a human message. Friendly failure beats a container restart that shows up as a generic 502.`,
            `Keep a dead-letter file of rows that failed validation. Support forwarded it to marketing; they fixed the source spreadsheet instead of opening engineering tickets for each bad email.`,
            `We also added idempotency keys per import job so retries did not duplicate contacts. Streams handle memory; idempotency handles human operators clicking "retry" twice.`,
          ],
        },
      ],
      takeaway:
        "Large CSV imports in Node should use read streams, line-by-line parsing, batched writes, and backpressure — never readFile on multi-gigabyte uploads.",
      credit:
        "Photo: [Emile Perron](https://unsplash.com/photos/macbook-pro-on-table-beside-white-imac-and-magic-mouse-xrVDYZRGdw4) on Unsplash",
    }),
  },

  // ── Open Source ─────────────────────────────────────────────────────────
  {
    categorySlug: "open-source",
    title: "Maintaining a 400-star npm package with a full-time job",
    slug: "maintaining-small-oss-library",
    excerpt:
      "Issue triage labels, a CONTRIBUTING.md, and saying no to scope creep kept the project alive without burnout.",
    featuredImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop",
    tags: ["open-source", "maintenance", "community"],
    content: article({
      lede: `I maintain a small Zod helper package with roughly 400 GitHub stars. It is not my job. No company pays me to merge PRs on Tuesday nights. Burnout arrived when every issue felt urgent, feature requests conflicted with the library's "thin wrapper" goal, and guilt piled up whenever I left notifications unread for a week.

The project stayed alive — and I stayed employed full-time — after I treated maintenance like **product management with zero revenue**: triage labels, explicit scope, a monthly release train, and permission to say no without ghosting people.`,
      sections: [
        {
          title: "Friday triage in thirty minutes",
          bullets: [
            "\`bug\` — reproducible, blocks usage.",
            "\`question\` — answer or point to docs.",
            "\`feature\` — fits stated scope or becomes \`wontfix\`.",
            "\`good first issue\` — docs typos, test gaps, clear repro.",
          ],
          paragraphs: [
            `I batch process issues once a week instead of reacting to every ping. Questions get a docs link and a kind close if resolved. Bugs get a request for minimal reproduction. Feature tickets get compared to CONTRIBUTING scope before I write a long reply.`,
          ],
        },
        {
          title: "CONTRIBUTING.md as a scope shield",
          paragraphs: [
            `The file says plainly: "We accept PRs for TypeScript types, documentation, and bug fixes with tests. New validators belong in application code unless they benefit a clear majority of users."`,
            `That sentence deflects half of "please add XML parsing" requests without a personal rejection. Point to the doc, offer a fork link, move on. Scope creep kills small libraries faster than lack of stars.`,
          ],
        },
        {
          title: "Monthly release train",
          paragraphs: [
            `Even one fix ships on the **first Tuesday** of each month. Users trust rhythm. Security patches ship immediately; everything else waits for the train unless a sponsor depends on it (nobody does — honesty helps).`,
            `Release notes are bullet points, not essays. Changelog automation from conventional commits saved more time than any GitHub Action gimmick.`,
            `Semantic versioning still applies: a breaking type change gets a major bump even if the diff is small. Predictable cadence does not mean reckless semver.`,
          ],
        },
        {
          title: "Templates that replace guilt",
          code: {
            lang: "text",
            body: `Thanks for the report — I maintain this in evenings and will look this weekend.
If you can share a minimal repro repo, I can confirm faster.
For feature ideas, check CONTRIBUTING.md scope; happy to discuss in an issue.`,
          },
          paragraphs: [
            `Honest beats silent. Contributors assume neglect when maintainers disappear. A template reply with a timeline resets expectations without promising instant merges.`,
          ],
        },
        {
          title: "Saying no to scope creep politely",
          paragraphs: [
            `A popular issue asked for a full JSON Schema export mode. Cool idea, wrong layer for a thin helper. I labeled \`wontfix\`, explained alternatives, linked a community fork that implemented it. Stars did not drop; resentment did not build.`,
            `Archiving is valid. If you dread opening the repo, tell the truth and hand off or archive. A dead project with a README note beats a zombie that npm depends on insecurely.`,
          ],
        },
        {
          title: "What I would tell past me",
          bullets: [
            "Stars are not obligations — users chose free software with no SLA.",
            "Automate CI early; manual release steps cause avoidance.",
            "One co-maintainer beats heroics; ask a repeat contributor.",
            "Protect weekends; batch work or burn out.",
          ],
        },
        {
          title: "Growing contributors without losing focus",
          paragraphs: [
            `The best PRs we merged came from users who fixed their own bug and included a test. I added a "first-time contributor" label and personally thanked each one — retention improved more than any README badge.`,
            `Sponsorship would be nice but is not required. A hundred stars does not justify quitting your job. Set expectations in the README: response window, release cadence, and how to fork if you need faster changes.`,
            `When burnout creeps back, I take a month-long pause with a pinned issue explaining why. The project survived both times. Community respect grew because I was honest, not because I answered at midnight.`,
            `Treat issue templates as product design. A good bug report form asks for version, repro steps, and expected behavior — the same fields you would want from a coworker.`,
            `Pin a "maintainer health" note in the README if you step back temporarily. Silence reads as abandonment.`,
          ],
        },
      ],
      takeaway:
        "Small OSS survives alongside a day job when you triage weekly, document scope, ship on a predictable release cadence, and reply honestly instead of silently absorbing every request.",
      credit:
        "Photo: [Brooke Cagle](https://unsplash.com/photos/group-of-people-sitting-indoors-hFWRk4F-0nU) on Unsplash",
    }),
  },

  // ── PostgreSQL ──────────────────────────────────────────────────────────
  {
    categorySlug: "postgresql",
    title: "Partial indexes for soft-deleted rows in PostgreSQL",
    slug: "postgresql-partial-indexes-soft-delete",
    excerpt:
      "Indexing only active rows shrank index size and sped up the queries users actually run.",
    featuredImage:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&auto=format&fit=crop",
    tags: ["postgresql", "indexes", "sql"],
    content: article({
      lede: `We soft-delete users with a \`deleted_at\` timestamp instead of hard \`DELETE\`. Every query gained \`WHERE deleted_at IS NULL\`. Login, search, and foreign-key lookups all filter active rows. A naive unique index on \`email\` still indexed tombstoned accounts — bloated, slower to maintain, and useless for the queries users actually run.

**Partial indexes** in PostgreSQL let us index only active rows. Index size dropped about 40% on a 2M-row table; login lookup stayed index-only and fast. Soft delete is convenient until your indexes forget which rows matter. The migration took one afternoon; the performance win lasted years.`,
      sections: [
        {
          title: "The problem with indexing everything",
          code: {
            lang: "sql",
            body: `CREATE UNIQUE INDEX users_email_idx ON users (email);`,
          },
          paragraphs: [
            `With soft delete, emails of deleted users still occupy the unique index. You cannot re-register the same email without extra application logic unless the index ignores tombstones. Queries always filter \`deleted_at IS NULL\`, but the planner still walks dead entries unless the index matches that predicate.`,
            `Hard deletes on GDPR erasure requests still happen — partial indexes do not replace legal requirements. We hard-delete after retention windows and REINDEX if needed.`,
          ],
        },
        {
          title: "Partial unique index for active emails",
          code: {
            lang: "sql",
            body: `CREATE UNIQUE INDEX users_email_active_idx
ON users (email)
WHERE deleted_at IS NULL;`,
          },
          paragraphs: [
            `Only rows satisfying the predicate enter the index. Uniqueness applies among active users. You can soft-delete \`alice@example.com\` and register a new account with the same email later without a hacky \`email || id\` composite.`,
          ],
        },
        {
          title: "Verifying with EXPLAIN",
          code: {
            lang: "sql",
            body: `EXPLAIN (ANALYZE, BUFFERS)
SELECT id, email
FROM users
WHERE email = 'alice@example.com'
  AND deleted_at IS NULL;`,
          },
          paragraphs: [
            `Look for an **Index Only Scan** using \`users_email_active_idx\`. If you see a sequential scan, check that the query predicate matches the index predicate exactly — PostgreSQL will not use a partial index when the WHERE clause is weaker or structurally different.`,
            `Re-run EXPLAIN after major version upgrades. Planner changes occasionally affect partial index selection.`,
          ],
        },
        {
          title: "Partial indexes on hot list queries",
          code: {
            lang: "sql",
            body: `CREATE INDEX projects_active_updated_idx
ON projects (updated_at DESC)
WHERE deleted_at IS NULL;`,
          },
          paragraphs: [
            `Dashboard "recent projects" queries always exclude deleted rows. Partial indexes shrink write amplification on insert/update to deleted rows and keep working set smaller in memory.`,
            `List endpoints are often hotter than login — index the queries users hit hundreds of times per session.`,
          ],
        },
        {
          title: "ORM and migration caveats",
          bullets: [
            "Drizzle and Prisma may not infer partial indexes — document raw SQL in migration comments.",
            "Test migrations on a staging snapshot with realistic tombstone ratio.",
            "Unique partial indexes replace application-level 'find any email including deleted' checks.",
            "Monitor index bloat after large purge events — REINDEX if needed.",
          ],
          paragraphs: [
            `We added SQL comments in Drizzle migrations so the next engineer knows why the index has a WHERE clause. Without context, someone "simplifies" it back to a full index.`,
          ],
        },
        {
          title: "When partial indexes are wrong",
          paragraphs: [
            `Reporting queries that include deleted rows need different indexes — do not force one index to serve analytics and OLTP. Admin "show deleted users" screens may seq-scan by design; that is fine off the hot path.`,
            `If soft deletes are rare, gains are modest. At our tombstone ratio (~15%), partial indexes were clearly worth it.`,
            `Pair partial indexes with application checks: your ORM scopes should still filter \`deleted_at IS NULL\` even when the index matches — defense in depth for ad-hoc console queries.`,
          ],
        },
        {
          title: "Rolling out safely",
          paragraphs: [
            `We created partial indexes with \`CONCURRENTLY\` in production to avoid long write locks on the users table. Staging first caught a typo in the predicate — always match \`deleted_at IS NULL\` exactly, not \`deleted_at = NULL\`.`,
            `After deploy, we compared index size with \`pg_relation_size\` and query plans with \`EXPLAIN\`. Login p95 dropped without touching application code beyond removing redundant \`OR deleted_at IS NOT NULL\` branches dead code left behind.`,
            `Document partial indexes in your data dictionary. Future you will wonder why \`users_email_active_idx\` exists when a plain email index seems enough — the WHERE clause is the whole point.`,
            `Vacuum and autovacuum still matter. Partial indexes reduce bloat but do not eliminate it when you soft-delete thousands of accounts during a compliance purge.`,
          ],
        },
      ],
      takeaway:
        "Align PostgreSQL partial indexes with your soft-delete filter so unique constraints and hot lookups only touch active rows — smaller indexes, faster scans, simpler email reuse.",
      credit:
        "Photo: [Tim Gouw](https://unsplash.com/photos/closeup-photo-of-computer-keyboard-mCuh3aaCQzk) on Unsplash",
    }),
  },
];
