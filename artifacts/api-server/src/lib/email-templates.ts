import { SITE_DOMAIN, SITE_NAME, SITE_ORIGIN } from "./site-config";

function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return SITE_ORIGIN;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailTemplateOpts = {
  preheader?: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function renderEmailTemplate(opts: EmailTemplateOpts): string {
  const siteUrl = getSiteUrl();
  const preheader = escapeHtml(opts.preheader ?? opts.title);
  const title = escapeHtml(opts.title);
  const footerNote = opts.footerNote
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${opts.footerNote}</p>`
    : "";
  const cta = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td style="border-radius:10px;background:#0f172a;">
            <a href="${escapeHtml(opts.cta.href)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(opts.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">${escapeHtml(SITE_NAME)}</p>
              <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#334155;font-size:16px;line-height:1.7;">
              ${opts.bodyHtml}
              ${cta}
              ${footerNote}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
                <a href="${escapeHtml(siteUrl)}" style="color:#0f172a;text-decoration:none;font-weight:600;">${escapeHtml(SITE_NAME)}</a>
                · ${escapeHtml(SITE_DOMAIN)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderOtpBlock(code: string, expiresMinutes: number): string {
  const safeCode = escapeHtml(code);
  return `
    <p style="margin:0 0 16px;">Use this one-time code to continue:</p>
    <div style="margin:0 0 16px;padding:20px 24px;border:2px dashed #cbd5e1;border-radius:12px;background:#f8fafc;text-align:center;">
      <span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:0.35em;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">${safeCode}</span>
    </div>
    <p style="margin:0;font-size:14px;color:#64748b;">This code expires in <strong>${expiresMinutes} minutes</strong>. Do not share it with anyone.</p>
  `;
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px;">${text}</p>`;
}

export function renderHtmlBlock(html: string): string {
  return html;
}

export function escapeEmailHtml(value: string): string {
  return escapeHtml(value);
}
