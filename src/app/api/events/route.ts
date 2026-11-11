import { NextResponse, after, type NextRequest } from "next/server";
import { siteEventSchema } from "@/features/analytics/events";
import { getServerEnv } from "@/lib/env";
import { clientIp, createRateLimiter } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 2 * 1024;
const limiter = createRateLimiter({ limit: 240, windowMs: 10 * 60 * 1000 });
const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|curl|wget|python|axios/i;
const noContent = () => new NextResponse(null, { status: 204 });

/**
 * Anonymous website events (see features/analytics/events.ts). Answers at once
 * and writes after the response. The IP address is used only for rate limiting
 * in memory and is never stored; neither is the user agent.
 */
export async function POST(request: NextRequest) {
  // Same-site only: browsers send Origin on POST; Sec-Fetch-Site covers the rest.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const sameSite = origin ? safeHost(origin) === host : request.headers.get("sec-fetch-site") === "same-origin";
  if (!sameSite) return new NextResponse(null, { status: 403 });
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return noContent();

  const env = getServerEnv();
  const ip = clientIp(request.headers, { header: env.CLIENT_IP_HEADER, trustedProxyHops: env.TRUSTED_PROXY_HOPS });
  if (ip && !limiter(ip).allowed) return noContent();

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = siteEventSchema.safeParse(json);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const admin = createSupabaseAdminClient();
  if (!admin) return noContent();
  const e = parsed.data;
  after(async () => {
    const { error } = await admin.from("site_events").insert({
      session_id: e.session,
      name: e.name,
      path: e.path,
      label: e.label ?? null,
      source: e.source ?? null,
      medium: e.medium ?? null,
      campaign: e.campaign ?? null,
      referrer_host: e.referrerHost ?? null,
      device: e.device,
    });
    if (error) console.error("[events] not saved", error.code);
  });
  return noContent();
}

function safeHost(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}
