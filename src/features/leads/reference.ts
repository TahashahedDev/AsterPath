// Crockford-style alphabet without easily confused characters (0/O, 1/I/L).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Human-friendly lead reference such as "AP-261108-7KQ4M".
 * The database UUID remains the real identifier; this is for conversations.
 */
export function generateLeadReference(now: Date = new Date(), random: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  const yy = String(now.getUTCFullYear() % 100).padStart(2, "0");
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const bytes = random(new Uint8Array(5));
  const suffix = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
  return `AP-${yy}${mm}${dd}-${suffix}`;
}

export const LEAD_REFERENCE_PATTERN = /^AP-\d{6}-[2-9A-HJKMNP-TV-Z]{5}$/;
