import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getServerEnv } from "@/lib/env";
import type { Attribution, Enquiry } from "@/features/leads/schema";

export type LeadRecord = {
  id: string;
  reference: string;
  status: "new";
  createdAt: string;
  followUpDueAt: string;
  contact: Pick<Enquiry, "fullName" | "email" | "whatsapp" | "countryOfResidence">;
  goals: Pick<Enquiry, "destination" | "pathway" | "level" | "intake">;
  background: Pick<Enquiry, "academicBackground" | "budgetRange" | "applicationStatus">;
  preferences: Pick<Enquiry, "consultationMethod" | "message">;
  consent: {
    privacyNoticeVersion: string;
    contactConsent: true;
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
 * Replaced by a Supabase-backed store in Phase 2.
 */
class LocalFileLeadStore implements LeadStore {
  readonly kind = "local";
  private readonly file = path.join(process.cwd(), ".data", "leads.ndjson");

  async create(lead: LeadRecord): Promise<void> {
    await mkdir(path.dirname(this.file), { recursive: true });
    await appendFile(this.file, `${JSON.stringify(lead)}\n`, { encoding: "utf8", mode: 0o600 });
  }
}

/** Returns the configured store, or null when enquiry storage is not connected. */
export function getLeadStore(): LeadStore | null {
  const { LEAD_STORE } = getServerEnv();
  switch (LEAD_STORE) {
    case "local":
      return new LocalFileLeadStore();
    case "none":
      return null;
  }
}
