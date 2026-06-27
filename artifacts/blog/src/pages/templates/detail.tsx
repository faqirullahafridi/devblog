import { useState } from "react";
import { useRoute, Link } from "wouter";
import { TemplatesLayout } from "@/components/templates/templates-layout";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { SafeImage } from "@/components/safe-image";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplateCodeViewer } from "@/components/templates/template-code-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getTemplateBySlug,
  getRelatedTemplates,
} from "@/lib/templates-config";
import { getTemplateSeoContent } from "@/lib/templates/template-content";
import { getTemplateHtml, getTemplateCss } from "@/lib/templates/template-source";
import { downloadTemplateSource } from "@/lib/templates/download";
import { getDemoHref } from "@/lib/templates/demo-theme";
import { getTemplatePageConfig } from "@/lib/templates/page-config";
import NotFound from "@/pages/not-found";
import { ChevronLeft, Download, CheckCircle2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";

export default function TemplateDetailPage() {
  const [, params] = useRoute("/templates/:slug");
  const slug = params?.slug;
  const template = slug ? getTemplateBySlug(slug) : undefined;
  const [copying, setCopying] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!template) return <NotFound />;

  const pageConfig = getTemplatePageConfig(template);

  const content = getTemplateSeoContent(template);
  const related = getRelatedTemplates(template, 4);
  const pageUrl = siteUrl(`/templates/${template.slug}`);

  const handleCopyHtml = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getTemplateHtml(template));
      toast.success("index.html copied");
    } catch {
      toast.error("Could not copy HTML");
    } finally {
      setCopying(false);
    }
  };

  const handleCopyCss = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getTemplateCss(template));
      toast.success("styles.css copied");
    } catch {
      toast.error("Could not copy CSS");
    } finally {
      setCopying(false);
    }
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: template.title,
      description: template.seoDescription,
      applicationCategory: "WebApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      operatingSystem: "Web",
      downloadUrl: template.downloadUrl,
      screenshot: template.previewImage,
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Templates", item: siteUrl("/templates") },
        {
          "@type": "ListItem",
          position: 2,
          name: template.categoryTitle,
          item: siteUrl(`/templates/category/${template.categorySlug}`),
        },
        { "@type": "ListItem", position: 3, name: template.title, item: pageUrl },
      ],
    },
  ];

  return (
    <TemplatesLayout wide>
      <SeoHead
        title={template.seoTitle}
        description={template.seoDescription}
        image={template.previewImage}
        url={pageUrl}
        type="article"
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> All templates
        </Link>

        {/* Hero */}
        {/* Live preview */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Live preview</h2>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={getDemoHref(template.slug)}>
                <Eye className="h-3.5 w-3.5" /> Open full demo
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted">
            {showPreview ? (
              <iframe
                title={`${template.title} live preview`}
                src={`${getDemoHref(template.slug)}?embed=1`}
                className="h-[480px] w-full border-0 bg-black"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex h-[280px] w-full flex-col items-center justify-center gap-3 bg-muted/50 text-muted-foreground"
              >
                <Eye className="h-8 w-8" />
                <span className="text-sm font-medium">Click to load live preview</span>
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Interactive live template — scroll inside the preview or open full screen
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="space-y-4 lg:order-2">
            <figure className="overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-lg">
              <SafeImage
                src={template.previewImage}
                alt={`${template.title} preview`}
                className="w-full aspect-[16/10] object-cover"
                wrapperClassName="w-full aspect-[16/10]"
              />
            </figure>
          </div>

          <div className="space-y-6 lg:order-1 lg:pt-2">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Link href={`/templates/category/${template.categorySlug}`}>
                  <Badge variant="outline" className="hover:bg-muted">{template.categoryTitle}</Badge>
                </Link>
                <Badge className="bg-emerald-600 text-white border-0">Free download</Badge>
                <Badge variant="secondary">{pageConfig.uiStyleLabel}</Badge>
                <Badge variant="outline">{pageConfig.palette.name}</Badge>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl leading-tight">
                {template.title}
              </h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">{template.shortDescription}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Technology stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {template.stack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500" asChild>
                <Link href={getDemoHref(template.slug)}>
                  <Eye className="h-4 w-4" /> Live preview
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => downloadTemplateSource(template)}
              >
                <Download className="h-4 w-4" /> Download source
              </Button>
              <Button size="lg" variant="outline" className="gap-2" disabled={copying} onClick={handleCopyHtml}>
                <Copy className="h-4 w-4" /> Copy HTML
              </Button>
              <Button size="lg" variant="outline" className="gap-2" disabled={copying} onClick={handleCopyCss}>
                <Copy className="h-4 w-4" /> Copy CSS
              </Button>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm rounded-xl border border-border/60 bg-muted/20 p-4 backdrop-blur-sm">
              <div>
                <dt className="text-muted-foreground">Downloads</dt>
                <dd className="font-semibold tabular-nums">{template.downloads.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-semibold">{template.publishedAt}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">License</dt>
                <dd className="font-semibold">Free / MIT</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Format</dt>
                <dd className="font-semibold">HTML + CSS</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Features + source code */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-violet-500" /> Features
            </h2>
            <ul className="space-y-2.5">
              {content.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold tracking-tight">Source files</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" disabled={copying} onClick={handleCopyHtml}>
                  Copy HTML
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" disabled={copying} onClick={handleCopyCss}>
                  Copy CSS
                </Button>
              </div>
            </div>
            <TemplateCodeViewer template={template} />
          </section>
        </div>

        {/* SEO content */}
        <div className="mt-16 space-y-12 max-w-3xl">
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">{content.introduction}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">Use cases</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm leading-relaxed">
              {content.useCases.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 pb-2 border-b">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {content.faq.map((item, i) => (
                <AccordionItem key={item.question} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t">
            <h2 className="text-xl font-bold mb-5">Related templates</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => (
                <TemplateCard key={t.slug} template={t} />
              ))}
            </div>
          </section>
        )}

        {template.relatedBlogSlugs.length > 0 && (
          <section className="mt-12 rounded-xl border bg-muted/20 p-6">
            <h2 className="text-lg font-bold mb-3">Related articles</h2>
            <ul className="space-y-2">
              {template.relatedBlogSlugs.map((postSlug) => (
                <li key={postSlug}>
                  <Link href={`/post/${postSlug}`} className="text-sm text-primary hover:underline capitalize">
                    {postSlug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </TemplatesLayout>
  );
}
