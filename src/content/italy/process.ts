import type { SourceId } from "@/content/italy/sources";

export type ProcessStage = {
  number: number;
  slug: string;
  title: string;
  summary: string;
  /** Typical window for an autumn (September/October) intake. */
  timing: string;
  weDo: string[];
  youDo: string[];
  outcome: string;
  sources: SourceId[];
};

export const processStages: ProcessStage[] = [
  {
    number: 1,
    slug: "documents",
    title: "Passport and document foundation",
    summary: "Most delays start here: an expiring passport, a name spelt two ways, a certificate attested at the wrong office. We fix the foundation first.",
    timing: "8–12 months before the intake",
    weDo: [
      "Audit your passport, certificates and marksheets for validity, names and dates",
      "Plan the attestation chain: state Higher Education Department, then MEA apostille or e-Sanad",
      "Flag name mismatches early and explain the “One and the same name” certificate",
      "Build your personal document checklist in the order you will need it",
    ],
    youDo: ["Renew or apply for your passport if needed", "Collect originals from your school and university"],
    outcome: "A complete, consistent document set and a dated attestation plan.",
    sources: ["meaApostille", "dovChecklistMumbai"],
  },
  {
    number: 2,
    slug: "english",
    title: "English test planning and preparation",
    summary: "Italian universities set their own language rules. We tell you exactly which test and score each shortlisted programme accepts — before you pay for one.",
    timing: "6–10 months before the intake",
    weDo: [
      "Check each programme's accepted tests and minimum scores (IELTS, TOEFL, others where accepted)",
      "Confirm whether a Medium of Instruction letter is accepted anywhere on your list",
      "Set a test date that leaves time for a retake before application deadlines",
      "Guide your preparation and track your score against your shortlist",
    ],
    youDo: ["Book and sit the test", "Share your score report with us"],
    outcome: "A test result that meets every programme on your final list.",
    sources: ["studyInItaly"],
  },
  {
    number: 3,
    slug: "applications",
    title: "University applications and enrolment",
    summary: "From shortlist to confirmed place: applications, admission, Universitaly pre-enrolment and your Declaration of Value or CIMEA statement.",
    timing: "4–9 months before the intake",
    weDo: [
      "Build a reasoned shortlist with requirements, deadlines and costs from official university pages",
      "Prepare and review every application, SOP and CV with you",
      "Pay university application fees within your package allowance",
      "Guide your Universitaly pre-enrolment and the university's validation",
      "Prepare your DOV file for the correct Italian mission, or your CIMEA request where accepted",
    ],
    youDo: ["Submit applications from your own accounts", "Attend any interviews or tests"],
    outcome: "An admission letter, validated Universitaly pre-enrolment and DOV or CIMEA in progress.",
    sources: ["universitaly", "cimea", "dovChecklistMumbai"],
  },
  {
    number: 4,
    slug: "visa",
    title: "Visa and documentation",
    summary: "A study visa file built line by line against the current checklist of your jurisdictional mission — reviewed before your appointment, not after a refusal.",
    timing: "2–4 months before the intake",
    weDo: [
      "Identify the correct mission and VFS centre for where you live",
      "Build your checklist from the mission's current requirements",
      "Review proof of funds against the current minimum, accommodation and insurance",
      "Prepare you for the in-person biometrics appointment",
    ],
    youDo: ["Arrange funds and sponsor documents", "Attend your appointment in person"],
    outcome: "A complete, reviewed visa application submitted on time.",
    sources: ["vistoPerItalia", "embassyDelhi"],
  },
  {
    number: 5,
    slug: "arrival",
    title: "Arrival and settling in",
    summary: "Landing is not the finish line. Your first weeks bring a residence permit, registrations and — if eligible — your DSU scholarship formalities.",
    timing: "First weeks in Italy",
    weDo: [
      "Walk you through the residence permit (permesso di soggiorno) application after arrival",
      "Explain your tax code (codice fiscale), university registration and health cover",
      "Guide DSU follow-ups and ISEE parificato where you have applied",
    ],
    youDo: ["Submit your residence permit application in person", "Complete your university enrolment on arrival"],
    outcome: "Registered, permitted to stay and enrolled — with a contact who knows your file.",
    sources: ["studyInItaly"],
  },
];
