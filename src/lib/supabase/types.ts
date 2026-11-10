/**
 * Database types for supabase-js, matching supabase/migrations. Written by hand
 * until the Supabase CLI is available; regenerate with
 * `supabase gen types typescript --local > src/lib/supabase/types.ts`.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TeamRole = "owner" | "admin" | "advisor" | "document_reviewer" | "finance" | "marketing" | "analyst";
export type LeadStatus = "new" | "contacted" | "consultation_booked" | "qualified" | "proposal" | "agreement" | "payment" | "converted" | "closed";

type Table<Row, Insert, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: [] };

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  terms_version: string | null;
  privacy_version: string | null;
  agreements_accepted_at: string | null;
  created_at: string;
  updated_at: string;
};

type TeamMemberRow = { user_id: string; role: TeamRole; active: boolean; created_at: string; updated_at: string };

export type LeadRow = {
  id: string;
  reference: string;
  status: LeadStatus;
  assigned_to: string | null;
  follow_up_due_at: string;
  full_name: string;
  email: string;
  whatsapp: string;
  residence: string;
  destination: string;
  pathway: string;
  level: string;
  intake: string;
  field_of_study: string;
  scholarship_interest: string;
  highest_qualification: string;
  academic_background: string;
  english_test: string;
  passport_status: string;
  budget_range: string;
  consultation_method: string;
  message: string;
  privacy_notice_version: string;
  contact_consent: boolean;
  age_or_guardian_confirmed: boolean;
  updates_consent: boolean;
  consent_recorded_at: string;
  attribution: Json | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadNoteRow = { id: string; lead_id: string; author_id: string | null; body: string; created_at: string };
export type QuoteRow = { id: string; lead_id: string; level: "bachelors" | "masters" | "phd"; inputs: Json; breakdown: Json; total: number; created_by: string | null; created_at: string };
export type CaseStage = "profile" | "shortlist" | "applications" | "admission" | "pre_enrolment" | "enrolment" | "visa" | "departure" | "arrival";
export type CaseStatus = "awaiting_payment" | "active" | "closed";
export type StudentCaseRow = {
  id: string;
  lead_id: string | null;
  quote_id: string | null;
  student_user_id: string | null;
  student_email: string;
  full_name: string;
  advisor_id: string | null;
  destination: string;
  level: string;
  intake: string;
  stage: CaseStage;
  status: CaseStatus;
  opened_at: string;
  updated_at: string;
};
export type InstalmentRowStatus = "upcoming" | "due" | "paid" | "waived";
export type InstalmentRow = {
  id: string;
  case_id: string;
  position: number;
  stage: string;
  amount: number;
  status: InstalmentRowStatus;
  due_on: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  confirmed_by: string | null;
  updated_at: string;
};
export type CaseTaskRow = { id: string; case_id: string; title: string; due_on: string | null; done: boolean; created_by: string | null; created_at: string };

type AuditEventRow = {
  id: number;
  occurred_at: string;
  actor_id: string | null;
  action: "insert" | "update" | "delete";
  entity: string;
  entity_id: string;
  changed_columns: string[];
  details: Json | null;
};

export type Database = {
  public: {
    Tables: {
      permissions: Table<{ key: string; description: string }, { key: string; description: string }>;
      role_permissions: Table<{ role: TeamRole; permission: string }, { role: TeamRole; permission: string }>;
      profiles: Table<ProfileRow, Pick<ProfileRow, "id"> & Partial<ProfileRow>>;
      team_members: Table<TeamMemberRow, Pick<TeamMemberRow, "user_id" | "role"> & Partial<TeamMemberRow>>;
      leads: Table<LeadRow, Omit<LeadRow, "status" | "assigned_to" | "message" | "updates_consent" | "attribution" | "lost_reason" | "created_at" | "updated_at"> & Partial<LeadRow>>;
      audit_events: Table<AuditEventRow, never, never>;
      lead_notes: Table<LeadNoteRow, Pick<LeadNoteRow, "lead_id" | "body">, never>;
      quotes: Table<QuoteRow, Pick<QuoteRow, "lead_id" | "level" | "inputs" | "breakdown" | "total">, never>;
      student_cases: Table<StudentCaseRow, never, Partial<Pick<StudentCaseRow, "stage" | "status" | "advisor_id">>>;
      instalments: Table<InstalmentRow, never, Partial<Pick<InstalmentRow, "status" | "due_on" | "paid_at" | "payment_reference" | "confirmed_by">>>;
      case_tasks: Table<CaseTaskRow, Pick<CaseTaskRow, "case_id" | "title"> & Partial<Pick<CaseTaskRow, "due_on">>, Partial<Pick<CaseTaskRow, "done" | "title" | "due_on">>>;
    };
    Views: Record<never, never>;
    Functions: {
      current_team_role: { Args: Record<never, never>; Returns: TeamRole | null };
      has_permission: { Args: { requested: string }; Returns: boolean };
      open_case: { Args: { p_lead: string; p_quote: string }; Returns: string };
      claim_my_case: { Args: Record<never, never>; Returns: undefined };
      team_directory: { Args: Record<never, never>; Returns: { user_id: string; full_name: string; role: TeamRole }[] };
    };
    Enums: { team_role: TeamRole; lead_status: LeadStatus };
    CompositeTypes: Record<never, never>;
  };
};
