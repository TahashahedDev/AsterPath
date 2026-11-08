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

  it("takes the first forwarded address", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
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
