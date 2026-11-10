import "server-only";
import { PRIVACY_NOTICE_VERSION, type Enquiry } from "@/features/leads/schema";
import { generateLeadReference } from "@/features/leads/reference";
import { getLeadStore, type LeadRecord } from "@/server/repositories/lead-store";
import { notifyTeamOfNewLead } from "@/server/integrations/notifications";

const MIN_FILL_MS = 3_000; // Humans take longer than this to complete four steps.
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const FOLLOW_UP_AFTER_MS = 24 * 60 * 60 * 1000;

export type CreateLeadResult =
  | { ok: true; reference: string }
  | { ok: false; reason: "spam" | "not-connected" };

export function looksAutomated(enquiry: Pick<Enquiry, "website" | "startedAt">, now: number): boolean {
  if (enquiry.website) return true;
  const elapsed = now - enquiry.startedAt;
  return elapsed < MIN_FILL_MS || elapsed > MAX_FORM_AGE_MS;
}

export async function createLead(enquiry: Enquiry, now: Date = new Date()): Promise<CreateLeadResult> {
  if (looksAutomated(enquiry, now.getTime())) return { ok: false, reason: "spam" };

  const store = getLeadStore();
  if (!store) return { ok: false, reason: "not-connected" };

  const createdAt = now.toISOString();
  const lead: LeadRecord = {
    id: crypto.randomUUID(),
    reference: generateLeadReference(now),
    status: "new",
    createdAt,
    // Stands in for the follow-up task that the CRM creates from Phase 3.
    followUpDueAt: new Date(now.getTime() + FOLLOW_UP_AFTER_MS).toISOString(),
    contact: {
      fullName: enquiry.fullName,
      email: enquiry.email,
      whatsapp: enquiry.whatsapp,
      residence: enquiry.residence,
    },
    goals: {
      destination: enquiry.destination,
      pathway: enquiry.pathway,
      level: enquiry.level,
      intake: enquiry.intake,
      fieldOfStudy: enquiry.fieldOfStudy,
      scholarshipInterest: enquiry.scholarshipInterest,
    },
    background: {
      highestQualification: enquiry.highestQualification,
      academicBackground: enquiry.academicBackground,
      englishTest: enquiry.englishTest,
      passportStatus: enquiry.passportStatus,
      budgetRange: enquiry.budgetRange,
    },
    preferences: { consultationMethod: enquiry.consultationMethod, message: enquiry.message },
    consent: {
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      contactConsent: enquiry.contactConsent,
      ageOrGuardianConfirmed: enquiry.ageConfirmed,
      updatesConsent: enquiry.updatesConsent,
      recordedAt: createdAt,
    },
    attribution: enquiry.attribution ?? null,
  };

  await store.create(lead);
  await notifyTeamOfNewLead({ reference: lead.reference, level: lead.goals.level });
  return { ok: true, reference: lead.reference };
}
