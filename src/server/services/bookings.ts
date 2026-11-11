import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRow } from "@/lib/supabase/types";

/** Consultation calls from Cal.com, read as the signed-in staff member (RLS: 'leads.read'). Null without Supabase. */
export async function listUpcomingBookings(days = 14): Promise<BookingRow[] | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const now = new Date();
  const until = new Date(now.getTime() + days * 86_400_000);
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .neq("status", "cancelled")
    .gte("ends_at", new Date(now.getTime() - 3_600_000).toISOString())
    .lte("starts_at", until.toISOString())
    .order("starts_at");
  return data ?? [];
}

export async function bookingsForLead(leadId: string): Promise<BookingRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("bookings").select("*").eq("lead_id", leadId).order("starts_at", { ascending: false });
  return data ?? [];
}
