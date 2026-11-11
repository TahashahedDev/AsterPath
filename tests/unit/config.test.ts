import { afterEach, describe, expect, it, vi } from "vitest";
import { parseSiteUrl } from "@/config/site";
import { bookingUrl } from "@/lib/booking";

describe("site URL", () => {
  it("accepts an https origin and trims a trailing slash", () => {
    expect(parseSiteUrl("https://asterpath.example/")).toBe("https://asterpath.example");
  });

  it("allows plain http only on this machine", () => {
    expect(parseSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(() => parseSiteUrl("http://asterpath.example")).toThrow();
  });

  it("rejects credentials, queries and other schemes", () => {
    expect(() => parseSiteUrl("https://user:pass@asterpath.example")).toThrow();
    expect(() => parseSiteUrl("https://asterpath.example/?a=1")).toThrow();
    expect(() => parseSiteUrl("javascript:alert(1)")).toThrow();
  });
});

describe("booking URL", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts a plain https cal.com link", () => {
    vi.stubEnv("NEXT_PUBLIC_BOOKING_URL", "https://cal.com/asterpath/consultation");
    expect(bookingUrl()?.href).toBe("https://cal.com/asterpath/consultation");
  });

  it("rejects other hosts, credentials and ports", () => {
    for (const raw of ["https://cal.com.evil.example/x", "https://u:p@cal.com/x", "https://cal.com:8443/x", "http://cal.com/x"]) {
      vi.stubEnv("NEXT_PUBLIC_BOOKING_URL", raw);
      expect(bookingUrl()).toBeNull();
    }
  });
});
