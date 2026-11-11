import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { LEAD_REFERENCE_PATTERN } from "@/features/leads/reference";

/** Cal.com signs each webhook body with HMAC-SHA256 (hex) in the X-Cal-Signature-256 header. */
export function verifyCalSignature(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const given = header.trim().toLowerCase();
  if (given.length !== expected.length || !/^[0-9a-f]+$/.test(given)) return false;
  return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}

const attendee = z.object({ name: z.string().max(120), email: z.email().max(254), phoneNumber: z.string().max(32).nullish() });
const webhookSchema = z.object({
  triggerEvent: z.string(),
  payload: z
    .object({
      uid: z.string().max(120).optional(),
      rescheduleUid: z.string().max(120).nullish(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      attendees: z.array(attendee).optional(),
      metadata: z.record(z.string(), z.unknown()).nullish(),
      additionalNotes: z.string().max(2000).nullish(),
      description: z.string().max(4000).nullish(),
      location: z.string().max(500).nullish(),
    })
    .loose()
    .optional(),
});

export type CalBooking = {
  event: "created" | "rescheduled" | "cancelled";
  uid: string;
  previousUid: string | null;
  startsAt: string;
  endsAt: string | null;
  name: string;
  email: string;
  phone: string | null;
  meetingUrl: string | null;
  reference: string | null;
};

const events: Record<string, CalBooking["event"]> = { BOOKING_CREATED: "created", BOOKING_RESCHEDULED: "rescheduled", BOOKING_CANCELLED: "cancelled" };
const httpsUrl = (v: unknown) => (typeof v === "string" && v.startsWith("https://") && v.length <= 500 ? v : null);

/** Reads the parts of a Cal.com booking webhook we keep. Null for pings and events we don't handle. */
export function parseCalBooking(json: unknown): CalBooking | null {
  const parsed = webhookSchema.safeParse(json);
  if (!parsed.success) return null;
  const event = events[parsed.data.triggerEvent];
  const p = parsed.data.payload;
  const person = p?.attendees?.[0];
  if (!event || !p?.uid || !p.startTime || !person || Number.isNaN(Date.parse(p.startTime))) return null;
  // The enquiry reference arrives as booking metadata from our prefilled link, or in the notes.
  const fromMetadata = typeof p.metadata?.reference === "string" ? p.metadata.reference : null;
  const fromNotes = [p.additionalNotes, p.description].join(" ").match(/AP-\d{6}-[A-Z0-9]{5}/)?.[0] ?? null;
  const reference = [fromMetadata, fromNotes].find((r) => r && LEAD_REFERENCE_PATTERN.test(r)) ?? null;
  return {
    event,
    uid: p.uid,
    previousUid: p.rescheduleUid ?? null,
    startsAt: new Date(p.startTime).toISOString(),
    endsAt: p.endTime && !Number.isNaN(Date.parse(p.endTime)) ? new Date(p.endTime).toISOString() : null,
    name: person.name,
    email: person.email,
    phone: person.phoneNumber ?? null,
    meetingUrl: httpsUrl(p.metadata?.videoCallUrl) ?? httpsUrl(p.location),
    reference,
  };
}
