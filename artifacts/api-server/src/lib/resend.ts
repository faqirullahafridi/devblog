import { defaultFromEmail, SITE_EMAIL, SITE_NAME } from "./site-config";
import {
  escapeEmailHtml,
  renderEmailTemplate,
  renderHtmlBlock,
  renderOtpBlock,
  renderParagraph,
} from "./email-templates";
import {
  getResendTemplateId,
  renderCtaSection,
  renderFooterNoteSection,
  sendResendTemplateEmail,
} from "./resend-templates";
import { OTP_TTL_MS } from "./admin-otp";

const RESEND_FROM = defaultFromEmail();
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_EMAIL?.trim() || SITE_EMAIL;
const OTP_EXPIRES_MINUTES = Math.round(OTP_TTL_MS / 60_000);

export function getSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.techventry.com";
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  template?: {
    id: string;
    variables: Record<string, string | number>;
  };
}) {
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];

  if (process.env.RESEND_API_KEY) {
    if (opts.template) {
      const result = await sendResendTemplateEmail({
        to,
        subject: opts.subject,
        templateId: opts.template.id,
        variables: opts.template.variables,
      });
      if (result.ok) return result;
    } else {
      const result = await sendViaResend({ to, subject: opts.subject, html: opts.html });
      if (result.ok) return result;
    }
  }

  if (process.env.SENDGRID_API_KEY) {
    const result = await sendViaSendGrid({ ...opts, to });
    if (result.ok) return result;
  }

  if (process.env.BREVO_API_KEY) {
    const result = await sendViaBrevo({ ...opts, to });
    if (result.ok) return result;
  }

  console.warn("No email provider configured — email not sent:", opts.subject);
  return { ok: false as const, error: "Email service not configured" };
}

function emailFetchError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function sendViaResend(opts: {
  to: string[];
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (err) {
    console.error("Resend fetch error:", emailFetchError(err));
    return { ok: false, error: emailFetchError(err) };
  }
}

async function sendViaSendGrid(opts: {
  to: string[];
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const from = process.env.SENDGRID_FROM_EMAIL?.trim() || RESEND_FROM;
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: opts.to.map((email) => ({ email })) }],
      from: { email: from.match(/<([^>]+)>/)?.[1] ?? from, name: from.replace(/<.+>/, "").trim() || SITE_NAME },
      subject: opts.subject,
      content: [{ type: "text/html", value: opts.html }],
    }),
  });

    if (!res.ok) {
      const err = await res.text();
      console.error("SendGrid error:", err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (err) {
    console.error("SendGrid fetch error:", emailFetchError(err));
    return { ok: false, error: emailFetchError(err) };
  }
}

async function sendViaBrevo(opts: {
  to: string[];
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const from = process.env.BREVO_FROM_EMAIL?.trim() || RESEND_FROM;
    const senderEmail = from.match(/<([^>]+)>/)?.[1] ?? from;
    const senderName = from.replace(/<.+>/, "").trim() || SITE_NAME;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: opts.to.map((email) => ({ email })),
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo error:", err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (err) {
    console.error("Brevo fetch error:", emailFetchError(err));
    return { ok: false, error: emailFetchError(err) };
  }
}

export async function sendAdminLoginOtpEmail(username: string, code: string) {
  const subject = `${SITE_NAME} admin sign-in code: ${code}`;
  const siteUrl = getSiteUrl();
  const otpTemplateId = getResendTemplateId("otp");

  if (otpTemplateId) {
    return sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject,
      html: "",
      template: {
        id: otpTemplateId,
        variables: {
          SITE_NAME,
          SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
          SITE_URL: siteUrl,
          SUBJECT: subject,
          TITLE: "Admin sign-in code",
          PREHEADER: `Your admin sign-in code is ${code}`,
          INTRO_HTML: renderParagraph(`Hi <strong>${escapeEmailHtml(username)}</strong>,`) +
            renderParagraph(
              "Someone is signing in to the admin panel with your credentials. Enter this code to complete sign-in:",
            ),
          OTP_CODE: code,
          OTP_EXPIRES_MINUTES: OTP_EXPIRES_MINUTES,
          CTA_SECTION: renderCtaSection("Open admin login", `${siteUrl}/admin/login`),
          FOOTER_NOTE_SECTION: renderFooterNoteSection(
            "If you didn't try to sign in, change your password immediately.",
          ),
        },
      },
    });
  }

  const html = renderEmailTemplate({
    preheader: `Your admin sign-in code is ${code}`,
    title: "Admin sign-in code",
    bodyHtml: `
      ${renderParagraph(`Hi <strong>${escapeEmailHtml(username)}</strong>,`)}
      ${renderParagraph("Someone is signing in to the admin panel with your credentials. Enter this code to complete sign-in:")}
      ${renderOtpBlock(code, OTP_EXPIRES_MINUTES)}
    `,
    footerNote: "If you didn't try to sign in, change your password immediately.",
    cta: { label: "Open admin login", href: `${getSiteUrl()}/admin/login` },
  });

  return sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject,
    html,
  });
}

export async function sendAdminPasswordResetOtpEmail(username: string, code: string) {
  const subject = `${SITE_NAME} password reset code: ${code}`;
  const siteUrl = getSiteUrl();
  const otpTemplateId = getResendTemplateId("otp");

  if (otpTemplateId) {
    return sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject,
      html: "",
      template: {
        id: otpTemplateId,
        variables: {
          SITE_NAME,
          SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
          SITE_URL: siteUrl,
          SUBJECT: subject,
          TITLE: "Reset your admin password",
          PREHEADER: `Your password reset code is ${code}`,
          INTRO_HTML:
            renderParagraph(
              `A password reset was requested for admin user <strong>${escapeEmailHtml(username)}</strong>.`,
            ) + renderParagraph("Enter this code on the reset page to choose a new password:"),
          OTP_CODE: code,
          OTP_EXPIRES_MINUTES: OTP_EXPIRES_MINUTES,
          CTA_SECTION: renderCtaSection("Reset password", `${siteUrl}/admin/forgot-password`),
          FOOTER_NOTE_SECTION: renderFooterNoteSection(
            "If you didn't request a reset, you can ignore this email.",
          ),
        },
      },
    });
  }

  const html = renderEmailTemplate({
    preheader: `Your password reset code is ${code}`,
    title: "Reset your admin password",
    bodyHtml: `
      ${renderParagraph(`A password reset was requested for admin user <strong>${escapeEmailHtml(username)}</strong>.`)}
      ${renderParagraph("Enter this code on the reset page to choose a new password:")}
      ${renderOtpBlock(code, OTP_EXPIRES_MINUTES)}
    `,
    footerNote: "If you didn't request a reset, you can ignore this email.",
    cta: { label: "Reset password", href: `${getSiteUrl()}/admin/forgot-password` },
  });

  return sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject,
    html,
  });
}

function sendTransactionalTemplateEmail(opts: {
  to: string | string[];
  subject: string;
  title: string;
  preheader: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
}) {
  const templateId = getResendTemplateId("transactional");
  const siteUrl = getSiteUrl();

  if (templateId) {
    return sendEmail({
      to: opts.to,
      subject: opts.subject,
      html: "",
      template: {
        id: templateId,
        variables: {
          SITE_NAME,
          SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
          SITE_URL: siteUrl,
          SUBJECT: opts.subject,
          TITLE: opts.title,
          PREHEADER: opts.preheader,
          BODY_HTML: opts.bodyHtml,
          CTA_SECTION: opts.cta ? renderCtaSection(opts.cta.label, opts.cta.href) : "",
          FOOTER_NOTE_SECTION: opts.footerNote ? renderFooterNoteSection(opts.footerNote) : "",
        },
      },
    });
  }

  const html = renderEmailTemplate({
    preheader: opts.preheader,
    title: opts.title,
    bodyHtml: opts.bodyHtml,
    cta: opts.cta,
    footerNote: opts.footerNote,
  });

  return sendEmail({ to: opts.to, subject: opts.subject, html });
}

export async function sendNewsletterConfirmEmail(email: string, token: string) {
  const url = `${getSiteUrl()}/newsletter/confirm?token=${token}`;
  return sendTransactionalTemplateEmail({
    to: email,
    subject: "Confirm your newsletter subscription",
    title: "Confirm your subscription",
    preheader: "Confirm your newsletter subscription",
    bodyHtml: renderParagraph(
      "Thanks for subscribing to our developer newsletter. Click below to confirm your email and start receiving new articles and updates.",
    ),
    cta: { label: "Confirm subscription", href: url },
    footerNote: "If you didn't request this, you can safely ignore this email.",
  });
}

export async function sendWelcomeEmail(email: string) {
  return sendTransactionalTemplateEmail({
    to: email,
    subject: "Welcome to the newsletter!",
    title: "Welcome aboard",
    preheader: "You're subscribed to the newsletter",
    bodyHtml: renderParagraph(
      `Thanks for confirming. You'll receive new articles, tutorials, and platform updates from ${SITE_NAME}.`,
    ),
    cta: { label: `Visit ${SITE_NAME}`, href: getSiteUrl() },
  });
}

export async function sendContactNotification(name: string, email: string, message: string) {
  const safeMessage = escapeEmailHtml(message).replace(/\n/g, "<br>");
  return sendTransactionalTemplateEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `New contact message from ${name}`,
    title: "New contact message",
    preheader: `New message from ${name}`,
    bodyHtml: `
      ${renderParagraph(`<strong>From:</strong> ${escapeEmailHtml(name)} &lt;${escapeEmailHtml(email)}&gt;`)}
      ${renderHtmlBlock(`<div style="margin-top:8px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">${safeMessage}</div>`)}
    `,
    cta: { label: "Open admin", href: `${getSiteUrl()}/admin/dashboard` },
  });
}

export async function sendContactAutoReply(email: string, name: string) {
  return sendTransactionalTemplateEmail({
    to: email,
    subject: "We received your message",
    title: `Thanks, ${escapeEmailHtml(name)}`,
    preheader: "We received your message",
    bodyHtml: renderParagraph(
      `We've received your message and will get back to you as soon as we can. In the meantime, feel free to explore guides and tools on ${SITE_NAME}.`,
    ),
    cta: { label: `Visit ${SITE_NAME}`, href: getSiteUrl() },
    footerNote: `— ${SITE_NAME} Team`,
  });
}

export async function sendNewsletterBroadcast(
  subscribers: string[],
  subject: string,
  html: string,
) {
  const templateId = getResendTemplateId("transactional");
  const siteUrl = getSiteUrl();
  const bodyHtml = renderHtmlBlock(html);
  const footerNote = `You are receiving this because you subscribed at ${siteUrl}.`;

  const results = [];
  for (const email of subscribers) {
    const result = templateId
      ? await sendEmail({
          to: email,
          subject,
          html: "",
          template: {
            id: templateId,
            variables: {
              SITE_NAME,
              SITE_DOMAIN: process.env.SITE_DOMAIN?.trim() || "techventry.com",
              SITE_URL: siteUrl,
              SUBJECT: subject,
              TITLE: subject,
              PREHEADER: subject,
              BODY_HTML: bodyHtml,
              CTA_SECTION: "",
              FOOTER_NOTE_SECTION: renderFooterNoteSection(footerNote),
            },
          },
        })
      : await sendEmail({
          to: email,
          subject,
          html: renderEmailTemplate({
            preheader: subject,
            title: subject,
            bodyHtml,
            footerNote,
          }),
        });
    results.push({ email, ...result });
  }
  return results;
}
