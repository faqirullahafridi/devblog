import {
  getResendTemplateId,
  renderCtaSection,
  renderFooterNoteSection,
  sendResendTemplateEmail,
} from "./resend-templates.js";

const SITE_NAME = "TechVentry";
const DEFAULT_ORIGIN = "https://www.techventry.com";

export function getSiteUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return DEFAULT_ORIGIN;
}

export function resendFromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() || `${SITE_NAME} <info@techventry.com>`;
}

export async function sendResendEmail({ to, subject, html, template }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  const recipients = Array.isArray(to) ? to : [to];

  if (template?.id) {
    return sendResendTemplateEmail({
      to: recipients,
      subject,
      templateId: template.id,
      variables: template.variables,
    });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromAddress(),
        to: recipients,
        subject,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[email] Resend error:", res.status, errBody);
      return { ok: false, error: errBody || `Resend HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Resend fetch error:", message);
    return { ok: false, error: message };
  }
}

export async function sendNewsletterConfirmEmail(email, token) {
  const url = `${getSiteUrl()}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const subject = "Confirm your newsletter subscription";
  const templateId = getResendTemplateId("transactional");

  if (templateId) {
    return sendResendEmail({
      to: email,
      subject,
      html: "",
      template: {
        id: templateId,
        variables: {
          SITE_NAME,
          SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
          SITE_URL: getSiteUrl(),
          SUBJECT: subject,
          TITLE: "Confirm your subscription",
          PREHEADER: subject,
          BODY_HTML: `<p style="margin:0 0 16px;color:#475569;line-height:1.6">Thanks for subscribing to the ${SITE_NAME} newsletter. Click the button below to confirm your email.</p>`,
          CTA_SECTION: renderCtaSection("Confirm subscription", url),
          FOOTER_NOTE_SECTION: renderFooterNoteSection("If you did not request this, you can ignore this email."),
        },
      },
    });
  }

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">Confirm your subscription</h1>
      <p style="color:#475569;line-height:1.6">
        Thanks for subscribing to the ${SITE_NAME} newsletter. Click the button below to confirm your email.
      </p>
      <p style="margin:24px 0">
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Confirm subscription
        </a>
      </p>
      <p style="font-size:12px;color:#94a3b8">If you did not request this, you can ignore this email.</p>
    </div>`;
  return sendResendEmail({
    to: email,
    subject: "Confirm your newsletter subscription",
    html,
  });
}

export async function sendNewsletterWelcomeEmail(email) {
  const subject = "Welcome to the newsletter!";
  const templateId = getResendTemplateId("transactional");

  if (templateId) {
    return sendResendEmail({
      to: email,
      subject,
      html: "",
      template: {
        id: templateId,
        variables: {
          SITE_NAME,
          SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
          SITE_URL: getSiteUrl(),
          SUBJECT: subject,
          TITLE: "Welcome aboard",
          PREHEADER: subject,
          BODY_HTML: `<p style="margin:0 0 16px;color:#475569;line-height:1.6">Your subscription is confirmed. You'll receive new articles, tutorials, and updates from ${SITE_NAME}.</p>`,
          CTA_SECTION: renderCtaSection(`Visit ${SITE_NAME}`, getSiteUrl()),
          FOOTER_NOTE_SECTION: "",
        },
      },
    });
  }

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">Welcome aboard</h1>
      <p style="color:#475569;line-height:1.6">
        Your subscription is confirmed. You'll receive new articles, tutorials, and updates from ${SITE_NAME}.
      </p>
      <p style="margin:24px 0">
        <a href="${getSiteUrl()}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Visit ${SITE_NAME}
        </a>
      </p>
    </div>`;
  return sendResendEmail({
    to: email,
    subject: "Welcome to the newsletter!",
    html,
  });
}

export function wrapNewsletterHtml(subject, bodyHtml, postSlug) {
  let body = bodyHtml.trim();
  if (postSlug?.trim()) {
    body += `<p style="margin-top:20px"><a href="${getSiteUrl()}/post/${encodeURIComponent(postSlug.trim())}">Read the full article</a></p>`;
  }
  body += `<p style="font-size:12px;color:#888;margin-top:24px">You received this because you subscribed at ${getSiteUrl()}.</p>`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 16px">${subject}</h1>
      <div style="color:#334155;line-height:1.6">${body}</div>
    </div>`;
}
