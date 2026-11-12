import type { PillTone } from "@/components/dashboard/ui";
import type { DocumentRequestStatus, DocumentReviewAction } from "@/lib/supabase/types";

/**
 * Labels and next steps for document requests. The rules themselves live in the
 * database (document_review_action, begin_document_upload); this mirrors them
 * only to decide which buttons to show, never to authorise anything.
 */
export const documentRequestStatusLabels: Record<DocumentRequestStatus, string> = {
  requested: "Requested",
  uploaded: "Uploaded",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  reupload_required: "Replacement needed",
  expired: "Expired",
  withdrawn: "No longer needed",
};

export const documentRequestStatusTone: Record<DocumentRequestStatus, PillTone> = {
  requested: "warning",
  uploaded: "primary",
  under_review: "gold",
  approved: "success",
  rejected: "danger",
  reupload_required: "danger",
  expired: "danger",
  withdrawn: "neutral",
};

/** States in which the student is the one who has to act. */
export const studentCanUpload = (status: DocumentRequestStatus) => status === "requested" || status === "reupload_required" || status === "expired";

/** What the student sees as their next step. */
export function studentNextStep(status: DocumentRequestStatus): string {
  switch (status) {
    case "requested":
      return "Upload this document.";
    case "reupload_required":
      return "Read the feedback and upload a new copy.";
    case "expired":
      return "This copy has expired. Upload a current one.";
    case "uploaded":
      return "Received. Your advisor will review it.";
    case "under_review":
      return "Your advisor is reviewing it.";
    case "approved":
      return "Nothing to do.";
    case "rejected":
      return "Your advisor will tell you what's needed next.";
    case "withdrawn":
      return "Nothing to do. This document is no longer needed.";
  }
}

/** Staff decisions available in a given state (withdrawal aside). */
export function reviewActions(status: DocumentRequestStatus): ("approved" | "rejected" | "reupload_required")[] {
  if (status === "under_review") return ["approved", "reupload_required", "rejected"];
  if (status === "rejected" || status === "approved" || status === "expired") return ["reupload_required"];
  return [];
}

export const reviewActionLabels: Record<DocumentReviewAction, string> = {
  requested: "Requested",
  uploaded: "Uploaded",
  opened: "Opened for review",
  approved: "Approved",
  rejected: "Rejected",
  reupload_required: "Replacement requested",
  withdrawn: "Request withdrawn",
  expired: "Expired",
  file_refused: "File refused (not a valid PDF, JPEG or PNG under 10 MB)",
};

/** Statuses that sit in the review queue, most urgent first. */
export const queueOrder: DocumentRequestStatus[] = ["uploaded", "under_review", "expired", "reupload_required", "requested", "rejected", "approved", "withdrawn"];
