import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck2, ClipboardList, Clock, Users } from "lucide-react";
import { DemoNotice, PageHeader, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DemoUnavailable } from "@/components/admin/admin-ui";
import { dayKey, daysBetween, relativeDays } from "@/components/admin/format";
import { DEMO_TODAY, demoApplications, demoCalendar, isDemoWorkspaceEnabled, studentById } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Calendar" };

type Entry = { id: string; title: string; at: string; kind: "consultation" | "deadline" | "appointment" | "internal" | "application"; studentId: string | null; allDay: boolean };

const kindMeta = {
  consultation: { label: "Consultation", tone: "primary", icon: Users },
  deadline: { label: "Deadline", tone: "warning", icon: Clock },
  appointment: { label: "Appointment", tone: "gold", icon: CalendarCheck2 },
  internal: { label: "Internal", tone: "neutral", icon: Users },
  application: { label: "Application deadline", tone: "warning", icon: ClipboardList },
} as const;

const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default function CalendarPage() {
  const header = <PageHeader eyebrow="Operations" title="Calendar" description="Consultations, internal reviews and every deadline in one agenda. Times are shown in India Standard Time." />;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="The calendar" /></div>;

  const entries: Entry[] = [
    ...demoCalendar.map((e) => ({ ...e, allDay: false })),
    ...demoApplications.filter((a) => !a.submittedAt).map((a) => ({ id: a.id, title: `${a.university} — ${a.programme}`, at: a.deadline, kind: "application" as const, studentId: a.studentId, allDay: true })),
  ].filter((e) => daysBetween(DEMO_TODAY, e.at) >= 0);

  const byDay = new Map<string, Entry[]>();
  for (const e of entries.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))) {
    const k = dayKey(e.at);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }

  return (
    <div>
      {header}
      <DemoNotice />
      <p className="mt-3 text-sm text-muted">Cal.com bookings will appear here automatically once its webhook is connected in Integrations. Until then nothing is synced.</p>
      <div className="mt-6 space-y-6">
        {[...byDay.entries()].map(([day, items]) => {
          const diff = daysBetween(DEMO_TODAY, day);
          return (
            <section key={day} aria-labelledby={`d-${day}`} className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
              <h2 id={`d-${day}`} className="md:pt-3">
                <span className="display block text-xl text-ink">{dayFmt.format(new Date(day))}</span>
                <span className="text-xs text-muted">{relativeDays(diff)}</span>
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
                {items.map((e) => {
                  const meta = kindMeta[e.kind];
                  const student = studentById(e.studentId);
                  return (
                    <li key={`${e.kind}-${e.id}`} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-16 shrink-0 text-sm text-ink-soft tabular-nums">{e.allDay ? "All day" : timeFmt.format(new Date(e.at))}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink">{e.title}</span>
                        {student && (
                          <Link href={`/admin/students/${student.id}`} className="text-xs text-muted underline-offset-4 hover:text-primary hover:underline">
                            {student.name}
                          </Link>
                        )}
                      </span>
                      <StatusPill tone={meta.tone}>
                        <meta.icon className="size-3" aria-hidden="true" />
                        {meta.label}
                      </StatusPill>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-8 text-xs text-muted">Showing events from {formatDate(DEMO_TODAY)} onward.</p>
    </div>
  );
}
