import { Link, useLocation } from "wouter";
import { useAdminLogout, useGetAuthMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { useQueryClient } from "@tanstack/react-query";

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
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/subscribers", label: "Subscribers" },
  ];

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-muted/20">
        <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
          <div className="h-14 border-b flex items-center px-6">
            <Link href="/" className="font-bold tracking-tight text-lg">
              DevBlog Admin
            </Link>
          </div>
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location === item.href || location.startsWith(item.href + "/")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground truncate px-2">
              {auth?.username}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-card flex items-center px-6 md:hidden">
            <span className="font-bold">DevBlog Admin</span>
          </header>
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
