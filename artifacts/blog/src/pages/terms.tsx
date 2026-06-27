import { LegalPageLayout } from "@/components/legal-page-layout";

const LAST_UPDATED = "June 23, 2026";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p>
        Welcome to devblog. By accessing or using this website, you agree to be bound by these
        Terms of Service. If you do not agree, please do not use the site.
      </p>

      <h2>Use of the website</h2>
      <p>
        devblog provides educational articles, tutorials, and developer resources for personal and
        non-commercial use, unless otherwise stated. You may read, share links to, and reference our
        content with proper attribution.
      </p>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site for any unlawful purpose or in violation of applicable laws</li>
        <li>Attempt to gain unauthorized access to our systems, admin areas, or user data</li>
        <li>Post spam, malware, harassing content, or misleading information in comments</li>
        <li>Scrape, copy, or republish substantial portions of the site without permission</li>
        <li>Interfere with the proper functioning of the website or its security features</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Unless otherwise noted, all content on this website—including text, graphics, logos, and
        layout—is owned by devblog or its content contributors and is protected by copyright and
        other intellectual property laws. You may not reproduce, distribute, or create derivative
        works without prior written consent, except as permitted by fair use or with attribution
        when sharing links.
      </p>

      <h2>User-generated content</h2>
      <p>
        When you submit comments or other content, you grant us a non-exclusive, royalty-free
        license to display, moderate, and store that content on the site. You are responsible for
        what you post and must not submit content that infringes others&apos; rights or violates
        these terms. We reserve the right to remove comments at our discretion.
      </p>

      <h2>Newsletter</h2>
      <p>
        By subscribing to our newsletter, you agree to receive periodic emails about new articles
        and updates. You may unsubscribe at any time using the link in our emails or by contacting
        us.
      </p>

      <h2>Advertising</h2>
      <p>
        This site may display third-party advertisements, including through Google AdSense.
        Advertisers are responsible for their own content. We do not endorse products or services
        advertised unless explicitly stated. Your interactions with advertisers are solely between
        you and the advertiser.
      </p>

      <h2>Disclaimer of warranties</h2>
      <p>
        The website and all content are provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, express or implied. We do not guarantee that the site will
        be uninterrupted, error-free, or free of harmful components. Technical articles are for
        informational purposes only and should not be considered professional advice.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, devblog and its operators shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages arising from your use
        of the site, including reliance on any content or loss of data or profits.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Our website may contain links to third-party websites. We are not responsible for the
        content, privacy practices, or policies of those sites. Accessing external links is at
        your own risk.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may revise these Terms of Service at any time. Updated terms will be posted on this page
        with a new &quot;Last updated&quot; date. Your continued use of the site after changes
        constitutes acceptance of the revised terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Pakistan, without regard to conflict-of-law
        principles. Any disputes shall be subject to the exclusive jurisdiction of the courts in
        Peshawar, Pakistan, where applicable.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these Terms of Service, please visit our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
