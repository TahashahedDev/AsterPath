import { afterEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
let configured = true;
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => (configured ? { rpc } : null) }));

const { createSharedRateLimiter } = await import("@/server/rate-limit");

describe("shared rate limiter", () => {
  afterEach(() => {
    rpc.mockReset();
    configured = true;
    vi.unstubAllEnvs();
  });

  it("counts in the database, keyed by an HMAC rather than the raw client key", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret");
    rpc.mockResolvedValue({ data: [{ allowed: true, retry_after_seconds: 600 }], error: null });
    const check = createSharedRateLimiter({ name: "enquiry", limit: 5, windowMs: 600_000 });

    expect(await check("203.0.113.7")).toMatchObject({ allowed: true });
    const [fn, args] = rpc.mock.calls[0]!;
    expect(fn).toBe("rate_limit_hit");
    expect(args).toMatchObject({ p_limit: 5, p_window_seconds: 600 });
    expect(args.p_key).toMatch(/^enquiry:[A-Za-z0-9_-]{32}$/);
    expect(args.p_key).not.toContain("203.0.113.7");
  });

  it("gives the same client the same key, and different clients different keys", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret");
    rpc.mockResolvedValue({ data: [{ allowed: true, retry_after_seconds: 1 }], error: null });
    const check = createSharedRateLimiter({ name: "auth", limit: 10, windowMs: 60_000 });
    await check("a");
    await check("a");
    await check("b");
    const keys = rpc.mock.calls.map(([, args]) => args.p_key);
    expect(keys[0]).toBe(keys[1]);
    expect(keys[0]).not.toBe(keys[2]);
  });

  it("passes on a refusal with when to retry", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret");
    rpc.mockResolvedValue({ data: [{ allowed: false, retry_after_seconds: 42 }], error: null });
    const check = createSharedRateLimiter({ name: "mfa", limit: 8, windowMs: 600_000 });
    expect(await check("user")).toEqual({ allowed: false, retryAfterSeconds: 42 });
  });

  it("falls back to the memory limiter, never fully open, when the database is missing or failing", async () => {
    configured = false;
    const offline = createSharedRateLimiter({ name: "x", limit: 2, windowMs: 60_000 });
    expect((await offline("k")).allowed).toBe(true);
    expect((await offline("k")).allowed).toBe(true);
    expect((await offline("k")).allowed).toBe(false);

    configured = true;
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret");
    rpc.mockResolvedValue({ data: null, error: { code: "PGRST" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = createSharedRateLimiter({ name: "y", limit: 1, windowMs: 60_000 });
    expect((await failing("k")).allowed).toBe(true);
    expect((await failing("k")).allowed).toBe(false);
  });
});
