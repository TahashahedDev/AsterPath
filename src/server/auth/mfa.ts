import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where the signed-in person stands with two-factor authentication:
 * "verified"  — this session used a second factor (aal2): staff data is readable.
 * "challenge" — they have an authenticator set up but haven't entered a code yet.
 * "enroll"    — no authenticator yet; staff must add one before using the workspace.
 */
export type MfaStatus = "verified" | "challenge" | "enroll" | "unavailable";

export async function getMfaStatus(): Promise<MfaStatus> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return "unavailable";
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return "unavailable";
  if (data.currentLevel === "aal2") return "verified";
  return data.nextLevel === "aal2" ? "challenge" : "enroll";
}
