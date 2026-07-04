import { SITE_DOMAIN, SITE_NAME } from "./site-config";
import https from "node:https";
import tls from "node:tls";

const RESEND_API = "https://api.resend.com";
const httpsAgent = new https.Agent({ ca: tls.rootCertificates });

export const RESEND_TEMPLATE_ALIASES = {
  transactional: "techventry-transactional",
  otp: "techventry-otp",
} as const;

export type ResendTemplateAlias = (typeof RESEND_TEMPLATE_ALIASES)[keyof typeof RESEND_TEMPLATE_ALIASES];

type TemplateVariableDef = {
  key: string;
  type: "string" | "number";
  fallbackValue?: string | number;
};

const WRAPPER_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>{{{TITLE}}}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{{PREHEADER}}}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;">{{{SITE_NAME}}}</p>
              <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">{{{TITLE}}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#334155;font-size:16px;line-height:1.7;">
              {{{BODY_HTML}}}
              {{{CTA_SECTION}}}
              {{{FOOTER_NOTE_SECTION}}}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
                <a href="{{{SITE_URL}}}" style="color:#0f172a;text-decoration:none;font-weight:600;">{{{SITE_NAME}}}</a>
                · {{{SITE_DOMAIN}}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const OTP_BODY = `
{{{INTRO_HTML}}}
<p style="margin:0 0 16px;">Use this one-time code to continue:</p>
<div style="margin:0 0 16px;padding:20px 24px;border:2px dashed #cbd5e1;border-radius:12px;background:#f8fafc;text-align:center;">
  <span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:0.35em;color:#0f172a;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{{{OTP_CODE}}}</span>
</div>
<p style="margin:0;font-size:14px;color:#64748b;">This code expires in <strong>{{{OTP_EXPIRES_MINUTES}}} minutes</strong>. Do not share it with anyone.</p>`;

export const RESEND_TEMPLATE_DEFINITIONS: Array<{
  alias: ResendTemplateAlias;
  name: string;
  subject: string;
  html: string;
  variables: TemplateVariableDef[];
}> = [
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

function apiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

export function resendTemplatesEnabled(): boolean {
  if (!apiKey()) return false;
  if (process.env.RESEND_USE_TEMPLATES === "0") return false;
  return process.env.RESEND_USE_TEMPLATES === "1";
}

export function getResendTemplateId(kind: "transactional" | "otp"): string | null {
  if (!resendTemplatesEnabled()) return null;
  const envKey =
    kind === "otp" ? process.env.RESEND_TEMPLATE_OTP : process.env.RESEND_TEMPLATE_TRANSACTIONAL;
  const id = envKey?.trim() || RESEND_TEMPLATE_ALIASES[kind];
  return id || null;
}

async function resendFetch<T>(path: string, init?: { method?: string; body?: string; headers?: Record<string, string> }): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("RESEND_API_KEY not configured");

  const method = init?.method || "GET";
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
          ...init?.headers,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          clearTimeout(timer);
          let data: T | { message?: string } = {};
          if (body) {
            try {
              data = JSON.parse(body) as T;
            } catch {
              data = { message: body };
            }
          }
          if ((res.statusCode ?? 500) >= 400) {
            const msg =
              typeof data === "object" && data && "message" in data && typeof data.message === "string"
                ? data.message
                : body || `Resend HTTP ${res.statusCode}`;
            reject(new Error(msg));
            return;
          }
          resolve(data as T);
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

    if (init?.body) req.write(init.body);
    req.end();
  });
}

export function renderCtaSection(label: string, href: string): string {
  if (!label.trim() || !href.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
    <tr>
      <td style="border-radius:10px;background:#0f172a;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function renderFooterNoteSection(note: string): string {
  if (!note.trim()) return "";
  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${note}</p>`;
}

export async function sendResendTemplateEmail(opts: {
  to: string | string[];
  subject: string;
  templateId: string;
  variables: Record<string, string | number>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = apiKey();
  if (!key) return { ok: false, error: "RESEND_API_KEY not configured" };

  const to = Array.isArray(opts.to) ? opts.to : [opts.to];
  const from = process.env.RESEND_FROM_EMAIL?.trim() || `${SITE_NAME} <info@techventry.com>`;

  try {
    await resendFetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        template: {
          id: opts.templateId,
          variables: opts.variables,
        },
      }),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resend-templates] send failed:", message);
    return { ok: false, error: message };
  }
}

type ListedTemplate = { id: string; alias?: string | null; name: string };

export async function syncResendTemplates(): Promise<
  Array<{ alias: string; id: string; action: "created" | "updated" }>
> {
  const listed = await resendFetch<{ data?: ListedTemplate[] }>("/templates?limit=100");
  const byAlias = new Map(
    (listed.data ?? [])
      .filter((t) => t.alias)
      .map((t) => [t.alias as string, t.id]),
  );

  const results: Array<{ alias: string; id: string; action: "created" | "updated" }> = [];

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
      const created = await resendFetch<{ id: string }>("/templates", {
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
