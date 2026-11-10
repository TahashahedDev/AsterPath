import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import type { Attribution, Enquiry } from "@/features/leads/schema";

export type LeadRecord = {
  id: string;
  reference: string;
  status: "new";
  createdAt: string;
  followUpDueAt: string;
  contact: Pick<Enquiry, "fullName" | "email" | "whatsapp" | "residence">;
  goals: Pick<Enquiry, "destination" | "pathway" | "level" | "intake" | "fieldOfStudy" | "scholarshipInterest">;
  background: Pick<Enquiry, "highestQualification" | "academicBackground" | "englishTest" | "passportStatus" | "budgetRange">;
  preferences: Pick<Enquiry, "consultationMethod" | "message">;
  consent: {
    privacyNoticeVersion: string;
    contactConsent: true;
    ageOrGuardianConfirmed: true;
    updatesConsent: boolean;
    recordedAt: string;
  };
  attribution: Attribution | null;
};

export interface LeadStore {
  readonly kind: string;
  create(lead: LeadRecord): Promise<void>;
}

/**
 * Development-only store: appends synthetic enquiries to .data/leads.ndjson
 * (git-ignored). Kept deliberately separate from any future production data.
 * Production uses the Supabase store below.
 */
class LocalFileLeadStore implements LeadStore {
  readonly kind = "local";
  private readonly file = path.join(process.cwd(), ".data", "leads.ndjson");

  async create(lead: LeadRecord): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    await appendFile(this.file, `${JSON.stringify(lead)}\n`, { encoding: "utf8", mode: 0o600 });
  }
}

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

/** Flattens a lead into the columns of public.leads. */
export function toLeadRow(lead: LeadRecord): LeadInsert {
  return {
    id: lead.id,
    reference: lead.reference,
    status: lead.status,
    follow_up_due_at: lead.followUpDueAt,
    created_at: lead.createdAt,
    full_name: lead.contact.fullName,
    email: lead.contact.email,
    whatsapp: lead.contact.whatsapp,
    residence: lead.contact.residence,
    destination: lead.goals.destination,
    pathway: lead.goals.pathway,
    level: lead.goals.level,
    intake: lead.goals.intake,
    field_of_study: lead.goals.fieldOfStudy,
    scholarship_interest: lead.goals.scholarshipInterest,
    highest_qualification: lead.background.highestQualification,
    academic_background: lead.background.academicBackground,
    english_test: lead.background.englishTest,
    passport_status: lead.background.passportStatus,
    budget_range: lead.background.budgetRange,
    consultation_method: lead.preferences.consultationMethod,
    message: lead.preferences.message,
    privacy_notice_version: lead.consent.privacyNoticeVersion,
    contact_consent: lead.consent.contactConsent,
    age_or_guardian_confirmed: lead.consent.ageOrGuardianConfirmed,
    updates_consent: lead.consent.updatesConsent,
    consent_recorded_at: lead.consent.recordedAt,
    attribution: lead.attribution,
  };
}

/**
 * Production store: one row in public.leads per enquiry. Written with the
 * service role because visitors have no database access of their own; the
 * route has already validated the input.
 */
class SupabaseLeadStore implements LeadStore {
  readonly kind = "supabase";

  async create(lead: LeadRecord): Promise<void> {
    const client = createSupabaseAdminClient();
    if (!client) throw new Error("Supabase is not configured");
    const { error } = await client.from("leads").insert(toLeadRow(lead));
    // Report the database's error code only; the message can echo submitted values.
    if (error) throw new Error(`Lead insert failed (${error.code ?? "unknown"})`);
  }
}

/** Returns the configured store, or null when enquiry storage is not connected. */
export function getLeadStore(): LeadStore | null {
  const { LEAD_STORE } = getServerEnv();
  switch (LEAD_STORE) {
    case "local":
      return new LocalFileLeadStore();
    case "supabase":
      return new SupabaseLeadStore();
    case "none":
      return null;
  }
}
