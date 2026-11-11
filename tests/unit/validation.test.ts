import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/features/leads/schema";
import { intakeValue } from "@/features/leads/intakes";
import { cleanLine, cleanText, dateWithin, emailAddress, multiLine, personName, singleLine, toE164 } from "@/lib/validation/fields";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe("text cleaning", () => {
  it("removes invisible and direction-changing characters and tidies spaces", () => {
    expect(cleanLine("  Priya​  Sharma‮ \n")).toBe("Priya Sharma");
    expect(cleanLine("Café")).toBe("Café");
  });

  it("keeps line breaks in longer text, at most one blank line in a row", () => {
    expect(cleanText("Line one  \r\n\r\n\r\n\r\n  Line two\u0000")).toBe("Line one\n\nLine two");
  });
});

describe("person names", () => {
  const name = personName();

  it("accepts real names in any script", () => {
    for (const v of ["Priya Sharma", "D'Souza", "Anne-Marie O’Neil", "K. S. Rao", "प्रिया शर्मा", "José Núñez"]) expect(ok(name, v), v).toBe(true);
  });

  it("refuses digits, symbols, links and single letters", () => {
    for (const v of ["12345", "Priya123", "<script>", "http://spam.example", "P", "--", "Priya  @ Sharma"]) expect(ok(name, v), v).toBe(false);
  });

  it("stores the cleaned name", () => {
    expect(name.parse("  priya​   sharma ")).toBe("priya sharma");
  });
});

describe("free text", () => {
  it("needs real words, not just punctuation", () => {
    expect(ok(singleLine({ label: "Field", max: 50 }), "Data Science")).toBe(true);
    expect(ok(singleLine({ label: "Field", max: 50 }), "!!!")).toBe(false);
    expect(ok(singleLine({ label: "Field", max: 50 }), "   ")).toBe(false);
  });

  it("keeps ordinary dotted words such as B.Com but refuses links where they don't belong", () => {
    expect(ok(singleLine({ label: "Field", max: 50 }), "B.Com, Node.js")).toBe(true);
    expect(ok(singleLine({ label: "Field", max: 50 }), "see www.spam.example")).toBe(false);
  });

  it("limits links in messages", () => {
    const message = multiLine({ label: "Message", max: 500, maxLinks: 2 });
    expect(ok(message, "My profile: https://a.example and https://b.example")).toBe(true);
    expect(ok(message, "https://a.example https://b.example https://c.example")).toBe(false);
  });

  it("counts length after cleaning", () => {
    expect(ok(singleLine({ label: "Field", max: 5 }), "  abc  ​​​ ")).toBe(true);
  });
});

describe("email", () => {
  it("lowercases and trims", () => {
    expect(emailAddress().parse("  Priya@Example.COM ")).toBe("priya@example.com");
  });

  it("refuses malformed addresses", () => {
    for (const v of ["priya", "priya@", "@example.com", "priya@example", "pri ya@example.com"]) expect(ok(emailAddress(), v), v).toBe(false);
  });
});

describe("WhatsApp numbers", () => {
  it("normalises the ways Indian numbers are typed to E.164", () => {
    for (const v of ["98765 43210", "098765 43210", "+91 98765 43210", "+91-98765-43210", "0091 98765 43210", "919876543210", "(+91) 98765-43210"]) expect(toE164(v), v).toBe("+919876543210");
  });

  it("accepts other countries with their + code", () => {
    expect(toE164("+39 331 110 4575")).toBe("+393311104575");
    expect(toE164("+44 7700 900123")).toBe("+447700900123");
  });

  it("refuses anything that cannot be a WhatsApp number", () => {
    for (const v of ["--------", "12345", "55555 55555", "+91 12345 67890", "+91 98765 4321", "331 110 4575", "+0 1234 5678", "+1234567890123456", "98765abc10", ""]) expect(toE164(v), v).toBeNull();
  });
});

describe("dates", () => {
  const now = () => Date.parse("2026-11-11T12:00:00Z");
  const paid = dateWithin({ past: 365, future: 0, message: "x", now });

  it("accepts dates inside the window", () => {
    expect(ok(paid, "2026-11-11")).toBe(true);
    expect(ok(paid, "2026-01-02")).toBe(true);
  });

  it("refuses typos and impossible dates", () => {
    for (const v of ["2026-11-12", "0202-11-11", "2206-11-11", "2026-02-30", "11/11/2026", ""]) expect(ok(paid, v), v).toBe(false);
  });
});

describe("intake", () => {
  const year = new Date().getFullYear();

  it("accepts undecided and seasons in the next few years", () => {
    for (const v of ["undecided", `autumn-${year + 1}`, `spring-${year + 2}`]) expect(ok(intakeValue, v), v).toBe(true);
  });

  it("refuses free text, past years and far-future years", () => {
    for (const v of ["next year", `autumn-${year - 1}`, `spring-${year + 9}`, "winter-2027", ""]) expect(ok(intakeValue, v), v).toBe(false);
  });
});

describe("enquiry, end to end", () => {
  const valid = {
    fullName: "Priya Sharma",
    email: "Priya@Example.com",
    whatsapp: "98765 43210",
    residence: "Maharashtra",
    destination: "italy",
    pathway: "study",
    level: "masters",
    intake: "undecided",
    fieldOfStudy: "Data Science",
    scholarshipInterest: "yes",
    highestQualification: "bachelors-4",
    academicBackground: "B.Tech Computer Science, 8.1 CGPA",
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

  it("stores clean, normalised values", () => {
    const parsed = enquirySchema.parse(valid);
    expect(parsed.email).toBe("priya@example.com");
    expect(parsed.whatsapp).toBe("+919876543210");
  });

  it("refuses values outside the lists, and fields it does not know", () => {
    expect(ok(enquirySchema, { ...valid, residence: "Atlantis" })).toBe(false);
    expect(ok(enquirySchema, { ...valid, budgetRange: "a lot" })).toBe(false);
    expect(ok(enquirySchema, { ...valid, contactConsent: false })).toBe(false);
    expect(ok(enquirySchema, { ...valid, attribution: { utmSource: "x", isAdmin: true } })).toBe(false);
  });
});
