/** Client-side analytics helpers for GA4 and Plausible */

import { hasCookieConsent, canTrackAnalytics } from "@/lib/cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

/**
 * GA4 key events — mark each event name in Google Analytics:
 * Admin → Data display → Key events → New key event
 *
 * Recommended GA4 names are used where possible so they appear in standard reports.
 */
export const GA_KEY_EVENTS = {
  SIGN_UP: "sign_up",
  LOGIN: "login",
  GENERATE_LEAD: "generate_lead",
  SEARCH: "search",
  SHARE: "share",
  FILE_DOWNLOAD: "file_download",
  SELECT_CONTENT: "select_content",
  AI_CHAT: "ai_chat",
  PLAYGROUND_SAVE: "playground_save",
  PLAYGROUND_FORK: "playground_fork",
  PLAYGROUND_VIEW: "playground_view",
  ROADMAP_GENERATE: "roadmap_generate",
  CHALLENGE_SUBMIT: "challenge_submit",
  JOB_BOOKMARK: "job_bookmark",
  COMMUNITY_ASK: "community_ask",
  COMMUNITY_ANSWER: "community_answer",
} as const;

export type GaKeyEventName = (typeof GA_KEY_EVENTS)[keyof typeof GA_KEY_EVENTS];

function canTrack(): boolean {
  return typeof window !== "undefined" && canTrackAnalytics();
}

function canTrackThirdParty(): boolean {
  return typeof window !== "undefined" && hasCookieConsent();
}

export function trackPageView(path: string, title?: string) {
  if (!canTrack()) return;
  const pageTitle = title ?? document.title;

  if (window.gtag) {
    window.gtag("event", "page_view", { page_path: path, page_title: pageTitle });
  }
  if (canTrackThirdParty() && window.plausible) {
    window.plausible("pageview", { props: { path } });
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
) {
  if (!canTrack()) return;

  if (window.gtag) {
    window.gtag("event", name, props);
  }
  if (canTrackThirdParty() && window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
}

/** GA4 key conversion events — use these helpers for actions you mark as key events. */
export const keyEvents = {
  signUp: (method: "email" | "github" = "email") =>
    trackEvent(GA_KEY_EVENTS.SIGN_UP, { method }),

  login: (method: "email" | "github" = "email") =>
    trackEvent(GA_KEY_EVENTS.LOGIN, { method }),

  newsletterSubscribe: () =>
    trackEvent(GA_KEY_EVENTS.GENERATE_LEAD, { lead_type: "newsletter" }),

  search: (searchTerm: string) => {
    const term = searchTerm.trim();
    if (term.length < 2) return;
    trackEvent(GA_KEY_EVENTS.SEARCH, { search_term: term });
  },

  share: (contentType: string, itemId: string, method = "link") =>
    trackEvent(GA_KEY_EVENTS.SHARE, {
      content_type: contentType,
      item_id: itemId,
      method,
    }),

  templateDownload: (slug: string) =>
    trackEvent(GA_KEY_EVENTS.FILE_DOWNLOAD, {
      file_name: `${slug}.html`,
      content_type: "template",
      item_id: slug,
    }),

  selectContent: (contentType: string, itemId: string) =>
    trackEvent(GA_KEY_EVENTS.SELECT_CONTENT, {
      content_type: contentType,
      item_id: itemId,
    }),
};

/** Platform-specific event helpers */
export const platformEvents = {
  aiChat: (mode: string) => trackEvent(GA_KEY_EVENTS.AI_CHAT, { mode }),
  playgroundSave: (language: string, isPublic: boolean) =>
    trackEvent(GA_KEY_EVENTS.PLAYGROUND_SAVE, { language, is_public: isPublic }),
  playgroundFork: (language: string) =>
    trackEvent(GA_KEY_EVENTS.PLAYGROUND_FORK, { language }),
  playgroundShare: (language: string) => {
    keyEvents.share("playground", language);
  },
  roadmapGenerate: (goal: string, level: string) =>
    trackEvent(GA_KEY_EVENTS.ROADMAP_GENERATE, { goal, level }),
  challengeSubmit: (slug: string, passed: boolean) =>
    trackEvent(GA_KEY_EVENTS.CHALLENGE_SUBMIT, { slug, passed }),
  jobBookmark: (slug: string, bookmarked: boolean) =>
    trackEvent(GA_KEY_EVENTS.JOB_BOOKMARK, { slug, bookmarked }),
  communityAsk: () => trackEvent(GA_KEY_EVENTS.COMMUNITY_ASK),
  communityAnswer: (questionId: number) =>
    trackEvent(GA_KEY_EVENTS.COMMUNITY_ANSWER, { question_id: questionId }),
};
