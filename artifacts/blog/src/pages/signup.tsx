import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { signupSiteUser } from "@/lib/api-extra";
import { toast } from "sonner";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signupSiteUser({
        email: email.trim(),
        username: username.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "site-user"] });
      toast.success("Account created. Welcome!");
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") || "/";
      setLocation(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SeoHead title={seoTitle("Sign up")} description="Create a free account to participate in the community." />
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="border-2 border-foreground bg-card p-6 md:p-8 brutal-shadow">
          <header className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Join the community to ask questions, answer, and use your profile name across the site.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dev_reader"
                className="border-2 border-foreground"
              />
              <p className="text-xs text-muted-foreground">3–32 characters: letters, numbers, underscore</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name (optional)</Label>
              <Input
                id="displayName"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others see you"
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-2 border-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full border-2 border-foreground bg-primary text-primary-foreground brutal-shadow-sm font-bold hover:bg-primary/90 hover:-translate-x-0.5 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
