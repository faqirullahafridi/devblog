import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CONSENT_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-accepted"));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6">
      <div className="container mx-auto max-w-3xl rounded-xl border bg-card p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          We use cookies for analytics and ads. See our{" "}
          <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setVisible(false)}>Dismiss</Button>
          <Button size="sm" onClick={accept}>Accept</Button>
        </div>
      </div>
    </div>
  );
}

export function hasCookieConsent() {
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}
