/** Client-side analytics helpers for GA4 and Plausible */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

function canTrack(): boolean {
  return typeof window !== "undefined" && localStorage.getItem("cookie-consent") === "accepted";
}

export function trackPageView(path: string, title?: string) {
  if (!canTrack()) return;
  const pageTitle = title ?? document.title;

  if (window.gtag) {
    window.gtag("event", "page_view", { page_path: path, page_title: pageTitle });
  }
  if (window.plausible) {
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
  if (window.plausible) {
    window.plausible(name, props ? { props } : undefined);
  }
}

/** Platform-specific event helpers */
export const platformEvents = {
  aiChat: (mode: string) => trackEvent("ai_chat", { mode }),
  playgroundSave: (language: string, isPublic: boolean) =>
    trackEvent("playground_save", { language, is_public: isPublic }),
  playgroundFork: (language: string) => trackEvent("playground_fork", { language }),
  playgroundShare: (language: string) => trackEvent("playground_share", { language }),
  roadmapGenerate: (goal: string, level: string) =>
    trackEvent("roadmap_generate", { goal, level }),
  challengeSubmit: (slug: string, passed: boolean) =>
    trackEvent("challenge_submit", { slug, passed }),
  jobBookmark: (slug: string, bookmarked: boolean) =>
    trackEvent("job_bookmark", { slug, bookmarked }),
  communityAsk: () => trackEvent("community_ask"),
  communityAnswer: (questionId: number) =>
    trackEvent("community_answer", { question_id: questionId }),
};
