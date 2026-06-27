import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SeoHead } from "@/components/seo-head";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function NewsletterUnsubscribePage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing unsubscribe token.");
      return;
    }
    fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStatus("success");
        setMessage((data as { message?: string }).message || "You have been unsubscribed.");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Invalid unsubscribe link.");
      });
  }, [token]);

  return (
    <PublicLayout>
      <SeoHead title="Unsubscribe — devblog" />
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Processing…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild><Link href="/">Back to blog</Link></Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild variant="outline"><Link href="/">Back to blog</Link></Button>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
