/**
 * INTERNAL rate card — never rendered on the public site.
 *
 * Status: PROPOSED (2026-11-10). Every figure below is a starting proposal for
 * the founder to confirm or change before the first written quote. Pass-through
 * amounts are planning estimates in rupees: re-check each against the current
 * official fee before relying on it, and record the date you checked.
 *
 * How a quote is built (see features/pricing/quote.ts):
 *   service fee for the level
 * + pass-through allowance (costs AsterPath pays on the student's behalf) + 10% buffer
 * − approved discounts (service fee only; pass-through money is never discounted)
 * = one written figure, split into stage instalments.
 * Unspent allowance is refunded at the end, so the buffer never becomes profit.
 */
import type { DegreeLevel } from "@/features/operations/types";

export const pricingStatus = {
  status: "proposed" as "proposed" | "confirmed",
  proposedOn: "2026-11-10",
  confirmedBy: null as string | null,
};

/** AsterPath's own fee for the work, by level. */
export const serviceFees: Record<DegreeLevel, { amount: number; why: string }> = {
  bachelors: { amount: 85_000, why: "Entrance tests (CEnT-S, SAT or university tests), more applications and closer work with parents." },
  masters: { amount: 75_000, why: "The core case: shortlist, applications, SOP and CV, Universitaly, DOV or CIMEA, DSU and visa." },
  phd: { amount: 70_000, why: "Fewer applications, but research proposals and supervisor outreach take more advisor time per application." },
};

export type PassThroughId = "englishTest" | "applications" | "attestation" | "translations" | "recognition" | "isee" | "insurance" | "courier" | "enrolmentCredit" | "visaCredit" | "permitCredit";

/** Costs AsterPath pays or credits back for the student (the public plan lists both). Estimates — verify before quoting. */
export const passThroughCosts: Record<PassThroughId, { label: string; amount: number; unit?: "per application"; basis: string }> = {
  englishTest: { label: "English test fee (IELTS or equivalent)", amount: 18_000, basis: "IELTS Academic fee in India; skip if the student already has a valid score." },
  applications: { label: "University application fees", amount: 4_500, unit: "per application", basis: "Italian public universities charge roughly €0–€100 per application; ₹4,500 is a planning average." },
  attestation: { label: "Notary, state HRD attestation and MEA apostille", amount: 12_000, basis: "Degree certificate and transcripts, including agent and travel costs." },
  translations: { label: "Certified translations", amount: 6_000, basis: "Only documents not issued in English; DOV does not need translation of English documents." },
  recognition: { label: "CIMEA statement (or paid DOV)", amount: 20_000, basis: "CIMEA statement of comparability fee; ₹0 when a free study DOV applies." },
  isee: { label: "ISEE parificato: translations and legalisation", amount: 12_000, basis: "Only for students applying for regional DSU scholarships." },
  insurance: { label: "Medical insurance for the visa", amount: 15_000, basis: "Policy covering the full visa period, as consulates require." },
  courier: { label: "Courier charges", amount: 4_000, basis: "Documents between the student, attestation offices and us." },
  // Credited back: consulate rules make the student pay these from their own account, so we reimburse against the receipt.
  enrolmentCredit: { label: "University enrolment fee (credited back)", amount: 18_000, basis: "First-year regional tax and stamp duty, roughly €160–€200; often waived for DSU winners, in which case it's refunded." },
  visaCredit: { label: "Visa fee and visa centre charge (credited back)", amount: 8_000, basis: "Italian national visa fee (€50) plus the visa centre service charge, paid by the student at the appointment." },
  permitCredit: { label: "Residence permit fee in Italy (credited back)", amount: 15_000, basis: "Permit fee, postal kit and stamp duty, roughly €160, paid at the post office after arrival." },
};

/** Added to the pass-through total so the plan never runs short; unspent money is refunded. */
export const allowanceBuffer = 0.1;

/**
 * Instalments as each stage starts. Front-loaded so early instalments cover the
 * money laid out early (test, application and attestation fees).
 * The arrival instalment is never charged if the visa is refused.
 */
export const instalmentPlan = [
  { stage: "Onboarding", share: 30, when: "On signing the agreement" },
  { stage: "Applications", share: 25, when: "When the first application is submitted" },
  { stage: "Admission", share: 15, when: "On the first admission letter" },
  { stage: "Visa", share: 20, when: "When the visa file starts" },
  { stage: "Arrival", share: 10, when: "After the visa is granted (waived if refused)" },
] as const;

export const discountRules = {
  /** Credit for a student who joins through a referral (and the same credit for the referrer once that student enrols). */
  referralCredit: { amount: 5_000, why: "Rewards word of mouth, the cheapest growth channel; paid only after enrolment." },
  /** For students who sign 9 months or more before their intake: early files are cheaper to run. */
  earlyStart: { percent: 5, monthsBefore: 9, why: "Early files avoid rush work and visa-season pressure." },
  /** Any other discount needs owner approval and is capped. */
  maxExtraPercent: 10,
};

/** Rounded so a written figure reads cleanly. */
export const quoteRounding = 500;

export const refundPolicy = [
  "A stage instalment becomes non-refundable once work on that stage has started.",
  "Unspent pass-through allowance is always refunded, with receipts for what was spent.",
  "If the visa is refused, the Arrival instalment is never charged, and we prepare one re-application (same or next intake) at no extra service fee; new third-party fees are at cost.",
  "If the student withdraws before any work starts, everything paid is refunded minus payment-processing costs.",
  "Approved refunds are paid to the original payment method within 14 working days.",
  "Government, university and embassy fees already paid to third parties can't be recovered by us.",
];
