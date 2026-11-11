import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Daily Vercel cron (see vercel.json): deletes website analytics older than 13
 * months, as the privacy notice promises. Vercel sends CRON_SECRET as a bearer
 * token; any other caller is refused.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (!secret || given.length !== expected.length || !timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ skipped: "Supabase not configured" });
  const { data, error } = await admin.rpc("prune_site_events");
  if (error) {
    console.error("[cron] prune failed", error.code);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  return NextResponse.json({ deleted: data });
}
