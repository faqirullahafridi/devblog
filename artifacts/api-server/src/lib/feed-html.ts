type FeedPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: Date;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function renderFeedHtml(site: string, posts: FeedPost[]) {
  const items = posts
    .map((post) => {
      const url = `${site}/post/${post.slug}`;
      const title = escapeHtml(post.title);
      const excerpt = escapeHtml(post.excerpt ?? "");
      const date = escapeHtml(formatDate(new Date(post.createdAt)));
      return `<article class="item">
  <time datetime="${new Date(post.createdAt).toISOString()}">${date}</time>
  <h2><a href="${url}">${title}</a></h2>
  ${excerpt ? `<p>${excerpt}</p>` : ""}
  <a class="read-more" href="${url}">Read article →</a>
</article>`;
    })
    .join("\n");

  const empty = `<p class="empty">No published posts yet. Check back soon.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RSS Feed — devblog</title>
  <link rel="alternate" type="application/rss+xml" title="devblog RSS" href="${site}/feed.xml?format=xml" />
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --primary: #0891b2;
      --primary-hover: #0e7490;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b1220;
        --card: #111827;
        --text: #f1f5f9;
        --muted: #94a3b8;
        --border: #1e293b;
        --primary: #22d3ee;
        --primary-hover: #67e8f9;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    .wrap { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
    header { margin-bottom: 2rem; }
    .badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.875rem; font-weight: 800; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
    .lead { color: var(--muted); margin: 0 0 1rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.875rem; }
    .actions a { color: var(--primary); text-decoration: none; }
    .actions a:hover { color: var(--primary-hover); text-decoration: underline; }
    .item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
    }
    .item time { font-size: 0.8rem; color: var(--muted); }
    .item h2 { font-size: 1.125rem; margin: 0.35rem 0 0.5rem; line-height: 1.35; }
    .item h2 a { color: var(--text); text-decoration: none; }
    .item h2 a:hover { color: var(--primary); }
    .item p { margin: 0 0 0.75rem; color: var(--muted); font-size: 0.95rem; }
    .read-more { font-size: 0.875rem; font-weight: 600; color: var(--primary); text-decoration: none; }
    .read-more:hover { text-decoration: underline; }
    .empty { color: var(--muted); text-align: center; padding: 2rem; }
    footer {
      margin-top: 2.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <p class="badge">RSS Feed</p>
      <h1>devblog</h1>
      <p class="lead">Developer knowledge hub — latest articles and tutorials.</p>
      <div class="actions">
        <a href="${site}/">← Back to site</a>
        <a href="${site}/feed.xml?format=xml">Subscribe via RSS (XML)</a>
      </div>
    </header>
    <main>
      ${posts.length > 0 ? items : empty}
    </main>
    <footer>
      Use the RSS link above in Feedly, Inoreader, or your favorite reader.
    </footer>
  </div>
</body>
</html>`;
}

export function wantsFeedHtml(req: { query: Record<string, unknown>; headers: { accept?: string } }) {
  if (req.query.format === "xml" || req.query.raw === "1") return false;
  const accept = req.headers.accept ?? "";
  if (accept.includes("application/rss+xml") || accept.includes("application/atom+xml")) {
    return false;
  }
  return accept.includes("text/html");
}
