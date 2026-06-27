import { TemplateListPage } from "./template-list-page";
import { getTrendingTemplates, TEMPLATES } from "@/lib/templates-config";

export default function TemplatesTrendingPage() {
  const templates = getTrendingTemplates(TEMPLATES.filter((t) => t.trending).length || 24);
  return (
    <TemplateListPage
      title="Trending templates"
      description="Most viewed free website templates this week — landing pages, dashboards, and portfolio kits developers are downloading now."
      seoTitle="Trending Free Website Templates — HTML & React Downloads"
      seoDescription="Browse trending free HTML landing page templates, React SaaS kits, and admin dashboard downloads updated weekly."
      path="/templates/trending"
      templates={templates}
    />
  );
}
