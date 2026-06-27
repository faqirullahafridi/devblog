import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { confirmNewsletter } from "@/lib/api-extra";
import { SeoHead } from "@/components/seo-head";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function NewsletterConfirmPage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing confirmation token.");
      return;
    }
    confirmNewsletter(token)
      .then((data) => {
        setStatus("success");
        setMessage((data as { message?: string }).message || "Subscription confirmed!");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Invalid or expired confirmation link.");
      });
  }, [token]);

  return (
    <PublicLayout>
      <SeoHead title="Confirm subscription — devblog" />
      <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Confirming your subscription…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">You&apos;re subscribed!</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild><Link href="/">Back to blog</Link></Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-bold">Confirmation failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild variant="outline"><Link href="/">Back to blog</Link></Button>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
