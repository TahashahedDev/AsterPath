import { readAttribution } from "@/features/leads/attribution";
import type { EventName, SiteEvent } from "@/features/analytics/events";

/**
 * Browser side of the website analytics. Nothing is sent when the visitor's
 * browser asks not to be tracked (Global Privacy Control or Do Not Track).
 * The reading journey stays on the device (sessionStorage) and is only sent to
 * us inside an enquiry, which the visitor submits with consent.
 */
const VISIT_KEY = "asterpath:visit";
const JOURNEY_KEY = "asterpath:journey";
const MAX_JOURNEY = 20;

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

function visitId(): string {
  try {
    const existing = sessionStorage.getItem(VISIT_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(VISIT_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function device(): SiteEvent["device"] {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

export function track(name: EventName, label?: string): void {
  try {
    if (optedOut()) return;
    const a = readAttribution();
    let referrerHost: string | undefined;
    try {
      referrerHost = a?.referrer ? new URL(a.referrer).host : undefined;
    } catch {
      referrerHost = undefined;
    }
    const event: SiteEvent = {
      name,
      session: visitId(),
      path: window.location.pathname.slice(0, 200),
      device: device(),
      ...(label ? { label: label.slice(0, 80) } : {}),
      ...(a?.utmSource ? { source: a.utmSource.slice(0, 80) } : {}),
      ...(a?.utmMedium ? { medium: a.utmMedium.slice(0, 80) } : {}),
      ...(a?.utmCampaign ? { campaign: a.utmCampaign.slice(0, 120) } : {}),
      ...(referrerHost ? { referrerHost: referrerHost.slice(0, 120) } : {}),
    };
    const body = new Blob([JSON.stringify(event)], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/events", body)) {
      void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => undefined);
    }
  } catch {
    // Analytics must never break the page.
  }
}

/** Remembers the pages read during this visit, on this device only. */
export function recordJourney(path: string): void {
  try {
    const journey = readJourney();
    if (journey.at(-1) === path) return;
    sessionStorage.setItem(JOURNEY_KEY, JSON.stringify([...journey, path.slice(0, 200)].slice(-MAX_JOURNEY)));
  } catch {
    // Storage may be unavailable; the journey is optional.
  }
}

export function readJourney(): string[] {
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === "string").slice(-MAX_JOURNEY) : [];
  } catch {
    return [];
  }
}
