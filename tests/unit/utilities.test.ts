import { describe, expect, it } from "vitest";
import { createRateLimiter, clientIp } from "@/lib/security/rate-limit";
import { upcomingIntakes } from "@/features/leads/intakes";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatInr } from "@/lib/utils";

describe("rate limiter", () => {
  it("allows up to the limit, then blocks until the window resets", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1_000 });
    expect(check("ip", 0).allowed).toBe(true);
    expect(check("ip", 10).allowed).toBe(true);
    expect(check("ip", 20)).toEqual({ allowed: false, retryAfterSeconds: 1 });
    expect(check("other", 20).allowed).toBe(true);
    expect(check("ip", 1_001).allowed).toBe(true);
  });

  it("never trusts forwarding headers unless the deployment says so", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.9, 203.0.113.5", "x-real-ip": "198.51.100.9" });
    expect(clientIp(headers, { trustedProxyHops: 0 })).toBeNull();
  });

  it("takes the entry added by the nearest trusted proxy, not the client's", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.9, 203.0.113.5" });
    expect(clientIp(headers, { trustedProxyHops: 1 })).toBe("203.0.113.5");
    expect(clientIp(new Headers(), { trustedProxyHops: 1 })).toBeNull();
  });

  it("reads a platform header and rejects values that are not addresses", () => {
    expect(clientIp(new Headers({ "x-real-ip": "2001:db8::1" }), { header: "x-real-ip", trustedProxyHops: 0 })).toBe("2001:db8::1");
    expect(clientIp(new Headers({ "x-real-ip": "x".repeat(500) }), { header: "x-real-ip", trustedProxyHops: 0 })).toBeNull();
  });

  it("stays within its key bound, dropping the oldest windows", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
    check("a", 0);
    check("b", 0);
    check("c", 0);
    expect(check("b", 1).allowed).toBe(false);
    expect(check("a", 1).allowed).toBe(true);
  });
});

describe("intake options", () => {
  it("lists the next four windows in date order, plus undecided", () => {
    const values = upcomingIntakes(new Date(2026, 10, 8)).map((o) => o.value);
    expect(values).toEqual(["spring-2027", "autumn-2027", "spring-2028", "autumn-2028", "undecided"]);
  });

  it("includes this year's autumn intake before September", () => {
    expect(upcomingIntakes(new Date(2026, 2, 1))[0]?.value).toBe("autumn-2026");
  });
});

describe("formatting and links", () => {
  it("formats rupees with Indian digit grouping", () => {
    expect(formatInr(139_000)).toBe("₹1,39,000");
  });

  it("builds an encoded WhatsApp click-to-chat link", () => {
    expect(whatsappUrl("Hello & welcome", "+39 333 1104575")).toBe("https://wa.me/393331104575?text=Hello%20%26%20welcome");
  });
});
