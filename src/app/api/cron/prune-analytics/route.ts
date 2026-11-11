import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isCronRequest } from "@/server/cron";

/**
 * Daily Vercel cron (see vercel.json): deletes website analytics older than 13
 * months, as the privacy notice promises, and rate-limit windows that ended a
 * day ago. Vercel sends CRON_SECRET as a bearer token; any other caller is refused.
 */
export async function GET(request: NextRequest) {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ skipped: "Supabase not configured" });
  const [events, limits] = await Promise.all([admin.rpc("prune_site_events"), admin.rpc("prune_rate_limits")]);
  const failed = events.error ?? limits.error;
  if (failed) {
    console.error("[cron] prune failed", failed.code);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ deleted: events.data, rateLimitWindows: limits.data });
}
