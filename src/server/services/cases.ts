import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CaseApplicationRow, CaseTaskRow, InstalmentRow, LeadNoteRow, QuoteRow, ReferralRow, StudentCaseRow } from "@/lib/supabase/types";

/**
 * Live casework: lead notes, saved quotes, student cases, instalments and tasks.
 * Every read runs as the signed-in user, so Row Level Security decides what comes
 * back. Each function returns null when Supabase isn't configured, so pages can
 * fall back to demo data (development) or an honest empty state.
 */

export type CaseWithMoney = StudentCaseRow & { instalments: InstalmentRow[]; tasks: CaseTaskRow[]; applications: CaseApplicationRow[]; referrals: ReferralRow[] };

const byPosition = (a: InstalmentRow, b: InstalmentRow) => a.position - b.position;

type Client = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

/** Everything hanging off one case; RLS trims what the viewer may not see (e.g. instalments for advisors). */
async function withDetails(supabase: Client, c: StudentCaseRow): Promise<CaseWithMoney> {
  const [instalments, tasks, applications, referrals] = await Promise.all([
    supabase.from("instalments").select("*").eq("case_id", c.id),
    supabase.from("case_tasks").select("*").eq("case_id", c.id).order("done").order("due_on", { nullsFirst: false }),
    supabase.from("case_applications").select("*").eq("case_id", c.id).order("deadline", { nullsFirst: false }),
    supabase.from("referrals").select("*").eq("referrer_case_id", c.id).order("created_at", { ascending: false }),
  ]);
  return { ...c, instalments: (instalments.data ?? []).sort(byPosition), tasks: tasks.data ?? [], applications: applications.data ?? [], referrals: referrals.data ?? [] };
}

export async function getLeadWorkspace(leadId: string): Promise<{ notes: LeadNoteRow[]; quotes: QuoteRow[]; caseId: string | null } | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [notes, quotes, existing] = await Promise.all([
    supabase.from("lead_notes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase.from("quotes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase.from("student_cases").select("id").eq("lead_id", leadId).maybeSingle(),
  ]);
  return { notes: notes.data ?? [], quotes: quotes.data ?? [], caseId: existing.data?.id ?? null };
}

export async function listCases(): Promise<StudentCaseRow[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.from("student_cases").select("*").order("opened_at", { ascending: false }).limit(500);
  return data ?? [];
}

/** One case for staff. Instalments come back empty for roles without 'payments.read'. */
export async function getCase(id: string): Promise<CaseWithMoney | null | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: c } = await supabase.from("student_cases").select("*").eq("id", id).maybeSingle();
  if (!c) return undefined;
  return withDetails(supabase, c);
}

export type LedgerRow = InstalmentRow & { studentName: string };

/** Every instalment the viewer may see (finance, owners and admins), newest cases first. */
export async function listInstalments(): Promise<LedgerRow[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [{ data: rows }, { data: cases }] = await Promise.all([
    supabase.from("instalments").select("*").order("case_id").order("position").limit(2000),
    supabase.from("student_cases").select("id, full_name"),
  ]);
  const names = new Map((cases ?? []).map((c) => [c.id, c.full_name]));
  return (rows ?? []).map((r) => ({ ...r, studentName: names.get(r.case_id) ?? "Student" }));
}

/**
 * The signed-in student's own case. Links it first when their verified email
 * matches a case opened for them. Returns null when Supabase isn't configured and
 * undefined when there is no case yet.
 */
export async function getMyCase(): Promise<CaseWithMoney | null | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return undefined;
  await supabase.rpc("claim_my_case");
  const { data: c } = await supabase.from("student_cases").select("*").eq("student_user_id", user.id).order("opened_at", { ascending: false }).limit(1).maybeSingle();
  if (!c) return undefined;
  return withDetails(supabase, c);
}

export type TaskWithCase = CaseTaskRow & { studentName: string };
export type ApplicationWithCase = CaseApplicationRow & { studentName: string };
export type ReferralWithNames = ReferralRow & { referrerName: string };

async function caseNames(supabase: Client) {
  const { data } = await supabase.from("student_cases").select("id, full_name");
  return new Map((data ?? []).map((c) => [c.id, c.full_name]));
}

/** Every student task across cases, open ones first by due date. */
export async function listAllTasks(): Promise<TaskWithCase[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [{ data }, names] = await Promise.all([supabase.from("case_tasks").select("*").order("done").order("due_on", { nullsFirst: false }).limit(1000), caseNames(supabase)]);
  return (data ?? []).map((t) => ({ ...t, studentName: names.get(t.case_id) ?? "Student" }));
}

/** Every university application across cases, nearest deadline first. */
export async function listAllApplications(): Promise<ApplicationWithCase[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [{ data }, names] = await Promise.all([supabase.from("case_applications").select("*").order("deadline", { nullsFirst: false }).limit(1000), caseNames(supabase)]);
  return (data ?? []).map((a) => ({ ...a, studentName: names.get(a.case_id) ?? "Student" }));
}

export async function listReferrals(): Promise<ReferralWithNames[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const [{ data }, names] = await Promise.all([supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(500), caseNames(supabase)]);
  return (data ?? []).map((r) => ({ ...r, referrerName: names.get(r.referrer_case_id) ?? "Student" }));
}

/** Instalments with a due date, for the calendar (finance, admins and owners only, by RLS). */
export async function listDatedInstalments(): Promise<LedgerRow[] | null> {
  const rows = await listInstalments();
  return rows ? rows.filter((r) => r.due_on && (r.status === "due" || r.status === "upcoming")) : null;
}
