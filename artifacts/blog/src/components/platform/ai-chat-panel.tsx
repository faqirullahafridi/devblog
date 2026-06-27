import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AiMarkdown } from "@/components/platform/ai-markdown";
import { ALL_AI_MODES, getAiMode, type AiModeId } from "@/components/platform/ai-config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendAiMessage, aiKeys, type AiMessage } from "@/lib/platform-api";
import { platformEvents } from "@/lib/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User } from "lucide-react";

type AiChatPanelProps = {
  initialMode?: AiModeId;
  /** Modes shown in the switcher; defaults to all modes. */
  modes?: typeof ALL_AI_MODES;
  variant?: "default" | "brutal";
  className?: string;
};

export function AiChatPanel({
  initialMode = "chat",
  modes = ALL_AI_MODES,
  variant = "default",
  className,
}: AiChatPanelProps) {
  const [mode, setMode] = useState<AiModeId>(initialMode);
  const meta = getAiMode(mode);
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const responseColumnRef = useRef<HTMLDivElement>(null);
  const shouldScrollToAnswerRef = useRef(false);

  const chat = useMutation({
    mutationFn: () => sendAiMessage(mode, input, conversationId),
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: input, createdAt: new Date().toISOString() },
        data.message,
      ]);
      setInput("");
      platformEvents.aiChat(mode);
      qc.invalidateQueries({ queryKey: aiKeys.conversations });
      shouldScrollToAnswerRef.current = true;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!shouldScrollToAnswerRef.current || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return;

    shouldScrollToAnswerRef.current = false;
    requestAnimationFrame(() => {
      responseColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [messages]);

  const submit = () => {
    if (!input.trim() || chat.isPending) return;
    chat.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const switchMode = (next: AiModeId) => {
    if (next === mode) return;
    setMode(next);
    setConversationId(undefined);
    setMessages([]);
    setInput("");
  };

  const brutal = variant === "brutal";

  return (
    <div className={cn("min-w-0 max-w-full", className)}>
      <div className="mb-4 flex w-full min-w-0 max-w-full flex-wrap gap-2">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => switchMode(m.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium transition-colors",
                brutal
                  ? cn(
                      "border-2 px-3 py-1.5 font-black uppercase tracking-wider",
                      active
                        ? "border-foreground bg-primary text-primary-foreground brutal-shadow-sm"
                        : "border-foreground bg-card text-foreground hover:bg-muted",
                    )
                  : cn(
                      "rounded-full border px-3 py-1",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    ),
              )}
            >
              <Icon className="h-3 w-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "w-full max-w-full overflow-x-clip bg-card",
          brutal ? "border-2 border-foreground brutal-shadow-sm" : "rounded-2xl border shadow-sm",
        )}
      >
        <div className="grid min-w-0 w-full lg:grid-cols-2 lg:min-h-[480px]">
          <div
            className={cn(
              "flex min-w-0 w-full flex-col",
              brutal ? "border-b-2 lg:border-b-0 lg:border-r-2 border-foreground" : "border-b lg:border-b-0 lg:border-r",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between px-4 py-2.5",
                brutal ? "border-b-2 border-foreground bg-muted" : "border-b bg-muted/25",
              )}
            >
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your input</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">⌘ + Enter to send</span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              placeholder={meta.placeholder}
              className={cn(
                "flex-1 min-h-[180px] lg:min-h-0 rounded-none border-0 bg-transparent font-mono text-sm leading-relaxed resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4",
              )}
            />
            <div
              className={cn(
                "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                brutal ? "border-t-2 border-foreground bg-muted/50" : "border-t bg-muted/15",
              )}
            >
              <p className="min-w-0 text-xs text-muted-foreground leading-snug break-words">
                {input.length > 0 ? `${input.length} characters` : meta.description}
              </p>
              <Button onClick={submit} disabled={!input.trim() || chat.isPending} size="sm" className="shrink-0 self-end sm:self-auto">
                {chat.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Send className="h-4 w-4 mr-1.5" />
                )}
                Send
              </Button>
            </div>
          </div>

          <div
            ref={responseColumnRef}
            className="flex min-w-0 w-full scroll-mt-20 flex-col lg:min-h-0"
          >
            <div
              className={cn(
                "px-4 py-2.5",
                brutal ? "border-b-2 border-foreground bg-muted" : "border-b bg-muted/25",
              )}
            >
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Response</span>
            </div>
            <div className="min-w-0 w-full">
              <div className="box-border w-full min-w-0 max-w-full p-4">
                {messages.length === 0 ? (
                  <div className="flex w-full min-w-0 flex-col items-center justify-center px-2 py-8 text-center">
                    <div className={cn("mb-4 flex h-12 w-12 shrink-0 items-center justify-center", meta.iconBg)}>
                      <meta.icon className={cn("h-6 w-6", meta.accent)} />
                    </div>
                    <p className="text-sm font-black">{meta.label} mode</p>
                    <p className="mt-1 w-full max-w-full text-xs text-muted-foreground leading-relaxed break-words">
                      {meta.description}
                    </p>
                    <div className="mt-5 flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                      {meta.prompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setInput(prompt)}
                          className={cn(
                            "w-full min-w-0 break-words px-3 py-2 text-left text-xs transition-colors sm:w-auto",
                            brutal
                              ? "border-2 border-foreground bg-muted/30 font-medium hover:bg-muted"
                              : "rounded-full border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0 space-y-5">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn("flex min-w-0 gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center",
                            brutal ? "border-2 border-foreground" : "rounded-lg ring-1",
                            m.role === "user" ? "bg-muted" : meta.iconBg,
                          )}
                        >
                          {m.role === "user" ? (
                            <User className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Bot className={cn("h-4 w-4", meta.accent)} />
                          )}
                        </div>
                        <div
                          className={cn(
                            "min-w-0 max-w-full flex-1 break-words px-3.5 py-2.5 text-sm [overflow-wrap:anywhere]",
                            brutal ? "border-2 border-foreground" : "rounded-xl",
                            m.role === "user"
                              ? "bg-primary/10 text-foreground sm:max-w-[90%]"
                              : "bg-muted/40",
                          )}
                        >
                          {m.role === "assistant" ? (
                            <AiMarkdown content={m.content} />
                          ) : (
                            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed [overflow-wrap:anywhere]">
                              {m.content}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                    {chat.isPending && (
                      <div className="flex min-w-0 gap-3">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground", meta.iconBg)}>
                          <Bot className={cn("h-4 w-4", meta.accent)} />
                        </div>
                        <div className="min-w-0 flex-1 border-2 border-foreground bg-muted/40 px-4 py-3">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
