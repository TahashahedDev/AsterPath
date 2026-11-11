import type { Metadata } from "next";
import Link from "next/link";
import {
  AlarmClock, ArrowUpRight, CalendarClock, ClipboardList, FileStack, GraduationCap, IndianRupee, Inbox, Percent, Users, Wallet, type LucideIcon,
} from "lucide-react";
import type { Lead } from "@/features/operations/types";
import { DemoNotice, DemoTag, EmptyState, PageHeader, Panel, StatCard, StatusPill, formatDate, formatDateTime } from "@/components/dashboard/ui";
import { DemoUnavailable, LeadSourceNote } from "@/components/admin/admin-ui";
import { daysBetween, relativeDays } from "@/components/admin/format";
import { overdueTasks, paymentTotals, pendingDocuments, studentName, upcomingDeadlines } from "@/components/admin/workspace-data";
import { DEMO_TODAY, demoActivity, demoApplications, demoDocuments, demoStudents, isDemoWorkspaceEnabled } from "@/server/demo/workspace";
import { getLeadDirectory } from "@/server/services/lead-directory";
import { listUpcomingBookings } from "@/server/services/bookings";
import { FounderToday } from "@/components/admin/founder-today";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const closedApplication = new Set(["admitted", "rejected", "withdrawn"]);

function Tagged({ text, demo }: { text: string; demo: boolean }) {
  return demo ? (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {text} <DemoTag />
    </span>
  ) : (
    <>{text}</>
  );
}

export default async function AdminOverviewPage() {
  const directory = await getLeadDirectory();
  const demo = isDemoWorkspaceEnabled();
  const leads = directory.leads;
  const leadsAreDemo = directory.source === "demo";
  const converted = leads.filter((l) => l.stage === "converted").length;
  const bookings = await listUpcomingBookings();
  // Demo leads are dated around a fixed "today", so ages are measured from it.
  const now = leadsAreDemo ? Date.parse(DEMO_TODAY) : new Date().getTime();

  return (
    <div>
      <PageHeader eyebrow="Admin workspace" title="Overview" description="Today’s pipeline, casework and money in one place. Every figure is counted from records, never estimated." />
      {directory.source === "unavailable" ? (
        <div className="mt-6">
          <EmptyState icon={Inbox} title="Enquiries are not available" description={directory.reason} />
        </div>
      ) : (
        <LeadSourceNote source={directory.source} />
      )}

      {directory.source !== "unavailable" && <FounderToday leads={leads} bookings={bookings} now={now} />}

      <h2 className="sr-only">Key figures</h2>
      <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total leads" value={leads.length} icon={Users} hint={<Tagged text="All enquiries" demo={leadsAreDemo} />} />
        <StatCard label="New enquiries" value={leads.filter((l) => l.stage === "new").length} icon={Inbox} tone="attention" hint={<Tagged text="Not yet contacted" demo={leadsAreDemo} />} />
        <StatCard
          label="Conversion rate"
          value={leads.length ? `${Math.round((converted / leads.length) * 100)}%` : "—"}
          icon={Percent}
          hint={<Tagged text={`${converted} converted of ${leads.length}`} demo={leadsAreDemo} />}
        />
        {demo && <OperationalStats />}
      </div>

      {demo ? <OperationalPanels leads={leads} leadToday={leadsAreDemo ? DEMO_TODAY : new Date().toISOString()} /> : <DemoUnavailable module="Casework, tasks and payments" />}
    </div>
  );
}

function OperationalStats() {
  const activeApplications = demoApplications.filter((a) => !closedApplication.has(a.status)).length;
  const payments = paymentTotals();
  return (
    <>
      <StatCard label="Active students" value={demoStudents.length} icon={GraduationCap} hint={<Tagged text="Open cases" demo />} />
      <StatCard label="Active applications" value={activeApplications} icon={ClipboardList} hint={<Tagged text="Not yet decided" demo />} />
      <StatCard label="Pending documents" value={pendingDocuments().length} icon={FileStack} tone="attention" hint={<Tagged text="Requested or in review" demo />} />
      <StatCard label="Overdue tasks" value={overdueTasks().length} icon={AlarmClock} tone="attention" hint={<Tagged text="Past due, not done" demo />} />
      <StatCard label="Upcoming deadlines" value={upcomingDeadlines().length} icon={CalendarClock} hint={<Tagged text="Calendar and applications" demo />} />
      <StatCard label="Pending payments" value={<span className="text-2xl sm:text-3xl">{formatInr(payments.pendingTotal)}</span>} icon={Wallet} tone="attention" hint={<Tagged text={`${payments.pending.length} due or overdue`} demo />} />
      <StatCard label="Collected revenue" value={<span className="text-2xl sm:text-3xl">{formatInr(payments.collected)}</span>} icon={IndianRupee} hint={<Tagged text="Paid instalments only" demo />} />
    </>
  );
}

type Attention = { id: string; icon: LucideIcon; title: string; detail: string; href: string; tone: "danger" | "warning" | "gold" };

function needsAttention(leads: Lead[], leadToday: string): Attention[] {
  const items: Attention[] = [];
  for (const t of overdueTasks()) {
    items.push({ id: `t-${t.id}`, icon: AlarmClock, title: t.title, detail: `Task due ${relativeDays(daysBetween(DEMO_TODAY, t.dueAt))} · ${studentName(t.studentId)}`, href: "/admin/tasks", tone: "danger" });
  }
  for (const d of demoDocuments) {
    if (d.status === "expired" || d.status === "reupload_required" || d.status === "uploaded") {
      const label = d.status === "expired" ? "Expired" : d.status === "uploaded" ? "Waiting for review" : "Re-upload requested";
      items.push({ id: `d-${d.id}`, icon: FileStack, title: d.title, detail: `${label} · ${studentName(d.studentId)}`, href: `/admin/documents/${d.id}`, tone: d.status === "expired" ? "danger" : "warning" });
    }
  }
  for (const i of paymentTotals().overdue) {
    items.push({ id: `p-${i.id}`, icon: Wallet, title: `${i.label} instalment · ${formatInr(i.amountInr)}`, detail: `Overdue since ${formatDate(i.dueAt)} · ${studentName(i.invoice.studentId)}`, href: "/admin/payments", tone: "danger" });
  }
  for (const l of leads) {
    if (l.followUpAt && l.stage !== "lost" && l.stage !== "converted" && daysBetween(leadToday, l.followUpAt) <= 0) {
      items.push({ id: `l-${l.id}`, icon: Users, title: `Follow up with ${l.name}`, detail: `Follow-up ${relativeDays(daysBetween(leadToday, l.followUpAt))}`, href: `/admin/leads/${l.id}`, tone: "gold" });
    }
  }
  return items;
}

const toneClass = { danger: "text-danger", warning: "text-warning-fg", gold: "text-terracotta-deep" } as const;

function OperationalPanels({ leads, leadToday }: { leads: Lead[]; leadToday: string }) {
  const attention = needsAttention(leads, leadToday);
  const deadlines = upcomingDeadlines().slice(0, 6);
  const activity = [...demoActivity].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, 6);
  return (
    <>
      <DemoNotice>Casework, document, task and payment figures come from synthetic fixtures, counted against a fixed demo date ({formatDate(DEMO_TODAY)}). Lead figures follow the source labelled above.</DemoNotice>
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Panel title="Needs attention" className="min-w-0 lg:col-span-3" bodyClassName="p-0" action={<StatusPill tone="danger">{attention.length}</StatusPill>}>
          <ul className="divide-y divide-border">
            {attention.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="group flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-paper-deep/40">
                  <item.icon className={`size-4 shrink-0 ${toneClass[item.tone]}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                    <span className="block truncate text-xs text-muted">{item.detail}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-subtle group-hover:text-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="Upcoming deadlines"
          className="min-w-0 lg:col-span-2"
          bodyClassName="p-0"
          action={<Link href="/admin/calendar" className="inline-flex min-h-10 items-center text-xs font-medium text-primary hover:underline">Open calendar</Link>}
        >
          <ul className="divide-y divide-border">
            {deadlines.map((d) => {
              const days = daysBetween(DEMO_TODAY, d.at);
              const [day, month] = formatDate(d.at).split(" ");
              return (
                <li key={`${d.kind}-${d.id}`}>
                  <Link href={d.href} className="flex min-h-14 items-center gap-3 px-5 py-3 hover:bg-paper-deep/40">
                    <span className="w-10 shrink-0 text-center" aria-hidden="true">
                      <span className="block text-[0.625rem] font-semibold tracking-wide text-terracotta-deep uppercase">{month}</span>
                      <span className="display block text-xl leading-none text-ink tabular-nums">{day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{d.title}</span>
                      <span className="block text-xs text-muted">
                        {formatDate(d.at)} · {relativeDays(days)}
                        {d.studentId ? ` · ${studentName(d.studentId)}` : ""}
                      </span>
                    </span>
                    {days <= 21 && <StatusPill tone="warning">Soon</StatusPill>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
      <Panel title="Recent activity" className="mt-4">
        <ol className="space-y-3">
          {activity.map((e) => (
            <li key={e.id} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:gap-4">
              <time dateTime={e.at} className="w-28 shrink-0 text-xs text-muted tabular-nums">{formatDateTime(e.at)}</time>
              <span className="min-w-0 text-ink-soft">
                <span className="font-medium text-ink">{e.actor}</span> — {e.summary}
                {!e.visibleToStudent && <StatusPill className="ml-2" tone="neutral">Internal</StatusPill>}
              </span>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
