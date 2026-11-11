/**
 * Fixed-window rate limiter held in process memory. Each instance keeps its own
 * counters, so production paths that must hold across instances use
 * createSharedRateLimiter (src/server/rate-limit.ts), which falls back to this.
 */
export type RateLimitResult = { allowed: true; remaining: number } | { allowed: false; retryAfterSeconds: number };

export function createRateLimiter({ limit, windowMs, maxKeys = 10_000 }: { limit: number; windowMs: number; maxKeys?: number }) {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    // Hard bound on memory: drop expired windows, then the oldest ones if still full.
    if (windows.size >= maxKeys && !windows.has(key)) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      for (const k of windows.keys()) {
        if (windows.size < maxKeys) break;
        windows.delete(k);
      }
    }

    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }
    if (current.count >= limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
    }
    current.count += 1;
    return { allowed: true, remaining: limit - current.count };
  };
}

/** Where the deployment says the real client address can be read. */
export type ClientIpSource = { header?: string; trustedProxyHops: number };

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

/**
 * The client address, read only from a source the deployment trusts: a header
 * the platform overwrites (CLIENT_IP_HEADER), or the X-Forwarded-For entry
 * added by the nearest trusted proxy (TRUSTED_PROXY_HOPS, counted from the
 * right). Anything a client can choose for itself returns null. Used only as a
 * rate-limit key, never stored.
 */
export function clientIp(headers: Headers, source: ClientIpSource): string | null {
  let candidate: string | undefined;
  if (source.header) {
    candidate = headers.get(source.header)?.split(",")[0]?.trim();
  } else if (source.trustedProxyHops > 0) {
    const entries = headers.get("x-forwarded-for")?.split(",").map((entry) => entry.trim()) ?? [];
    candidate = entries[entries.length - source.trustedProxyHops];
  }
  return candidate && IP_PATTERN.test(candidate) ? candidate : null;
}
