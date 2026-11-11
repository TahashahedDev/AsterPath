import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { firstReplyMessage, whatsappDigits } from "@/features/leads/reply";
import { parseCalBooking, verifyCalSignature } from "@/server/integrations/cal";

vi.mock("server-only", () => ({}));

describe("WhatsApp first reply", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("normalises Indian numbers with or without a country code", () => {
    expect(whatsappDigits("+91 98765 43210")).toBe("919876543210");
    expect(whatsappDigits("98765 43210")).toBe("919876543210");
    expect(whatsappDigits("+39 331 110 4575")).toBe("393311104575");
    expect(whatsappDigits("09876543210")).toBe("919876543210");
    expect(whatsappDigits("0091 98765 43210")).toBe("919876543210");
    expect(whatsappDigits("+91-98765-43210")).toBe("919876543210");
  });

  it("asks for a time when no booking page is set, and links the prefilled booking when it is", () => {
    const lead = { name: "Priya Sharma", email: "priya@example.com", whatsapp: "+91 98765 43210", reference: "AP-261111-ABCDE", levelLabel: "Master's" };
    vi.stubEnv("NEXT_PUBLIC_BOOKING_URL", "");
    expect(firstReplyMessage(lead)).toContain("Which day and time suit you");
    vi.stubEnv("NEXT_PUBLIC_BOOKING_URL", "https://cal.com/asterpath/consultation");
    const withBooking = firstReplyMessage(lead);
    expect(withBooking).toContain("Hi Priya");
    expect(withBooking).toContain("https://cal.com/asterpath/consultation?");
    expect(withBooking).toContain("metadata%5Breference%5D=AP-261111-ABCDE");
  });
});

describe("Cal.com webhook", () => {
  const secret = "test-secret-1234567890";
  const sign = (body: string) => createHmac("sha256", secret).update(body).digest("hex");

  it("accepts only bodies signed with the shared secret", () => {
    const body = JSON.stringify({ triggerEvent: "PING" });
    expect(verifyCalSignature(body, sign(body), secret)).toBe(true);
    expect(verifyCalSignature(body, sign(body + " "), secret)).toBe(false);
    expect(verifyCalSignature(body, null, secret)).toBe(false);
    expect(verifyCalSignature(body, "not-hex", secret)).toBe(false);
  });

  it("reads the booking, its Meet link and the enquiry reference", () => {
    const booking = parseCalBooking({
      triggerEvent: "BOOKING_CREATED",
      payload: {
        uid: "abc123",
        startTime: "2026-11-20T05:30:00.000Z",
        endTime: "2026-11-20T06:00:00.000Z",
        attendees: [{ name: "Priya Sharma", email: "priya@example.com", timeZone: "Asia/Kolkata" }],
        metadata: { videoCallUrl: "https://meet.google.com/abc-defg-hij", reference: "AP-261111-ABCDE" },
      },
    });
    expect(booking).toMatchObject({ event: "created", uid: "abc123", email: "priya@example.com", meetingUrl: "https://meet.google.com/abc-defg-hij", reference: "AP-261111-ABCDE" });
  });

  it("ignores pings, unknown events and non-https meeting links", () => {
    expect(parseCalBooking({ triggerEvent: "PING" })).toBeNull();
    expect(parseCalBooking({ triggerEvent: "MEETING_ENDED", payload: { uid: "x" } })).toBeNull();
    const booking = parseCalBooking({
      triggerEvent: "BOOKING_CANCELLED",
      payload: { uid: "x", startTime: "2026-11-20T05:30:00Z", attendees: [{ name: "A", email: "a@example.com" }], metadata: { videoCallUrl: "javascript:alert(1)" } },
    });
    expect(booking).toMatchObject({ event: "cancelled", meetingUrl: null, reference: null });
  });
});

describe("morning briefing", () => {
  const empty = { waiting: [], followUps: [], calls: [], deadlines: [], overdueTasks: [], payments: [], referrals: [] };
  const now = new Date("2026-11-11T02:30:00Z");

  it("sends nothing on a day with nothing to do", async () => {
    const { composeDigest } = await import("@/server/integrations/digest");
    expect(composeDigest(empty, now)).toBeNull();
  });

  it("lists only the sections with work, escapes names, and links into the admin", async () => {
    const { composeDigest } = await import("@/server/integrations/digest");
    const digest = composeDigest(
      {
        ...empty,
        waiting: [{ name: "Priya <script>", detail: "masters · september-2027", href: "/admin/leads/1", late: true }],
        calls: [{ name: "Arjun", detail: "4:00 pm", href: "/admin/leads/2", meetingUrl: "https://meet.google.com/abc-defg-hij" }],
      },
      now,
    )!;
    expect(digest.subject).toContain("1 waiting, 1 call");
    expect(digest.html).toContain("Priya &lt;script&gt;");
    expect(digest.html).toContain("over 24h");
    expect(digest.html).toContain("Join Meet");
    expect(digest.html).not.toContain("Application deadlines");
    expect(digest.text).toContain("/admin/leads/1");
  });
});
