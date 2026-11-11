/**
 * A half-finished enquiry kept on the student's own device, so a phone call or
 * a closed tab doesn't cost them the form. Only plans and background are kept:
 * never name, email, WhatsApp number, message or consent ticks, so another
 * person using the same phone learns nothing personal from it. Expires after
 * seven days and is cleared once the enquiry is sent.
 */
export const DRAFT_KEY = "asterpath:enquiry-draft:v1";
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const DRAFT_FIELDS = [
  "residence",
  "destination",
  "pathway",
  "level",
  "intake",
  "fieldOfStudy",
  "scholarshipInterest",
  "highestQualification",
  "academicBackground",
  "englishTest",
  "passportStatus",
  "budgetRange",
  "consultationMethod",
] as const;

export type DraftField = (typeof DRAFT_FIELDS)[number];
export type DraftValues = Partial<Record<DraftField, string>>;
type Stored = { savedAt: number; values: DraftValues };

/** Storage can be missing or throw (private mode, blocked site data); a draft is a convenience, never required. */
function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The draftable answers that differ from a blank form; empty when there is nothing worth keeping. */
export function draftableValues(values: Record<string, unknown>, blank: Record<string, unknown>): DraftValues {
  const out: DraftValues = {};
  for (const field of DRAFT_FIELDS) {
    const value = values[field];
    if (typeof value === "string" && value !== "" && value !== blank[field]) out[field] = value.slice(0, 600);
  }
  return out;
}

export function saveDraft(values: DraftValues, now = Date.now()): void {
  const store = storage();
  if (!store) return;
  try {
    if (Object.keys(values).length === 0) store.removeItem(DRAFT_KEY);
    else store.setItem(DRAFT_KEY, JSON.stringify({ savedAt: now, values } satisfies Stored));
  } catch {
    // Quota or privacy settings: drop the draft silently.
  }
}

/** The raw stored string, for useSyncExternalStore (a stable primitive snapshot). */
export function readDraftRaw(): string | null {
  try {
    return storage()?.getItem(DRAFT_KEY) ?? null;
  } catch {
    return null;
  }
}

/** Parses a stored draft, rejecting anything expired, malformed or carrying fields it shouldn't. */
export function parseDraft(raw: string | null, now = Date.now()): DraftValues | null {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (typeof stored.savedAt !== "number" || now - stored.savedAt > DRAFT_TTL_MS || now < stored.savedAt) return null;
    if (!stored.values || typeof stored.values !== "object") return null;
    const values: DraftValues = {};
    for (const field of DRAFT_FIELDS) {
      const value = (stored.values as Record<string, unknown>)[field];
      if (typeof value === "string" && value.length <= 600) values[field] = value;
    }
    return Object.keys(values).length > 0 ? values : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    storage()?.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
