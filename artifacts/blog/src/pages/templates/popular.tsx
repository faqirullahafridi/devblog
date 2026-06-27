import { TemplateListPage } from "./template-list-page";
import { getPopularTemplates, TEMPLATES } from "@/lib/templates-config";

export default function TemplatesPopularPage() {
  const templates = getPopularTemplates(TEMPLATES.filter((t) => t.popular).length || 24);
  return (
    <TemplateListPage
      title="Popular templates"
      description="Top downloaded free templates — trusted by developers, agencies, and startups for fast launches."
      seoTitle="Popular Free Website Templates — Most Downloaded Source Code"
      seoDescription="Most popular free website template downloads: SaaS landing pages, admin dashboards, portfolio HTML, and startup sites."
      path="/templates/popular"
      templates={templates}
    />
  );
}
