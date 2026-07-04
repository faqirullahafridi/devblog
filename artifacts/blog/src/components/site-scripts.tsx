import { useEffect, useState } from "react";
import { hasCookieConsent } from "@/lib/cookie-consent";
import { cn } from "@/lib/utils";

export function Analytics() {
  const plausible = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

  useEffect(() => {
    const load = () => {
      if (plausible) {
        const s = document.createElement("script");
        s.defer = true;
        s.dataset.domain = plausible;
        s.src = "https://plausible.io/js/script.js";
        document.head.appendChild(s);
      }
    };

    if (hasCookieConsent()) load();
    window.addEventListener("cookie-consent-accepted", load);
    return () => window.removeEventListener("cookie-consent-accepted", load);
  }, [plausible]);

  return null;
}

export function AdSenseScript() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

  useEffect(() => {
    if (!client) return;
    const load = () => {
      if (document.querySelector("script[data-adsense]")) return;
      const s = document.createElement("script");
      s.async = true;
      s.dataset.adsense = "true";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    };
    if (hasCookieConsent()) load();
    window.addEventListener("cookie-consent-accepted", load);
    return () => window.removeEventListener("cookie-consent-accepted", load);
  }, [client]);

  return null;
}

export type AdSlotVariant = "banner" | "sidebar" | "in-article" | "responsive";

const VARIANT_LAYOUT: Record<
  AdSlotVariant,
  { minHeight: string; adFormat?: string; fullWidth?: boolean; slotEnv?: string }
> = {
  banner: { minHeight: "90px", adFormat: "horizontal", fullWidth: true },
  sidebar: { minHeight: "280px", adFormat: "vertical", fullWidth: true, slotEnv: "VITE_ADSENSE_SLOT_SIDEBAR" },
  "in-article": { minHeight: "280px", adFormat: "fluid", fullWidth: true, slotEnv: "VITE_ADSENSE_SLOT_ARTICLE" },
  responsive: { minHeight: "100px", fullWidth: true },
};

function resolveSlotId(variant: AdSlotVariant): string | undefined {
  const envKey = VARIANT_LAYOUT[variant].slotEnv;
  if (!envKey) return undefined;
  const val = import.meta.env[envKey as keyof ImportMetaEnv] as string | undefined;
  return val?.trim() || undefined;
}

export function AdSlot({
  className,
  variant = "responsive",
  label = true,
}: {
  className?: string;
  variant?: AdSlotVariant;
  /** Show small "Advertisement" label (recommended for AdSense policy). */
  label?: boolean;
}) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const [consented, setConsented] = useState(false);
  const layout = VARIANT_LAYOUT[variant];
  const slotId = resolveSlotId(variant);

  useEffect(() => {
    setConsented(hasCookieConsent());
    const onAccept = () => setConsented(true);
    window.addEventListener("cookie-consent-accepted", onAccept);
    return () => window.removeEventListener("cookie-consent-accepted", onAccept);
  }, []);

  useEffect(() => {
    if (!client || !consented) return;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore */
    }
  }, [client, consented, variant, slotId]);

  if (!client || !consented) return null;

  return (
    <div className={cn("w-full", className)} role="complementary" aria-label="Advertisement">
      {label && (
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80 text-center">
          Advertisement
        </p>
      )}
      <div
        className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden flex items-center justify-center"
        style={{ minHeight: layout.minHeight }}
      >
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: layout.minHeight }}
          data-ad-client={client}
          {...(slotId ? { "data-ad-slot": slotId } : { "data-ad-slot": "auto" })}
          {...(layout.adFormat ? { "data-ad-format": layout.adFormat } : {})}
          {...(layout.fullWidth ? { "data-full-width-responsive": "true" } : {})}
        />
      </div>
    </div>
  );
}
