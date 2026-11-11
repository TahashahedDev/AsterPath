import { bookingLinkFor } from "@/lib/booking";
import { whatsappUrl } from "@/lib/whatsapp";

/** "+91 98765 43210", "098765 43210" or "98765 43210" → "919876543210"; numbers without a country code are assumed Indian. */
export function whatsappDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  // Indian trunk prefix: "0 98765 43210" is the same mobile as "+91 98765 43210".
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits.length === 10 ? `91${digits}` : digits;
}

type ReplyLead = { name: string; email?: string; whatsapp: string; reference: string; levelLabel?: string };

/**
 * The founder's first reply to a new enquiry, ready to send from WhatsApp in one
 * tap. Includes the booking link when Cal.com is set up, so the student can pick
 * a slot (with a Google Meet link) without any back-and-forth.
 */
export function firstReplyMessage(lead: ReplyLead): string {
  const first = lead.name.trim().split(/\s+/)[0] ?? "";
  const booking = bookingLinkFor({ name: lead.name, email: lead.email, reference: lead.reference });
  return [
    `Hi ${first}, this is AsterPath. Thank you for your enquiry (${lead.reference})${lead.levelLabel ? ` about a ${lead.levelLabel.toLowerCase()} in Italy` : ""}.`,
    "I've read your details and would be glad to talk you through your options on a free 30-minute call.",
    booking ? `You can pick a time that suits you here: ${booking}` : "Which day and time suit you this week?",
  ].join(" ");
}

export function firstReplyWhatsappUrl(lead: ReplyLead): string {
  return whatsappUrl(firstReplyMessage(lead), whatsappDigits(lead.whatsapp));
}
