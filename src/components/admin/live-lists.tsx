import Link from "next/link";
import { CalendarClock, ClipboardList, ListChecks, Users, Video, Wallet } from "lucide-react";
import { DataTable, EmptyState, Panel, StatusPill, formatDate, type Column, type PillTone } from "@/components/dashboard/ui";
import { setCaseTaskDone } from "@/app/(admin)/admin/students/actions";
import { decideReferral } from "@/app/(admin)/admin/payments/actions";
import { discountRules } from "@/content/pricing";
import { applicationStatusLabels } from "@/features/operations/types";
import type { ApplicationRowStatus, BookingRow } from "@/lib/supabase/types";
import { formatInr } from "@/lib/utils";
import type { ApplicationWithCase, LedgerRow, ReferralWithNames, TaskWithCase } from "@/server/services/cases";

const appTone: Record<ApplicationRowStatus, PillTone> = {
  planned: "neutral", in_preparation: "gold", submitted: "primary", under_review: "primary", admitted: "success", waitlisted: "warning", rejected: "danger", withdrawn: "neutral",
};
const smallButton = "h-9 rounded-lg border border-border-strong px-3 text-sm font-medium text-ink hover:bg-ink/5";
const daysTo = (date: string, today: number) => Math.round((Date.parse(`${date}T00:00:00Z`) - today) / 86_400_000);
const dueText = (date: string, today: number) => {
  const d = daysTo(date, today);
  return d < 0 ? `${-d}d overdue` : d === 0 ? "today" : `in ${d}d`;
};
const todayUtc = (now: Date) => Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

export function LiveApplications({ rows, now }: { rows: ApplicationWithCase[]; now: Date }) {
  if (rows.length === 0) return <div className="mt-6"><EmptyState icon={ClipboardList} title="No applications yet" description="Add each university a student applies to on their case page; deadlines then appear here and in the calendar." /></div>;
  const today = todayUtc(now);
  const columns: Column<ApplicationWithCase>[] = [
    { key: "student", header: "Student", cell: (a) => <Link href={`/admin/students/${a.case_id}`} className="font-medium text-ink hover:text-primary">{a.studentName}</Link> },
    { key: "university", header: "University", cell: (a) => <span>{a.university}<span className="block text-xs text-muted">{a.programme}</span></span> },
    {
      key: "deadline", header: "Deadline", className: "whitespace-nowrap",
      cell: (a) => a.deadline ? <span className={daysTo(a.deadline, today) <= 21 && !["submitted", "under_review", "admitted", "rejected", "withdrawn"].includes(a.status) ? "font-semibold text-danger" : ""}>{formatDate(a.deadline)} <span className="text-xs text-muted">({dueText(a.deadline, today)})</span></span> : <span className="text-muted">Not set</span>,
    },
    { key: "status", header: "Status", cell: (a) => <StatusPill tone={appTone[a.status]}>{applicationStatusLabels[a.status]}</StatusPill> },
  ];
  return <div className="mt-6"><DataTable rows={rows} columns={columns} rowKey={(a) => a.id} primary="student" caption="Applications" /></div>;
}

export function LiveTasks({ rows, now }: { rows: TaskWithCase[]; now: Date }) {
  if (rows.length === 0) return <div className="mt-6"><EmptyState icon={ListChecks} title="No tasks yet" description="Tasks you give students on their case page appear here, and in the student's portal." /></div>;
  const today = todayUtc(now);
  const open = rows.filter((t) => !t.done);
  const done = rows.filter((t) => t.done).slice(0, 20);
  const list = (items: TaskWithCase[]) => (
    <ul className="divide-y divide-border">
      {items.map((t) => (
        <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className={t.done ? "text-muted line-through" : "text-ink"}>{t.title}</p>
            <p className="text-xs text-muted">
              <Link href={`/admin/students/${t.case_id}`} className="hover:text-primary">{t.studentName}</Link>
              {t.due_on && <> · due {formatDate(t.due_on)} <span className={!t.done && daysTo(t.due_on, today) < 0 ? "font-semibold text-danger" : ""}>({dueText(t.due_on, today)})</span></>}
            </p>
          </div>
          <form action={setCaseTaskDone}>
            <input type="hidden" name="caseId" value={t.case_id} />
            <input type="hidden" name="taskId" value={t.id} />
            <input type="hidden" name="done" value={String(!t.done)} />
            <button type="submit" className={smallButton}>{t.done ? "Reopen" : "Mark done"}</button>
          </form>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="mt-6 grid gap-4">
      <Panel title={`Open (${open.length})`}>{open.length ? list(open) : <p className="text-sm text-muted">Nothing open.</p>}</Panel>
      {done.length > 0 && <Panel title="Recently done">{list(done)}</Panel>}
    </div>
  );
}

const referralTone = { enquired: "gold", approved: "success", declined: "neutral" } as const;

export function LiveReferrals({ rows }: { rows: ReferralWithNames[] }) {
  if (rows.length === 0) {
    return <div className="mt-6"><EmptyState icon={Users} title="No referrals yet" description="Each student has a referral link in their portal. Enquiries that arrive through it appear here for a credit decision." /></div>;
  }
  return (
    <Panel title="Referrals" className="mt-6">
      <ul className="divide-y divide-border">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0 text-sm">
              <p className="text-ink">
                Referred by <Link href={`/admin/students/${r.referrer_case_id}`} className="font-medium hover:text-primary">{r.referrerName}</Link> <span className="font-mono text-xs text-muted">{r.referral_code}</span>
              </p>
              <p className="text-xs text-muted">
                {formatDate(r.created_at)} · {r.lead_id ? <Link href={`/admin/leads/${r.lead_id}`} className="hover:text-primary">open the enquiry</Link> : "enquiry removed"}
                {r.reward_amount ? ` · credit ${formatInr(r.reward_amount)}` : ""}
              </p>
            </div>
            {r.status === "enquired" ? (
              <form action={decideReferral} className="flex gap-2">
                <input type="hidden" name="referralId" value={r.id} />
                <button type="submit" name="decision" value="approved" className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-on-primary hover:bg-primary-deep">Approve {formatInr(discountRules.referralCredit.amount)}</button>
                <button type="submit" name="decision" value="declined" className={smallButton}>Decline</button>
              </form>
            ) : (
              <StatusPill tone={referralTone[r.status]}>{r.status === "approved" ? "Credit approved" : "Declined"}</StatusPill>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Approve only once the referred student has signed and paid their first instalment. The credit is taken off the referrer&apos;s next instalment by hand.</p>
    </Panel>
  );
}

type AgendaItem = { id: string; at: string; title: string; detail: string; href?: string; kind: "call" | "deadline" | "task" | "payment"; meet?: string | null };
const kindMeta = {
  call: { label: "Call", tone: "primary", icon: Video },
  deadline: { label: "Application deadline", tone: "warning", icon: ClipboardList },
  task: { label: "Student task", tone: "neutral", icon: ListChecks },
  payment: { label: "Instalment due", tone: "gold", icon: Wallet },
} as const;
const dayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" });
const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** One agenda from real records: booked calls, application deadlines, student tasks and instalments due. */
export function LiveCalendar({ bookings, applications, tasks, instalments, now }: { bookings: BookingRow[]; applications: ApplicationWithCase[]; tasks: TaskWithCase[]; instalments: LedgerRow[]; now: Date }) {
  const from = todayUtc(now) - 86_400_000;
  const until = from + 60 * 86_400_000;
  const items: AgendaItem[] = [
    ...bookings.map((b) => ({ id: b.id, at: b.starts_at, title: b.attendee_name, detail: `Consultation · ${timeFmt.format(new Date(b.starts_at))}`, href: b.lead_id ? `/admin/leads/${b.lead_id}` : undefined, kind: "call" as const, meet: b.meeting_url })),
    ...applications.filter((a) => a.deadline && !["submitted", "under_review", "admitted", "rejected", "withdrawn"].includes(a.status)).map((a) => ({ id: a.id, at: `${a.deadline}T12:00:00Z`, title: `${a.university} — ${a.studentName}`, detail: a.programme, href: `/admin/students/${a.case_id}`, kind: "deadline" as const })),
    ...tasks.filter((t) => t.due_on && !t.done).map((t) => ({ id: t.id, at: `${t.due_on}T12:00:00Z`, title: t.title, detail: t.studentName, href: `/admin/students/${t.case_id}`, kind: "task" as const })),
    ...instalments.map((i) => ({ id: i.id, at: `${i.due_on}T12:00:00Z`, title: `${i.stage} instalment — ${i.studentName}`, detail: formatInr(i.amount), href: `/admin/payments`, kind: "payment" as const })),
  ]
    .filter((i) => Date.parse(i.at) >= from && Date.parse(i.at) < until)
    .sort((a, b) => a.at.localeCompare(b.at));
  if (items.length === 0) return <div className="mt-6"><EmptyState icon={CalendarClock} title="Nothing in the next 60 days" description="Booked calls, application deadlines, student tasks and instalments with a due date appear here." /></div>;
  const days = new Map<string, AgendaItem[]>();
  for (const i of items) {
    const key = dayFmt.format(new Date(i.at));
    days.set(key, [...(days.get(key) ?? []), i]);
  }
  return (
    <div className="mt-6 grid gap-4">
      {[...days.entries()].map(([day, list]) => (
        <Panel key={day} title={day}>
          <ul className="divide-y divide-border">
            {list.map((i) => {
              const meta = kindMeta[i.kind];
              const Icon = meta.icon;
              return (
                <li key={`${i.kind}-${i.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
                    <div className="min-w-0">
                      {i.href ? <Link href={i.href} className="font-medium text-ink hover:text-primary">{i.title}</Link> : <span className="font-medium text-ink">{i.title}</span>}
                      <p className="text-xs text-muted">{i.detail}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2">
                    {i.meet && <a href={i.meet} target="_blank" rel="noopener noreferrer" className={smallButton + " inline-flex items-center gap-1.5"}><Video className="size-4" aria-hidden="true" /> Join</a>}
                    <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
