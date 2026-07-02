export type ChatPreviewBundle = {
  srcDoc: string;
  label: string;
  files: { html: string; css: string; js: string };
};

type CodeBlock = { lang: string; code: string };

function parseFencedBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const re = /```([\w-]*)\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    blocks.push({ lang: (match[1] || "").toLowerCase(), code: match[2].replace(/\n$/, "") });
  }
  return blocks;
}

function isFullHtmlDocument(code: string): boolean {
  return /<!DOCTYPE\s+html/i.test(code) || /<html[\s>]/i.test(code);
}

const PREVIEW_BASE_CSS = `
html, body {
  margin: 0;
  min-height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
`;

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

function wrapHtmlFragment(html: string, css = "", js = ""): string {
  if (isFullHtmlDocument(html)) {
    let doc = html;
    if (css) {
      doc = doc.replace(/<\/head>/i, `<style>${css}</style></head>`);
      if (!/<head[\s>]/i.test(doc)) {
        doc = doc.replace(/<html[^>]*>/i, (m) => `${m}<head><style>${css}</style></head>`);
      }
    }
    if (js) {
      doc = doc.replace(/<\/body>/i, `<script>${js}<\/script></body>`);
      if (!/<body[\s>]/i.test(doc)) {
        doc = `${doc}<script>${js}<\/script>`;
      }
    }
    return injectPreviewBaseCss(doc);
  }

  return injectPreviewBaseCss(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${PREVIEW_BASE_CSS}${css}</style>
</head>
<body>
${html}
<script>${js}<\/script>
</body>
</html>`);
}

function pickBlock(blocks: CodeBlock[], langs: string[]): CodeBlock | undefined {
  return blocks.find((b) => langs.includes(b.lang));
}

function pickHtmlBlock(blocks: CodeBlock[]): CodeBlock | undefined {
  const explicit = pickBlock(blocks, ["html", "htm"]);
  if (explicit) return explicit;
  return blocks.find(
    (b) =>
      (b.lang === "" || b.lang === "xml") &&
      (isFullHtmlDocument(b.code) || /<(?:div|section|main|header|footer|body|nav|article)[\s>]/i.test(b.code)),
  );
}

/** Extract a sandboxed HTML document from an AI assistant message, if possible. */
export function extractChatPreview(content: string): ChatPreviewBundle | null {
  const blocks = parseFencedBlocks(content);
  if (!blocks.length) return null;

  const htmlBlock = pickHtmlBlock(blocks);
  const cssBlock = pickBlock(blocks, ["css"]);
  const jsBlock = pickBlock(blocks, ["js", "javascript"]);

  const html = htmlBlock?.code ?? "";
  const css = cssBlock?.code ?? "";
  const js = jsBlock?.code ?? "";

  if (html && (isFullHtmlDocument(html) || htmlBlock)) {
    return {
      srcDoc: wrapHtmlFragment(html, css, js),
      label: isFullHtmlDocument(html) ? "Site preview" : "Page preview",
      files: { html, css, js },
    };
  }

  if (css && (/<[a-z][\s>]/i.test(css) || css.includes("<!DOCTYPE"))) {
    return null;
  }

  if (css || js) {
    const scaffold = `<main class="preview-root"></main>`;
    return {
      srcDoc: wrapHtmlFragment(scaffold, css, js),
      label: "Style preview",
      files: { html: scaffold, css, js },
    };
  }

  const standalone = blocks.find((b) => ["html", "htm"].includes(b.lang) || isFullHtmlDocument(b.code));
  if (standalone) {
    return {
      srcDoc: wrapHtmlFragment(standalone.code),
      label: "Page preview",
      files: { html: standalone.code, css: "", js: "" },
    };
  }

  return null;
}

export const PLAYGROUND_IMPORT_KEY = "devblog-playground-import";

export function savePlaygroundImport(files: { html: string; css: string; js: string }): void {
  try {
    sessionStorage.setItem(PLAYGROUND_IMPORT_KEY, JSON.stringify(files));
  } catch {
    /* private mode */
  }
}
