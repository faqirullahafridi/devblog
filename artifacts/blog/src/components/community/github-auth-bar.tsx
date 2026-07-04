import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Github, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGitHubUser, getSiteUser, logoutGitHub, logoutSiteUser } from "@/lib/api-extra";
import { toast } from "sonner";

export function GitHubAuthBar() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [checkedAuth, setCheckedAuth] = useState(false);

  const { data: github } = useQuery({
    queryKey: ["auth", "github"],
    queryFn: getGitHubUser,
    staleTime: 60_000,
  });

  const { data: siteUser } = useQuery({
    queryKey: ["auth", "site-user"],
    queryFn: getSiteUser,
    staleTime: 60_000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (!auth) {
      setCheckedAuth(true);
      return;
    }

    if (auth === "success") toast.success("Signed in with GitHub");
    else if (auth === "failed") toast.error("GitHub sign-in failed");
    else if (auth === "unconfigured") toast.message("GitHub OAuth is not configured on this server");

    params.delete("auth");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    setLocation(next, { replace: true });
    queryClient.invalidateQueries({ queryKey: ["auth", "github"] });
    setCheckedAuth(true);
  }, [queryClient, setLocation]);

  if (!checkedAuth && !github && !siteUser) return null;

  if (siteUser?.authenticated && siteUser.user) {
    return (
      <div className="flex flex-wrap items-center gap-3 mb-6 border border-border bg-muted/40 p-4 shadow-sm">
        <User className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{siteUser.user.displayName}</p>
          <p className="text-xs text-muted-foreground">Signed in as @{siteUser.user.username}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-foreground"
          onClick={async () => {
            await logoutSiteUser();
            queryClient.invalidateQueries({ queryKey: ["auth", "site-user"] });
            toast.success("Signed out");
          }}
        >
          <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
        </Button>
      </div>
    );
  }

  if (github?.authenticated && github.user) {
    return (
      <div className="flex flex-wrap items-center gap-3 mb-6 border border-border bg-muted/40 p-4 shadow-sm">
        {github.user.avatar ? (
          <img src={github.user.avatar} alt="" className="h-8 w-8 rounded-full border border-border" />
        ) : (
          <Github className="h-5 w-5" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{github.user.name ?? github.user.login}</p>
          <p className="text-xs text-muted-foreground">Signed in as @{github.user.login}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-foreground"
          onClick={async () => {
            await logoutGitHub();
            queryClient.invalidateQueries({ queryKey: ["auth", "github"] });
            toast.success("Signed out");
          }}
        >
          <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mb-6 border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Sign in to use your profile when asking and answering in the community.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border border-border shadow-sm font-bold"
        >
          <Link href="/login">Sign in</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="border border-border bg-primary text-primary-foreground shadow-sm font-bold hover:bg-primary/90"
        >
          <Link href="/signup">Sign up</Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="border border-border shadow-sm font-bold"
        >
          <a href="/api/auth/github">
            <Github className="h-4 w-4 mr-2" /> GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
