import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MarketingSummary } from "@/lib/supabase/types";

/**
 * Website analytics aggregates for the last N days, computed in the database
 * (RLS: 'reports.read'). Null without Supabase; undefined if the viewer's role
 * may not see reports.
 */
export async function getMarketingSummary(days = 30): Promise<MarketingSummary | null | undefined> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: allowed } = await supabase.rpc("has_permission", { requested: "reports.read" });
  if (!allowed) return undefined;
  const { data, error } = await supabase.rpc("marketing_summary", { p_days: days });
  if (error || !data) return undefined;
  return data;
}
