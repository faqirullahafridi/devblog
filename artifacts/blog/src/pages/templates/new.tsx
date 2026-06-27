import { TemplateListPage } from "./template-list-page";
import { getNewTemplates, TEMPLATES } from "@/lib/templates-config";

export default function TemplatesNewPage() {
  const templates = getNewTemplates(TEMPLATES.filter((t) => t.isNew).length || 24);
  return (
    <TemplateListPage
      title="New templates"
      description="Freshly added free website templates — modern landing page designs, React projects, and Bootstrap source code."
      seoTitle="New Free Website Templates — Latest HTML & React Downloads"
      seoDescription="Download the newest free website templates: HTML landing pages, React SaaS layouts, portfolio sites, and dashboard UI kits."
      path="/templates/new"
      templates={templates}
    />
  );
}
