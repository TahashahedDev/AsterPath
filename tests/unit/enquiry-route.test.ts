import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const headers = { host: "localhost", origin: "http://localhost", "content-type": "application/json" };

function streamOf(bytes: number) {
  const chunk = new Uint8Array(1024).fill(120);
  let sent = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= bytes) return controller.close();
      sent += chunk.byteLength;
      controller.enqueue(chunk);
    },
  });
}

describe("POST /api/enquiries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LEAD_STORE", undefined);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("stops reading a length-less body once it passes the cap", async () => {
    const { POST } = await import("@/app/api/enquiries/route");
    const body = streamOf(1024 * 1024);
    const request = new NextRequest("http://localhost/api/enquiries", { method: "POST", headers, body, duplex: "half" } as ConstructorParameters<typeof NextRequest>[1]);
    const response = await POST(request);
    expect(response.status).toBe(413);
  });

  it("ignores spoofed forwarding headers when no trusted source is configured", async () => {
    const { POST } = await import("@/app/api/enquiries/route");
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) {
      const request = new NextRequest("http://localhost/api/enquiries", {
        method: "POST",
        headers: { ...headers, "x-forwarded-for": `198.51.100.${i}` },
        body: "{}",
      });
      statuses.push((await POST(request)).status);
    }
    // Every spoofed address shares one allowance, so the 31st request is limited.
    expect(statuses.at(-1)).toBe(429);
    expect(statuses.slice(0, 30)).not.toContain(429);
  });
});
