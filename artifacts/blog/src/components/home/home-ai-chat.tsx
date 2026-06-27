import { Link } from "wouter";
import { AiChatPanel } from "@/components/platform/ai-chat-panel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HomeAiChat() {
  return (
    <section className="overflow-x-clip border-b-2 border-foreground bg-muted/30">
      <div className="container mx-auto min-w-0 px-4 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">AI Assistant</p>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ask anything — switch modes below</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Chat, debug, explain, or generate code without leaving the home page. Pick a mode and start typing.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 gap-2">
            <Link href="/ai">
              Full AI hub <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <AiChatPanel variant="brutal" />
      </div>
    </section>
  );
}
