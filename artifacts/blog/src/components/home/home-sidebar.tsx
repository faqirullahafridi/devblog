import { useState } from "react";
import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { keyEvents } from "@/lib/analytics";
import { AdSlot } from "@/components/site-scripts";
import { format } from "date-fns";
import { Mail, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeNewsletterCard({ compact = false }: { compact?: boolean }) {
  const subscribe = useSubscribeNewsletter();
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe.mutateAsync({ data: { email } });
      keyEvents.newsletterSubscribe();
      toast.success("Check your email to confirm your subscription!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe.");
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-primary text-primary-foreground shadow-sm",
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
        <h3 className={cn("font-semibold", compact ? "text-base" : "text-lg")}>Newsletter</h3>
      </div>
      <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
        Weekly articles, tools, and templates. Unsubscribe anytime.
      </p>
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row lg:flex-col gap-2">
        <Input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background text-foreground border-0 flex-1"
        />
        <Button
          type="submit"
          variant="secondary"
          className={cn("shrink-0", compact ? "sm:w-auto lg:w-full" : "w-full")}
          disabled={subscribe.isPending}
        >
          {subscribe.isPending ? "…" : "Subscribe"}
        </Button>
      </form>
    </div>
  );
}

export function HomePopularCard({ popularPosts }: { popularPosts: Post[] }) {
  if (popularPosts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Popular reads</h3>
      </div>
      <ol className="divide-y divide-border">
        {popularPosts.slice(0, 5).map((post, i) => (
          <li key={post.id}>
            <Link
              href={`/post/${post.slug}`}
              className="group flex gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors"
            >
              <span className="text-sm font-semibold text-primary/80 w-5 shrink-0 tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </p>
                <time className="text-xs text-muted-foreground mt-1 block">
                  {format(new Date(post.createdAt), "MMM d")}
                </time>
              </div>
            </Link>
          </li>
        ))}
      </ol>
      <div className="border-t border-border px-4 py-2.5">
        <Link href="/search" className="text-xs font-medium text-primary hover:underline">
          All articles →
        </Link>
      </div>
    </div>
  );
}

/** Desktop sticky sidebar */
export function HomeSidebar({ popularPosts }: { popularPosts: Post[] }) {
  return (
    <aside className="space-y-5">
      <HomeNewsletterCard />
      <AdSlot variant="sidebar" />
      <HomePopularCard popularPosts={popularPosts} />
    </aside>
  );
}
