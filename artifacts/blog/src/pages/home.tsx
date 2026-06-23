import { PublicLayout } from "@/components/layout/public-layout";
import { PostCard } from "@/components/post-card";
import { useGetFeaturedPosts, useListPosts, useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const { data: featuredPosts, isLoading: isLoadingFeatured } = useGetFeaturedPosts({ limit: 4 });
  const { data: recentPostsData, isLoading: isLoadingRecent } = useListPosts({ limit: 6, status: "published" });
  const subscribe = useSubscribeNewsletter();
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe.mutateAsync({ data: { email } });
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      toast.error("Failed to subscribe.");
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 border-b bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Crafting the web,<br />one line at a time.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A focused knowledge hub for developers who care about code quality, architecture, and the art of building software.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Featured</h2>
              {isLoadingFeatured ? (
                <div className="h-40 bg-muted animate-pulse rounded-lg"></div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2">
                  {featuredPosts?.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {featuredPosts?.length === 0 && <p className="text-muted-foreground">No featured posts yet.</p>}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Articles</h2>
              {isLoadingRecent ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>)}
                </div>
              ) : (
                <div className="grid gap-10">
                  {recentPostsData?.posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <div className="p-6 bg-card border rounded-xl space-y-4 shadow-sm">
              <h3 className="font-bold text-lg">Join the Newsletter</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest articles and insights delivered straight to your inbox. No spam, just signal.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="hello@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" disabled={subscribe.isPending}>
                  {subscribe.isPending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
