import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { enquirySchema } from "@/features/leads/schema";
import { clientIp, createRateLimiter } from "@/lib/security/rate-limit";
import { createLead } from "@/server/services/lead-service";

const MAX_BODY_BYTES = 16 * 1024;
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

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

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return error(403, "forbidden", "This request was blocked.");

  const rate = limiter(clientIp(request.headers));
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
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return error(413, "too-large", "This enquiry is too large to submit.");
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
    if (result.ok) return NextResponse.json({ reference: result.reference }, { status: 201 });
    if (result.reason === "spam") return error(422, "rejected", "This enquiry couldn't be submitted. Please message us on WhatsApp instead.");
    return error(503, "not-connected", "Online enquiries aren't connected yet. Please message us on WhatsApp and we'll reply there.");
  } catch (cause) {
    // Log the failure without the enquiry contents.
    console.error("[leads] Failed to store enquiry", cause instanceof Error ? cause.message : cause);
    return error(500, "server-error", "Something went wrong on our side. Please try again or message us on WhatsApp.");
  }
}
