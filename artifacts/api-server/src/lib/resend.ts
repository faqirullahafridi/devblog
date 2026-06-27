const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL || "Dev Blog <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "faqirullah.dev@gmail.com";

export function getSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:24722";
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — email not sent:", opts.subject);
    return { ok: false as const, error: "Email service not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return { ok: false as const, error: err };
  }

  return { ok: true as const };
}

export async function sendNewsletterConfirmEmail(email: string, token: string) {
  const url = `${getSiteUrl()}/newsletter/confirm?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Confirm your newsletter subscription",
    html: `
      <h2>Confirm your subscription</h2>
      <p>Click the link below to confirm your subscription to our developer blog newsletter:</p>
      <p><a href="${url}">Confirm subscription</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}

export async function sendWelcomeEmail(email: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to the newsletter!",
    html: `
      <h2>You're subscribed!</h2>
      <p>Thanks for confirming. You'll receive new articles and updates from our dev blog.</p>
      <p><a href="${getSiteUrl()}">Visit the blog</a></p>
    `,
  });
}

export async function sendContactNotification(name: string, email: string, message: string) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `New contact message from ${name}`,
    html: `
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
}

export async function sendContactAutoReply(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "We received your message",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out. We've received your message and will get back to you soon.</p>
      <p>— Dev Blog Team</p>
    `,
  });
}

export async function sendNewsletterBroadcast(
  subscribers: string[],
  subject: string,
  html: string,
) {
  const results = [];
  for (const email of subscribers) {
    const result = await sendEmail({ to: email, subject, html });
    results.push({ email, ...result });
  }
  return results;
}
