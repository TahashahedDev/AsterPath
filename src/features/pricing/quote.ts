import { allowanceBuffer, discountRules, instalmentPlan, passThroughCosts, quoteRounding, serviceFees, type PassThroughId } from "@/content/pricing";
import type { DegreeLevel } from "@/features/operations/types";

/**
 * Pure quote arithmetic in whole rupees. Same inputs, same figure — so a quote
 * can be recalculated and explained line by line. No I/O.
 */
export type QuoteInput = {
  level: DegreeLevel;
  applications: number;
  needsEnglishTest: boolean;
  needsTranslations: boolean;
  recognition: "cimea" | "free-dov";
  dsu: boolean;
  referral: boolean;
  earlyStart: boolean;
  /** Owner-approved extra discount on the service fee, 0–maxExtraPercent. */
  extraDiscountPercent: number;
};

export type QuoteLine = { id: string; label: string; amount: number };
export type Quote = {
  serviceFee: number;
  passThrough: QuoteLine[];
  passThroughTotal: number;
  buffer: number;
  allowance: number;
  discounts: QuoteLine[];
  discountTotal: number;
  total: number;
  instalments: { stage: string; when: string; amount: number }[];
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function buildQuote(input: QuoteInput): Quote {
  const applications = Math.min(Math.max(Math.round(input.applications), 1), 10);
  const extra = Math.min(Math.max(input.extraDiscountPercent, 0), discountRules.maxExtraPercent);
  const serviceFee = serviceFees[input.level].amount;

  const included: [PassThroughId, number][] = [
    ["englishTest", input.needsEnglishTest ? 1 : 0],
    ["applications", applications],
    ["attestation", 1],
    ["translations", input.needsTranslations ? 1 : 0],
    ["recognition", input.recognition === "cimea" ? 1 : 0],
    ["isee", input.dsu ? 1 : 0],
    ["insurance", 1],
    ["courier", 1],
    ["enrolmentCredit", 1],
    ["visaCredit", 1],
    ["permitCredit", 1],
  ];
  const passThrough = included
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, label: qty > 1 ? `${passThroughCosts[id].label} × ${qty}` : passThroughCosts[id].label, amount: passThroughCosts[id].amount * qty }));
  const passThroughTotal = passThrough.reduce((sum, line) => sum + line.amount, 0);
  const buffer = roundTo(passThroughTotal * allowanceBuffer, 100);
  const allowance = passThroughTotal + buffer;

  // Discounts apply to AsterPath's own fee only; pass-through money is never discounted.
  const discounts: QuoteLine[] = [];
  if (input.earlyStart) discounts.push({ id: "earlyStart", label: `Early start (${discountRules.earlyStart.percent}% of service fee)`, amount: Math.round((serviceFee * discountRules.earlyStart.percent) / 100) });
  if (input.referral) discounts.push({ id: "referral", label: "Referral credit", amount: discountRules.referralCredit.amount });
  if (extra > 0) discounts.push({ id: "extra", label: `Approved discount (${extra}% of service fee)`, amount: Math.round((serviceFee * extra) / 100) });
  const discountTotal = Math.min(discounts.reduce((sum, d) => sum + d.amount, 0), serviceFee);

  const total = roundTo(serviceFee + allowance - discountTotal, quoteRounding);
  return { serviceFee, passThrough, passThroughTotal, buffer, allowance, discounts, discountTotal, total, instalments: splitInstalments(total) };
}

/** Splits a total by the stage shares into amounts rounded to ₹100; the first instalment absorbs the rounding so the sum is exact. */
export function splitInstalments(total: number): Quote["instalments"] {
  const rows = instalmentPlan.map((p) => ({ stage: p.stage, when: p.when, amount: Math.floor((total * p.share) / 100 / 100) * 100 }));
  const difference = total - rows.reduce((sum, r) => sum + r.amount, 0);
  rows[0]!.amount += difference;
  return rows;
}
