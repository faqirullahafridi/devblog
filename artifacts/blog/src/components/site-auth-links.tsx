import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSiteUser, logoutSiteUser } from "@/lib/api-extra";
import { toast } from "sonner";

export function SiteAuthLinks() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["auth", "site-user"],
    queryFn: getSiteUser,
    staleTime: 60_000,
  });

  if (data?.authenticated && data.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 font-bold border-foreground">
            <User className="h-4 w-4" />
            <span className="max-w-[8rem] truncate">{data.user.displayName || data.user.username}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-border">
          <DropdownMenuLabel className="font-normal">
            <p className="font-bold">{data.user.displayName}</p>
            <p className="text-xs text-muted-foreground">@{data.user.username}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/community/profile/${data.user.username}`}>Community profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await logoutSiteUser();
              queryClient.invalidateQueries({ queryKey: ["auth", "site-user"] });
              toast.success("Signed out");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="font-bold border-foreground shadow-sm"
      >
        <Link href="/login">Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="font-bold border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  );
}
