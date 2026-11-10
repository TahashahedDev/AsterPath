import "server-only";
import { supabaseConfig } from "@/lib/supabase/config";
import type {
  ActivityEvent, Application, CalendarEvent, Invoice, Lead, Message, Referral, StaffMember, Student, StudentDocument, Task, WorkflowStage,
} from "@/features/operations/types";

/**
 * DEMO WORKSPACE — synthetic records only.
 *
 * Every person, file and amount below is invented to show how the admin
 * workspace and student portal behave. Nothing here is a real student, staff
 * member, payment or document, and none of it is ever written to a database.
 * Pages using these fixtures must render <DemoNotice />. Replace each getter
 * with a Supabase repository as the matching table ships.
 */

/** Admin demo data: outside production, or in production only when explicitly enabled (the admin layout already limits it to staff). */
export function isDemoWorkspaceEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DEMO_WORKSPACE === "enabled";
}

/**
 * Portal demo data: development only, and only while Supabase isn't connected —
 * once real students can sign in, they must never see fixtures.
 */
export function isPortalDemoEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && !supabaseConfig();
}

/** The fixed "today" the fixtures are written against, so the demo renders identically everywhere. */
export const DEMO_TODAY = "2026-11-10T09:00:00+05:30";

export const demoStaff: StaffMember[] = [
  { id: "st-1", name: "Demo Advisor One", role: "Advisor", initials: "A1" },
  { id: "st-2", name: "Demo Advisor Two", role: "Advisor", initials: "A2" },
  { id: "st-3", name: "Demo Reviewer", role: "Document reviewer", initials: "DR" },
  { id: "st-4", name: "Demo Finance", role: "Finance", initials: "FI" },
];

export const demoLeads: Lead[] = [
  { id: "ld-1", reference: "AP-261108-K3Q7M", name: "Demo Lead Ananya", email: "ananya.demo@example.com", whatsapp: "+91 90000 00001", residence: "Karnataka", destination: "italy", level: "masters", intake: "September 2027", stage: "new", source: "Instagram", advisorId: null, tags: ["DSU interest"], followUpAt: "2026-11-11T10:00:00+05:30", createdAt: "2026-11-08T18:12:00+05:30", lastActivityAt: "2026-11-08T18:12:00+05:30", notes: [] },
  { id: "ld-2", reference: "AP-261107-P8W2D", name: "Demo Lead Rohan", email: "rohan.demo@example.com", whatsapp: "+91 90000 00002", residence: "Maharashtra", destination: "italy", level: "bachelors", intake: "September 2027", stage: "contacted", source: "Referral", advisorId: "st-1", tags: ["Parent involved"], followUpAt: "2026-11-10T16:00:00+05:30", createdAt: "2026-11-07T11:40:00+05:30", lastActivityAt: "2026-11-09T12:05:00+05:30", notes: [{ at: "2026-11-09T12:05:00+05:30", authorId: "st-1", body: "Spoke on WhatsApp. Wants engineering in the north. Call booked." }] },
  { id: "ld-3", reference: "AP-261104-Z1M9F", name: "Demo Lead Meera", email: "meera.demo@example.com", whatsapp: "+91 90000 00003", residence: "Kerala", destination: "italy", level: "masters", intake: "September 2027", stage: "consultation", source: "Google search", advisorId: "st-2", tags: ["Biotech"], followUpAt: "2026-11-12T11:00:00+05:30", createdAt: "2026-11-04T09:10:00+05:30", lastActivityAt: "2026-11-09T17:30:00+05:30", notes: [] },
  { id: "ld-4", reference: "AP-261029-H4T6B", name: "Demo Lead Kabir", email: "kabir.demo@example.com", whatsapp: "+91 90000 00004", residence: "Delhi", destination: "germany", level: "masters", intake: "Winter 2027", stage: "profile_evaluation", source: "Instagram", advisorId: "st-1", tags: ["Germany waitlist"], followUpAt: "2026-11-09T10:00:00+05:30", createdAt: "2026-10-29T15:00:00+05:30", lastActivityAt: "2026-11-05T13:00:00+05:30", notes: [] },
  { id: "ld-5", reference: "AP-261022-R7N3C", name: "Demo Lead Sana", email: "sana.demo@example.com", whatsapp: "+91 90000 00005", residence: "Telangana", destination: "italy", level: "masters", intake: "September 2027", stage: "proposal", source: "Website", advisorId: "st-2", tags: ["Architecture"], followUpAt: "2026-11-13T15:00:00+05:30", createdAt: "2026-10-22T10:20:00+05:30", lastActivityAt: "2026-11-08T10:00:00+05:30", notes: [] },
  { id: "ld-6", reference: "AP-261015-B2V8Q", name: "Demo Lead Arjun", email: "arjun.demo@example.com", whatsapp: "+91 90000 00006", residence: "Gujarat", destination: "italy", level: "bachelors", intake: "September 2027", stage: "agreement", source: "Facebook", advisorId: "st-1", tags: [], followUpAt: "2026-11-14T12:00:00+05:30", createdAt: "2026-10-15T19:45:00+05:30", lastActivityAt: "2026-11-07T19:00:00+05:30", notes: [] },
  { id: "ld-7", reference: "AP-261009-L5K1W", name: "Demo Lead Isha", email: "isha.demo@example.com", whatsapp: "+91 90000 00007", residence: "Punjab", destination: "france", level: "masters", intake: "September 2027", stage: "payment", source: "Referral", advisorId: "st-2", tags: ["France waitlist"], followUpAt: null, createdAt: "2026-10-09T08:30:00+05:30", lastActivityAt: "2026-11-06T09:00:00+05:30", notes: [] },
  { id: "ld-8", reference: "AP-260930-Y9D4S", name: "Demo Lead Vikram", email: "vikram.demo@example.com", whatsapp: "+91 90000 00008", residence: "Tamil Nadu", destination: "italy", level: "phd", intake: "November 2027", stage: "lost", source: "Website", advisorId: "st-1", tags: [], followUpAt: null, createdAt: "2026-09-30T14:00:00+05:30", lastActivityAt: "2026-10-20T14:00:00+05:30", lostReason: "Chose to defer by a year", notes: [] },
];

export const demoStudents: Student[] = [
  { id: "sd-1", name: "Demo Student Priya", email: "priya.demo@example.com", whatsapp: "+91 90000 00101", city: "Bengaluru", destination: "italy", level: "masters", course: "MSc Data Science", intake: "September 2027", advisorId: "st-1", stage: "applications", visaStatus: "not_started", academicSummary: "B.Tech Computer Science (4 years), 8.1 CGPA. IELTS 7.0.", shortlist: ["Politecnico di Milano", "University of Padua", "University of Bologna"], lastActivityAt: "2026-11-09T16:20:00+05:30", internalNotes: ["Prefers northern Italy. Eligible for DSU — start ISEE parificato early."] },
  { id: "sd-2", name: "Demo Student Aditya", email: "aditya.demo@example.com", whatsapp: "+91 90000 00102", city: "Pune", destination: "italy", level: "bachelors", course: "BSc Economics and Management", intake: "September 2027", advisorId: "st-2", stage: "shortlist", visaStatus: "not_started", academicSummary: "Class 12 (CBSE), 89%. SAT planned.", shortlist: ["University of Milan", "University of Turin"], lastActivityAt: "2026-11-08T11:00:00+05:30", internalNotes: ["Parents join every call."] },
  { id: "sd-3", name: "Demo Student Fatima", email: "fatima.demo@example.com", whatsapp: "+91 90000 00103", city: "Hyderabad", destination: "italy", level: "masters", course: "MSc Architecture", intake: "September 2027", advisorId: "st-2", stage: "pre_enrolment", visaStatus: "preparing", academicSummary: "B.Arch (5 years), 7.6 CGPA. Portfolio ready.", shortlist: ["Politecnico di Torino", "Sapienza University of Rome"], lastActivityAt: "2026-11-09T09:40:00+05:30", internalNotes: [] },
  { id: "sd-4", name: "Demo Student Rahul", email: "rahul.demo@example.com", whatsapp: "+91 90000 00104", city: "Kochi", destination: "italy", level: "phd", course: "PhD Physics", intake: "November 2027", advisorId: "st-1", stage: "profile", visaStatus: "not_started", academicSummary: "MSc Physics, 2 publications.", shortlist: [], lastActivityAt: "2026-11-05T15:00:00+05:30", internalNotes: [] },
];

export const demoApplications: Application[] = [
  { id: "ap-1", studentId: "sd-1", university: "Politecnico di Milano", programme: "MSc Computer Science and Engineering", country: "italy", intake: "September 2027", deadline: "2026-11-27", submittedAt: null, status: "in_preparation", advisorId: "st-1", requiredDocuments: ["Degree certificate", "Transcripts", "CV", "Statement of Purpose", "IELTS"], reference: null, notes: "Round 1. SOP draft two under review." },
  { id: "ap-2", studentId: "sd-1", university: "University of Padua", programme: "MSc Data Science", country: "italy", intake: "September 2027", deadline: "2027-01-15", submittedAt: null, status: "planned", advisorId: "st-1", requiredDocuments: ["Degree certificate", "Transcripts", "CV", "Two recommendation letters"], reference: null, notes: "" },
  { id: "ap-3", studentId: "sd-1", university: "University of Bologna", programme: "MSc Artificial Intelligence", country: "italy", intake: "September 2027", deadline: "2027-02-10", submittedAt: null, status: "planned", advisorId: "st-1", requiredDocuments: ["Degree certificate", "Transcripts", "CV", "Motivation letter"], reference: null, notes: "" },
  { id: "ap-4", studentId: "sd-3", university: "Politecnico di Torino", programme: "MSc Architecture for Sustainability", country: "italy", intake: "September 2027", deadline: "2026-10-15", submittedAt: "2026-10-10", status: "admitted", advisorId: "st-2", requiredDocuments: ["Portfolio", "Degree certificate", "Transcripts"], reference: "DEMO-TO-4471", notes: "Conditional on final transcript." },
  { id: "ap-5", studentId: "sd-3", university: "Sapienza University of Rome", programme: "MSc Architecture (Restoration)", country: "italy", intake: "September 2027", deadline: "2026-10-30", submittedAt: "2026-10-28", status: "under_review", advisorId: "st-2", requiredDocuments: ["Portfolio", "Degree certificate"], reference: "DEMO-RM-2210", notes: "" },
  { id: "ap-6", studentId: "sd-2", university: "University of Milan", programme: "BSc Economics and Management", country: "italy", intake: "September 2027", deadline: "2027-03-01", submittedAt: null, status: "planned", advisorId: "st-2", requiredDocuments: ["Class 12 mark sheet", "SAT score", "Passport"], reference: null, notes: "" },
];

const v = (version: number, fileName: string, uploadedAt: string, status: StudentDocument["status"], feedback?: string) => ({ version, fileName, uploadedAt, status, feedback, reviewerId: feedback ? "st-3" : undefined });

export const demoDocuments: StudentDocument[] = [
  { id: "dc-1", studentId: "sd-1", category: "Passport", title: "Passport (bio page)", status: "approved", requestedAt: "2026-10-01", dueAt: null, expiresAt: "2031-04-02", feedback: null, versions: [v(1, "passport-demo.pdf", "2026-10-03", "approved")] },
  { id: "dc-2", studentId: "sd-1", category: "Degree certificates", title: "B.Tech degree certificate", status: "under_review", requestedAt: "2026-10-01", dueAt: "2026-11-15", expiresAt: null, feedback: null, versions: [v(1, "degree-demo.pdf", "2026-11-08", "under_review")] },
  { id: "dc-3", studentId: "sd-1", category: "Mark sheets", title: "Semester mark sheets (1–8)", status: "reupload_required", requestedAt: "2026-10-01", dueAt: "2026-11-14", expiresAt: null, feedback: "Semester 6 page is cut off at the bottom. Please rescan all pages at full size.", versions: [v(1, "marksheets-demo.pdf", "2026-10-20", "rejected", "Semester 6 page is cut off at the bottom. Please rescan all pages at full size.")] },
  { id: "dc-4", studentId: "sd-1", category: "Statement of Purpose", title: "Statement of Purpose — Politecnico di Milano", status: "under_review", requestedAt: "2026-10-15", dueAt: "2026-11-20", expiresAt: null, feedback: null, versions: [v(1, "sop-v1-demo.docx", "2026-10-25", "superseded", "Good start. Tighten paragraph 2 around your final-year project."), v(2, "sop-v2-demo.docx", "2026-11-07", "under_review")] },
  { id: "dc-5", studentId: "sd-1", category: "Language certificates", title: "IELTS Academic test report", status: "approved", requestedAt: "2026-10-01", dueAt: null, expiresAt: "2028-06-10", feedback: null, versions: [v(1, "ielts-demo.pdf", "2026-10-05", "approved")] },
  { id: "dc-6", studentId: "sd-1", category: "Recommendation letters", title: "Recommendation letter — academic", status: "requested", requestedAt: "2026-11-01", dueAt: "2026-12-10", expiresAt: null, feedback: null, versions: [] },
  { id: "dc-7", studentId: "sd-1", category: "CV", title: "Europass CV", status: "uploaded", requestedAt: "2026-10-15", dueAt: null, expiresAt: null, feedback: null, versions: [v(1, "cv-demo.pdf", "2026-11-09", "uploaded")] },
  { id: "dc-8", studentId: "sd-3", category: "Pre-enrolment documents", title: "Universitaly pre-enrolment summary", status: "approved", requestedAt: "2026-10-20", dueAt: null, expiresAt: null, feedback: null, versions: [v(1, "universitaly-demo.pdf", "2026-10-29", "approved")] },
  { id: "dc-9", studentId: "sd-3", category: "Apostille", title: "Degree certificate — MEA apostille", status: "requested", requestedAt: "2026-11-02", dueAt: "2026-12-01", expiresAt: null, feedback: null, versions: [] },
  { id: "dc-10", studentId: "sd-3", category: "Insurance", title: "Health insurance for visa", status: "expired", requestedAt: "2026-06-01", dueAt: null, expiresAt: "2026-11-01", feedback: "Policy dates must cover the full visa period. Request a new policy.", versions: [v(1, "insurance-demo.pdf", "2026-06-10", "expired")] },
];

export const demoTasks: Task[] = [
  { id: "tk-1", studentId: "sd-1", title: "Rescan semester mark sheets", description: "Upload all eight semesters at full page size.", dueAt: "2026-11-14", priority: "high", status: "todo", audience: "student", ownerId: null },
  { id: "tk-2", studentId: "sd-1", title: "Ask your professor for a recommendation letter", description: "We sent you a template and the submission instructions.", dueAt: "2026-12-10", priority: "normal", status: "in_progress", audience: "student", ownerId: null },
  { id: "tk-3", studentId: "sd-1", title: "Review SOP draft two", description: "Check the project paragraph against the programme page.", dueAt: "2026-11-12", priority: "high", status: "in_progress", audience: "internal", ownerId: "st-1" },
  { id: "tk-4", studentId: "sd-3", title: "Book a new insurance policy", description: "Dates must cover the full visa period.", dueAt: "2026-11-11", priority: "urgent", status: "todo", audience: "student", ownerId: null },
  { id: "tk-5", studentId: "sd-3", title: "Check DOV / CIMEA route with the university", description: "Confirm what Politecnico di Torino accepts.", dueAt: "2026-11-08", priority: "high", status: "waiting", audience: "internal", ownerId: "st-2" },
  { id: "tk-6", studentId: "sd-2", title: "Confirm SAT test date", description: "", dueAt: "2026-11-20", priority: "normal", status: "todo", audience: "student", ownerId: null },
  { id: "tk-7", studentId: null, title: "Prepare December Instagram calendar", description: "Draft, then send for founder approval.", dueAt: "2026-11-25", priority: "low", status: "todo", audience: "internal", ownerId: "st-2" },
];

export const demoInvoices: Invoice[] = [
  { id: "in-1", number: "DEMO-INV-0001", studentId: "sd-1", issuedAt: "2026-10-01", totalInr: 100000, instalments: [
    { id: "i-1", label: "Onboarding", amountInr: 20000, dueAt: "2026-10-01", status: "paid", paidAt: "2026-10-02", receipt: "DEMO-RCPT-0001" },
    { id: "i-2", label: "Applications", amountInr: 25000, dueAt: "2026-11-15", status: "due", paidAt: null, receipt: null },
    { id: "i-3", label: "Admission", amountInr: 20000, dueAt: "2027-03-01", status: "upcoming", paidAt: null, receipt: null },
    { id: "i-4", label: "Visa", amountInr: 25000, dueAt: "2027-06-01", status: "upcoming", paidAt: null, receipt: null },
    { id: "i-5", label: "Arrival", amountInr: 10000, dueAt: "2027-09-01", status: "upcoming", paidAt: null, receipt: null },
  ] },
  { id: "in-2", number: "DEMO-INV-0002", studentId: "sd-3", issuedAt: "2026-08-20", totalInr: 100000, instalments: [
    { id: "i-6", label: "Onboarding", amountInr: 20000, dueAt: "2026-08-20", status: "paid", paidAt: "2026-08-21", receipt: "DEMO-RCPT-0002" },
    { id: "i-7", label: "Applications", amountInr: 25000, dueAt: "2026-09-20", status: "paid", paidAt: "2026-09-19", receipt: "DEMO-RCPT-0003" },
    { id: "i-8", label: "Admission", amountInr: 20000, dueAt: "2026-11-05", status: "overdue", paidAt: null, receipt: null },
    { id: "i-9", label: "Visa", amountInr: 25000, dueAt: "2027-05-01", status: "upcoming", paidAt: null, receipt: null },
    { id: "i-10", label: "Arrival", amountInr: 10000, dueAt: "2027-09-01", status: "upcoming", paidAt: null, receipt: null },
  ] },
];

export const demoActivity: ActivityEvent[] = [
  { id: "ev-1", studentId: "sd-1", at: "2026-11-09T16:20:00+05:30", actor: "Demo Advisor One", summary: "Commented on SOP draft two", visibleToStudent: true },
  { id: "ev-2", studentId: "sd-1", at: "2026-11-08T12:00:00+05:30", actor: "Demo Student Priya", summary: "Uploaded B.Tech degree certificate", visibleToStudent: true },
  { id: "ev-3", studentId: "sd-1", at: "2026-10-21T10:00:00+05:30", actor: "Demo Reviewer", summary: "Asked for a rescan of the mark sheets", visibleToStudent: true },
  { id: "ev-4", studentId: "sd-3", at: "2026-11-09T09:40:00+05:30", actor: "Demo Advisor Two", summary: "Marked insurance as expired; requested a new policy", visibleToStudent: true },
  { id: "ev-5", studentId: "sd-3", at: "2026-11-02T11:00:00+05:30", actor: "Demo Advisor Two", summary: "Internal: chased university on CIMEA route", visibleToStudent: false },
  { id: "ev-6", studentId: null, at: "2026-11-08T18:12:00+05:30", actor: "Website", summary: "New enquiry AP-261108-K3Q7M", visibleToStudent: false },
];

export const demoMessages: Message[] = [
  { id: "ms-1", studentId: "sd-1", at: "2026-11-07T10:15:00+05:30", from: "student", authorName: "Demo Student Priya", body: "I've uploaded SOP draft two. Is the project paragraph better now?" },
  { id: "ms-2", studentId: "sd-1", at: "2026-11-09T16:20:00+05:30", from: "advisor", authorName: "Demo Advisor One", body: "Much better. Two small edits in the comments, then we're ready for the Politecnico round-one deadline on 27 November." },
];

export const demoCalendar: CalendarEvent[] = [
  { id: "ca-1", title: "Consultation — Demo Lead Meera", at: "2026-11-12T11:00:00+05:30", kind: "consultation", studentId: null },
  { id: "ca-2", title: "Politecnico di Milano round-one deadline", at: "2026-11-27T23:59:00+01:00", kind: "deadline", studentId: "sd-1" },
  { id: "ca-3", title: "Profile review — Demo Student Rahul", at: "2026-11-13T15:00:00+05:30", kind: "internal", studentId: "sd-4" },
  { id: "ca-4", title: "Universitaly window opens (example)", at: "2027-01-15T09:00:00+01:00", kind: "deadline", studentId: null },
];

export const demoReferrals: Referral[] = [
  { id: "rf-1", code: "PRIYA-DEMO", referrerStudentId: "sd-1", referredName: "Demo Friend One", status: "enquired", rewardStatus: "none", createdAt: "2026-11-02" },
  { id: "rf-2", code: "PRIYA-DEMO", referrerStudentId: "sd-1", referredName: "Demo Friend Two", status: "converted", rewardStatus: "pending_approval", createdAt: "2026-10-12" },
];

/** Italy: admission → Universitaly pre-enrolment → visa → enrolment on arrival. Other countries skip pre-enrolment. */
export function journeyFor(destination: Student["destination"]): WorkflowStage[] {
  return destination === "italy"
    ? ["profile", "shortlist", "applications", "admission", "pre_enrolment", "visa", "departure", "arrival", "enrolment"]
    : ["profile", "shortlist", "applications", "admission", "enrolment", "visa", "departure", "arrival"];
}

export const staffById = (id: string | null) => demoStaff.find((s) => s.id === id) ?? null;
export const studentById = (id: string | null) => demoStudents.find((s) => s.id === id) ?? null;
/** The student the portal demo shows as "signed in". */
export const DEMO_PORTAL_STUDENT_ID = "sd-1";
