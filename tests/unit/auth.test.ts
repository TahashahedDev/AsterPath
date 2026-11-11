import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { safeNextPath, signInSchema, signUpSchema, staffSignInSchema } from "@/features/auth/schema";
import { parseSupabaseUrl } from "@/lib/supabase/config";
import { toLeadRow, type LeadRecord } from "@/server/repositories/lead-store";

describe("post-login destination", () => {
  it("allows only paths inside the signed-in areas", () => {
    expect(safeNextPath("/portal")).toBe("/portal");
    expect(safeNextPath("/admin/audit")).toBe("/admin/audit");
    for (const unsafe of ["https://evil.example", "//evil.example", "/\\evil.example", "/contact", "/portal?x=1", "javascript:alert(1)", undefined, 42]) {
      expect(safeNextPath(unsafe)).toBe("/portal");
    }
  });
});

describe("sign-up form", () => {
  const valid = {
    fullName: "Test Student",
    email: "  Test.Student@Example.com ",
    password: "a-long-passphrase",
    terms: "on",
    privacy: "on",
    age: "on",
    noGuarantee: "on",
    truthful: "on",
  };

  it("accepts a complete form and normalises the email", () => {
    const parsed = signUpSchema.parse(valid);
    expect(parsed.email).toBe("test.student@example.com");
    expect(parsed.updates).toBeUndefined();
  });

  it("requires every agreement and a 10-character password", () => {
    expect(signUpSchema.safeParse({ ...valid, truthful: undefined }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, password: "x".repeat(73) }).success).toBe(false);
  });

  it("rejects an invalid sign-in email", () => {
    expect(signInSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});

describe("Supabase settings", () => {
  it("accepts an https project origin or a local one", () => {
    expect(parseSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
    expect(parseSupabaseUrl("http://127.0.0.1:54321")).toBe("http://127.0.0.1:54321");
  });

  it("rejects plain http, credentials and paths", () => {
    for (const bad of ["http://abc.supabase.co", "https://u:p@abc.supabase.co", "https://abc.supabase.co/rest/v1", "not a url"]) {
      expect(parseSupabaseUrl(bad)).toBeNull();
    }
  });
});

describe("lead storage", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("saves to Supabase by default in production once it is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LEAD_STORE", undefined);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key-for-tests-only");
    const { getServerEnv } = await import("@/lib/env");
    expect(getServerEnv().LEAD_STORE).toBe("supabase");
  });

  it("refuses LEAD_STORE=supabase without its keys", async () => {
    vi.stubEnv("LEAD_STORE", "supabase");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
    const { getServerEnv } = await import("@/lib/env");
    expect(() => getServerEnv()).toThrow(/needs NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("maps every enquiry field onto a leads column", () => {
    const lead: LeadRecord = {
      id: "10000000-0000-4000-8000-000000000009",
      reference: "AP-261109-ABCDE",
      status: "new",
      createdAt: "2026-11-09T10:00:00.000Z",
      followUpDueAt: "2026-11-10T10:00:00.000Z",
      contact: { fullName: "Test Student", email: "test@example.com", whatsapp: "+91 90000 00000", residence: "Kerala" },
      goals: { destination: "italy", pathway: "study", level: "masters", intake: "autumn-2027", fieldOfStudy: "Design", scholarshipInterest: "yes" },
      background: { highestQualification: "bachelors-4", academicBackground: "Synthetic", englishTest: "planning", passportStatus: "valid", budgetRange: "10-20l" },
      preferences: { consultationMethod: "whatsapp", message: "" },
      consent: { privacyNoticeVersion: "v1", contactConsent: true, ageOrGuardianConfirmed: true, updatesConsent: false, recordedAt: "2026-11-09T10:00:00.000Z" },
      attribution: null,
    };
    const row = toLeadRow(lead);
    expect(row).toMatchObject({ reference: "AP-261109-ABCDE", full_name: "Test Student", field_of_study: "Design", age_or_guardian_confirmed: true, attribution: null });
    expect(Object.values(row).every((value) => value !== undefined)).toBe(true);
  });
});

describe("password recovery", () => {
  it("allows the reset page as a post-link destination, and nothing else outside the signed-in areas", async () => {
    const { safeNextPath } = await import("@/features/auth/schema");
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(safeNextPath("/reset-password/../admin")).toBe("/portal");
    expect(safeNextPath("/forgot-password")).toBe("/portal");
  });

  it("requires matching new passwords of at least 10 characters", async () => {
    const { resetPasswordSchema, forgotPasswordSchema } = await import("@/features/auth/schema");
    expect(resetPasswordSchema.safeParse({ password: "correct horse", confirm: "correct horse" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ password: "correct horse", confirm: "correct house" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "short", confirm: "short" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "Someone@Example.com" }).data?.email).toBe("someone@example.com");
  });
});

describe("team sign-in", () => {
  const ok = (identifier: string) => staffSignInSchema.safeParse({ identifier, password: "x" }).success;

  it("accepts a username or an email", () => {
    expect(ok("TahaShahed")).toBe(true);
    expect(ok("taha.shahed_1")).toBe(true);
    expect(ok("founder@example.com")).toBe(true);
  });

  it("refuses anything that is neither", () => {
    expect(ok("")).toBe(false);
    expect(ok("ab")).toBe(false);
    expect(ok("Taha Shahed")).toBe(false);
    expect(ok("taha@")).toBe(false);
    expect(ok("x".repeat(33))).toBe(false);
  });
});
