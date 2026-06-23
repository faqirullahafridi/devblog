import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAuthMe } from "@workspace/api-client-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: auth, isLoading, isFetching } = useGetAuthMe({
    query: { staleTime: 5 * 60 * 1000 },
  });

  const settling = isLoading || isFetching;
  const denied = !settling && !auth?.authenticated;

  useEffect(() => {
    if (denied) {
      setLocation("/admin/login");
    }
  }, [denied, setLocation]);

  if (settling) {
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
