import type { PillTone } from "@/components/dashboard/ui";
import type { ApplicationStatus, DocumentStatus, InstalmentStatus, TaskPriority, TaskStatus, VisaStatus } from "@/features/operations/types";

export const documentTone: Record<DocumentStatus, PillTone> = {
  requested: "neutral",
  uploaded: "primary",
  under_review: "gold",
  approved: "success",
  rejected: "danger",
  reupload_required: "danger",
  superseded: "neutral",
  expired: "warning",
};

export const applicationTone: Record<ApplicationStatus, PillTone> = {
  planned: "neutral",
  in_preparation: "gold",
  submitted: "primary",
  under_review: "primary",
  admitted: "success",
  waitlisted: "warning",
  rejected: "danger",
  withdrawn: "neutral",
};

export const visaTone: Record<VisaStatus, PillTone> = {
  not_started: "neutral",
  preparing: "gold",
  appointment_booked: "primary",
  submitted: "primary",
  decided: "success",
};

export const instalmentTone: Record<InstalmentStatus, PillTone> = { upcoming: "neutral", due: "gold", paid: "success", overdue: "danger", waived: "neutral" };
export const instalmentLabels: Record<InstalmentStatus, string> = { upcoming: "Upcoming", due: "Due", paid: "Paid", overdue: "Overdue", waived: "Waived" };

export const taskTone: Record<TaskStatus, PillTone> = { todo: "neutral", in_progress: "primary", waiting: "warning", done: "success" };
export const priorityTone: Record<TaskPriority, PillTone> = { low: "neutral", normal: "neutral", high: "gold", urgent: "danger" };
export const priorityLabels: Record<TaskPriority, string> = { low: "Low priority", normal: "Normal priority", high: "High priority", urgent: "Urgent" };
