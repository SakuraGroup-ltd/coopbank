// GA4 helpers for Cooperative Bank.
// Measurement ID is env-configurable; falls back to the live "Front End" stream.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-9DSFGNCT74";

type Gtag = (...args: unknown[]) => void;
function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { gtag?: Gtag }).gtag ?? null;
}

/** Send an explicit GA4 page_view (used on every route change). */
export function pageview(url: string) {
  const g = gtag();
  if (!g || !GA_ID) return;
  g("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Send any GA4 event with parameters. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  const g = gtag();
  if (!g || !GA_ID) return;
  g("event", name, params);
}
