/**
 * Operational domain model shared by the admin workspace and the student portal.
 * These are the frontend data contracts: repositories (Supabase later, demo
 * fixtures now) return these shapes, so pages never change when storage does.
 * Pure types and label maps only — no data, no I/O.
 */

export const leadStages = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "consultation", label: "Consultation" },
  { value: "profile_evaluation", label: "Profile evaluation" },
  { value: "proposal", label: "Proposal" },
  { value: "agreement", label: "Agreement" },
  { value: "payment", label: "Payment" },
  { value: "converted", label: "Converted" },
] as const;
export type LeadStage = (typeof leadStages)[number]["value"] | "lost";

export type Destination = "italy" | "germany" | "france";
export const destinationLabels: Record<Destination, string> = { italy: "Italy", germany: "Germany", france: "France" };

export type DegreeLevel = "bachelors" | "masters" | "phd";
export const degreeLabels: Record<DegreeLevel, string> = { bachelors: "Bachelor's", masters: "Master's", phd: "PhD" };

export type StaffMember = { id: string; name: string; role: string; initials: string };

export type Lead = {
  id: string;
  reference: string;
  name: string;
  email: string;
  whatsapp: string;
  residence: string;
  destination: Destination;
  level: DegreeLevel;
  intake: string;
  stage: LeadStage;
  source: string;
  advisorId: string | null;
  tags: string[];
  followUpAt: string | null;
  createdAt: string;
  lastActivityAt: string;
  lostReason?: string;
  /** How they found us and what they read before enquiring (sent with the enquiry, with consent). */
  visit?: { source?: string; campaign?: string; referrer?: string; landingPage?: string; pages: string[] };
  notes: { at: string; authorId: string; body: string }[];
};

/** Case workflow. Order differs by country; `journeyFor` in the fixtures picks the right one. */
export const workflowStages = [
  { value: "profile", label: "Profile assessment" },
  { value: "shortlist", label: "University shortlist" },
  { value: "applications", label: "Applications" },
  { value: "admission", label: "Admission" },
  { value: "pre_enrolment", label: "Pre-enrolment" },
  { value: "enrolment", label: "Enrolment" },
  { value: "visa", label: "Visa preparation" },
  { value: "departure", label: "Departure" },
  { value: "arrival", label: "Arrival" },
] as const;
export type WorkflowStage = (typeof workflowStages)[number]["value"];

export type ApplicationStatus = "planned" | "in_preparation" | "submitted" | "under_review" | "admitted" | "waitlisted" | "rejected" | "withdrawn";
export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  planned: "Planned",
  in_preparation: "In preparation",
  submitted: "Submitted",
  under_review: "Under review",
  admitted: "Admitted",
  waitlisted: "Waitlisted",
  rejected: "Not admitted",
  withdrawn: "Withdrawn",
};

/** Visa status is tracked separately from any application — never conflate them. */
export type VisaStatus = "not_started" | "preparing" | "appointment_booked" | "submitted" | "decided";
export const visaStatusLabels: Record<VisaStatus, string> = {
  not_started: "Not started",
  preparing: "Preparing file",
  appointment_booked: "Appointment booked",
  submitted: "Submitted to consulate",
  decided: "Decision received",
};

export type Application = {
  id: string;
  studentId: string;
  university: string;
  programme: string;
  country: Destination;
  intake: string;
  deadline: string;
  submittedAt: string | null;
  status: ApplicationStatus;
  advisorId: string;
  requiredDocuments: string[];
  reference: string | null;
  notes: string;
};

export const documentCategories = [
  "Passport", "Academic certificates", "Mark sheets", "Degree certificates", "CV", "Language certificates", "Statement of Purpose",
  "Recommendation letters", "Financial records", "Admission letters", "Enrolment documents", "Pre-enrolment documents", "Visa forms",
  "Insurance", "Accommodation", "Translations", "Apostille", "Legalisation", "Other",
] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export type DocumentStatus = "requested" | "uploaded" | "under_review" | "approved" | "rejected" | "reupload_required" | "superseded" | "expired";
export const documentStatusLabels: Record<DocumentStatus, string> = {
  requested: "Requested",
  uploaded: "Uploaded",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  reupload_required: "Re-upload required",
  superseded: "Superseded",
  expired: "Expired",
};
/** Categories finance and marketing roles must never see the contents of. */
export const sensitiveDocumentCategories: readonly DocumentCategory[] = ["Passport", "Financial records", "Visa forms"];

export type DocumentVersion = { version: number; fileName: string; uploadedAt: string; status: DocumentStatus; reviewerId?: string; feedback?: string };
export type StudentDocument = {
  id: string;
  studentId: string;
  category: DocumentCategory;
  title: string;
  status: DocumentStatus;
  requestedAt: string;
  dueAt: string | null;
  expiresAt: string | null;
  feedback: string | null;
  versions: DocumentVersion[];
};

export type TaskStatus = "todo" | "in_progress" | "waiting" | "done";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export const taskStatusLabels: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", waiting: "Waiting", done: "Done" };
export type Task = {
  id: string;
  studentId: string | null;
  title: string;
  description: string;
  dueAt: string;
  priority: TaskPriority;
  status: TaskStatus;
  /** "student" tasks show in the portal; "internal" tasks never do. */
  audience: "student" | "internal";
  ownerId: string | null;
};

export type InstalmentStatus = "upcoming" | "due" | "paid" | "overdue" | "waived";
export type Instalment = { id: string; label: string; amountInr: number; dueAt: string; status: InstalmentStatus; paidAt: string | null; receipt: string | null };
export type Invoice = { id: string; number: string; studentId: string; issuedAt: string; totalInr: number; instalments: Instalment[] };

export type Student = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  destination: Destination;
  level: DegreeLevel;
  course: string;
  intake: string;
  advisorId: string;
  stage: WorkflowStage;
  visaStatus: VisaStatus;
  academicSummary: string;
  shortlist: string[];
  lastActivityAt: string;
  internalNotes: string[];
};

export type ActivityEvent = { id: string; studentId: string | null; at: string; actor: string; summary: string; visibleToStudent: boolean };
export type Message = { id: string; studentId: string; at: string; from: "student" | "advisor"; authorName: string; body: string };
export type CalendarEvent = { id: string; title: string; at: string; kind: "consultation" | "deadline" | "appointment" | "internal"; studentId: string | null };
export type Referral = { id: string; code: string; referrerStudentId: string; referredName: string; status: "invited" | "enquired" | "converted"; rewardStatus: "none" | "pending_approval" | "approved"; createdAt: string };
