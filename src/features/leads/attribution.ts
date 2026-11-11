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
    const params = new URLSearchParams(window.location.search);
    // A referral link can arrive on any page of the visit; remember it alongside first-touch data.
    const ref = params.get("ref")?.trim().toUpperCase();
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...(JSON.parse(existing) as Attribution), referralCode: ref }));
      return;
    }
    const attribution: Attribution = { landingPage: window.location.pathname.slice(0, 200) };
    if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
      attribution.referralCode = ref;
      attribution.utmSource ??= "referral";
    }
    for (const [param, key] of Object.entries(UTM_KEYS)) {
      const value = params.get(param);
      if (value) attribution[key] = value.slice(0, 200);
    }
    // Keep only the referring origin, never the full URL with its query string.
    if (document.referrer) {
      const referrer = new URL(document.referrer);
      if (referrer.host !== window.location.host) attribution.referrer = referrer.origin;
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
