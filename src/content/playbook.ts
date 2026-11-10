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
};

export const playbook: PlaybookStage[] = [
  {
    id: "enquiry", phase: "Win", title: "New enquiry", owner: "Advisor on rota", sla: "First reply within 1 working day",
    actions: ["Reply on the channel they used (WhatsApp first for India)", "Send the Cal.com link for the free consultation", "Tag the source (Instagram, referral, search) for attribution"],
    exit: "Consultation booked, or 3 follow-ups over 10 days without reply → Lost (no response)",
  },
  {
    id: "consultation", phase: "Win", title: "Free consultation (30 min)", owner: "Advisor", sla: "Within 5 days of booking",
    actions: ["Walk through profile, budget, intake and risks honestly", "Say clearly when Italy isn't the right fit", "Never quote a figure live; promise it in writing"],
    exit: "Student shares marksheets for evaluation, or says no",
  },
  {
    id: "evaluation", phase: "Win", title: "Written profile evaluation", owner: "Advisor", sla: "Within 2 working days",
    actions: ["Eligibility per level, entrance tests needed, DOV or CIMEA route, DSU likelihood", "Draft 4–6 realistic universities", "Build the figure in the quote builder"],
    exit: "Evaluation and proposal sent together",
  },
  {
    id: "proposal", phase: "Win", title: "Proposal and agreement", owner: "Advisor, approved by owner", sla: "Follow up after 3 and 7 days",
    actions: ["One written figure, what's included, instalments, refund rules", "Any discount above the standard rules needs owner approval", "Agreement sent for e-signature"],
    exit: "Agreement signed → request the Onboarding instalment",
  },
  {
    id: "onboarding", phase: "Onboard", title: "Onboarding", owner: "Advisor + finance", sla: "Case opened within 1 working day of payment",
    actions: ["Finance confirms the payment against the bank statement or Razorpay record — never a screenshot", "Convert the lead to a student and link their portal account", "Open the case, document checklist and timeline; kickoff call"],
    exit: "Student sees their journey, tasks and documents in the portal",
  },
  {
    id: "applications", phase: "Deliver", title: "Tests and applications", owner: "Advisor; document reviewer checks files", sla: "Weekly update while active",
    actions: ["English and entrance test bookings", "SOP and CV reviewed in at least two drafts", "Every application submitted 7+ days before its deadline"],
    exit: "All planned applications submitted → Applications instalment",
  },
  {
    id: "admission", phase: "Deliver", title: "Admission, pre-enrolment and recognition", owner: "Advisor", sla: "Weekly update while active",
    actions: ["Compare offers with the student and family", "Universitaly pre-enrolment", "DOV or CIMEA; DSU and ISEE parificato if applying"],
    exit: "First admission letter → Admission instalment",
  },
  {
    id: "visa", phase: "Deliver", title: "Visa file", owner: "Advisor; reviewer checks every page", sla: "File checked 7+ days before the appointment",
    actions: ["Funds, accommodation, insurance and forms per the consulate's current checklist", "Mock interview", "The student books and pays the appointment themselves"],
    exit: "File complete → Visa instalment. The consulate decides.",
  },
  {
    id: "arrival", phase: "Deliver", title: "Departure and arrival", owner: "Advisor", sla: "Check-in in week 1 and week 4",
    actions: ["Pre-departure briefing", "Residence permit, tax code and health registration guidance", "Final allowance reconciliation with receipts; refund anything unspent"],
    exit: "Visa granted → Arrival instalment (never charged if refused). Case closed after week 4; ask for an honest review and referrals.",
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
