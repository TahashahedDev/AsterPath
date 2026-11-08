import type { Attribution } from "@/features/leads/schema";

/**
 * First-touch campaign attribution, kept in sessionStorage (first-party, expires
 * with the tab, no cookies). It is only sent to us if the visitor submits an
 * enquiry, and is stored alongside it to measure which campaigns help students.
 */
const STORAGE_KEY = "asterpath:attribution";
const UTM_KEYS = { utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign", utm_content: "utmContent", utm_term: "utmTerm" } as const;

export function captureAttribution(): void {
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const attribution: Attribution = { landingPage: window.location.pathname.slice(0, 200) };
    for (const [param, key] of Object.entries(UTM_KEYS)) {
      const value = params.get(param);
      if (value) attribution[key] = value.slice(0, 200);
    }
    // Keep only the referring origin, never the full URL with its query string.
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host !== window.location.host) attribution.referrer = ref.origin;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage may be unavailable (private mode, blocked). Attribution is optional.
  }
}

export function readAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}
