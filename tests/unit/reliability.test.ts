import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DRAFT_KEY, DRAFT_TTL_MS, draftableValues, parseDraft } from "@/features/leads/draft";

vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: vi.fn(), connection: vi.fn(async () => {}) }));

const validEnquiry = {
  fullName: "Priya Sharma",
  email: "priya@example.com",
  whatsapp: "98765 43210",
  residence: "Maharashtra",
  destination: "italy",
  pathway: "study",
  level: "masters",
  intake: "undecided",
  fieldOfStudy: "Data Science",
  scholarshipInterest: "yes",
  highestQualification: "bachelors-4",
  academicBackground: "B.Tech CSE",
  englishTest: "ielts",
  passportStatus: "valid",
  budgetRange: "10-20l",
  consultationMethod: "whatsapp",
  message: "",
  privacyAcknowledged: true,
  contactConsent: true,
  ageConfirmed: true,
  updatesConsent: false,
  startedAt: 1,
};

describe("enquiry drafts on the device", () => {
  const blank = { residence: "", destination: "italy", level: "", consultationMethod: "whatsapp" };

  it("keeps plans and background but never contact details, the message or consent", () => {
    const draft = draftableValues({ ...validEnquiry }, blank);
    expect(draft).toMatchObject({ residence: "Maharashtra", level: "masters", fieldOfStudy: "Data Science", budgetRange: "10-20l" });
    for (const field of ["fullName", "email", "whatsapp", "message", "privacyAcknowledged", "contactConsent", "ageConfirmed"]) expect(draft).not.toHaveProperty(field);
  });

  it("keeps nothing for an untouched form, including its defaults", () => {
    expect(draftableValues({ ...blank }, blank)).toEqual({});
  });

  it("reads back a recent draft and refuses expired, future-dated, malformed or tampered ones", () => {
    const now = Date.parse("2026-11-12T10:00:00Z");
    const stored = (savedAt: number, values: unknown) => JSON.stringify({ savedAt, values });
    expect(parseDraft(stored(now - 1000, { level: "masters" }), now)).toEqual({ level: "masters" });
    expect(parseDraft(stored(now - DRAFT_TTL_MS - 1, { level: "masters" }), now)).toBeNull();
    expect(parseDraft(stored(now + 60_000, { level: "masters" }), now)).toBeNull();
    expect(parseDraft("{not json", now)).toBeNull();
    expect(parseDraft(stored(now, { email: "x@example.com", level: 3 }), now)).toBeNull();
    expect(parseDraft(stored(now, { level: "masters", email: "x@example.com" }), now)).toEqual({ level: "masters" });
    expect(DRAFT_KEY).toMatch(/^asterpath:/);
  });
});

describe("an enquiry the database refuses", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => {
    vi.doUnmock("@/server/repositories/lead-store");
    vi.doUnmock("@/server/services/lead-service");
    vi.doUnmock("@/server/integrations/notifications");
    vi.unstubAllEnvs();
  });

  it("is handed back to the caller instead of being thrown away", async () => {
    vi.doMock("@/server/repositories/lead-store", () => ({
      getLeadStore: () => ({ kind: "supabase", create: async () => Promise.reject(new Error("Lead insert failed (08006)")) }),
    }));
    const { createLead } = await import("@/server/services/lead-service");
    const { enquirySchema } = await import("@/features/leads/schema");
    const enquiry = enquirySchema.parse({ ...validEnquiry, startedAt: Date.now() - 60_000 });
    const result = await createLead(enquiry);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason: "store-failed", lead: { contact: { email: "priya@example.com" } } });
  });

  async function postWith(forwarded: "sent" | "failed") {
    const notify = vi.fn(async () => forwarded);
    vi.doMock("@/server/services/lead-service", () => ({
      createLead: async () => ({ ok: false, reason: "store-failed", lead: { reference: "AP-261112-ABCDE" }, cause: new Error("down") }),
    }));
    vi.doMock("@/server/integrations/notifications", () => ({ notifyTeamOfNewLead: notify, acknowledgeEnquiry: vi.fn() }));
    const { POST } = await import("@/app/api/enquiries/route");
    const response = await POST(
      new NextRequest("http://localhost/api/enquiries", {
        method: "POST",
        headers: { host: "localhost", origin: "http://localhost", "content-type": "application/json" },
        body: JSON.stringify(validEnquiry),
      }),
    );
    return { response, notify };
  }

  it("is emailed to the team, and the student is told it was forwarded, not saved", async () => {
    const { response, notify } = await postWith("sent");
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ reference: "AP-261112-ABCDE" }), { unsaved: true });
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ reference: "AP-261112-ABCDE", saved: false });
  });

  it("is reported as a failure when the email can't be sent either", async () => {
    const { response } = await postWith("failed");
    expect(response.status).toBe(500);
    expect((await response.json()).error.message).toMatch(/WhatsApp/);
  });
});

describe("error alerts", () => {
  it("carry where, when and what kind, never the message or the query string", async () => {
    const { errorFacts } = await import("@/server/alerts");
    const error = Object.assign(new TypeError("value priya@example.com is invalid"), { digest: "123abc" });
    const facts = errorFacts({ where: "route /api/enquiries", error, path: "/contact?email=priya@example.com" });
    expect(facts).toMatchObject({ where: "route /api/enquiries", path: "/contact", kind: "TypeError", digest: "123abc" });
    expect(JSON.stringify(facts)).not.toContain("priya");
  });
});

describe("GET /api/health", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("is healthy in development without a database", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("LEAD_STORE", "none");
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok", database: "not-configured" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("reports an outage in production when enquiries can't be stored", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LEAD_STORE", "none");
    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ status: "degraded", database: "not-configured" });
  });
});
