/**
 * How AsterPath runs, from first message to first week abroad. Each stage has
 * one owner, a time limit, and an exit rule, matching the CRM stages and the
 * student's case workflow. Changing how the business runs starts here.
 * Status: proposed operating model (2026-11-10), founder to confirm.
 */
export type PlaybookStage = {
  id: string;
  phase: "Win" | "Onboard" | "Deliver";
  title: string;
  owner: string;
  sla: string;
  actions: string[];
  exit: string;
  /** What the student experiences at this stage, on the site, by email or in their portal. */
  student: string;
  /** Where the team does this stage in the admin workspace. */
  inApp: string;
};

export const playbook: PlaybookStage[] = [
  {
    id: "enquiry", phase: "Win", title: "New enquiry", owner: "Advisor on rota", sla: "First reply within 1 working day",
    actions: ["Reply on the channel they used (WhatsApp first for India)", "Send the Cal.com link for the free consultation", "Tag the source (Instagram, referral, search) for attribution"],
    exit: "Consultation booked, or 3 follow-ups over 10 days without reply → Lost (no response)",
    student: "They fill in the four-step form (or tap WhatsApp), get their reference on screen and a confirmation email, and can pick a call slot straight away.",
    inApp: "Email alert with one-tap WhatsApp reply; Overview → “Waiting for a first reply”; Leads and CRM.",
  },
  {
    id: "consultation", phase: "Win", title: "Free consultation (30 min)", owner: "Advisor", sla: "Within 5 days of booking",
    actions: ["Walk through profile, budget, intake and risks honestly", "Say clearly when Italy isn't the right fit", "Never quote a figure live; promise it in writing"],
    exit: "Student shares marksheets for evaluation, or says no",
    student: "A Cal.com invite with a Google Meet link lands in their calendar; their call is with the advisor who read their details.",
    inApp: "Overview → “Upcoming calls” (Join Meet); lead page shows the booked call and “How they found us”; add notes after the call.",
  },
  {
    id: "evaluation", phase: "Win", title: "Written profile evaluation", owner: "Advisor", sla: "Within 2 working days",
    actions: ["Eligibility per level, entrance tests needed, DOV or CIMEA route, DSU likelihood", "Draft 4–6 realistic universities", "Build the figure in the quote builder"],
    exit: "Evaluation and proposal sent together",
    student: "They receive a written evaluation and shortlist on WhatsApp or email.",
    inApp: "Lead page → notes; move the CRM card to Profile evaluation.",
  },
  {
    id: "proposal", phase: "Win", title: "Proposal and agreement", owner: "Advisor, approved by owner", sla: "Follow up after 3 and 7 days",
    actions: ["One written figure, what's included, instalments, refund rules", "Any discount above the standard rules needs owner approval", "Agreement sent for e-signature"],
    exit: "Agreement signed → request the Onboarding instalment",
    student: "They get one written figure with its five instalments and the refund rules, and sign the agreement.",
    inApp: "Lead page → “Build a quote” → Save to lead; CRM card to Proposal, then Agreement.",
  },
  {
    id: "onboarding", phase: "Onboard", title: "Onboarding", owner: "Advisor + finance", sla: "Case opened within 1 working day of payment",
    actions: ["Finance confirms the payment against the bank statement or Razorpay record — never a screenshot", "Convert the lead to a student and link their portal account", "Open the case, document checklist and timeline; kickoff call"],
    exit: "Student sees their journey, tasks and documents in the portal",
    student: "They sign up with the same email; their portal shows their stage, tasks and payment plan. It goes live when their first payment is confirmed.",
    inApp: "Lead page → “Open student case”; Payments → confirm the first instalment with its bank reference.",
  },
  {
    id: "applications", phase: "Deliver", title: "Tests and applications", owner: "Advisor; document reviewer checks files", sla: "Weekly update while active",
    actions: ["English and entrance test bookings", "SOP and CV reviewed in at least two drafts", "Every application submitted 7+ days before its deadline"],
    exit: "All planned applications submitted → Applications instalment",
    student: "The portal lists every university with its deadline and status, and their to-do list with due dates.",
    inApp: "Student case → add applications and tasks; Applications and Calendar show every deadline; Tasks shows what is overdue.",
  },
  {
    id: "admission", phase: "Deliver", title: "Admission, pre-enrolment and recognition", owner: "Advisor", sla: "Weekly update while active",
    actions: ["Compare offers with the student and family", "Universitaly pre-enrolment", "DOV or CIMEA; DSU and ISEE parificato if applying"],
    exit: "First admission letter → Admission instalment",
    student: "Each application status changes as decisions arrive; their journey moves to Admission and Pre-enrolment.",
    inApp: "Student case → update application status and stage; Payments → request the Admission instalment.",
  },
  {
    id: "visa", phase: "Deliver", title: "Visa file", owner: "Advisor; reviewer checks every page", sla: "File checked 7+ days before the appointment",
    actions: ["Funds, accommodation, insurance and forms per the consulate's current checklist", "Mock interview", "The student books and pays the appointment themselves"],
    exit: "File complete → Visa instalment. The consulate decides.",
    student: "Their journey shows Visa preparation and the tasks for the visa file.",
    inApp: "Student case → stage and tasks; Payments → request the Visa instalment.",
  },
  {
    id: "arrival", phase: "Deliver", title: "Departure and arrival", owner: "Advisor", sla: "Check-in in week 1 and week 4",
    actions: ["Pre-departure briefing", "Residence permit, tax code and health registration guidance", "Final allowance reconciliation with receipts; refund anything unspent"],
    exit: "Visa granted → Arrival instalment (never charged if refused). Case closed after week 4; ask for an honest review and referrals.",
    student: "Their journey shows Departure and Arrival; if the visa is refused they see the Arrival instalment is never charged. They get a referral link to share.",
    inApp: "Payments → request or waive the Arrival instalment; Referrals → approve credits for friends who join.",
  },
];

export const operatingRules = [
  "One named advisor per student, from first call to arrival.",
  "Every message answered within 1 working day; weekly updates during active stages, even when nothing changed.",
  "Never promise admission, scholarships or visas. Universities and consulates decide.",
  "Never accept passports or bank statements over WhatsApp or email once secure document upload is live.",
  "Payments are confirmed by finance against the bank or Razorpay record, never from a screenshot.",
  "Students sign up themselves; staff are invited. A student's portal case opens only after the Onboarding instalment.",
  "Marketing never sees personal data; AI drafts are reviewed by a person before anything is sent.",
];
