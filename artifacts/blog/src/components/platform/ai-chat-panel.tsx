import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AiMarkdown } from "@/components/platform/ai-markdown";
import { AiCodePreview } from "@/components/platform/ai-code-preview";
import { extractChatPreview } from "@/lib/ai-preview";
import { ALL_AI_MODES, getAiMode, type AiModeId } from "@/components/platform/ai-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  streamAiMessage,
  getAiStatus,
  getAiConversation,
  aiKeys,
  type AiMessage,
} from "@/lib/platform-api";
import { AiModelSwitcher, useAiModelPreference } from "@/components/platform/ai-model-switcher";
import { AiChatHistory } from "@/components/platform/ai-chat-history";
import { AI_MODEL_AUTO, isValidPickerModelId, pickerLabel } from "@/lib/ai-model-prefs";
import {
  clearStoredConversationId,
  consumePendingConversationId,
  getStoredConversationId,
  setPendingConversationId,
  setStoredConversationId,
} from "@/lib/ai-chat-session";
import { platformEvents } from "@/lib/analytics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  Copy,
  Eye,
  FileText,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User,
} from "lucide-react";

type AiChatPanelProps = {
  initialMode?: AiModeId;
  modes?: typeof ALL_AI_MODES;
  variant?: "default" | "brutal";
  /** Immersive studio — minimal chrome, floating composer */
  layout?: "default" | "workspace" | "studio";
  className?: string;
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}

const STREAM_UI_MS = 48;

function ChatMessage({
  message,
  meta,
  brutal,
  onCopy,
  copiedId,
  isStreaming = false,
  displayContent,
}: {
  message: AiMessage;
  meta: ReturnType<typeof getAiMode>;
  brutal: boolean;
  onCopy: (id: number, content: string) => void;
  copiedId: number | null;
  isStreaming?: boolean;
  displayContent?: string;
}) {
  const isUser = message.role === "user";
  const content = displayContent ?? message.content;
  const preview = !isUser && !isStreaming ? extractChatPreview(content) : null;
  const [view, setView] = useState<"answer" | "preview">("answer");

  useEffect(() => {
    setView("answer");
  }, [message.id]);

  const isPreviewOpen = view === "preview" && !!preview;

  useEffect(() => {
    if (!isPreviewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isPreviewOpen]);

  return (
    <div
      className={cn(
        "group flex w-full min-w-0 max-w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center shadow-sm sm:mt-1 sm:h-9 sm:w-9",
          brutal ? "border border-border" : "rounded-full ring-1 ring-border/80",
          isUser ? "bg-primary text-primary-foreground" : meta.iconBg,
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Bot className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", meta.accent)} />}
      </div>

      <div className={cn("min-w-0 flex-1 max-w-[min(100%,36rem)] sm:max-w-[min(100%,42rem)]", isUser ? "items-end" : "items-start")}>
        <p
          className={cn(
            "mb-1.5 text-[10px] font-bold  text-muted-foreground",
            isUser ? "text-right" : "text-left",
          )}
        >
          {isUser ? "You" : "Assistant"}
        </p>
        <div
          className={cn(
            "relative px-3 py-2.5 text-sm shadow-sm [overflow-wrap:anywhere] sm:px-4 sm:py-3",
            isPreviewOpen && "overflow-hidden",
            brutal ? "border border-border" : "rounded-2xl",
            isUser
              ? cn(
                  "bg-primary text-primary-foreground",
                  !brutal && "rounded-br-md",
                )
              : cn(
                  "bg-muted/50 text-foreground",
                  !brutal && "rounded-bl-md border border-border/50 border-l-[3px] border-l-primary/70",
                ),
          )}
        >
          {preview && (
            <div
              className={cn(
                "mb-3 flex flex-wrap gap-1 border-b border-border/40 pb-2",
                brutal && "border-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => setView("answer")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors",
                  view === "answer"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  brutal && view === "answer" && "rounded-none border border-border",
                )}
              >
                <FileText className="h-3 w-3" />
                Answer
              </button>
              <button
                type="button"
                onClick={() => setView("preview")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors",
                  view === "preview"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  brutal && view === "preview" && "rounded-none border border-border",
                )}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>
          )}
          {isPreviewOpen ? (
            <AiCodePreview preview={preview} brutal={brutal} className="-mx-1 sm:-mx-0" />
          ) : isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : content ? (
            <>
              <AiMarkdown content={content} />
              {isStreaming && (
                <span
                  className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary align-middle"
                  aria-hidden
                />
              )}
            </>
          ) : isStreaming ? (
            <span className="inline-flex items-center py-0.5" aria-label="Generating response">
              <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary" aria-hidden />
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "mt-1.5 flex items-center gap-2 px-0.5",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          {message.createdAt && (
            <span className="text-[10px] text-muted-foreground/80">{formatTime(message.createdAt)}</span>
          )}
          {!isUser && !isStreaming && (
            <button
              type="button"
              onClick={() => onCopy(message.id, content)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all",
                copiedId === message.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground opacity-100 hover:bg-muted/80 hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100",
              )}
              aria-label="Copy response"
            >
              {copiedId === message.id ? (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoChatMessage = memo(ChatMessage);

export function AiChatPanel({
  initialMode = "chat",
  modes = ALL_AI_MODES,
  variant = "default",
  layout = "default",
  className,
}: AiChatPanelProps) {
  const [mode, setMode] = useState<AiModeId>(initialMode);
  const meta = getAiMode(mode);
  const studio = layout === "studio";
  const workspace = layout === "workspace";
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { modelId, setModelId } = useAiModelPreference();
  const modelIdRef = useRef(modelId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const streamingIdRef = useRef<number | null>(null);
  const lastStreamUiRef = useRef(0);
  const streamFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollOnNextRef = useRef(false);

  const persistConversation = useCallback((modeId: AiModeId, id: number) => {
    setConversationId(id);
    setStoredConversationId(modeId, id);
  }, []);

  const openConversation = useCallback(
    async (id: number) => {
      setHistoryLoading(true);
      try {
        const conv = await getAiConversation(id);
        const convMode = conv.mode as AiModeId;

        if (convMode !== mode) {
          if (studio) {
            setPendingConversationId(id);
            setLocation(getAiMode(convMode).href);
            return;
          }
          setMode(convMode);
          setInput("");
          setCopiedId(null);
        }

        setMessages(conv.messages ?? []);
        persistConversation(convMode, conv.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        toast.error(msg.includes("unavailable") ? "Database busy — try again in a moment" : "Could not load chat");
      } finally {
        setHistoryLoading(false);
      }
    },
    [mode, studio, persistConversation, setLocation],
  );

  const loadConversationHistory = useCallback(
    async (modeId: AiModeId) => {
      const pending = consumePendingConversationId();
      if (pending) {
        await openConversation(pending);
        return;
      }

      const storedId = getStoredConversationId(modeId);
      setConversationId(storedId);
      if (!storedId) {
        setMessages([]);
        return;
      }
      await openConversation(storedId);
    },
    [openConversation],
  );

  const handleHistoryDeleted = useCallback(
    (id: number) => {
      if (conversationId === id) {
        clearStoredConversationId(mode);
        setConversationId(undefined);
        setMessages([]);
      }
    },
    [conversationId, mode],
  );

  const { data: aiStatus } = useQuery({
    queryKey: aiKeys.status,
    queryFn: getAiStatus,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!isValidPickerModelId(modelId)) {
      setModelId(AI_MODEL_AUTO);
    }
  }, [modelId, setModelId]);

  useLayoutEffect(() => {
    if (!scrollOnNextRef.current) return;
    scrollOnNextRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages, streamingContent, isStreaming]);

  const scrollToBottom = useCallback(() => {
    scrollOnNextRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    modelIdRef.current = isValidPickerModelId(modelId) ? modelId : AI_MODEL_AUTO;
  }, [modelId]);

  useEffect(() => {
    void loadConversationHistory(mode);
  }, [mode, loadConversationHistory]);

  useEffect(() => {
    if (isStreaming && streamingContent) scrollToBottom();
  }, [streamingContent, isStreaming, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const scheduleStreamingUi = useCallback((full: string) => {
    const flush = () => {
      lastStreamUiRef.current = Date.now();
      setStreamingContent(full);
    };

    const now = Date.now();
    if (now - lastStreamUiRef.current >= STREAM_UI_MS) {
      flush();
      return;
    }

    if (streamFlushTimerRef.current) return;
    streamFlushTimerRef.current = setTimeout(() => {
      streamFlushTimerRef.current = null;
      flush();
    }, STREAM_UI_MS);
  }, []);

  const runStreamChat = async (text: string) => {
    const userId = Date.now();
    const assistantId = userId + 1;
    setStreamingContent("");
    lastStreamUiRef.current = 0;
    streamingIdRef.current = assistantId;
    setStreamingMessageId(assistantId);
    setIsStreaming(true);

    setMessages((prev) => [
      ...prev,
      { id: userId, role: "user", content: text, createdAt: new Date().toISOString() },
      { id: assistantId, role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);
    setInput("");
    scrollToBottom();

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      await streamAiMessage(
        mode,
        text,
        {
          onStart: (cid) => persistConversation(mode, cid),
          onDelta: (_chunk, full) => {
            scheduleStreamingUi(full);
          },
          onDone: (data) => {
            persistConversation(mode, data.conversationId);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...data.message, id: assistantId } : m,
              ),
            );
            setStreamingContent("");
            platformEvents.aiChat(mode);
            qc.invalidateQueries({ queryKey: aiKeys.conversations() });
          },
          onError: (err) => {
            toast.error(err);
            setMessages((prev) => prev.filter((m) => m.id !== userId && m.id !== assistantId));
            setInput(text);
            setStreamingContent("");
          },
        },
        conversationId,
        modelIdRef.current,
        ac.signal,
      );
    } catch (e) {
      const err = e instanceof Error ? e.message : "AI request failed";
      toast.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== userId && m.id !== assistantId));
      setInput(text);
      setStreamingContent("");
    } finally {
      if (streamFlushTimerRef.current) {
        clearTimeout(streamFlushTimerRef.current);
        streamFlushTimerRef.current = null;
      }
      setIsStreaming(false);
      setStreamingMessageId(null);
      streamingIdRef.current = null;
      abortRef.current = null;
      requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
    }
  };

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

  const submit = () => {
    const text = input.trim();
    if (!text || isStreaming || historyLoading) return;
    void runStreamChat(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const switchMode = (next: AiModeId) => {
    if (next === mode) return;
    setInput("");
    setCopiedId(null);
    setMode(next);
  };

  const clearChat = () => {
    clearStoredConversationId(mode);
    setConversationId(undefined);
    setMessages([]);
    setInput("");
    setCopiedId(null);
    setStreamingContent("");
    textareaRef.current?.focus({ preventScroll: true });
  };

  const copyMessage = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const brutal = variant === "brutal" && !studio;
  const activeModelLabel = modelId !== AI_MODEL_AUTO ? pickerLabel(modelId, true) : null;
  const isReady = aiStatus?.configured !== false;

  const headerActions = (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <AiChatHistory
        activeId={conversationId}
        disabled={isStreaming}
        brutal={brutal}
        onSelect={(id) => void openConversation(id)}
        onDeleted={handleHistoryDeleted}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={clearChat}
        disabled={isStreaming}
        className={cn(
          "h-8 gap-1.5 text-xs",
          brutal && "rounded-none border border-border font-semibold uppercase",
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{workspace ? "New" : "New chat"}</span>
      </Button>
    </div>
  );

  const composerToolbar = (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <AiModelSwitcher
        mode={mode}
        value={modelId}
        onChange={setModelId}
        disabled={isStreaming}
        brutal={brutal}
        compact
        className="max-w-[min(100%,14rem)] sm:max-w-xs"
      />
      {activeModelLabel && (
        <Badge
          variant="secondary"
          className={cn(
            "h-6 max-w-[min(100%,12rem)] truncate rounded-full px-2 text-[10px] font-medium sm:max-w-none",
            brutal && "rounded-none border border-border",
          )}
        >
          {activeModelLabel}
        </Badge>
      )}
    </div>
  );

  if (studio) {
    return (
      <div className={cn("flex min-w-0 max-w-full flex-col overflow-x-clip", className)}>
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", isReady ? "bg-emerald-500" : "bg-amber-500")} />
              {isReady ? "Ready" : "Not configured"}
            </span>
            {messages.length > 0 && (
              <>
                <span className="text-border">·</span>
                <span>{messages.length} messages</span>
              </>
            )}
          </div>
          {headerActions}
        </div>

        <div className="min-w-0 max-h-[min(70vh,720px)] overflow-y-auto overscroll-contain">
          {historyLoading ? (
            <div className="flex items-center justify-center px-1 py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading chat…
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <div className="px-1 py-4 text-center md:py-8">
              <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-border/50 sm:mb-5 sm:h-16 sm:w-16", meta.iconBg)}>
                <meta.icon className={cn("h-7 w-7 sm:h-8 sm:w-8", meta.accent)} />
              </div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{meta.label} mode</h2>
              <p className="mx-auto mt-2 max-w-md px-2 text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
              <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2 px-1 sm:mt-8">
                {meta.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      textareaRef.current?.focus({ preventScroll: true });
                    }}
                    className="rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-left text-sm text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-md"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-w-0 space-y-5 px-0.5 pb-2 sm:space-y-6">
              {messages.map((m) => (
                <MemoChatMessage
                  key={m.id}
                  message={m}
                  meta={meta}
                  brutal={false}
                  onCopy={copyMessage}
                  copiedId={copiedId}
                  isStreaming={isStreaming && m.id === streamingMessageId}
                  displayContent={
                    isStreaming && m.id === streamingMessageId ? streamingContent : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-px shrink-0" aria-hidden />
            </div>
          )}
        </div>

        <div className="mt-6 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {composerToolbar}
          <div className="min-w-0 rounded-2xl border border-border/60 bg-card p-2 shadow-lg ring-1 ring-black/5 focus-within:border-primary/40 focus-within:ring-primary/20">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                rows={1}
                placeholder={meta.placeholder}
                disabled={isStreaming}
                aria-label="Message"
                className="min-h-[52px] max-h-[168px] flex-1 resize-none border-0 bg-transparent px-3 py-3.5 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="button"
                onClick={submit}
                disabled={!input.trim() || isStreaming || !isReady || historyLoading}
                size="icon"
                className="mb-1 mr-1 h-10 w-10 shrink-0 rounded-xl shadow-md shadow-primary/20"
                aria-label="Send message"
              >
                {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="mt-2 hidden text-center text-[10px] text-muted-foreground sm:block">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 max-w-full flex-col", className)}>
      {!workspace && (
        <div className="mb-3 flex w-full min-w-0 flex-col gap-2 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => switchMode(m.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium transition-all",
                    brutal
                      ? cn(
                          "border-2 px-3 py-1.5 font-semibold ",
                          active
                            ? "border-foreground bg-primary text-primary-foreground shadow-sm -translate-x-0.5 -translate-y-0.5"
                            : "border-foreground bg-card text-foreground hover:bg-muted",
                        )
                      : cn(
                          "rounded-full border px-3.5 py-1.5",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                            : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                        ),
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
          {headerActions}
        </div>
      )}

      <div
        className={cn(
          "relative flex w-full max-w-full flex-col bg-card",
          brutal ? "border border-border brutal-shadow" : "rounded-2xl border shadow-md ring-1 ring-border/40",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3",
            brutal ? "border-b border-border bg-muted" : "border-b bg-muted/30",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {!workspace && (
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10", meta.iconBg)}>
                <meta.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", meta.accent)} />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {workspace ? meta.label : `${meta.label} assistant`}
              </p>
              <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground sm:text-xs">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    isReady ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500",
                  )}
                />
                {isReady ? "Online" : "Not configured"}
                {messages.length > 0 && (
                  <span className="text-muted-foreground/60">· {messages.length} messages</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
            {headerActions}
          </div>
        </div>

        <div
          className={cn(
            "relative max-h-[min(65vh,640px)] overflow-y-auto overscroll-contain",
            !brutal && "bg-gradient-to-b from-muted/15 via-background to-background",
          )}
        >
          {historyLoading ? (
            <div className="flex items-center justify-center px-1 py-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading chat…
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <div className={cn("px-4 py-8 sm:px-6 sm:py-10", workspace ? "md:py-12" : "text-center flex flex-col items-center justify-center")}>
              <div className={cn("flex gap-6", workspace ? "flex-col md:flex-row md:items-start" : "flex-col items-center")}>
                <div className={cn(workspace ? "md:w-[220px] md:shrink-0" : "", workspace ? "text-left" : "text-center")}>
                  <div
                    className={cn(
                      "mb-4 flex h-14 w-14 items-center justify-center",
                      brutal ? meta.iconBg : cn(meta.iconBg, "rounded-2xl shadow-sm"),
                      !workspace && "mx-auto mb-5 h-16 w-16",
                    )}
                  >
                    <Sparkles className={cn("h-7 w-7", meta.accent, !workspace && "h-8 w-8")} />
                  </div>
                  <p className="text-lg font-semibold tracking-tight">How can I help?</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
                </div>
                <div className={cn("grid w-full gap-2", workspace ? "flex-1 md:grid-cols-1" : "max-w-2xl mt-8")}>
                  {meta.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setInput(prompt);
                        textareaRef.current?.focus({ preventScroll: true });
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3.5 text-left text-sm transition-all",
                        brutal
                          ? "border border-border bg-card font-medium hover:bg-muted hover:shadow-sm"
                          : "rounded-xl border border-border/60 bg-card/80 text-foreground shadow-sm hover:border-primary/40 hover:bg-muted/40 hover:shadow-md",
                      )}
                    >
                      <Sparkles className={cn("mt-0.5 h-4 w-4 shrink-0", meta.accent)} />
                      <span className="leading-snug">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:space-y-8 sm:px-6 sm:py-8">
              {messages.map((m) => (
                <MemoChatMessage
                  key={m.id}
                  message={m}
                  meta={meta}
                  brutal={brutal}
                  onCopy={copyMessage}
                  copiedId={copiedId}
                  isStreaming={isStreaming && m.id === streamingMessageId}
                  displayContent={
                    isStreaming && m.id === streamingMessageId ? streamingContent : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-px shrink-0" aria-hidden />
            </div>
          )}
        </div>

        <div
          className={cn(
            "shrink-0 p-2.5 sm:p-4",
            brutal ? "border-t border-border bg-muted/95" : "border-t bg-background",
            "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          )}
        >
          {composerToolbar}
          <div
            className={cn(
              "mx-auto flex max-w-3xl items-end gap-2 transition-shadow focus-within:ring-2 focus-within:ring-primary/20",
              brutal
                ? "border border-border bg-card p-2 shadow-sm"
                : "rounded-2xl border border-border/80 bg-card p-2 shadow-sm",
            )}
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              rows={1}
              placeholder={meta.placeholder}
              disabled={isStreaming}
              aria-label="Message"
              className="min-h-[48px] max-h-[168px] flex-1 resize-none border-0 bg-transparent px-3 py-3 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              onClick={submit}
              disabled={!input.trim() || isStreaming || !isReady || historyLoading}
              size="icon"
              className={cn(
                "mb-0.5 h-11 w-11 shrink-0",
                brutal ? "border border-border shadow-sm" : "rounded-xl shadow-sm",
              )}
              aria-label="Send message"
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <span>Enter to send</span>
            <span className="hidden sm:inline text-muted-foreground/40">·</span>
            <span className="hidden sm:inline">Shift + Enter for new line</span>
            {input.length > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>{input.length} chars</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
