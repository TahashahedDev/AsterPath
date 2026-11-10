import type { SourceId } from "@/content/italy/sources";

/**
 * The AsterPath service catalogue. Every service separates what AsterPath does,
 * what the student does, and who actually decides or issues the outcome.
 * AsterPath coordinates; universities, regional offices, consulates and
 * authorised bodies decide and issue. Keep it that way.
 */

export type ServicePhase = "before" | "admission" | "documents" | "arrival";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  phase: ServicePhase;
  weDo: string[];
  youDo: string[];
  /** Who makes the decision or issues the document. AsterPath never does. */
  decidedBy: string;
  /** Authorised third party that issues or performs the step, where there is one. */
  authorisedBody?: string;
  /** Italy-specific services name the destination; the rest apply to every destination we open. */
  destination?: "italy";
  /** Offered on request only, outside the standard journey. */
  onRequest?: boolean;
  sources?: SourceId[];
};

export const servicePhases: { id: ServicePhase; number: string; title: string; accent: string; description: string }[] = [
  {
    id: "before",
    number: "01",
    title: "Before you",
    accent: "apply.",
    description: "An honest read of where you stand, and a shortlist built from official requirements rather than rankings or hearsay.",
  },
  {
    id: "admission",
    number: "02",
    title: "Applications",
    accent: "and admission.",
    description: "Every application prepared and reviewed with you, then the enrolment and pre-enrolment steps that turn an offer into a place.",
  },
  {
    id: "documents",
    number: "03",
    title: "Documents",
    accent: "and visa.",
    description: "Translations, attestation, apostille and the visa file, planned in the right order and checked against the current official checklist.",
  },
  {
    id: "arrival",
    number: "04",
    title: "Departure",
    accent: "and arrival.",
    description: "Preparing to leave, and the registrations of your first weeks abroad, with someone who already knows your file.",
  },
];

export const services: Service[] = [
  {
    slug: "profile-evaluation",
    title: "Profile evaluation",
    summary: "A clear, honest view of what is realistic for you, before you commit to anything.",
    phase: "before",
    weDo: [
      "Review your marks, degree, subjects, test plans and budget",
      "Explain which levels and programme types you are likely to be eligible for",
      "Tell you plainly where your profile is weak and what would strengthen it",
    ],
    youDo: ["Share accurate marksheets, certificates and your budget", "Tell us what you want to study and why"],
    decidedBy: "You decide whether to go ahead. Eligibility itself is decided by each university.",
  },
  {
    slug: "university-selection",
    title: "University selection",
    summary: "A reasoned shortlist with requirements, deadlines and costs taken from each university's own pages.",
    phase: "before",
    weDo: [
      "Build a shortlist matched to your marks, subject and budget",
      "Check entry requirements, language rules and deadlines on official university pages",
      "Explain the trade-offs between cities, regions and programmes",
    ],
    youDo: ["Research the programmes on your list", "Choose your final list"],
    decidedBy: "You choose where to apply. Each university decides admission.",
    sources: ["universitaly"],
  },
  {
    slug: "application-assistance",
    title: "Application assistance",
    summary: "Every application, statement of purpose and CV prepared and reviewed with you, on time.",
    phase: "admission",
    weDo: [
      "Plan each application against its deadline and document list",
      "Review your statement of purpose and CV with you, draft by draft",
      "Check every upload before you submit",
    ],
    youDo: ["Write your own statement of purpose", "Submit applications from your own accounts", "Attend any interviews or tests"],
    decidedBy: "The university decides admission. No consultant can promise an offer.",
  },
  {
    slug: "enrolment-support",
    title: "Enrolment support",
    summary: "From offer letter to confirmed place: acceptance, enrolment steps and fee deadlines.",
    phase: "admission",
    weDo: [
      "Explain the offer and what the university needs from you next",
      "Track acceptance and enrolment deadlines",
      "Prepare the documents the university asks for at enrolment",
    ],
    youDo: ["Accept your offer", "Pay the enrolment fee from your own account where the consulate needs to see it"],
    decidedBy: "The university confirms enrolment.",
  },
  {
    slug: "pre-enrolment-universitaly",
    title: "Pre-enrolment on Universitaly",
    summary: "Italy's mandatory online pre-enrolment for international students, completed correctly and validated by your university.",
    phase: "admission",
    destination: "italy",
    weDo: ["Walk you through the Universitaly pre-enrolment form", "Check the details match your passport and admission", "Follow up on the university's validation"],
    youDo: ["Create your Universitaly account and submit the application yourself"],
    decidedBy: "Your university validates the pre-enrolment; the Italian mission uses it for your visa.",
    sources: ["universitaly"],
  },
  {
    slug: "scholarship-guidance",
    title: "Scholarship guidance (DSU)",
    summary: "Regional, means-tested DSU grants explained, with the ISEE parificato prepared months ahead.",
    phase: "admission",
    destination: "italy",
    weDo: [
      "Explain the DSU call for your university's region and its dates",
      "Plan the ISEE parificato documents from India",
      "Review your DSU application before you submit",
    ],
    youDo: ["Gather family income and asset documents", "Submit the DSU application in your own name"],
    decidedBy: "The regional DSU office decides awards from its own rules and rankings.",
    sources: ["murDsu", "iseeDocs"],
  },
  {
    slug: "translation-coordination",
    title: "Translation coordination",
    summary: "Certified translations arranged where a document needs one, and only where it does.",
    phase: "documents",
    weDo: ["Identify which documents need translation and into which language", "Arrange the work with a qualified translator", "Check names and dates in the translation against the original"],
    youDo: ["Provide clear copies of the originals"],
    decidedBy: "The receiving university, mission or office decides whether a translation is accepted.",
    authorisedBody: "Qualified or sworn translators",
  },
  {
    slug: "apostille-legalisation",
    title: "Apostille and legalisation coordination",
    summary: "The attestation chain planned in the right order, so no document goes to the wrong office.",
    phase: "documents",
    weDo: [
      "Plan the chain for each document: notary where needed, state HRD attestation, then MEA apostille",
      "Explain e-Sanad for digital documents",
      "Prepare the Declaration of Value or CIMEA request where your university needs one",
    ],
    youDo: ["Collect originals from your school and university", "Attend any office in person where required"],
    decidedBy: "Each authority checks and issues its own attestation. AsterPath does not issue any of them.",
    authorisedBody: "State Higher Education Department, Ministry of External Affairs, Italian missions in India or CIMEA",
    sources: ["meaApostille", "cimea"],
  },
  {
    slug: "visa-preparation",
    title: "Visa preparation assistance",
    summary: "A study visa file built line by line against your mission's current checklist, and filed early.",
    phase: "documents",
    weDo: [
      "Identify the correct mission and visa centre for where you live",
      "Build your checklist from the mission's current requirements",
      "Review funds, accommodation and insurance documents before your appointment",
      "Prepare you for the in-person appointment",
    ],
    youDo: ["Arrange funds and sponsor documents", "Book the appointment with your own email and phone, and attend in person"],
    decidedBy: "The consulate decides the visa. No one can guarantee one.",
    sources: ["vistoPerItalia"],
  },
  {
    slug: "departure-assistance",
    title: "Departure assistance",
    summary: "What to carry, what to book and when, so the last weeks at home are calm.",
    phase: "arrival",
    weDo: ["Give you a pre-departure checklist for documents and originals", "Explain accommodation search and what to check in a contract", "Tell you when to book flights"],
    youDo: ["Book flights and sign your accommodation contract", "Carry originals and copies as listed"],
    decidedBy: "Landlords and airlines; the contracts are yours.",
  },
  {
    slug: "arrival-support",
    title: "Arrival support",
    summary: "Your first weeks: residence permit, tax code, registration and health cover, explained step by step.",
    phase: "arrival",
    weDo: [
      "Walk you through the residence permit application after arrival",
      "Explain the tax code, university registration and health cover",
      "Guide scholarship follow-ups where you have applied",
    ],
    youDo: ["Submit your residence permit application in person", "Complete your registration on arrival"],
    decidedBy: "Local immigration authorities decide the residence permit.",
    sources: ["studyInItaly"],
  },
  {
    slug: "work-visa-pathway",
    title: "Work visa pathway guidance",
    summary: "On request: we explain the official routes and paperwork for working after study. We do not recruit, find jobs or place candidates.",
    phase: "arrival",
    onRequest: true,
    weDo: ["Explain the official post-study and work permit routes", "Help you understand the paperwork an employer or authority will ask for"],
    youDo: ["Find and secure your own job offer", "Apply to the authorities yourself"],
    decidedBy: "Employers decide hiring; immigration authorities decide permits.",
  },
];

export function servicesByPhase(phase: ServicePhase) {
  return services.filter((s) => s.phase === phase);
}

/** Bodies that issue or decide; AsterPath only coordinates with them. */
export const authorisedBodies = [
  { name: "Universities", role: "Decide admission and confirm enrolment" },
  { name: "Regional DSU offices", role: "Decide means-tested scholarships" },
  { name: "Sworn or qualified translators", role: "Produce certified translations" },
  { name: "State Higher Education Departments", role: "Attest academic documents" },
  { name: "Ministry of External Affairs", role: "Issues the apostille, including through e-Sanad" },
  { name: "Italian missions and CIMEA", role: "Issue the Declaration of Value or a CIMEA statement" },
  { name: "Consulates and immigration authorities", role: "Decide visas and residence permits" },
];
