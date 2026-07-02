export const COOKIE_CONSENT_KEY = "cookie-consent";
export const COOKIE_CONSENT_ACCEPTED = "accepted";
export const COOKIE_CONSENT_REJECTED = "rejected";

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

export function getCookieConsentChoice(): string | null {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_REJECTED) return value;
    return null;
  } catch {
    return null;
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsentChoice() === COOKIE_CONSENT_ACCEPTED;
}

export function hasCookieChoice(): boolean {
  return getCookieConsentChoice() !== null;
}

/** GA custom events + SPA page views (respects explicit reject; otherwise follows Consent Mode defaults). */
export function canTrackAnalytics(): boolean {
  return getCookieConsentChoice() !== COOKIE_CONSENT_REJECTED;
}

export function updateGoogleConsent(granted: boolean): void {
  window.gtag?.("consent", "update", granted ? GOOGLE_CONSENT_GRANTED : GOOGLE_CONSENT_DENIED);
  window.gtag?.("set", "ads_data_redaction", !granted);
}

export function grantCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_ACCEPTED);
  updateGoogleConsent(true);
  window.dispatchEvent(new Event("cookie-consent-accepted"));
}

export function rejectCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_REJECTED);
  updateGoogleConsent(false);
  window.dispatchEvent(new Event("cookie-consent-rejected"));
}
