import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { taskStatusLabels, type Task } from "@/features/operations/types";
import { DataTable, DemoNotice, PageHeader, StatusPill, formatDate, type Column } from "@/components/dashboard/ui";
import { DemoUnavailable } from "@/components/admin/admin-ui";
import { daysBetween, priorityLabels, priorityTone, relativeDays } from "@/components/admin/format";
import { DEMO_TODAY, demoTasks, isDemoWorkspaceEnabled, staffById, studentById } from "@/server/demo/workspace";
import { LiveTasks } from "@/components/admin/live-lists";
import { listAllTasks } from "@/server/services/cases";

export const metadata: Metadata = { title: "Tasks" };

const groups = [
  { key: "overdue", label: "Overdue", test: (d: number) => d < 0 },
  { key: "today", label: "Today", test: (d: number) => d === 0 },
  { key: "week", label: "This week", test: (d: number) => d > 0 && d <= 7 },
  { key: "later", label: "Later", test: (d: number) => d > 7 },
] as const;

const columns: Column<Task>[] = [
  { key: "title", header: "Task", cell: (t) => <span className="font-medium text-ink">{t.title}</span>, className: "min-w-56" },
  {
    key: "student",
    header: "Student",
    cell: (t) =>
      t.studentId ? (
        <Link href={`/admin/students/${t.studentId}`} className="underline-offset-4 hover:text-primary hover:underline">
          {studentById(t.studentId)?.name}
        </Link>
      ) : (
        <span className="text-muted">Team</span>
      ),
  },
  { key: "due", header: "Due", cell: (t) => <span className="tabular-nums">{formatDate(t.dueAt)} <span className="text-xs text-muted">({relativeDays(daysBetween(DEMO_TODAY, t.dueAt))})</span></span>, className: "whitespace-nowrap" },
  { key: "priority", header: "Priority", cell: (t) => <StatusPill tone={priorityTone[t.priority]}>{priorityLabels[t.priority]}</StatusPill> },
  { key: "status", header: "Status", cell: (t) => taskStatusLabels[t.status] },
  { key: "owner", header: "Owner", cell: (t) => (t.ownerId ? (staffById(t.ownerId)?.name ?? "—") : t.audience === "student" ? "Student" : "Unassigned") },
  {
    key: "audience",
    header: "Visible to",
    cell: (t) =>
      t.audience === "student" ? (
        <span className="inline-flex items-center gap-1.5 text-terracotta-deep"><Eye className="size-3.5" aria-hidden="true" /> Student portal</span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-muted"><EyeOff className="size-3.5" aria-hidden="true" /> Internal only</span>
      ),
  },
];

export default async function TasksPage() {
  const header = <PageHeader eyebrow="Operations" title="Tasks" description="Open work by due date. Student tasks appear in the student’s portal; internal tasks never do." />;
  const live = await listAllTasks();
  if (live) return <div>{header}<LiveTasks rows={live} now={new Date()} /></div>;
  if (!isDemoWorkspaceEnabled()) return <div>{header}<DemoUnavailable module="Tasks" /></div>;

  const open = demoTasks.filter((t) => t.status !== "done").sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  const done = demoTasks.filter((t) => t.status === "done");

  return (
    <div>
      {header}
      <DemoNotice />
      <nav aria-label="Task groups" className="mt-6 flex flex-wrap gap-2">
        {groups.map((g) => {
          const n = open.filter((t) => g.test(daysBetween(DEMO_TODAY, t.dueAt))).length;
          return (
            <a key={g.key} href={`#${g.key}`} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm text-ink-soft ring-1 ring-border ring-inset hover:bg-ink/5">
              {g.label} <span className={g.key === "overdue" && n > 0 ? "font-semibold text-danger tabular-nums" : "text-muted tabular-nums"}>{n}</span>
            </a>
          );
        })}
      </nav>
      {groups.map((g) => {
        const rows = open.filter((t) => g.test(daysBetween(DEMO_TODAY, t.dueAt)));
        return (
          <section key={g.key} id={g.key} aria-labelledby={`h-${g.key}`} className="mt-8 scroll-mt-6">
            <h2 id={`h-${g.key}`} className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              {g.label}
              <span className="text-muted tabular-nums">{rows.length}</span>
            </h2>
            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-strong px-4 py-5 text-sm text-muted">Nothing here.</p>
            ) : (
              <DataTable rows={rows} columns={columns} rowKey={(t) => t.id} primary="title" caption={`${g.label} tasks`} />
            )}
          </section>
        );
      })}
      {done.length > 0 && (
        <section aria-labelledby="h-done" className="mt-8">
          <h2 id="h-done" className="mb-3 text-sm font-semibold text-ink">Done</h2>
          <DataTable rows={done} columns={columns} rowKey={(t) => t.id} primary="title" caption="Completed tasks" />
        </section>
      )}
    </div>
  );
}
