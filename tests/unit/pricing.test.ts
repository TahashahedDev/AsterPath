import { describe, expect, it } from "vitest";
import { instalmentPlan, serviceFees } from "@/content/pricing";
import { buildQuote, splitInstalments, type QuoteInput } from "@/features/pricing/quote";
import { checkSchedule } from "@/features/payments/milestones";

const base: QuoteInput = { level: "masters", applications: 5, needsEnglishTest: true, needsTranslations: false, recognition: "cimea", dsu: true, referral: false, earlyStart: false, extraDiscountPercent: 0 };

describe("pricing", () => {
  it("instalment shares add up to 100%", () => {
    expect(instalmentPlan.reduce((sum, p) => sum + p.share, 0)).toBe(100);
  });

  it("builds a typical master's quote from service fee plus allowance with buffer", () => {
    const q = buildQuote(base);
    expect(q.serviceFee).toBe(serviceFees.masters.amount);
    expect(q.passThrough.find((l) => l.id === "applications")?.amount).toBe(5 * 4_500);
    expect(q.allowance).toBe(q.passThroughTotal + q.buffer);
    expect(q.total % 500).toBe(0);
    expect(q.total).toBe(Math.round((q.serviceFee + q.allowance) / 500) * 500);
  });

  it("instalments always add up exactly to the quoted total", () => {
    for (const total of [100_000, 187_500, 213_000, 99_500]) {
      const rows = splitInstalments(total);
      expect(checkSchedule(rows.map((r) => ({ label: r.stage, amount: r.amount })), total)).toEqual({ ok: true });
    }
  });

  it("discounts reduce only the service fee and are capped", () => {
    const plain = buildQuote(base);
    const discounted = buildQuote({ ...base, referral: true, earlyStart: true, extraDiscountPercent: 50 });
    expect(discounted.allowance).toBe(plain.allowance);
    // Extra discount is capped at 10%: 5% early + ₹5,000 referral + 10% extra.
    expect(discounted.discountTotal).toBe(Math.round(base.level === "masters" ? 75_000 * 0.05 : 0) + 5_000 + 7_500);
  });

  it("always includes the costs the public plan promises to credit back", () => {
    const ids = buildQuote({ ...base, needsEnglishTest: false, dsu: false, recognition: "free-dov" }).passThrough.map((l) => l.id);
    expect(ids).toEqual(expect.arrayContaining(["enrolmentCredit", "visaCredit", "permitCredit"]));
  });

  it("drops optional costs the student doesn't need", () => {
    const q = buildQuote({ ...base, needsEnglishTest: false, dsu: false, recognition: "free-dov" });
    const ids = q.passThrough.map((l) => l.id);
    expect(ids).not.toContain("englishTest");
    expect(ids).not.toContain("isee");
    expect(ids).not.toContain("recognition");
  });
});
