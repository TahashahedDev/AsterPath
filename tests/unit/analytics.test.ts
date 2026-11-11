import { describe, expect, it } from "vitest";
import { siteEventSchema } from "@/features/analytics/events";
import { attributionSchema } from "@/features/leads/schema";

const base = { name: "pageview", session: "6f1c3a52-2b7d-4c1e-9d55-0a4c1b2e3f40", path: "/study-in-italy/masters", device: "mobile" } as const;

describe("website analytics events", () => {
  it("accepts an anonymous page view", () => {
    expect(siteEventSchema.safeParse(base).success).toBe(true);
  });

  it("refuses anything beyond the anonymous fields, such as an email or IP", () => {
    expect(siteEventSchema.safeParse({ ...base, email: "a@example.com" }).success).toBe(false);
    expect(siteEventSchema.safeParse({ ...base, ip: "1.2.3.4" }).success).toBe(false);
  });

  it("refuses unknown event names, full URLs and oversized labels", () => {
    expect(siteEventSchema.safeParse({ ...base, name: "keystroke" }).success).toBe(false);
    expect(siteEventSchema.safeParse({ ...base, path: "https://evil.example/x" }).success).toBe(false);
    expect(siteEventSchema.safeParse({ ...base, name: "cta_click", label: "x".repeat(81) }).success).toBe(false);
  });

  it("accepts a short reading journey with an enquiry, and nothing else", () => {
    expect(attributionSchema.safeParse({ utmSource: "instagram", journey: ["/", "/scholarships"] }).success).toBe(true);
    expect(attributionSchema.safeParse({ journey: Array.from({ length: 21 }, () => "/") }).success).toBe(false);
    expect(attributionSchema.safeParse({ journey: ["javascript:alert(1)"] }).success).toBe(false);
  });
});
