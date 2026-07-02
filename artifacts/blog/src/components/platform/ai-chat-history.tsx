import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Loader2, MessageSquare, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getAiMode } from "@/components/platform/ai-config";
import { aiKeys, deleteAiConversation, listAiConversations } from "@/lib/platform-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
  } catch {
    return "";
  }
}

type AiChatHistoryProps = {
  activeId?: number;
  disabled?: boolean;
  brutal?: boolean;
  onSelect: (id: number) => void;
  onDeleted?: (id: number) => void;
  className?: string;
};

function HistoryList({
  conversations,
  activeId,
  brutal,
  isLoading,
  isFetched,
  onSelect,
  onDelete,
}: {
  conversations: Array<{ id: number; title: string; mode: string; updatedAt: string }>;
  activeId?: number;
  brutal?: boolean;
  isLoading: boolean;
  isFetched: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (isFetched && conversations.length === 0) {
    return (
      <div className="px-2 py-10 text-center">
        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No saved chats yet</p>
        <p className="mt-1 text-xs text-muted-foreground/80">Send a message in any mode to start</p>
      </div>
    );
  }

  return (
    <>
      {conversations.map((conv) => {
        const active = conv.id === activeId;
        const modeMeta = getAiMode(conv.mode);
        return (
          <div
            key={conv.id}
            className={cn(
              "group mb-1 flex items-start gap-1 rounded-lg transition-colors",
              active ? "bg-primary/10 ring-1 ring-primary/25" : "hover:bg-muted/70",
              brutal && "rounded-none",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex min-w-0 flex-1 items-start gap-2 rounded-lg px-3 py-2.5 text-left touch-manipulation",
                brutal && "rounded-none",
              )}
            >
              <MessageSquare
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium leading-snug">
                  {conv.title || "New conversation"}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-muted-foreground">
                  <span className="font-medium text-muted-foreground/90">{modeMeta.label}</span>
                  <span aria-hidden>·</span>
                  <span>{formatRelative(conv.updatedAt)}</span>
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(conv.id)}
              className="mt-2 mr-1 shrink-0 rounded-md p-2 text-muted-foreground touch-manipulation transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </>
  );
}

export function AiChatHistory({
  activeId,
  disabled,
  brutal,
  onSelect,
  onDeleted,
  className,
}: AiChatHistoryProps) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: conversations = [], isLoading, isFetched } = useQuery({
    queryKey: aiKeys.conversations(),
    queryFn: () => listAiConversations(),
    staleTime: 30_000,
  });

  const handleSelect = (id: number) => {
    onSelect(id);
    setOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAiConversation(id);
      await qc.invalidateQueries({ queryKey: aiKeys.conversations() });
      onDeleted?.(id);
      toast.success("Chat deleted");
    } catch {
      toast.error("Could not delete chat");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
        className={cn(
          "h-8 gap-1.5 text-xs touch-manipulation",
          brutal && "rounded-none border-2 border-foreground font-black uppercase",
          className,
        )}
      >
        <History className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">History</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
          side="right"
          hideClose
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "z-[250] flex h-[100dvh] max-h-[100dvh] w-[min(100vw-2rem,20rem)] max-w-[85vw] flex-col gap-0 p-0",
            "touch-pan-y",
            brutal && "rounded-none border-2 border-foreground",
          )}
        >
          <SheetHeader className="shrink-0 flex flex-row items-start justify-between gap-2 border-b border-border/60 px-4 py-3 text-left">
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold">Chat history</SheetTitle>
              <SheetDescription className="text-xs font-normal text-muted-foreground">
                All modes — Chat, Debug, Code, and more
              </SheetDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 touch-manipulation rounded-full"
              onClick={() => setOpen(false)}
              aria-label="Close history"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 touch-pan-y [-webkit-overflow-scrolling:touch]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <HistoryList
              conversations={conversations}
              activeId={activeId}
              brutal={brutal}
              isLoading={isLoading && !conversations.length}
              isFetched={isFetched}
              onSelect={handleSelect}
              onDelete={(id) => void handleDelete(id)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
