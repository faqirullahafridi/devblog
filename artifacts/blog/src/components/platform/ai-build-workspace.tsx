import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/platform/code-editor";
import { cn } from "@/lib/utils";
import {
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  Loader2,
} from "lucide-react";
import type { ChatCodeBlock, ChatPreviewBundle } from "@/lib/ai-preview";
import {
  downloadProjectZip,
  savePlaygroundImport,
} from "@/lib/ai-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type AiBuildWorkspaceProps = {
  blocks: ChatCodeBlock[];
  preview: ChatPreviewBundle | null;
  isStreaming?: boolean;
  lowQualityReact?: boolean;
  className?: string;
};

export function AiBuildWorkspace({ blocks, preview, isStreaming, lowQualityReact, className }: AiBuildWorkspaceProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!blocks.length) {
      setActiveId("");
      return;
    }
    if (!blocks.some((b) => b.id === activeId)) {
      setActiveId(blocks[0].id);
    }
  }, [blocks, activeId]);

  const applyPreview = useCallback(() => {
    if (iframeRef.current && preview) {
      iframeRef.current.srcdoc = preview.srcDoc;
    }
  }, [preview?.srcDoc]);

  useEffect(() => {
    if (previewOpen) applyPreview();
  }, [previewOpen, applyPreview, preview?.srcDoc]);

  const activeBlock = blocks.find((b) => b.id === activeId) ?? blocks[0];

  const openPlayground = () => {
    if (!preview) return;
    savePlaygroundImport(preview.files);
    window.open("/playground/html-css-js", "_blank", "noopener,noreferrer");
  };

  if (!blocks.length) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center",
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <FileCode2 className="h-6 w-6 text-primary" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="text-sm font-semibold text-foreground">Code panel</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Generated code appears here — TypeScript, React, Python, Node, SQL, and more. Use Preview when HTML/CSS output is ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileCode2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-xs font-semibold text-foreground">Generated code</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Writing…
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {preview && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px]"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-3 w-3" />
              Preview
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px]"
            onClick={() => {
              void downloadProjectZip(blocks, "generated-site").then(() => {
                toast.success("Downloaded project.zip");
              }).catch(() => {
                toast.error("Could not create zip");
              });
            }}
          >
            <Download className="h-3 w-3" />
            Download ZIP
          </Button>
          {preview && (
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={openPlayground}>
              <ExternalLink className="h-3 w-3" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {lowQualityReact && !isStreaming && (
        <div className="mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-950 dark:text-amber-100">
          This output used React (<code className="text-[10px]">App.js</code>, <code className="text-[10px]">Hero.js</code>) instead of a static site.
          Click <strong>New</strong> and ask again — e.g. &quot;Static HTML/CSS/JS fintech landing, no React&quot;.
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/70 bg-card">
        <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-border/50 bg-muted/30 p-1">
          {blocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => setActiveId(block.id)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors",
                activeId === block.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              {block.label}
            </button>
          ))}
        </div>
        {activeBlock && (
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={activeBlock.code}
              onChange={() => {}}
              readOnly
              language={activeBlock.lang === "js" ? "javascript" : activeBlock.lang}
              className="min-h-[240px] w-full resize-none overflow-visible rounded-none border-0 text-xs leading-relaxed lg:min-h-0 lg:h-full lg:overflow-y-auto"
              minHeight="min-h-[240px]"
            />
          </div>
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[95dvh] w-[min(96vw,1100px)] max-w-[min(96vw,1100px)] flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-4 py-3">
            <DialogTitle className="text-sm">{preview?.label ?? "Live preview"}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-auto bg-muted/30 p-2">
            {preview && (
              <iframe
                ref={iframeRef}
                key={`preview-${preview.srcDoc.length}`}
                title={preview.label}
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
                srcDoc={preview.srcDoc}
                className="block min-h-[75dvh] w-full border-0 bg-white"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
