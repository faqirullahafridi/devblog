import type { TemplateDef } from "../templates-config";
import { keyEvents } from "@/lib/analytics";
import { getTemplateSourceFiles, getTemplateHtml, getTemplateCss, getTemplateSourceCode, getTemplateScreenshots } from "./template-source";

export function downloadTemplateSource(template: TemplateDef) {
  keyEvents.templateDownload(template.slug);
  const files = getTemplateSourceFiles(template);
  downloadBlob(`${template.slug}.html`, files.html, "text/html");
  setTimeout(() => downloadBlob(`${template.slug}-styles.css`, files.css, "text/css"), 150);
  if (files.jsx) {
    setTimeout(() => downloadBlob(`${template.slug}.tsx`, files.jsx!, "text/typescript"), 300);
  }
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadTemplateHtml(template: TemplateDef) {
  const { html } = getTemplateSourceFiles(template);
  downloadBlob(`${template.slug}.html`, html, "text/html");
}

export function downloadTemplateCss(template: TemplateDef) {
  const { css } = getTemplateSourceFiles(template);
  downloadBlob(`${template.slug}-styles.css`, css, "text/css");
}
