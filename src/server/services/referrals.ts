import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Records that a saved enquiry arrived through a student's referral link. Runs
 * after the enquiry response with the service role (the visitor has no account);
 * unknown codes and self-referrals are ignored.
 */
export async function recordReferral(lead: { id: string; email: string }, code: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) return;
  const { data: referrer } = await admin.from("student_cases").select("id, student_email").eq("referral_code", code).maybeSingle();
  if (!referrer || referrer.student_email.toLowerCase() === lead.email.toLowerCase()) return;
  const { error } = await admin.from("referrals").insert({ referral_code: code, referrer_case_id: referrer.id, lead_id: lead.id });
  if (error && error.code !== "23505") console.error("[referrals] not recorded", error.code);
}
