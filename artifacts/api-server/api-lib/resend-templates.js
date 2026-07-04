import https from "node:https";
import tls from "node:tls";

const SITE_NAME = process.env.SITE_NAME?.trim() || "TechVentry";
const SITE_DOMAIN = process.env.SITE_DOMAIN?.trim() || "techventry.com";

const RESEND_API = "https://api.resend.com";
const httpsAgent = new https.Agent({ ca: tls.rootCertificates });

export const RESEND_TEMPLATE_ALIASES = {
  transactional: "techventry-transactional",
  otp: "techventry-otp",
};

const WRAPPER_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{{TITLE}}}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{{PREHEADER}}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a,#1e293b);">
          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">{{{SITE_NAME}}}</p>
          <h1 style="margin:10px 0 0;font-size:24px;color:#fff;">{{{TITLE}}}</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#334155;font-size:16px;line-height:1.7;">
          {{{BODY_HTML}}}{{{CTA_SECTION}}}{{{FOOTER_NOTE_SECTION}}}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center;font-size:13px;color:#64748b;">
          <a href="{{{SITE_URL}}}" style="color:#0f172a;font-weight:600;text-decoration:none;">{{{SITE_NAME}}}</a> · {{{SITE_DOMAIN}}}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const OTP_BODY = `{{{INTRO_HTML}}}
<p style="margin:0 0 16px;">Use this one-time code to continue:</p>
<div style="margin:0 0 16px;padding:20px 24px;border:2px dashed #cbd5e1;border-radius:12px;background:#f8fafc;text-align:center;">
  <span style="font-size:34px;font-weight:800;letter-spacing:0.35em;color:#0f172a;font-family:monospace;">{{{OTP_CODE}}}</span>
</div>
<p style="margin:0;font-size:14px;color:#64748b;">Expires in <strong>{{{OTP_EXPIRES_MINUTES}}} minutes</strong>.</p>`;

export const RESEND_TEMPLATE_DEFINITIONS = [
  {
    alias: RESEND_TEMPLATE_ALIASES.transactional,
    name: "TechVentry transactional",
    subject: "{{{SUBJECT}}}",
    html: WRAPPER_HEAD,
    variables: [
      { key: "SITE_NAME", type: "string", fallbackValue: SITE_NAME },
      { key: "SITE_DOMAIN", type: "string", fallbackValue: SITE_DOMAIN },
      { key: "SITE_URL", type: "string", fallbackValue: "https://www.techventry.com" },
      { key: "SUBJECT", type: "string", fallbackValue: "Message from TechVentry" },
      { key: "TITLE", type: "string", fallbackValue: "Hello" },
      { key: "PREHEADER", type: "string", fallbackValue: "" },
      { key: "BODY_HTML", type: "string", fallbackValue: "" },
      { key: "CTA_SECTION", type: "string", fallbackValue: "" },
      { key: "FOOTER_NOTE_SECTION", type: "string", fallbackValue: "" },
    ],
  },
  {
    alias: RESEND_TEMPLATE_ALIASES.otp,
    name: "TechVentry OTP",
    subject: "{{{SUBJECT}}}",
    html: WRAPPER_HEAD.replace("{{{BODY_HTML}}}", OTP_BODY),
    variables: [
      { key: "SITE_NAME", type: "string", fallbackValue: SITE_NAME },
      { key: "SITE_DOMAIN", type: "string", fallbackValue: SITE_DOMAIN },
      { key: "SITE_URL", type: "string", fallbackValue: "https://www.techventry.com" },
      { key: "SUBJECT", type: "string", fallbackValue: "Your sign-in code" },
      { key: "TITLE", type: "string", fallbackValue: "Sign-in code" },
      { key: "PREHEADER", type: "string", fallbackValue: "" },
      { key: "INTRO_HTML", type: "string", fallbackValue: "" },
      { key: "OTP_CODE", type: "string", fallbackValue: "000000" },
      { key: "OTP_EXPIRES_MINUTES", type: "number", fallbackValue: 10 },
      { key: "CTA_SECTION", type: "string", fallbackValue: "" },
      { key: "FOOTER_NOTE_SECTION", type: "string", fallbackValue: "" },
    ],
  },
];

function apiKey() {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function resendTemplatesEnabled() {
  if (!apiKey()) return false;
  if (process.env.RESEND_USE_TEMPLATES === "0") return false;
  return process.env.RESEND_USE_TEMPLATES === "1";
}

export function getResendTemplateId(kind) {
  if (!resendTemplatesEnabled()) return null;
  const envKey = kind === "otp" ? process.env.RESEND_TEMPLATE_OTP : process.env.RESEND_TEMPLATE_TRANSACTIONAL;
  return envKey?.trim() || RESEND_TEMPLATE_ALIASES[kind] || null;
}

export function renderCtaSection(label, href) {
  if (!label?.trim() || !href?.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;"><tr><td style="border-radius:10px;background:#0f172a;"><a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">${label}</a></td></tr></table>`;
}

export function renderFooterNoteSection(note) {
  if (!note?.trim()) return "";
  return `<p style="margin:16px 0 0;font-size:13px;color:#64748b;">${note}</p>`;
}

async function resendFetch(path, init = {}) {
  const key = apiKey();
  if (!key) throw new Error("RESEND_API_KEY not configured");

  const method = init.method || "GET";
  const url = `${RESEND_API}${path}`;
  const timeoutMs = 15_000;

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        agent: httpsAgent,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          clearTimeout(timer);
          let data = {};
          if (body) {
            try {
              data = JSON.parse(body);
            } catch {
              data = { message: body };
            }
          }
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(data.message || body || `Resend HTTP ${res.statusCode}`));
            return;
          }
          resolve(data);
        });
      },
    );

    const timer = setTimeout(() => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    req.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    if (init.body) req.write(init.body);
    req.end();
  });
}

export async function sendResendTemplateEmail({ to, subject, templateId, variables }) {
  const key = apiKey();
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };
  const recipients = Array.isArray(to) ? to : [to];
  const from = process.env.RESEND_FROM_EMAIL?.trim() || `${SITE_NAME} <info@techventry.com>`;
  try {
    await resendFetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        template: { id: templateId, variables },
      }),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resend-templates] send failed:", message);
    return { ok: false, error: message };
  }
}

export async function syncResendTemplates() {
  const listed = await resendFetch("/templates?limit=100");
  const byAlias = new Map((listed.data ?? []).filter((t) => t.alias).map((t) => [t.alias, t.id]));
  const results = [];

  for (const def of RESEND_TEMPLATE_DEFINITIONS) {
    const existingId = byAlias.get(def.alias);
    let templateId = existingId;

    if (existingId) {
      await resendFetch(`/templates/${existingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: def.name,
          subject: def.subject,
          html: def.html,
          variables: def.variables,
        }),
      });
      results.push({ alias: def.alias, id: existingId, action: "updated" });
    } else {
      const created = await resendFetch("/templates", {
        method: "POST",
        body: JSON.stringify({
          name: def.name,
          alias: def.alias,
          subject: def.subject,
          html: def.html,
          variables: def.variables,
        }),
      });
      templateId = created.id;
      results.push({ alias: def.alias, id: created.id, action: "created" });
    }

    if (templateId) {
      await resendFetch(`/templates/${templateId}/publish`, { method: "POST", body: "{}" });
    }
  }

  return results;
}
