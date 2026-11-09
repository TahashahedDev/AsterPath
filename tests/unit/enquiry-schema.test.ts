import { describe, expect, it } from "vitest";
import { contactStepSchema, enquirySchema } from "@/features/leads/schema";
import { validEnquiry } from "../fixtures/enquiry";


describe("enquiry schema", () => {
  it("accepts a complete enquiry and normalises contact details", () => {
    const result = enquirySchema.parse(validEnquiry);
    expect(result.fullName).toBe("Test Student");
    expect(result.email).toBe("test.student@example.com");
    expect(result.whatsapp).toBe("+919876543210");
  });

  it("requires privacy acknowledgement, contact consent and age or guardian confirmation", () => {
    const result = enquirySchema.safeParse({ ...validEnquiry, privacyAcknowledged: false, contactConsent: false, ageConfirmed: false });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path[0]);
    expect(paths).toContain("privacyAcknowledged");
    expect(paths).toContain("contactConsent");
    expect(paths).toContain("ageConfirmed");
  });

  it("only accepts Indian states and union territories, or outside India", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, residence: "outside-india" }).success).toBe(true);
    expect(enquirySchema.safeParse({ ...validEnquiry, residence: "Atlantis" }).success).toBe(false);
  });

  it("rejects unknown study levels and invalid phone numbers", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, level: "diploma" }).success).toBe(false);
    expect(contactStepSchema.safeParse({ ...validEnquiry, whatsapp: "call me" }).success).toBe(false);
  });

  it("enforces length limits", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, message: "x".repeat(1501) }).success).toBe(false);
  });

  it("rejects unexpected attribution keys", () => {
    expect(enquirySchema.safeParse({ ...validEnquiry, attribution: { utmSource: "instagram", passport: "X" } }).success).toBe(false);
  });
});
