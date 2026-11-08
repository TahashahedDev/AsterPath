import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enquirySchema } from "@/features/leads/schema";
import { LEAD_REFERENCE_PATTERN, generateLeadReference } from "@/features/leads/reference";
import { validEnquiry } from "../fixtures/enquiry";

describe("lead references", () => {
  it("generates readable references in the expected format", () => {
    const ref = generateLeadReference(new Date("2026-11-08T10:00:00Z"));
    expect(ref).toMatch(LEAD_REFERENCE_PATTERN);
    expect(ref.startsWith("AP-261108-")).toBe(true);
  });
});

describe("lead service", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("treats honeypot submissions and instant submissions as automated", async () => {
    const { looksAutomated } = await import("@/server/services/lead-service");
    const now = 1_700_000_100_000;
    expect(looksAutomated({ website: "http://spam", startedAt: now - 60_000 }, now)).toBe(true);
    expect(looksAutomated({ website: "", startedAt: now - 500 }, now)).toBe(true);
    expect(looksAutomated({ website: "", startedAt: now - 60_000 }, now)).toBe(false);
  });

  it("reports not-connected instead of faking success when no store is configured", async () => {
    vi.stubEnv("LEAD_STORE", "none");
    const { createLead } = await import("@/server/services/lead-service");
    const now = new Date(validEnquiry.startedAt + 60_000);
    const result = await createLead(enquirySchema.parse(validEnquiry), now);
    expect(result).toEqual({ ok: false, reason: "not-connected" });
  });
});

describe("server environment", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("defaults to no lead storage in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LEAD_STORE", undefined);
    const { getServerEnv } = await import("@/lib/env");
    expect(getServerEnv().LEAD_STORE).toBe("none");
  });

  it("refuses the local file store in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LEAD_STORE", "local");
    const { getServerEnv } = await import("@/lib/env");
    expect(() => getServerEnv()).toThrow(/development only/);
  });
});
