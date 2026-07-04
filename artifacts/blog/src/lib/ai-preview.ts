export type ChatPreviewBundle = {
  srcDoc: string;
  label: string;
  files: { html: string; css: string; js: string };
};

export type ChatCodeBlock = {
  id: string;
  lang: string;
  label: string;
  code: string;
};

type CodeBlock = { lang: string; code: string };

const PREVIEW_LANGS = new Set(["html", "htm", "css", "js", "javascript"]);

const LANG_FILENAMES: Record<string, string> = {
  html: "index.html",
  htm: "index.html",
  css: "styles.css",
  js: "script.js",
  javascript: "script.js",
  typescript: "index.ts",
  ts: "index.ts",
  tsx: "App.tsx",
  jsx: "App.jsx",
  python: "main.py",
  py: "main.py",
  sql: "query.sql",
  go: "main.go",
  rust: "main.rs",
  java: "Main.java",
  kotlin: "Main.kt",
  swift: "main.swift",
  php: "index.php",
  ruby: "main.rb",
  rb: "main.rb",
  csharp: "Program.cs",
  cs: "Program.cs",
  cpp: "main.cpp",
  c: "main.c",
  json: "data.json",
  yaml: "config.yaml",
  yml: "config.yml",
  bash: "script.sh",
  sh: "script.sh",
  shell: "script.sh",
  dockerfile: "Dockerfile",
  docker: "Dockerfile",
};

function parseFencedBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const re = /```([\w-]*)\s*\n?([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    blocks.push({ lang: (match[1] || "").toLowerCase(), code: match[2].replace(/\n$/, "") });
  }
  return blocks;
}

/** Parse #### `styles.css` / #### App.js followed by fenced blocks. */
function parseMarkdownFileBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const re = /#{2,6}\s*`?([^\n`]+?)`?\s*\n+```([\w-]*)\s*\n?([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const filename = match[1].trim().toLowerCase();
    const lang = langFromFilename(filename) || (match[2] || "").toLowerCase() || "text";
    blocks.push({ lang, code: match[3].replace(/\n$/, "") });
  }
  return blocks;
}

function langFromFilename(filename: string): string {
  const name = filename.toLowerCase();
  if (name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".js") || name.endsWith(".mjs")) return "javascript";
  if (name.endsWith(".jsx")) return "jsx";
  if (name.endsWith(".tsx")) return "tsx";
  return "";
}

function parseAllCodeBlocks(content: string): CodeBlock[] {
  return [...parseFencedBlocks(content), ...parseMarkdownFileBlocks(content)];
}

function normalizeHtmlCode(code: string): string {
  const match = code.match(/[\s\S]*?<\/html>/i);
  if (match) return match[0].trim();
  return code.trim();
}

function isReactShellHtml(html: string): boolean {
  const h = html.toLowerCase();
  if (/id\s*=\s*["']root["']/.test(h) && /<script[^>]+src\s*=\s*["'][^"']*\.js["']/i.test(html)) {
    return true;
  }
  if (/id\s*=\s*["']root["']/.test(h) && !/<(?:section|nav|header|main|footer|article)\b/i.test(html)) {
    return true;
  }
  return false;
}

function isReactJsCode(code: string): boolean {
  return (
    /\bimport\s+.+?\s+from\s+['"]/i.test(code) ||
    /\bexport\s+default\b/i.test(code) ||
    /ReactDOM\.(render|createRoot)/i.test(code) ||
    /from\s+['"]react['"]/i.test(code) ||
    /<\s*[A-Z][A-Za-z]*/.test(code)
  );
}

/** Pick vanilla html/css/js from messy multi-file React output. */
function selectStaticSiteParts(blocks: CodeBlock[]): { html: string; css: string; js: string } {
  const htmlCandidates = blocks.filter(
    (b) => ["html", "htm"].includes(b.lang) || isFullHtmlDocument(b.code) || /\.html?$/i.test(b.lang),
  );
  let html = "";
  for (const c of [...htmlCandidates].sort((a, b) => b.code.length - a.code.length)) {
    const cleaned = normalizeHtmlCode(c.code);
    if (cleaned.length > 80 && !isReactShellHtml(cleaned)) {
      html = cleaned;
      break;
    }
  }

  const css =
    blocks
      .filter((b) => b.lang === "css")
      .sort((a, b) => b.code.length - a.code.length)[0]?.code ?? "";

  const jsCandidates = blocks.filter((b) => ["js", "javascript"].includes(b.lang));
  const vanillaJs = jsCandidates.filter((b) => !isReactJsCode(b.code));
  const js =
    (vanillaJs.sort((a, b) => b.code.length - a.code.length)[0] ?? jsCandidates.find((b) => !isReactJsCode(b.code)))
      ?.code ?? "";

  return { html, css, js };
}

function staticSiteBlocksFromContent(content: string): ChatCodeBlock[] | null {
  const parsed = dedupeWebsiteBlocks(parseAllCodeBlocks(content));
  const { html, css, js } = selectStaticSiteParts(parsed);
  if (!html && !css && !js) return null;

  const result: ChatCodeBlock[] = [];
  if (html) result.push({ id: "static-html", lang: "html", label: "index.html", code: html });
  if (css) result.push({ id: "static-css", lang: "css", label: "styles.css", code: css });
  if (js && !isReactJsCode(js)) {
    result.push({ id: "static-js", lang: "javascript", label: "script.js", code: js });
  }
  return result.length ? result : null;
}

export function isLowQualityReactOutput(content: string): boolean {
  const blocks = parseAllCodeBlocks(content);
  const hasReactFiles =
    /#{2,6}\s*`?(?:index|app|hero|features)\.js`?/i.test(content) ||
    blocks.some((b) => isReactJsCode(b.code));
  const html = selectStaticSiteParts(blocks).html;
  const hasRealHtml = Boolean(html);
  return hasReactFiles && !hasRealHtml;
}

/** Read an open (unclosed) fenced block — used while the model is still streaming. */
function extractOpenBlock(content: string, langs: string[]): string {
  for (const lang of langs) {
    const re = new RegExp(`\`\`\`${lang}\\s*\\n?([\\s\\S]*)$`, "i");
    const match = content.match(re);
    if (match?.[1] && !content.slice(match.index!).includes("```", match[0].length)) {
      return match[1];
    }
  }
  return "";
}

function filenameForLang(lang: string, index: number): string {
  const base = LANG_FILENAMES[lang] ?? (lang ? `${lang}.${lang}` : `snippet-${index + 1}.txt`);
  return index > 0 ? base.replace(/(\.[^.]+)$/, `-${index + 1}$1`) : base;
}

/** All fenced code blocks from an assistant message (any language). */
export function extractChatCodeBlocks(content: string): ChatCodeBlock[] {
  const staticBlocks = staticSiteBlocksFromContent(content);
  if (staticBlocks?.length) {
    return staticBlocks;
  }

  const closed = dedupeWebsiteBlocks(parseAllCodeBlocks(content));
  const counts = new Map<string, number>();
  const blocks: ChatCodeBlock[] = closed
    .filter((b) => {
      if (["jsx", "tsx"].includes(b.lang)) return false;
      if (["js", "javascript"].includes(b.lang) && isReactJsCode(b.code)) return false;
      if (["html", "htm"].includes(b.lang) && isReactShellHtml(normalizeHtmlCode(b.code))) return false;
      return true;
    })
    .map((b, i) => {
      const key = dedupeLangKey(b.lang) ?? b.lang;
      const n = counts.get(key) ?? 0;
      counts.set(key, n + 1);
      let code = b.code;
      if (["html", "htm"].includes(b.lang)) code = normalizeHtmlCode(code);
      return {
        id: `block-${i}`,
        lang: b.lang || "text",
        label: filenameForLang((dedupeLangKey(b.lang) ?? b.lang) || "text", n),
        code,
      };
    });

  if (staticBlocks?.length) {
    return dedupeChatCodeBlocks(staticBlocks.length >= blocks.length ? staticBlocks : blocks);
  }

  const openMatch = content.match(/```([\w-]*)\s*\n([\s\S]*)$/);
  if (openMatch && !content.slice(openMatch.index!).includes("```", openMatch[0].length)) {
    const lang = (openMatch[1] || "text").toLowerCase();
    const n = counts.get(lang) ?? 0;
    let code = openMatch[2];
    if (lang === "html" || lang === "htm") code = normalizeHtmlCode(code);
    blocks.push({
      id: `block-open`,
      lang,
      label: filenameForLang(lang, n),
      code,
    });
  }

  return dedupeChatCodeBlocks(blocks);
}

function isFullHtmlDocument(code: string): boolean {
  return /<!DOCTYPE\s+html/i.test(code) || /<html[\s>]/i.test(code);
}

const PREVIEW_BASE_CSS = `
html, body {
  margin: 0;
  min-height: 100%;
}
`;

function escapeScriptContent(js: string): string {
  return js.replace(/<\/(script)/gi, "<\\/$1");
}

function escapeStyleContent(css: string): string {
  return css.replace(/<\/(style)/gi, "<\\/$1");
}

function stripExternalAssetRefs(html: string): string {
  return html
    .replace(/<link\b[^>]*rel=["'][^"']*stylesheet[^"']*["'][^>]*>/gi, "")
    .replace(/<script\b[^>]*\bsrc\s*=\s*["'][^"']+["'][^>]*>\s*<\/script>/gi, "");
}

function injectPreviewBaseCss(doc: string): string {
  const tag = `<style id="preview-base">${PREVIEW_BASE_CSS}</style>`;
  if (/<head[\s>]/i.test(doc)) {
    return doc.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  }
  if (/<html[\s>]/i.test(doc)) {
    return doc.replace(/<html([^>]*)>/i, `<html$1><head>${tag}</head>`);
  }
  return doc;
}

export function wrapHtmlFragment(html: string, css = "", js = ""): string {
  let body = html;
  const inlineStyles = extractInlineStyles(body);
  body = inlineStyles.html;
  const inlineScripts = extractInlineScripts(body);
  body = inlineScripts.html;

  const mergedCss = [inlineStyles.css, css].filter(Boolean).join("\n\n");
  const mergedJs = wrapUserScript([inlineScripts.js, js].filter(Boolean).join("\n\n"));

  const safeCss = escapeStyleContent(mergedCss);
  const safeJs = escapeScriptContent(mergedJs);

  if (isFullHtmlDocument(body)) {
    let doc = stripExternalAssetRefs(body);
    if (safeCss) {
      const styleTag = `<style id="preview-styles">${safeCss}</style>`;
      doc = insertBeforeClose(doc, "head", styleTag);
    }
    if (safeJs) {
      const scriptTag = `<script id="preview-script">${safeJs}</script>`;
      doc = insertBeforeClose(doc, "body", scriptTag);
    }
    return injectPreviewBaseCss(doc);
  }

  return injectPreviewBaseCss(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style id="preview-base">${PREVIEW_BASE_CSS}</style>
  ${safeCss ? `<style id="preview-styles">${safeCss}</style>` : ""}
</head>
<body>
${body}
${safeJs ? `<script id="preview-script">${safeJs}</script>` : ""}
</body>
</html>`);
}

function pickBlock(blocks: CodeBlock[], langs: string[]): CodeBlock | undefined {
  const matches = blocks.filter((b) => langs.includes(b.lang));
  if (!matches.length) return undefined;
  return matches.reduce((best, b) => (b.code.length > best.code.length ? b : best));
}

function pickHtmlBlock(blocks: CodeBlock[]): CodeBlock | undefined {
  const htmlLike = blocks.filter(
    (b) =>
      ["html", "htm"].includes(b.lang) ||
      ((b.lang === "" || b.lang === "xml") &&
        (isFullHtmlDocument(b.code) ||
          /<(?:div|section|main|header|footer|body|nav|article)[\s>]/i.test(b.code))),
  );
  if (!htmlLike.length) return undefined;
  return htmlLike.reduce((best, b) => (b.code.length > best.code.length ? b : best));
}

const WEBSITE_LANG_KEYS = new Set(["html", "htm", "css", "js", "javascript", "jsx", "tsx"]);

function dedupeLangKey(lang: string): string | null {
  if (lang === "htm" || lang === "html") return "html";
  if (lang === "javascript" || lang === "js") return "js";
  if (lang === "css" || lang === "jsx" || lang === "tsx") return lang;
  return null;
}

/** Keep only the largest block per html/css/js/jsx/tsx — avoids App-2.jsx, index-2.html, etc. */
function dedupeWebsiteBlocks(blocks: CodeBlock[]): CodeBlock[] {
  const best = new Map<string, CodeBlock>();
  const rest: CodeBlock[] = [];

  for (const b of blocks) {
    const key = dedupeLangKey(b.lang);
    if (key) {
      const prev = best.get(key);
      if (!prev || b.code.length > prev.code.length) best.set(key, b);
    } else {
      rest.push(b);
    }
  }

  const order = ["html", "css", "js", "jsx", "tsx"];
  const ordered = order.filter((k) => best.has(k)).map((k) => best.get(k)!);
  return [...ordered, ...rest];
}

function dedupeChatCodeBlocks(blocks: ChatCodeBlock[]): ChatCodeBlock[] {
  const best = new Map<string, ChatCodeBlock>();
  const rest: ChatCodeBlock[] = [];

  for (const b of blocks) {
    const key = dedupeLangKey(b.lang);
    if (key) {
      const prev = best.get(key);
      if (!prev || b.code.length > prev.code.length) {
        best.set(key, { ...b, label: filenameForLang(key, 0) });
      }
    } else {
      rest.push(b);
    }
  }

  const order = ["html", "css", "js", "jsx", "tsx"];
  const ordered = order.filter((k) => best.has(k)).map((k) => best.get(k)!);
  return [...ordered, ...rest];
}

function buildPreviewBundle(html: string, css: string, js: string): ChatPreviewBundle | null {
  if (!html && !css && !js) return null;

  const scaffold = `<main class="preview-root"></main>`;
  const htmlBody = html || scaffold;
  const linkedHtml = ensureMultiFileProjectHtml(htmlBody, !!css, !!js);

  return {
    srcDoc: wrapHtmlFragment(htmlBody, css, js),
    label: html && isFullHtmlDocument(html) ? "Site preview" : "Page preview",
    files: { html: linkedHtml, css, js },
  };
}

function normalizeJsxForBrowser(jsx: string): string {
  let code = jsx.trim();
  code = code.replace(/^import\s+.+?;?\s*$/gm, "");

  const exportFn = code.match(/^export\s+default\s+function\s+(\w+)/m);
  if (exportFn) {
    code = code.replace(/^export\s+default\s+/m, "");
    if (exportFn[1] !== "App") {
      code += `\nconst App = ${exportFn[1]};`;
    }
  } else {
    code = code.replace(/^export\s+default\s+/m, "");
  }

  if (!/createRoot|ReactDOM\.render/.test(code)) {
    code += `

const __previewRoot = document.getElementById("root");
const __PreviewApp = typeof App !== "undefined" ? App : null;
if (__previewRoot && __PreviewApp) {
  ReactDOM.createRoot(__previewRoot).render(React.createElement(__PreviewApp));
}`;
  }
  return code;
}

function buildJsxPreviewBundle(jsx: string, css: string): ChatPreviewBundle {
  const body = normalizeJsxForBrowser(jsx);
  const safeCss = escapeStyleContent(css);
  const safeJsx = escapeScriptContent(body);
  const srcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${PREVIEW_BASE_CSS}${safeCss}</style>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react,env">${safeJsx}</script>
</body>
</html>`;
  return {
    srcDoc,
    label: "React preview",
    files: { html: '<div id="root"></div>', css, js: jsx },
  };
}

function pickBlockFromChat(
  blocks: ChatCodeBlock[],
  langs: string[],
  labelRx?: RegExp,
): ChatCodeBlock | undefined {
  const byLang = blocks.filter((b) => langs.includes(b.lang));
  const byLabel = labelRx ? blocks.filter((b) => labelRx.test(b.label)) : [];
  const matches = [...byLang, ...byLabel.filter((b) => !byLang.includes(b))];
  if (!matches.length) return undefined;
  return matches.reduce((best, b) => (b.code.length > best.code.length ? b : best));
}

function pickBlockCode(blocks: ChatCodeBlock[], langs: string[], labelRx?: RegExp): string {
  return pickBlockFromChat(blocks, langs, labelRx)?.code ?? "";
}

function insertBeforeClose(html: string, tag: "head" | "body", snippet: string): string {
  const close = new RegExp(`</${tag}>`, "i");
  if (close.test(html)) return html.replace(close, `${snippet}\n</${tag}>`);
  if (tag === "head" && /<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${snippet}`);
  }
  if (tag === "body" && /<body[\s>]/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1>${snippet}`);
  }
  return html;
}

function sanitizeHtmlForProjectFiles(html: string, hasExternalCss: boolean, hasExternalJs: boolean): string {
  let doc = html;
  if (hasExternalCss) {
    doc = doc.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    doc = doc.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, "");
  }
  if (hasExternalJs) {
    doc = doc.replace(
      /<script\b(?![^>]*\bsrc\s*=)(?![^>]*type\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
  }
  return doc;
}
/** index.html with correct relative links for zip / playground (not inlined). */
export function ensureMultiFileProjectHtml(html: string, hasCss: boolean, hasJs: boolean): string {
  let doc = sanitizeHtmlForProjectFiles(html.trim(), hasCss, hasJs);
  if (!doc) {
    doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Site</title>
</head>
<body>
  <main></main>
</body>
</html>`;
  } else if (!isFullHtmlDocument(doc)) {
    doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Site</title>
</head>
<body>
${doc}
</body>
</html>`;
  }

  if (hasCss) {
    doc = stripExternalAssetRefs(doc);
    if (!/styles\.css/i.test(doc)) {
      doc = insertBeforeClose(doc, "head", '<link rel="stylesheet" href="styles.css" />');
    }
  }
  if (hasJs) {
    doc = stripExternalAssetRefs(doc);
    if (!/script\.js/i.test(doc)) {
      doc = insertBeforeClose(doc, "body", '<script src="script.js"></script>');
    }
  }
  return doc;
}

function extractInlineStyles(html: string): { html: string; css: string } {
  let collected = "";
  const stripped = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    collected += `${css}\n`;
    return "";
  });
  return { html: stripped, css: collected.trim() };
}

function extractInlineScripts(html: string): { html: string; js: string } {
  let collected = "";
  const stripped = html.replace(
    /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi,
    (_, js: string) => {
      collected += `${js}\n`;
      return "";
    },
  );
  return { html: stripped, js: collected.trim() };
}

function wrapUserScript(js: string): string {
  const trimmed = js.trim();
  if (!trimmed) return "";
  return `(function() {
  const __run = function() {
${trimmed}
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __run);
  } else {
    __run();
  }
})();`;
}

/** Build a live preview from deduped code blocks (html/css/js only — no React for preview). */
export function buildPreviewFromBlocks(blocks: ChatCodeBlock[]): ChatPreviewBundle | null {
  if (!blocks.length) return null;

  const htmlBlock =
    pickBlockFromChat(blocks, ["html", "htm"], /\.html?$/i) ??
    blocks.find(
      (b) =>
        isFullHtmlDocument(b.code) ||
        (b.code.length > 40 &&
          /<(?:section|nav|header|main|footer|article|body)[\s>]/i.test(b.code)),
    );
  const cssBlock = pickBlockFromChat(blocks, ["css"], /\.css$/i);
  const jsBlock = pickBlockFromChat(blocks, ["js", "javascript"], /\.js$/i);

  const html = htmlBlock?.code ?? "";
  const css = cssBlock?.code ?? "";
  const js = jsBlock?.code ?? "";

  if (html || css || js) return buildPreviewBundle(html, css, js);

  const jsxBlock = pickBlockFromChat(blocks, ["jsx", "tsx"], /\.(jsx|tsx)$/i);
  if (jsxBlock) return buildJsxPreviewBundle(jsxBlock.code, pickBlockCode(blocks, ["css"], /\.css$/i));

  return null;
}

/** All project files for zip download — linked index.html + separate assets. */
export function collectProjectEntries(blocks: ChatCodeBlock[]): { path: string; content: string }[] {
  if (!blocks.length) return [];

  const html =
    pickBlockCode(blocks, ["html", "htm"], /\.html?$/i) ||
    blocks.find(
      (b) =>
        isFullHtmlDocument(b.code) ||
        (b.code.length > 40 &&
          /<(?:section|nav|header|main|footer|article|body)[\s>]/i.test(b.code)),
    )?.code ||
    "";
  const css = pickBlockCode(blocks, ["css"], /\.css$/i);
  const js = pickBlockCode(blocks, ["js", "javascript"], /\.js$/i);
  const jsxBlock = pickBlockFromChat(blocks, ["jsx", "tsx"], /\.(jsx|tsx)$/i);

  const usedPaths = new Set<string>();
  const entries: { path: string; content: string }[] = [];

  const add = (path: string, content: string) => {
    if (!content.trim()) return;
    usedPaths.add(path);
    entries.push({ path, content });
  };

  if (html || css || js) {
    add("index.html", ensureMultiFileProjectHtml(html, !!css, !!js));
    if (css) add("styles.css", css);
    if (js) add("script.js", js);
    return entries;
  }

  if (jsxBlock) add(jsxBlock.label || "App.jsx", jsxBlock.code);
  if (css && jsxBlock) add("styles.css", css);

  for (const block of blocks) {
    if (!usedPaths.has(block.label)) {
      add(block.label, block.code);
    }
  }

  return entries;
}

function collectPreviewParts(content: string): { html: string; css: string; js: string; jsx: string } {
  const blocks = dedupeWebsiteBlocks(parseAllCodeBlocks(content));
  const staticParts = selectStaticSiteParts(blocks);
  if (staticParts.html || staticParts.css || staticParts.js) {
    return { ...staticParts, jsx: "" };
  }
  const htmlBlock = pickHtmlBlock(blocks);
  const cssBlock = pickBlock(blocks, ["css"]);
  const jsBlock = pickBlock(blocks, ["js", "javascript"]);
  const jsxBlock = pickBlock(blocks, ["jsx", "tsx"]);

  let html = htmlBlock?.code ?? "";
  let css = cssBlock?.code ?? "";
  let js = jsBlock?.code ?? "";
  let jsx = jsxBlock?.code ?? "";

  if (!html) html = extractOpenBlock(content, ["html", "htm"]);
  if (!css) css = extractOpenBlock(content, ["css"]);
  if (!js) js = extractOpenBlock(content, ["js", "javascript"]);
  if (!jsx) jsx = extractOpenBlock(content, ["jsx", "tsx"]);

  return { html, css, js, jsx };
}

export function extractChatPreview(content: string): ChatPreviewBundle | null {
  const { html, css, js, jsx } = collectPreviewParts(content);
  if (!html && !css && !js && !jsx) return null;

  if (html && (isFullHtmlDocument(html) || html.length > 20)) {
    return buildPreviewBundle(html, css, js);
  }

  if (jsx && jsx.length > 40) {
    return buildJsxPreviewBundle(jsx, css);
  }

  if (css || js) {
    return buildPreviewBundle("", css, js);
  }

  const standalone = dedupeWebsiteBlocks(parseFencedBlocks(content)).find(
    (b) => ["html", "htm"].includes(b.lang) || isFullHtmlDocument(b.code),
  );
  if (standalone) {
    const { css, js } = collectPreviewParts(content);
    return buildPreviewBundle(standalone.code, css, js);
  }

  return null;
}

export function extractChatPreviewPartial(content: string): ChatPreviewBundle | null {
  return buildPreviewFromBlocks(extractChatCodeBlocks(content)) ?? extractChatPreview(content);
}

/** Remove all fenced code from markdown — explanation only in the chat column. */
export function stripChatCodeFences(content: string): string {
  let text = content.replace(/```[\w-]*\s*\n[\s\S]*?```/g, "");
  text = text.replace(/```[\w-]*\s*\n[\s\S]*$/i, "");
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/** @deprecated use stripChatCodeFences */
export function stripPreviewCodeFences(content: string): string {
  let text = content.replace(/```[\w-]*\s*\n[\s\S]*?```/g, (block) => {
    const lang = block.match(/^```([\w-]*)/)?.[1]?.toLowerCase() ?? "";
    return PREVIEW_LANGS.has(lang) ? "" : block;
  });
  text = text.replace(/```[\w-]*\s*\n[\s\S]*$/i, "");
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export const PLAYGROUND_IMPORT_KEY = "devblog-playground-import";

export function savePlaygroundImport(files: { html: string; css: string; js: string }): void {
  try {
    sessionStorage.setItem(PLAYGROUND_IMPORT_KEY, JSON.stringify(files));
  } catch {
    /* private mode */
  }
}

function triggerBlobDownload(filename: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function triggerDownload(filename: string, content: string, mime: string) {
  triggerBlobDownload(filename, new Blob([content], { type: mime }));
}

export async function downloadPreviewZip(preview: ChatPreviewBundle, zipName = "site"): Promise<void> {
  const blocks: ChatCodeBlock[] = [];
  let i = 0;
  if (preview.files.html.trim()) {
    blocks.push({ id: `zip-${i++}`, lang: "html", label: "index.html", code: preview.files.html });
  }
  if (preview.files.css.trim()) {
    blocks.push({ id: `zip-${i++}`, lang: "css", label: "styles.css", code: preview.files.css });
  }
  if (preview.files.js.trim()) {
    blocks.push({
      id: `zip-${i++}`,
      lang: "javascript",
      label: preview.label === "React preview" ? "App.jsx" : "script.js",
      code: preview.files.js,
    });
  }
  await downloadProjectZip(blocks, zipName);
}

export async function downloadProjectZip(blocks: ChatCodeBlock[], zipName = "project"): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const entries = collectProjectEntries(blocks);

  if (!entries.length) {
    for (const block of blocks) {
      zip.file(block.label, block.code);
    }
  } else {
    for (const { path, content } of entries) {
      zip.file(path, content);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  triggerBlobDownload(`${zipName}.zip`, blob);
}

export function downloadCodeBlock(block: ChatCodeBlock) {
  triggerDownload(block.label, block.code, "text/plain;charset=utf-8");
}

/** @deprecated use downloadProjectZip */
export function downloadAllCodeBlocks(blocks: ChatCodeBlock[]) {
  void downloadProjectZip(blocks);
}

/** @deprecated use downloadProjectZip — downloads a single inlined html */
export function downloadBundledSite(files: { html: string; css: string; js: string }, name = "site") {
  const bundled = wrapHtmlFragment(files.html, files.css, files.js);
  triggerDownload(`${name}.html`, bundled, "text/html;charset=utf-8");
}

/** @deprecated use downloadProjectZip */
export function downloadProjectSources(files: { html: string; css: string; js: string }, name = "site") {
  void downloadProjectZip(
    [
      { id: "html", lang: "html", label: "index.html", code: files.html },
      { id: "css", lang: "css", label: "styles.css", code: files.css },
      { id: "js", lang: "js", label: "script.js", code: files.js },
    ].filter((b) => b.code.trim()),
    name,
  );
}
