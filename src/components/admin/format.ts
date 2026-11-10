import type { PillTone } from "@/components/dashboard/ui";
import {
  applicationStatusLabels, leadStages, workflowStages,
  type ApplicationStatus, type DocumentStatus, type InstalmentStatus, type LeadStage, type TaskPriority, type VisaStatus, type WorkflowStage,
} from "@/features/operations/types";

/**
 * Pure presentation helpers for the admin workspace: tones, labels and
 * calendar-day arithmetic in India time. Safe in server and client components.
 */

const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });

/** "YYYY-MM-DD" of the calendar day the instant falls on in IST. Plain dates pass through unchanged. */
export const dayKey = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : dayFmt.format(new Date(iso)));

/** Whole calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(dayKey(to)) - Date.parse(dayKey(from))) / 86_400_000);
}

export function relativeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export const leadStageLabel = (stage: LeadStage) => (stage === "lost" ? "Lost" : (leadStages.find((s) => s.value === stage)?.label ?? stage));
export const leadStageTone = (stage: LeadStage): PillTone => (stage === "new" ? "gold" : stage === "converted" ? "success" : stage === "lost" ? "neutral" : "primary");

export const workflowLabel = (stage: WorkflowStage) => workflowStages.find((s) => s.value === stage)?.label ?? stage;

export const applicationStatusTone: Record<ApplicationStatus, PillTone> = {
  planned: "neutral",
  in_preparation: "gold",
  submitted: "primary",
  under_review: "primary",
  admitted: "success",
  waitlisted: "warning",
  rejected: "danger",
  withdrawn: "neutral",
};
export const applicationStatuses = Object.keys(applicationStatusLabels) as ApplicationStatus[];

export const documentStatusTone: Record<DocumentStatus, PillTone> = {
  requested: "neutral",
  uploaded: "gold",
  under_review: "primary",
  approved: "success",
  rejected: "danger",
  reupload_required: "warning",
  superseded: "neutral",
  expired: "danger",
};
/** Statuses that still need work from the student or a reviewer. */
export const pendingDocumentStatuses: readonly DocumentStatus[] = ["requested", "uploaded", "under_review", "reupload_required"];

export const priorityLabels: Record<TaskPriority, string> = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" };
export const priorityTone: Record<TaskPriority, PillTone> = { low: "neutral", normal: "neutral", high: "warning", urgent: "danger" };

export const instalmentLabels: Record<InstalmentStatus, string> = { upcoming: "Upcoming", due: "Due", paid: "Paid", overdue: "Overdue", waived: "Waived" };
export const instalmentTone: Record<InstalmentStatus, PillTone> = { upcoming: "neutral", due: "gold", paid: "success", overdue: "danger", waived: "neutral" };

export const visaTone: Record<VisaStatus, PillTone> = { not_started: "neutral", preparing: "gold", appointment_booked: "primary", submitted: "primary", decided: "success" };

/** Single value from a searchParams entry. */
export const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
