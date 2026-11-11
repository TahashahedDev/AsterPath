import { NextResponse, after, type NextRequest } from "next/server";
import { z } from "zod";
import { enquirySchema } from "@/features/leads/schema";
import { getServerEnv } from "@/lib/env";
import { clientIp } from "@/lib/security/rate-limit";
import { acknowledgeEnquiry, notifyTeamOfNewLead } from "@/server/integrations/notifications";
import { createLead } from "@/server/services/lead-service";
import { createSharedRateLimiter } from "@/server/rate-limit";
import { recordReferral } from "@/server/services/referrals";

const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 10 * 60 * 1000;
// Per client when the deployment says where the real address is.
const limiter = createSharedRateLimiter({ name: "enquiry", limit: 5, windowMs: WINDOW_MS });
// One shared allowance for every request whose address cannot be trusted.
const unverifiedLimiter = createSharedRateLimiter({ name: "enquiry-unverified", limit: 30, windowMs: WINDOW_MS });

function error(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

/** Rejects cross-site form posts: the Origin must match the host serving this route. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Reads the body while counting bytes and stops at the cap, so an oversized or
 * length-less chunked body is never held in memory whole. Null means too large.
 */
async function readBodyLimited(request: NextRequest, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return error(403, "forbidden", "This request was blocked.");

  const env = getServerEnv();
  const ip = clientIp(request.headers, { header: env.CLIENT_IP_HEADER, trustedProxyHops: env.TRUSTED_PROXY_HOPS });
  const rate = ip ? await limiter(ip) : await unverifiedLimiter("unverified");
  if (!rate.allowed) {
    return NextResponse.json(
      { error: { code: "rate-limited", message: "Too many enquiries from this connection. Please try again later or message us on WhatsApp." } },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return error(413, "too-large", "This enquiry is too large to submit.");

  let body: unknown;
  try {
    const text = await readBodyLimited(request, MAX_BODY_BYTES);
    if (text === null) return error(413, "too-large", "This enquiry is too large to submit.");
    body = JSON.parse(text);
  } catch {
    return error(400, "invalid-json", "We couldn't read this enquiry. Please try again.");
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return error(400, "validation", "Some details need attention.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  try {
    const result = await createLead(parsed.data);
    if (result.ok) {
      // The enquiry is saved; emails go out after the response so they can never delay or undo it.
      const { lead } = result;
      const code = lead.attribution?.referralCode;
      after(() =>
        Promise.allSettled([
          notifyTeamOfNewLead(lead),
          acknowledgeEnquiry(lead),
          ...(code && getServerEnv().LEAD_STORE === "supabase" ? [recordReferral({ id: lead.id, email: lead.contact.email }, code)] : []),
        ]),
      );
      return NextResponse.json({ reference: result.reference }, { status: 201 });
    }
    if (result.reason === "spam") return error(422, "rejected", "This enquiry couldn't be submitted. Please message us on WhatsApp instead.");
    return error(503, "not-connected", "Online enquiries aren't connected yet. Please message us on WhatsApp and we'll reply there.");
  } catch (cause) {
    // Log the failure without the enquiry contents.
    console.error("[leads] Failed to store enquiry", cause instanceof Error ? cause.message : cause);
    return error(500, "server-error", "Something went wrong on our side. Please try again or message us on WhatsApp.");
  }
}
