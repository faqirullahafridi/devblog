import { LegalPageLayout } from "@/components/legal-page-layout";

const LAST_UPDATED = "June 23, 2026";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        This Privacy Policy describes how devblog (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects,
        uses, and shares information when you visit our website and use our services.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Information you provide:</strong> name, email address, and message content when you
          subscribe to our newsletter, leave a comment, or contact us.
        </li>
        <li>
          <strong>Automatically collected information:</strong> IP address, browser type, device
          information, pages visited, referring URLs, and general usage data through cookies and
          similar technologies.
        </li>
        <li>
          <strong>Analytics data:</strong> aggregated statistics about how visitors use our site,
          such as page views on blog posts.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>Operate, maintain, and improve our website and content</li>
        <li>Publish and moderate comments on blog posts</li>
        <li>Send newsletter updates if you have subscribed</li>
        <li>Respond to inquiries and support requests</li>
        <li>Display relevant advertising through Google AdSense</li>
        <li>Monitor site security and prevent abuse</li>
      </ul>

      <h2>Cookies and advertising</h2>
      <p>
        We use cookies and similar tracking technologies to remember preferences, understand how
        visitors use our site, and serve advertisements.
      </p>
      <p>
        <strong>Google AdSense.</strong> We use Google AdSense to display ads. Google and its
        partners may use cookies (including the DoubleClick cookie) to serve ads based on your
        visits to this site and other sites on the Internet. This may include personalized or
        non-personalized advertising depending on your settings and applicable law.
      </p>
      <ul>
        <li>
          You can opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          .
        </li>
        <li>
          You can opt out of third-party vendor use of cookies for personalized advertising at{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </li>
        <li>
          Learn more about how Google uses data at{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s partner sites policy
          </a>
          .
        </li>
      </ul>

      <h2>Third-party services</h2>
      <p>
        We may use third-party services for hosting, analytics, email delivery, and advertising.
        These providers process data according to their own privacy policies. We do not sell your
        personal information to third parties.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain information only as long as necessary to provide our services, comply with legal
        obligations, resolve disputes, and enforce our agreements. Newsletter and comment data are
        kept until you request deletion or we remove it as part of routine administration.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, delete, or restrict
        processing of your personal data. To exercise these rights, please contact us using the
        details on our{" "}
        <a href="/contact">Contact page</a>.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        Our website is not directed at children under 13. We do not knowingly collect personal
        information from children. If you believe a child has provided us with personal data, please
        contact us so we can remove it.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page
        with an updated &quot;Last updated&quot; date. Continued use of the site after changes
        constitutes acceptance of the revised policy.
      </p>

      <h2>Contact us</h2>
      <p>
        If you have questions about this Privacy Policy, please visit our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
