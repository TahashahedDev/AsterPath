import { z } from "zod";

/**
 * Website analytics events. Deliberately anonymous: no cookies, no IP address,
 * no user agent string, no form contents. A random id per browser tab groups one
 * visit's events so we can count visits and the visit → enquiry funnel.
 */
export const eventNames = ["pageview", "cta_click", "whatsapp_click", "booking_click", "enquiry_started", "enquiry_submitted"] as const;
export type EventName = (typeof eventNames)[number];

const short = (max: number) => z.string().trim().max(max).optional();

export const siteEventSchema = z
  .object({
    name: z.enum(eventNames),
    session: z.uuid(),
    path: z.string().max(200).regex(/^\/[^\s]*$/),
    label: short(80),
    source: short(80),
    medium: short(80),
    campaign: short(120),
    referrerHost: short(120),
    device: z.enum(["mobile", "tablet", "desktop"]),
  })
  .strict();

export type SiteEvent = z.infer<typeof siteEventSchema>;
