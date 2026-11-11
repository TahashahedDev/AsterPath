import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseCalBooking, verifyCalSignature } from "@/server/integrations/cal";

const MAX_BODY_BYTES = 64 * 1024;

/**
 * Cal.com booking webhook. Records each consultation call (with its Google Meet
 * link) and attaches it to the lead: by the enquiry reference our prefilled link
 * sends, or else by email. A new booking moves a new or contacted lead to
 * "consultation booked". The signature is checked before anything is read, and
 * the service-role client is used only for these narrow writes.
 */
export async function POST(request: NextRequest) {
  const { CAL_WEBHOOK_SECRET } = getServerEnv();
  const admin = createSupabaseAdminClient();
  if (!CAL_WEBHOOK_SECRET || !admin) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return NextResponse.json({ error: "too-large" }, { status: 413 });
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return NextResponse.json({ error: "too-large" }, { status: 413 });
  if (!verifyCalSignature(body, request.headers.get("x-cal-signature-256"), CAL_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "bad-signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }
  const booking = parseCalBooking(json);
  // Pings and events we don't track are acknowledged so Cal.com doesn't retry them.
  if (!booking) return NextResponse.json({ ok: true, ignored: true });

  // Find the lead: the reference is exact; email is the fallback (most recent enquiry).
  let leadId: string | null = null;
  let leadStatus: string | null = null;
  if (booking.reference) {
    const { data } = await admin.from("leads").select("id, status").eq("reference", booking.reference).maybeSingle();
    if (data) [leadId, leadStatus] = [data.id, data.status];
  }
  if (!leadId) {
    const { data } = await admin.from("leads").select("id, status").eq("email", booking.email).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) [leadId, leadStatus] = [data.id, data.status];
  }

  if (booking.event === "rescheduled" && booking.previousUid) {
    await admin.from("bookings").update({ status: "rescheduled" }).eq("cal_uid", booking.previousUid);
  }
  const { error } = await admin.from("bookings").upsert(
    {
      cal_uid: booking.uid,
      status: booking.event === "cancelled" ? "cancelled" : "booked",
      starts_at: booking.startsAt,
      ends_at: booking.endsAt,
      attendee_name: booking.name,
      attendee_email: booking.email,
      attendee_phone: booking.phone,
      meeting_url: booking.meetingUrl,
      reference: booking.reference,
      lead_id: leadId,
    },
    { onConflict: "cal_uid" },
  );
  if (error) {
    console.error("[cal] booking not saved", error.code);
    return NextResponse.json({ error: "not-saved" }, { status: 500 });
  }

  if (leadId && booking.event !== "cancelled" && (leadStatus === "new" || leadStatus === "contacted")) {
    await admin.from("leads").update({ status: "consultation_booked" }).eq("id", leadId);
  }
  return NextResponse.json({ ok: true });
}
