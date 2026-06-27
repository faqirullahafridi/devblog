export const TOOL_GUIDES: Record<string, string> = {
  "json-formatter": `## What is JSON?

JSON (JavaScript Object Notation) is the standard format for APIs and config files. Keys must be double-quoted strings; values can be strings, numbers, booleans, null, arrays, or objects.

## How to use this tool

1. Paste raw JSON into the input area
2. Click **Format** for readable indentation
3. Click **Minify** to remove whitespace for production
4. Invalid JSON shows an error with the line position

## Common mistakes

| Error | Fix |
|-------|-----|
| Trailing comma | Remove last comma in object/array |
| Single quotes | Use double quotes for keys and strings |
| Comments | JSON does not allow comments — use JSONC in editors only |

## When to use JSON

- REST API request/response bodies
- \`package.json\`, \`tsconfig.json\`
- Storing structured data in localStorage

## Related

- [JSON syntax reference](/refs/json-syntax)
- [Learn: JSON APIs](/learn/web-apis/json-apis)
- [JSON → TypeScript tool](/tools/json-to-typescript)`,

  "jwt-decoder": `## What is a JWT?

A JSON Web Token has three Base64URL parts: **header**, **payload**, and **signature**, separated by dots.

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature
\`\`\`

## How to use this tool

Paste a token to decode the header and payload. **This does not verify the signature** — never trust decoded claims alone in production.

## Common claims

| Claim | Meaning |
|-------|---------|
| \`sub\` | Subject (user id) |
| \`exp\` | Expiration timestamp |
| \`iat\` | Issued at |
| \`iss\` | Issuer |

## Security notes

- Always verify signatures server-side with your secret or public key
- Check \`exp\` before trusting a token
- Never store sensitive data in JWT payload (it's readable by anyone)

## Related

- [Learn: JWT auth](/learn/web-apis/auth-jwt)
- [JWT decode snippet](/snippets/jwt-decode-payload)`,

  "regex-tester": `## What are regular expressions?

Regex patterns match text for validation, search/replace, and parsing. Flags change behavior: \`g\` global, \`i\` case-insensitive, \`m\` multiline.

## How to use this tool

1. Enter your pattern (without delimiters)
2. Enter test text
3. See matches highlighted live
4. Toggle flags and watch results update

## Common patterns

- Email (basic): \`^[\\w.%+-]+@[\\w.-]+\\.[a-zA-Z]{2,}$\`
- Digits only: \`^\\d+$\`
- URL: \`^https?:\\/\\/.+\`

## Tips

- Start simple, add complexity gradually
- Use [regex reference](/refs/regex-patterns)
- Prefer built-in validation libraries for email/password in production

## Related

- [Email validation snippet](/snippets/regex-email-basic)
- [Learn: strings chapter](/learn/javascript-fundamentals/strings-templates)`,

  "encode-decode": `## Base64 and URL encoding

**Base64** encodes binary data as ASCII text — used in data URLs, basic auth headers, and JWT segments.

**URL encoding** (percent-encoding) makes strings safe for query parameters.

## How to use

- Paste text → encode to Base64 or URL format
- Paste encoded text → decode back
- Useful for debugging API payloads and auth headers

## When you need this

| Encoding | Use case |
|----------|----------|
| Base64 | Images in CSS, Basic Auth |
| URL encode | Query string values with spaces/symbols |

## Related

- [Learn: HTTP methods](/learn/web-apis/methods-headers)`,

  "timestamp": `## Unix timestamps

A Unix timestamp is seconds (or milliseconds) since **Jan 1, 1970 UTC**.

## How to use

- Enter a timestamp → see human-readable date in your timezone
- Pick a date → get the Unix timestamp for APIs and databases

## JavaScript

\`\`\`javascript
Date.now()              // ms
Math.floor(Date.now()/1000) // seconds
new Date(1710000000 * 1000)
\`\`\`

## Common in APIs

Logs, JWT \`exp\`/\`iat\`, database \`created_at\` fields.`,

  "uuid-generator": `## UUIDs (Universally Unique Identifiers)

UUID v4 uses random bits — great for database primary keys, request IDs, and file names without coordination.

## Format

\`550e8400-e29b-41d4-a716-446655440000\` — 128 bits, hex with hyphens.

## When to use

- Client-generated IDs before server insert
- Correlation IDs in logs
- Unique filenames in uploads

## JavaScript

\`\`\`javascript
crypto.randomUUID() // modern browsers & Node
\`\`\`

## Related

- [PostgreSQL patterns](/snippets/sql-upsert-postgres)`,

  "hash-generator": `## Cryptographic hashes

Hash functions map input to a fixed-length fingerprint. Same input → same hash. One-way: you cannot reverse a hash.

## Algorithms

| Algorithm | Use |
|-----------|-----|
| SHA-256 | File integrity, blockchain |
| SHA-512 | Stronger hashing |

## Not for passwords

Use **bcrypt**, **argon2**, or **scrypt** for passwords — not plain SHA-256.

## Use cases

- Verify file downloads
- Cache keys
- HMAC message authentication`,

  "markdown-preview": `## Markdown

Markdown is a lightweight markup language for README files, blog posts, and docs. This blog renders markdown with GFM (tables, task lists, strikethrough).

## Syntax quick reference

\`\`\`markdown
# Heading
**bold** *italic*
\`code\`
[link](url)
- list item
\`\`\`

## How to use

Type markdown on the left; preview renders on the right. Great for drafting articles before pasting into the admin editor.

## Related

- Admin post editor uses the same rendering
- [HTML reference](/refs/html)`,

  "sql-formatter": `## SQL formatting

Readable SQL helps code review and debugging. This tool indents SELECT, JOIN, WHERE, and subqueries.

## Best practices

- One clause per line for complex queries
- Align JOIN conditions
- Name columns explicitly in production (\`SELECT id, title\` not \`SELECT *\`)

## Learn SQL deeply

- [SQL learning path](/learn/sql-databases/sql-intro)
- [SQL reference](/refs/sql)
- [JOINs lesson](/learn/sql-databases/joins)`,

  "color-converter": `## Color formats

Web developers work with multiple color notations:

| Format | Example |
|--------|---------|
| HEX | \`#0891b2\` |
| RGB | \`rgb(8, 145, 178)\` |
| HSL | \`hsl(192, 90%, 36%)\` |

## How to use

Enter any format — see equivalents instantly. Useful for design systems and Tailwind customization.

## Related

- [CSS reference](/refs/css)
- [Tailwind snippets](/snippets/tailwind-button-variants)`,

  "cron-parser": `## Cron expressions

Cron schedules recurring jobs on servers (backups, newsletters, cache clears).

## Format (5 fields)

\`\`\`
* * * * *
│ │ │ │ └── day of week (0-7)
│ │ │ └──── month (1-12)
│ │ └────── day of month (1-31)
│ └──────── hour (0-23)
└────────── minute (0-59)
\`\`\`

## Examples

| Expression | Meaning |
|------------|---------|
| \`0 9 * * *\` | Daily at 9:00 AM |
| \`*/15 * * * *\` | Every 15 minutes |
| \`0 0 * * 0\` | Weekly Sunday midnight |

Paste an expression to see the next run times explained.`,

  "text-diff": `## Text diff

Compare two versions of code, config, or copy to see what changed. Essential for code review and debugging.

## How to use

- **Original** — previous version
- **Modified** — new version
- Added lines highlighted green, removed lines red

## When to use

- Reviewing PR changes offline
- Comparing JSON configs before deploy
- Finding what changed in .env templates

## Related

- [Git undo lesson](/learn/devops-git/undo-fixes)
- [Learn: code review](/learn/devops-git/code-review)`,

  "json-to-typescript": `## JSON to TypeScript

Paste a JSON API response to generate TypeScript interfaces automatically.

## Example

Input:
\`\`\`json
{ "id": 1, "title": "Hi", "tags": ["a"] }
\`\`\`

Output:
\`\`\`typescript
interface Root {
  id: number;
  title: string;
  tags: string[];
}
\`\`\`

## Tips

- Rename \`Root\` to something meaningful (\`Post\`, \`User\`)
- Use with [Zod validation snippet](/snippets/typescript-zod-parse) for runtime safety
- [TypeScript React lesson](/learn/frontend-react/typescript-react)`,
};

export function getToolGuide(slug: string) {
  return TOOL_GUIDES[slug] ?? "";
}
