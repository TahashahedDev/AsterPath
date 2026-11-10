import "server-only";
import {
  DEMO_PORTAL_STUDENT_ID, DEMO_TODAY, demoActivity, demoApplications, demoCalendar, demoDocuments, demoInvoices, demoMessages, demoReferrals, demoTasks,
  journeyFor, staffById, studentById,
} from "@/server/demo/workspace";

/**
 * Everything the portal shows, scoped to the one demo student. Pages read from
 * here so the student-only filters (visible events, student tasks) live in one place.
 */
export function getDemoPortal() {
  const student = studentById(DEMO_PORTAL_STUDENT_ID)!;
  const journey = journeyFor(student.destination);
  const own = <T extends { studentId: string | null }>(rows: T[]) => rows.filter((r) => r.studentId === student.id);
  return {
    today: DEMO_TODAY,
    student,
    firstName: firstNameOf(student.name),
    advisor: staffById(student.advisorId),
    journey,
    stageIndex: Math.max(0, journey.indexOf(student.stage)),
    applications: own(demoApplications),
    documents: own(demoDocuments),
    tasks: own(demoTasks).filter((t) => t.audience === "student"),
    invoices: own(demoInvoices),
    activity: own(demoActivity).filter((e) => e.visibleToStudent).sort((a, b) => b.at.localeCompare(a.at)),
    messages: own(demoMessages).sort((a, b) => a.at.localeCompare(b.at)),
    calendar: own(demoCalendar).filter((e) => e.kind !== "internal"),
    referrals: demoReferrals.filter((r) => r.referrerStudentId === student.id),
  };
}

/** Fixture names read "Demo Student Priya"; the greeting should just say "Priya". */
function firstNameOf(name: string): string {
  const parts = name.split(" ").filter((p) => p !== "Demo" && p !== "Student");
  return parts[0] ?? name;
}

/** Whole days from the demo "today" to an ISO date (negative when past). */
export function daysUntil(iso: string, from: string = DEMO_TODAY): number {
  const day = (s: string) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((day(iso) - day(from)) / 86_400_000);
}
