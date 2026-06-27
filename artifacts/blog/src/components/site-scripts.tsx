import { useEffect, useState } from "react";

export function Analytics() {
  const gaId = import.meta.env.VITE_GA_ID as string | undefined;
  const plausible = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

  useEffect(() => {
    const load = () => {
      if (gaId) {
        const s1 = document.createElement("script");
        s1.async = true;
        s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s1);
        const s2 = document.createElement("script");
        s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`;
        document.head.appendChild(s2);
      }
      if (plausible) {
        const s = document.createElement("script");
        s.defer = true;
        s.dataset.domain = plausible;
        s.src = "https://plausible.io/js/script.js";
        document.head.appendChild(s);
      }
    };

    if (localStorage.getItem("cookie-consent") === "accepted") load();
    window.addEventListener("cookie-consent-accepted", load);
    return () => window.removeEventListener("cookie-consent-accepted", load);
  }, [gaId, plausible]);

  return null;
}

export function AdSenseScript() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

  useEffect(() => {
    if (!client) return;
    const load = () => {
      if (document.querySelector('script[data-adsense]')) return;
      const s = document.createElement("script");
      s.async = true;
      s.dataset.adsense = "true";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    };
    if (localStorage.getItem("cookie-consent") === "accepted") load();
    window.addEventListener("cookie-consent-accepted", load);
    return () => window.removeEventListener("cookie-consent-accepted", load);
  }, [client]);

  return null;
}

export function AdSlot({ className }: { className?: string }) {
  const client = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(localStorage.getItem("cookie-consent") === "accepted");
    const onAccept = () => setConsented(true);
    window.addEventListener("cookie-consent-accepted", onAccept);
    return () => window.removeEventListener("cookie-consent-accepted", onAccept);
  }, []);

  useEffect(() => {
    if (!client || !consented) return;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* ignore */ }
  }, [client, consented, className]);

  if (!client || !consented) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
