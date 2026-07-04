import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ExternalLink, Maximize2, Monitor, RefreshCw, Smartphone } from "lucide-react";
import type { ChatPreviewBundle } from "@/lib/ai-preview";
import { savePlaygroundImport } from "@/lib/ai-preview";

type AiCodePreviewProps = {
  preview: ChatPreviewBundle;
  className?: string;
  brutal?: boolean;
};

type Viewport = "desktop" | "mobile";

export function AiCodePreview({ preview, className, brutal }: AiCodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  const applyPreview = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = preview.srcDoc;
    }
  }, [preview.srcDoc]);

  useEffect(() => {
    applyPreview();
  }, [applyPreview, key]);

  const refresh = () => setKey((k) => k + 1);

  const openPlayground = () => {
    savePlaygroundImport(preview.files);
    window.open("/playground/html-css-js", "_blank", "noopener,noreferrer");
  };

  const frame = (
    <iframe
      ref={iframeRef}
      title={preview.label}
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      className={cn(
        "h-full min-h-0 w-full border-0 bg-white",
        viewport === "mobile" && "mx-auto max-w-[390px] shadow-lg",
      )}
    />
  );

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div
        className={cn(
          "mb-2 flex flex-wrap items-center justify-between gap-2",
          brutal && "border-b border-border pb-2",
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {preview.label}
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1 px-2 text-[10px]", brutal && "rounded-none border border-border")}
            onClick={() => setViewport("desktop")}
            aria-label="Desktop preview"
          >
            <Monitor className="h-3 w-3" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button
            type="button"
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className={cn("h-7 gap-1 px-2 text-[10px]", brutal && "rounded-none border border-border")}
            onClick={() => setViewport("mobile")}
            aria-label="Mobile preview"
          >
            <Smartphone className="h-3 w-3" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", brutal && "rounded-none border border-border")}
            onClick={refresh}
            aria-label="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-7 w-7 p-0", brutal && "rounded-none border border-border")}
            onClick={() => setFullscreen(true)}
            aria-label="Fullscreen preview"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-7 gap-1 px-2 text-[10px]", brutal && "rounded-none border border-border")}
            onClick={openPlayground}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative isolate w-full overflow-hidden",
          brutal ? "border border-border bg-muted/30" : "rounded-xl border border-border/70 bg-muted/20 ring-1 ring-border/40",
        )}
      >
        <div
          className="h-[min(55vh,420px)] w-full overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]"
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="h-full min-h-[min(55vh,420px)] w-full p-2 sm:p-3">{frame}</div>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
        Preview runs in a sandbox. Switch back to Answer to ask for fixes, or open Edit to tweak in the playground.
      </p>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="flex max-h-[95dvh] max-w-[min(96vw,1200px)] flex-col gap-0 p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="text-sm">{preview.label}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 touch-pan-y [-webkit-overflow-scrolling:touch]">
            <iframe
              title={`${preview.label} fullscreen`}
              sandbox="allow-scripts allow-forms allow-modals allow-popups"
              srcDoc={preview.srcDoc}
              className="h-[min(80dvh,720px)] w-full border-0 bg-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
