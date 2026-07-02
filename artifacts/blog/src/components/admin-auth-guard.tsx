import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAuthMe } from "@workspace/api-client-react";
import { toast } from "sonner";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: auth, isLoading } = useGetAuthMe({
    query: { staleTime: 5 * 60 * 1000 },
  });

  const denied = !isLoading && !auth?.authenticated;

  useEffect(() => {
    if (denied) {
      toast.message("Session expired. Please sign in again.");
      setLocation("/admin/login");
    }
  }, [denied, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth?.authenticated) {
    return null;
  }

  return <>{children}</>;
}
