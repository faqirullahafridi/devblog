import { LegalPageLayout } from "@/components/legal-page-layout";

const LAST_UPDATED = "July 5, 2026";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated={LAST_UPDATED}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]}
    >
      <p>
        This Cookie Policy explains how TechVentry (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and
        similar technologies when you visit our website. It should be read together with our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help sites
        remember preferences, understand how visitors use pages, and—in some cases—serve relevant
        advertisements.
      </p>

      <h2>How we use cookies</h2>
      <ul>
        <li>
          <strong>Essential / preference cookies:</strong> remember choices such as cookie consent
          and theme (light/dark mode).
        </li>
        <li>
          <strong>Analytics cookies:</strong> help us understand traffic and usage (e.g. Google
          Analytics, Plausible) so we can improve content and performance.
        </li>
        <li>
          <strong>Advertising cookies:</strong> used by Google AdSense and partners to deliver and
          measure ads, including the DoubleClick cookie for interest-based advertising where
          permitted by law.
        </li>
      </ul>

      <h2>Your choices</h2>
      <p>
        When you first visit our site, you can <strong>Accept</strong> or <strong>Reject</strong>{" "}
        non-essential cookies via the cookie banner. You can change your mind later by clearing site
        data or browser cookies for techventry.com.
      </p>
      <ul>
        <li>
          Opt out of Google personalized ads:{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
        </li>
        <li>
          Industry opt-out (US):{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
        </li>
        <li>
          How Google uses data from partners:{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google partner sites policy
          </a>
        </li>
      </ul>

      <h2>Third-party cookies</h2>
      <p>
        Analytics and advertising providers may set their own cookies when you use our site. We do
        not control third-party cookies; please review their privacy policies for details.
      </p>

      <h2>Updates</h2>
      <p>
        We may update this Cookie Policy from time to time. The &quot;Last updated&quot; date at the top of
        this page will reflect changes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies? Visit our <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
