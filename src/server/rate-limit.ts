import "server-only";
import { createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createRateLimiter, type RateLimitResult } from "@/lib/security/rate-limit";

/**
 * A rate limiter shared by every instance of the site, backed by
 * public.rate_limit_hit() in Supabase. Client keys (IP addresses, emails, user
 * ids) are HMAC'd with a server secret before they leave this process, so the
 * table never holds them in the clear.
 *
 * Without Supabase (local development), or if the database call fails, it falls
 * back to the per-instance memory limiter: weaker, but never fully open.
 */
export function createSharedRateLimiter({ name, limit, windowMs }: { name: string; limit: number; windowMs: number }) {
  const fallback = createRateLimiter({ limit, windowMs });
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async function check(clientKey: string): Promise<RateLimitResult> {
    const db = createSupabaseAdminClient();
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!db || !secret) return fallback(clientKey);

    const key = `${name}:${createHmac("sha256", secret).update(clientKey).digest("base64url").slice(0, 32)}`;
    const { data, error } = await db.rpc("rate_limit_hit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
    const row = data?.[0];
    if (error || !row) {
      console.error("[rate-limit] shared store unavailable, using memory", error?.code ?? "no-row");
      return fallback(clientKey);
    }
    return row.allowed ? { allowed: true, remaining: -1 } : { allowed: false, retryAfterSeconds: Math.max(1, row.retry_after_seconds) };
  };
}
