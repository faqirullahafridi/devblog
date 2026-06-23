import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAuthMe } from "@workspace/api-client-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: auth, isLoading } = useGetAuthMe();

  useEffect(() => {
    if (!isLoading && !auth?.authenticated) {
      setLocation("/admin/login");
    }
  }, [auth, isLoading, setLocation]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!auth?.authenticated) {
    return null;
  }

  return <>{children}</>;
}
