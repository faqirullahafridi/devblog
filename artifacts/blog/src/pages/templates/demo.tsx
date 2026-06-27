import { useState } from "react";
import { useRoute, Link } from "wouter";
import { getTemplateBySlug, getTemplateHref } from "@/lib/templates-config";
import { TemplateDemoRenderer } from "@/components/templates/template-demo-renderer";
import { getTemplateHtml, getTemplateCss } from "@/lib/templates/template-source";
import { downloadTemplateSource } from "@/lib/templates/download";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

export default function TemplateDemoPage() {
  const [, params] = useRoute("/templates/demo/:slug");
  const slug = params?.slug;
  const template = slug ? getTemplateBySlug(slug) : undefined;
  const embed = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("embed") === "1";
  const [chromeHidden, setChromeHidden] = useState(false);
  const [copying, setCopying] = useState(false);

  if (!template) return <NotFound />;

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getTemplateHtml(template));
      toast.success("index.html copied — get styles.css from detail page");
    } catch {
      toast.error("Could not copy code");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {!embed && !chromeHidden && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 border-b border-white/10 bg-black/80 px-4 py-2.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" className="gap-1.5 text-white/80 hover:text-white hover:bg-white/10" asChild>
              <Link href={getTemplateHref(template.slug)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <span className="hidden truncate text-sm text-white/60 sm:inline">{template.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-white/80 hover:text-white hover:bg-white/10"
              disabled={copying}
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" /> Copy code
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-white text-black hover:bg-white/90"
              onClick={() => downloadTemplateSource(template)}
            >
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setChromeHidden(true)}
              aria-label="Hide toolbar"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {chromeHidden && !embed && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs text-white backdrop-blur hover:bg-black"
          onClick={() => setChromeHidden(false)}
        >
          <Minimize2 className="h-3.5 w-3.5" /> Show controls
        </button>
      )}

      <div className={!embed && !chromeHidden ? "pt-[52px]" : ""}>
        <TemplateDemoRenderer template={template} />
      </div>
    </div>
  );
}
