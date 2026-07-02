export const COOKIE_CONSENT_KEY = "cookie-consent";

const GOOGLE_CONSENT_DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
} as const;

const GOOGLE_CONSENT_GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
} as const;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function updateGoogleConsent(granted: boolean): void {
  window.gtag?.("consent", "update", granted ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED);
  if (granted) {
    window.gtag?.("set", "ads_data_redaction", false);
  }
}

export function grantCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  updateGoogleConsent(true);
  window.dispatchEvent(new Event("cookie-consent-accepted"));
}
