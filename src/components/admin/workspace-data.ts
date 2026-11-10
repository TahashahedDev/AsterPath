import "server-only";
import { DEMO_TODAY, demoApplications, demoCalendar, demoDocuments, demoInvoices, demoTasks, studentById } from "@/server/demo/workspace";
import { daysBetween, pendingDocumentStatuses } from "@/components/admin/format";

/**
 * Derived views over the demo workspace, shared by several admin pages.
 * Each function reads the fixtures only; callers must check isDemoWorkspaceEnabled().
 */

export type Deadline = { id: string; title: string; at: string; kind: "calendar" | "application"; studentId: string | null; href: string };

/** Calendar deadlines plus every unsubmitted application deadline, soonest first. */
export function upcomingDeadlines(today = DEMO_TODAY): Deadline[] {
  const fromCalendar: Deadline[] = demoCalendar
    .filter((e) => e.kind === "deadline")
    .map((e) => ({ id: e.id, title: e.title, at: e.at, kind: "calendar", studentId: e.studentId, href: "/admin/calendar" }));
  const fromApplications: Deadline[] = demoApplications
    .filter((a) => !a.submittedAt)
    .map((a) => ({ id: a.id, title: `${a.university} — ${a.programme}`, at: a.deadline, kind: "application", studentId: a.studentId, href: `/admin/students/${a.studentId}` }));
  return [...fromCalendar, ...fromApplications].filter((d) => daysBetween(today, d.at) >= 0).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

export const isTaskOverdue = (t: { dueAt: string; status: string }, today = DEMO_TODAY) => t.status !== "done" && daysBetween(today, t.dueAt) < 0;
export const overdueTasks = () => demoTasks.filter((t) => isTaskOverdue(t));
export const pendingDocuments = () => demoDocuments.filter((d) => pendingDocumentStatuses.includes(d.status));
export const openTasksFor = (studentId: string) => demoTasks.filter((t) => t.studentId === studentId && t.status !== "done");

export function paymentTotals() {
  const all = demoInvoices.flatMap((inv) => inv.instalments.map((i) => ({ ...i, invoice: inv })));
  const sum = (xs: typeof all) => xs.reduce((n, i) => n + i.amountInr, 0);
  const paid = all.filter((i) => i.status === "paid");
  const pending = all.filter((i) => i.status === "due" || i.status === "overdue");
  const overdue = all.filter((i) => i.status === "overdue");
  const outstanding = all.filter((i) => i.status !== "paid" && i.status !== "waived");
  return { all, collected: sum(paid), pending, pendingTotal: sum(pending), overdue, overdueTotal: sum(overdue), outstandingTotal: sum(outstanding) };
}

export const studentName = (id: string | null) => studentById(id)?.name ?? "—";
