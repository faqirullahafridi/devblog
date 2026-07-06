import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { loginSiteUser } from "@/lib/api-extra";
import { keyEvents } from "@/lib/analytics";
import { toast } from "sonner";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginSiteUser({ login: login.trim(), password });
      queryClient.invalidateQueries({ queryKey: ["auth", "site-user"] });
      keyEvents.login("email");
      toast.success("Signed in");
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/";
      setLocation(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SeoHead title={seoTitle("Sign in")} description="Sign in to your account." />
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="border border-border bg-card p-6 md:p-8 brutal-shadow">
          <header className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Use your email or username and password.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Email or username</Label>
              <Input
                id="login"
                autoComplete="username"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="you@example.com or username"
                className="border border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-border"
              />
            </div>
            <Button
              type="submit"
              className="w-full border border-border bg-primary text-primary-foreground shadow-sm font-bold hover:bg-primary/90 hover:-translate-x-0.5 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
