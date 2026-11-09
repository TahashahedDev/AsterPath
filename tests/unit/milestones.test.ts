import { describe, expect, it } from "vitest";
import { checkSchedule, milestoneShares, milestoneTotal } from "@/features/payments/milestones";
import { servicePackages } from "@/content/packages";

describe("milestone arithmetic", () => {
  const schedule = [
    { label: "Onboarding", amount: 15_000 },
    { label: "Applications", amount: 30_000 },
    { label: "Enrolment", amount: 29_000 },
    { label: "Visa", amount: 25_000 },
  ];

  it("totals whole-rupee milestones", () => {
    expect(milestoneTotal(schedule)).toBe(99_000);
  });

  it("rejects non-integer or non-positive amounts", () => {
    expect(() => milestoneTotal([{ label: "Bad", amount: 10.5 }])).toThrow(RangeError);
    expect(() => milestoneTotal([{ label: "Zero", amount: 0 }])).toThrow(RangeError);
  });

  it("reports the difference when a schedule does not match the price", () => {
    expect(checkSchedule(schedule, 99_000)).toEqual({ ok: true });
    expect(checkSchedule(schedule, 100_000)).toEqual({ ok: false, difference: 1_000 });
  });

  it("produces display percentages that always sum to 100", () => {
    const shares = milestoneShares(schedule);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100);
    expect(milestoneShares([{ label: "a", amount: 1 }, { label: "b", amount: 1 }, { label: "c", amount: 1 }]).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe("seed packages", () => {
  it("every instalment schedule adds up to its package price", () => {
    for (const pkg of servicePackages) {
      expect(checkSchedule(pkg.milestones, pkg.startingPrice), pkg.name).toEqual({ ok: true });
    }
  });
});
