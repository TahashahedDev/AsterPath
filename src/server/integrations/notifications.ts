import "server-only";
import { siteConfig } from "@/config/site";
import { budgetOptions, consultationOptions, englishTestOptions, levelOptions, qualificationOptions } from "@/features/leads/schema";
import { firstReplyWhatsappUrl } from "@/features/leads/reply";
import { bookingLinkFor } from "@/lib/booking";
import { getServerEnv } from "@/lib/env";
import type { LeadRecord } from "@/server/repositories/lead-store";

/**
 * Email through Resend's HTTP API (no SDK). Sending is skipped, with a log line
 * that carries only the reference, until RESEND_API_KEY and EMAIL_FROM are set.
 * These run after the enquiry is saved and the student has their answer, so a
 * slow or failed email never loses or delays an enquiry.
 */
type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(email: Email): Promise<"sent" | "not-configured" | "failed"> {
  const { RESEND_API_KEY, EMAIL_FROM } = getServerEnv();
  if (!RESEND_API_KEY || !EMAIL_FROM) return "not-configured";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM, to: [email.to], subject: email.subject, html: email.html, text: email.text, reply_to: email.replyTo }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error("[email] Resend refused the message", res.status);
      return "failed";
    }
    return "sent";
  } catch (cause) {
    console.error("[email] Resend unreachable", cause instanceof Error ? cause.name : "error");
    return "failed";
  }
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const label = (options: readonly { value: string; label: string }[], value: string) => options.find((o) => o.value === value)?.label ?? value;
const intakeLabel = (v: string) => (v === "undecided" ? "Not decided" : v.replace(/^([a-z]+)-(\d{4})$/, (_, s: string, y: string) => `${s[0]!.toUpperCase()}${s.slice(1)} ${y}`));

function button(href: string, text: string, primary = false) {
  const style = primary
    ? "background:#1f4d40;color:#ffffff;border:1px solid #1f4d40"
    : "background:#ffffff;color:#1f4d40;border:1px solid #d3c8b4";
  return `<a href="${escape(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:999px;font-weight:600;text-decoration:none;${style}">${escape(text)}</a>`;
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f7f3eb;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#16201c">
<div style="max-width:560px;margin:0 auto;padding:28px 20px">
<p style="margin:0 0 20px;font-size:14px;color:#58605a">${escape(siteConfig.name)}</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${escape(title)}</h1>
${body}
</div></body></html>`;
}

/** The founder's alert: everything needed to reply in one tap, from the phone. */
export async function notifyTeamOfNewLead(lead: LeadRecord): Promise<void> {
  const { LEAD_NOTIFY_EMAIL } = getServerEnv();
  const level = label(levelOptions, lead.goals.level);
  if (!LEAD_NOTIFY_EMAIL) {
    console.info(`[leads] New enquiry ${lead.reference} (${lead.goals.level}). Alerts not configured: set LEAD_NOTIFY_EMAIL and Resend.`);
    return;
  }
  const rows: [string, string][] = [
    ["Name", lead.contact.fullName],
    ["WhatsApp", lead.contact.whatsapp],
    ["Email", lead.contact.email],
    ["Lives in", lead.contact.residence],
    ["Wants", `${level}, ${lead.goals.fieldOfStudy || "field not given"}`],
    ["Intake", intakeLabel(lead.goals.intake)],
    ["Studies so far", label(qualificationOptions, lead.background.highestQualification)],
    ["English test", label(englishTestOptions, lead.background.englishTest)],
    ["Budget", label(budgetOptions, lead.background.budgetRange)],
    ["Prefers", label(consultationOptions, lead.preferences.consultationMethod)],
  ];
  const reply = firstReplyWhatsappUrl({ name: lead.contact.fullName, email: lead.contact.email, whatsapp: lead.contact.whatsapp, reference: lead.reference, levelLabel: level });
  const admin = `${siteConfig.url}/admin/leads/${lead.id}`;
  const table = rows
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#58605a;font-size:14px;vertical-align:top;white-space:nowrap">${escape(k)}</td><td style="padding:6px 0;font-size:15px">${escape(v)}</td></tr>`)
    .join("");
  const message = lead.preferences.message ? `<p style="margin:16px 0;padding:12px 14px;background:#ffffff;border-radius:12px;font-size:15px;line-height:1.5">“${escape(lead.preferences.message)}”</p>` : "";
  const html = layout(
    `New enquiry: ${lead.contact.fullName}`,
    `<p style="margin:0 0 16px;color:#58605a;font-size:14px">${escape(lead.reference)} · reply within 1 working day</p>
<div style="margin:0 0 20px">${button(reply, "Reply on WhatsApp", true)}${button(`mailto:${lead.contact.email}`, "Email them")}${button(admin, "Open in admin")}</div>
<table style="border-collapse:collapse">${table}</table>${message}`,
  );
  const text = [`New enquiry ${lead.reference}`, ...rows.map(([k, v]) => `${k}: ${v}`), lead.preferences.message ? `Message: ${lead.preferences.message}` : "", `Reply on WhatsApp: ${reply}`, `Admin: ${admin}`]
    .filter(Boolean)
    .join("\n");
  await sendEmail({ to: LEAD_NOTIFY_EMAIL, subject: `New enquiry: ${lead.contact.fullName} (${level}, ${intakeLabel(lead.goals.intake)})`, html, text, replyTo: lead.contact.email });
}

/** The student's confirmation: their reference, what happens next, and a booking link when Cal.com is set up. */
export async function acknowledgeEnquiry(lead: LeadRecord): Promise<void> {
  const first = lead.contact.fullName.trim().split(/\s+/)[0] ?? "";
  const booking = bookingLinkFor({ name: lead.contact.fullName, email: lead.contact.email, reference: lead.reference });
  const method = label(consultationOptions, lead.preferences.consultationMethod).toLowerCase();
  const html = layout(
    `Thank you, ${first}. We have your enquiry.`,
    `<p style="font-size:15px;line-height:1.6">Your reference is <strong>${escape(lead.reference)}</strong>. An advisor will read your details and contact you within one working day${method ? ` (you asked for ${escape(method)})` : ""}.</p>
${booking ? `<p style="font-size:15px;line-height:1.6">Prefer to choose a time yourself? Pick a slot for your free 30-minute call; you'll get a calendar invite with a Google Meet link.</p><div style="margin:16px 0">${button(booking, "Pick a time for your call", true)}</div>` : ""}
<p style="font-size:13px;line-height:1.6;color:#58605a">Please don't send passports, bank statements or other documents by email or WhatsApp. When documents are needed, we'll give you a secure way to share them.</p>`,
  );
  const text = [
    `Thank you, ${first}. We have your enquiry. Your reference is ${lead.reference}.`,
    "An advisor will read your details and contact you within one working day.",
    booking ? `Pick a time for your free 30-minute call: ${booking}` : "",
    "Please don't send passports or bank statements by email or WhatsApp.",
  ]
    .filter(Boolean)
    .join("\n\n");
  await sendEmail({ to: lead.contact.email, subject: `We have your enquiry (${lead.reference})`, html, text });
}
