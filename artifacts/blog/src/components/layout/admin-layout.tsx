import { Link, useLocation } from "wouter";
import { useAdminLogout, useGetAuthMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { useQueryClient } from "@tanstack/react-query";
import { BrandLogo } from "@/components/brand-logo";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  const { data: auth } = useGetAuthMe();

  const handleLogout = async () => {
    await logout.mutateAsync(undefined);
    queryClient.clear();
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/posts", label: "Posts" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/comments", label: "Comments" },
    { href: "/admin/profile", label: "Profile" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/platform", label: "Platform" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/challenges", label: "Challenges" },
    { href: "/admin/subscribers", label: "Subscribers" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-muted">
        <aside className="w-64 border-r-2 border-foreground bg-card flex flex-col hidden md:flex brutal-shadow-sm">
          <div className="h-16 border-b-2 border-foreground flex items-center px-6">
            <Link href="/admin/dashboard" className="hover:opacity-90 transition-opacity">
              <BrandLogo variant="admin" markClassName="h-8 w-8" />
            </Link>
          </div>
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-bold border-2 transition-all ${
                    location === item.href || location.startsWith(item.href + "/")
                      ? "bg-primary text-primary-foreground border-foreground brutal-shadow-sm"
                      : "border-transparent text-muted-foreground hover:border-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t-2 border-foreground flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground truncate px-2">
              {auth?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b-2 border-foreground bg-card flex items-center px-6 md:hidden">
            <BrandLogo variant="admin" markClassName="h-8 w-8" />
          </header>
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
