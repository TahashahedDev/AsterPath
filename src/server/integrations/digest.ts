import "server-only";
import { siteConfig } from "@/config/site";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { button, escape, layout, sendEmail } from "@/server/integrations/notifications";

/**
 * The founder's morning briefing, emailed at 08:00 IST by the daily-digest cron.
 * It carries names, dates and admin links only (no phone numbers, no messages),
 * and every item links back to the admin, where the work is done.
 */

type Item = { name: string; detail: string; href: string; meetingUrl?: string | null };
type Section = { title: string; items: Item[]; action?: (i: Item) => string };
export type DigestInput = {
  waiting: (Item & { late: boolean })[];
  followUps: Item[];
  calls: Item[];
  deadlines: Item[];
  overdueTasks: Item[];
  payments: Item[];
  referrals: Item[];
};

const istDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
const istTime = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
const dayMonth = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

export function composeDigest(input: DigestInput, now: Date): { subject: string; html: string; text: string } | null {
  const admin = (path: string) => `${siteConfig.url}${path}`;
  const all: Section[] = [
    { title: "Waiting for a first reply", items: input.waiting.map((w) => ({ ...w, detail: w.late ? `${w.detail} · over 24h` : w.detail })) },
    { title: "Calls in the next 24 hours", items: input.calls, action: (i) => (i.meetingUrl ? button(i.meetingUrl, "Join Meet") : "") },
    { title: "Follow-ups due", items: input.followUps },
    { title: "Application deadlines in the next 14 days", items: input.deadlines },
    { title: "Overdue student tasks", items: input.overdueTasks },
    { title: "Instalments due this week", items: input.payments },
    { title: "Referral credits to decide", items: input.referrals },
  ];
  const sections = all.filter((s) => s.items.length > 0);
  if (sections.length === 0) return null;

  const counts = [
    input.waiting.length && `${input.waiting.length} waiting`,
    input.calls.length && `${input.calls.length} call${input.calls.length === 1 ? "" : "s"}`,
    input.deadlines.length && `${input.deadlines.length} deadline${input.deadlines.length === 1 ? "" : "s"}`,
    input.payments.length && `${input.payments.length} payment${input.payments.length === 1 ? "" : "s"}`,
  ].filter(Boolean);
  const today = new Date(now).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
  const subject = `Today at ${siteConfig.name}: ${counts.length ? counts.join(", ") : "follow-ups and tasks"}`;

  const html = layout(
    `Good morning. Here's ${today}.`,
    sections
      .map(
        (s) => `<h2 style="margin:24px 0 8px;font-size:16px">${escape(s.title)} (${s.items.length})</h2>
<ul style="margin:0;padding:0;list-style:none">${s.items
          .slice(0, 8)
          .map(
            (i) => `<li style="padding:8px 0;border-bottom:1px solid #e6dfd2"><a href="${escape(admin(i.href))}" style="color:#1f4d40;font-weight:600;text-decoration:none">${escape(i.name)}</a><br><span style="font-size:13px;color:#58605a">${escape(i.detail)}</span>${s.action ? `<div style="margin-top:6px">${s.action(i)}</div>` : ""}</li>`,
          )
          .join("")}</ul>${s.items.length > 8 ? `<p style="font-size:13px;color:#58605a">and ${s.items.length - 8} more in the admin.</p>` : ""}`,
      )
      .join("") + `<div style="margin:24px 0 0">${button(admin("/admin"), "Open the admin", true)}</div>`,
  );
  const text = [
    `Good morning. Here's ${today}.`,
    ...sections.map((s) => [`\n${s.title} (${s.items.length})`, ...s.items.slice(0, 8).map((i) => `- ${i.name}: ${i.detail} ${admin(i.href)}`)].join("\n")),
    `\nAdmin: ${admin("/admin")}`,
  ].join("\n");
  return { subject, html, text };
}

/** Gathers the day's work with the service role (cron only) and sends it to LEAD_NOTIFY_EMAIL. */
export async function sendDailyDigest(now: Date): Promise<"sent" | "nothing-to-do" | "not-configured" | "failed"> {
  const { LEAD_NOTIFY_EMAIL } = getServerEnv();
  const db = createSupabaseAdminClient();
  if (!db || !LEAD_NOTIFY_EMAIL) return "not-configured";

  const today = istDate(now);
  const in24h = new Date(now.getTime() + 86_400_000).toISOString();
  const [waiting, followUps, calls, deadlines, tasks, payments, referrals, cases] = await Promise.all([
    db.from("leads").select("id, full_name, level, intake, created_at").eq("status", "new").order("created_at").limit(50),
    db.from("leads").select("id, full_name, status, follow_up_due_at").not("status", "in", "(new,converted,closed)").lte("follow_up_due_at", now.toISOString()).order("follow_up_due_at").limit(50),
    db.from("bookings").select("attendee_name, starts_at, meeting_url, lead_id").neq("status", "cancelled").gte("starts_at", now.toISOString()).lt("starts_at", in24h).order("starts_at"),
    db.from("case_applications").select("case_id, university, programme, deadline").in("status", ["planned", "in_preparation"]).gte("deadline", today).lte("deadline", addDays(today, 14)).order("deadline"),
    db.from("case_tasks").select("case_id, title, due_on").eq("done", false).lt("due_on", today).order("due_on").limit(50),
    db.from("instalments").select("case_id, stage, amount, due_on").in("status", ["due", "upcoming"]).lte("due_on", addDays(today, 7)).order("due_on"),
    db.from("referrals").select("referrer_case_id, created_at").eq("status", "enquired").order("created_at"),
    db.from("student_cases").select("id, full_name"),
  ]);
  const failed = [waiting, followUps, calls, deadlines, tasks, payments, referrals, cases].find((r) => r.error);
  if (failed?.error) {
    console.error("[digest] query failed", failed.error.code);
    return "failed";
  }
  const names = new Map((cases.data ?? []).map((c) => [c.id, c.full_name]));
  const student = (id: string) => names.get(id) ?? "Student";
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const digest = composeDigest(
    {
      waiting: (waiting.data ?? []).map((l) => ({ name: l.full_name, detail: `${l.level} · ${l.intake}`, href: `/admin/leads/${l.id}`, late: now.getTime() - Date.parse(l.created_at) > 86_400_000 })),
      followUps: (followUps.data ?? []).map((l) => ({ name: l.full_name, detail: `${l.status.replace(/_/g, " ")} · due ${dayMonth(istDate(new Date(l.follow_up_due_at)))}`, href: `/admin/leads/${l.id}` })),
      calls: (calls.data ?? []).map((b) => ({ name: b.attendee_name, detail: istTime.format(new Date(b.starts_at)), href: b.lead_id ? `/admin/leads/${b.lead_id}` : "/admin/calendar", meetingUrl: b.meeting_url })),
      deadlines: (deadlines.data ?? []).map((a) => ({ name: student(a.case_id), detail: `${a.university}, ${a.programme} · ${dayMonth(a.deadline!)}`, href: `/admin/students/${a.case_id}` })),
      overdueTasks: (tasks.data ?? []).map((t) => ({ name: student(t.case_id), detail: `${t.title} · was due ${dayMonth(t.due_on!)}`, href: `/admin/students/${t.case_id}` })),
      payments: (payments.data ?? []).map((p) => ({ name: student(p.case_id), detail: `${p.stage} · ${inr(p.amount)} · ${p.due_on! < today ? "overdue since" : "due"} ${dayMonth(p.due_on!)}`, href: `/admin/students/${p.case_id}` })),
      referrals: (referrals.data ?? []).map((r) => ({ name: student(r.referrer_case_id), detail: "Their code was used in a new enquiry", href: "/admin/referrals" })),
    },
    now,
  );
  if (!digest) return "nothing-to-do";
  return sendEmail({ to: LEAD_NOTIFY_EMAIL, ...digest });
}
