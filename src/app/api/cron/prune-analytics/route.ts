import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isCronRequest } from "@/server/cron";

/**
 * Daily Vercel cron (see vercel.json): deletes website analytics older than 13
 * months, as the privacy notice promises. Vercel sends CRON_SECRET as a bearer
 * token; any other caller is refused.
 */
export async function GET(request: NextRequest) {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ skipped: "Supabase not configured" });
  const { data, error } = await admin.rpc("prune_site_events");
  if (error) {
    console.error("[cron] prune failed", error.code);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ deleted: data });
}
