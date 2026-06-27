import { useState } from "react";
import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { Mail, TrendingUp } from "lucide-react";

export function HomeSidebar({ popularPosts }: { popularPosts: Post[] }) {
  const subscribe = useSubscribeNewsletter();
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe.mutateAsync({ data: { email } });
      toast.success("Check your email to confirm your subscription!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe.");
    }
  };

  return (
    <aside className="space-y-6 lg:sticky lg:top-20">
      <div className="border-2 border-foreground bg-primary p-6 brutal-shadow text-primary-foreground">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5" />
          <h3 className="font-black text-lg">Newsletter</h3>
        </div>
        <p className="text-sm text-primary-foreground/90 leading-relaxed mb-5">
          Weekly picks — articles, tools, and templates. No spam, unsubscribe anytime.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-foreground bg-background text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            variant="outline"
            className="w-full border-foreground bg-background text-foreground hover:bg-muted hover:text-foreground"
            disabled={subscribe.isPending}
          >
            {subscribe.isPending ? "Subscribing…" : "Subscribe free"}
          </Button>
        </form>
      </div>

      {popularPosts.length > 0 && (
        <div className="border-2 border-foreground bg-card brutal-shadow-sm">
          <div className="flex items-center gap-2 border-b-2 border-foreground px-5 py-4 bg-muted">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-black text-sm uppercase tracking-wider">Popular</h3>
          </div>
          <ol className="divide-y-2 divide-foreground">
            {popularPosts.slice(0, 5).map((post, i) => (
              <li key={post.id}>
                <Link
                  href={`/post/${post.slug}`}
                  className="group flex gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-black text-primary/80 leading-none w-6 shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                    <time className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1 block">
                      {format(new Date(post.createdAt), "MMM d")}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
          <div className="border-t-2 border-foreground px-5 py-3">
            <Link href="/search" className="text-xs font-black uppercase tracking-wider text-primary hover:underline">
              View all articles →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
