import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

/**
 * Service-role client: bypasses Row Level Security, so it is used only for
 * narrow server-side writes: saving an enquiry, and sending a team invitation
 * after the inviter's own permission has been checked. Never import it into a client
 * component, and never pass user input through it unvalidated.
 */
export function createSupabaseAdminClient() {
  const config = supabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !serviceKey) return null;
  return createClient<Database>(config.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
