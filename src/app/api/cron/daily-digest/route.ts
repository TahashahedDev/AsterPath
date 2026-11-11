import { NextResponse, type NextRequest } from "next/server";
import { isCronRequest } from "@/server/cron";
import { sendDailyDigest } from "@/server/integrations/digest";

/**
 * Daily Vercel cron at 08:00 IST (see vercel.json): emails the founder one
 * morning briefing, covering who is waiting, today's calls, and deadlines,
 * tasks and payments falling due. Nothing is sent on a day with nothing to do.
 */
export async function GET(request: NextRequest) {
  if (!isCronRequest(request)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const result = await sendDailyDigest(new Date());
  return NextResponse.json({ result }, { status: result === "failed" ? 500 : 200 });
}
