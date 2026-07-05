import { LegalPageLayout } from "@/components/legal-page-layout";

const LAST_UPDATED = "July 5, 2026";

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      title="Disclaimer"
      lastUpdated={LAST_UPDATED}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]}
    >
      <p>
        The information on TechVentry (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is provided for general
        informational and educational purposes only. By using this website, you acknowledge and agree to
        the following disclaimer.
      </p>

      <h2>No professional advice</h2>
      <p>
        Content on this site—including articles, tutorials, tools, AI-assisted responses, code samples,
        and interview guides—is not professional, legal, financial, or medical advice. Always consult
        qualified professionals and verify information before making decisions based on our content.
      </p>

      <h2>Accuracy and completeness</h2>
      <p>
        We strive to keep information accurate and up to date, but we make no representations or
        warranties about the completeness, reliability, or suitability of any content. Technology
        changes quickly; examples may become outdated. Use content at your own risk.
      </p>

      <h2>External links</h2>
      <p>
        Our site may link to third-party websites, services, or resources. We do not control and are
        not responsible for their content, availability, or privacy practices. Links do not imply
        endorsement unless explicitly stated.
      </p>

      <h2>Tools and AI features</h2>
      <p>
        Free tools, playgrounds, and AI-generated output are provided &quot;as is&quot; without guarantee of
        correctness. Do not rely on generated code in production without review and testing. You are
        responsible for how you use any output from our tools or AI assistant.
      </p>

      <h2>Advertising</h2>
      <p>
        Third-party advertisements, including Google AdSense, are displayed for convenience. We are not
        responsible for products, services, or claims made by advertisers. Your dealings with
        advertisers are solely between you and them.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, TechVentry and its operators shall not be liable for
        any loss or damage arising from your use of this website, including reliance on content,
        tools, or third-party links.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer? Visit our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </LegalPageLayout>
  );
}
