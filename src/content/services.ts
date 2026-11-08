/**
 * Service catalogue — Phase 1 seed. Will become admin-editable content.
 *
 * `fulfilment` makes explicit who actually performs the work. AsterPath does not
 * itself certify translations, issue apostilles or decide admissions and visas.
 */

export type ServiceCategory = "study" | "work" | "documents" | "support";

export type Fulfilment =
  | { by: "asterpath"; note: string }
  | { by: "partner"; note: string }
  | { by: "authority"; note: string };

export type ServiceIcon =
  | "graduation"
  | "book"
  | "flask"
  | "building"
  | "compass"
  | "clipboard"
  | "send"
  | "badge"
  | "passport"
  | "briefcase"
  | "award"
  | "stamp"
  | "scale"
  | "languages"
  | "plane"
  | "home";

export type Service = {
  slug: string;
  title: string;
  category: ServiceCategory;
  icon: ServiceIcon;
  summary: string;
  description: string;
  includes: string[];
  limits: string[];
  fulfilment: Fulfilment;
};

export const serviceCategories: Record<ServiceCategory, { label: string; description: string }> = {
  study: { label: "Admissions", description: "Choosing and applying to the right programmes." },
  work: { label: "Work pathways", description: "Understanding official routes to work after or alongside study." },
  documents: { label: "Documents & visas", description: "Preparing paperwork carefully and on time." },
  support: { label: "Before & after you fly", description: "Getting ready to leave and settling in." },
};

const directly = (note: string): Fulfilment => ({ by: "asterpath", note });

export const services: Service[] = [
  {
    slug: "bachelors-admissions",
    title: "Bachelor's applications",
    category: "study",
    icon: "graduation",
    summary: "Undergraduate applications for students finishing Class 12 or equivalent.",
    description:
      "We help you understand which bachelor's programmes accept your school qualifications, what entrance or language requirements apply, and how to put together a complete application for each university.",
    includes: [
      "Eligibility check against each programme's published requirements",
      "Application calendar for your intake",
      "Document checklist and review before submission",
      "Statement of purpose feedback",
    ],
    limits: [
      "Admission decisions are made by universities",
      "University application fees are paid directly by you",
    ],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "masters-admissions",
    title: "Master's applications",
    category: "study",
    icon: "book",
    summary: "Postgraduate applications matched to your degree, experience and goals.",
    description:
      "Master's admissions in Europe often hinge on how closely your previous degree matches the programme. We map your coursework against each programme's entry requirements so you apply where you have a genuine chance.",
    includes: [
      "Academic profile review and credit-match notes",
      "Programme shortlist with reasoning",
      "CV and statement of purpose feedback",
      "Submission tracking for each application",
    ],
    limits: [
      "Admission decisions are made by universities",
      "University application fees are paid directly by you",
    ],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "phd-guidance",
    title: "PhD guidance",
    category: "study",
    icon: "flask",
    summary: "Orientation on doctoral routes, funded positions and research proposals.",
    description:
      "Doctoral admissions work differently from taught degrees — often through funded calls or direct contact with supervisors. We explain the routes in each country and help you prepare a strong, honest application.",
    includes: [
      "Overview of doctoral pathways by country",
      "Guidance on finding open calls and funded positions",
      "Feedback on research proposal structure and CV",
    ],
    limits: [
      "We do not contact supervisors on your behalf",
      "Funding and selection decisions are made by institutions",
    ],
    fulfilment: directly("Guidance from your AsterPath advisor."),
  },
  {
    slug: "university-selection",
    title: "University & course selection",
    category: "study",
    icon: "building",
    summary: "A reasoned shortlist built from your profile, budget and ambitions.",
    description:
      "We compare programmes on what matters to you — entry requirements, teaching language, costs, location and career relevance — and explain the trade-offs so you make the final choice with confidence.",
    includes: [
      "Shortlist with requirements, costs and deadlines from official sources",
      "Source links and the date each detail was checked",
      "A conversation to refine the list together",
    ],
    limits: ["Rankings and outcomes are never presented as guarantees"],
    fulfilment: directly("Researched and reviewed by your AsterPath advisor."),
  },
  {
    slug: "profile-evaluation",
    title: "Academic profile evaluation",
    category: "study",
    icon: "compass",
    summary: "An honest read of where you stand and what could strengthen your application.",
    description:
      "Before you spend money on applications, we review your academic record, test scores and experience against typical requirements in your chosen countries, and tell you clearly where the gaps are.",
    includes: [
      "Review of grades, degree structure and test results",
      "Country-by-country fit notes",
      "Practical suggestions to strengthen your profile",
    ],
    limits: ["An evaluation is advice, not a prediction of admission"],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "application-assistance",
    title: "University application assistance",
    category: "study",
    icon: "send",
    summary: "Careful, complete applications — submitted by you, prepared together.",
    description:
      "We help you fill in each university portal correctly, assemble the right documents in the right format, and keep track of every deadline and follow-up request.",
    includes: [
      "Portal walkthroughs and form review",
      "Document formatting and naming checks",
      "Deadline and status tracking",
    ],
    limits: [
      "You submit applications from your own accounts",
      "University application fees are paid directly by you",
    ],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "enrollment-support",
    title: "Admission & enrolment support",
    category: "study",
    icon: "badge",
    summary: "From offer letter to confirmed enrolment, including national pre-enrolment where it applies.",
    description:
      "After an offer, there is usually a sequence of acceptance, deposit, registration and — in some countries — a national pre-enrolment step. We help you complete each one in the right order.",
    includes: [
      "Offer comparison and acceptance steps",
      "Country-specific pre-enrolment guidance (for example, Universitaly in Italy)",
      "Enrolment document checklist",
    ],
    limits: ["Deposits and tuition are paid directly to the university"],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "visa-preparation",
    title: "Study visa preparation",
    category: "documents",
    icon: "passport",
    summary: "A clear checklist, careful document review and appointment guidance.",
    description:
      "We prepare you for your study visa application: what the consulate or visa centre asks for in your situation, how to present your documents, and what to expect at the appointment.",
    includes: [
      "Personalised document checklist based on current official guidance",
      "Review of forms and supporting documents before your appointment",
      "Appointment preparation",
    ],
    limits: [
      "Visa decisions are made solely by the relevant government authorities",
      "Government visa fees and visa-centre charges are paid directly by you",
    ],
    fulfilment: {
      by: "authority",
      note: "AsterPath prepares and reviews. The consulate or embassy decides.",
    },
  },
  {
    slug: "work-pathways",
    title: "Work pathway guidance",
    category: "work",
    icon: "briefcase",
    summary: "Understanding the official routes to work during and after your studies.",
    description:
      "Each country sets its own rules on working while studying, post-study stay and work permits. We explain the official routes that may apply to you, help you plan realistically, and prepare the documents for the permits you choose to pursue.",
    includes: [
      "Overview of official work and post-study routes in your destination",
      "CV guidance for European employers",
      "Document preparation for work-related permit applications",
    ],
    limits: [
      "We are not a recruitment agency and do not place candidates in jobs",
      "Work permits are decided by government authorities",
    ],
    fulfilment: { by: "authority", note: "AsterPath guides and prepares. Authorities decide." },
  },
  {
    slug: "scholarship-guidance",
    title: "Scholarship guidance",
    category: "study",
    icon: "award",
    summary: "Finding the calls you may be eligible for and applying well.",
    description:
      "Scholarships in Europe come from governments, regions, foundations and universities, each with separate rules. We help you find realistic options and prepare strong applications on time.",
    includes: [
      "Search for calls matched to your profile and destination",
      "Eligibility notes with official links",
      "Application and essay feedback",
    ],
    limits: ["Awards are decided by the scholarship provider"],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "apostille-coordination",
    title: "Apostille coordination",
    category: "documents",
    icon: "stamp",
    summary: "Helping you get the right documents apostilled through the proper channels.",
    description:
      "Apostilles are issued by the competent government authority. We tell you which documents need one for your destination, coordinate with authorised service providers where you choose, and track the process.",
    includes: [
      "Which documents need an apostille, and in what order",
      "Coordination with authorised agencies, if you choose",
      "Tracking until documents are returned",
    ],
    limits: [
      "Apostilles are issued by the government — AsterPath does not issue them",
      "Government and agency fees are passed through at cost and shown upfront",
    ],
    fulfilment: { by: "partner", note: "Issued by the government; coordinated through authorised agencies." },
  },
  {
    slug: "legalization-coordination",
    title: "Legalisation coordination",
    category: "documents",
    icon: "scale",
    summary: "Attestation and legalisation steps when an apostille is not the right route.",
    description:
      "Some documents or destinations require attestation or consular legalisation instead of, or as well as, an apostille. We work out the correct chain for your documents and coordinate it with you.",
    includes: [
      "Document-by-document legalisation plan",
      "Coordination with authorised agencies, if you choose",
      "Tracking and status updates",
    ],
    limits: [
      "Legalisation is performed by government authorities — AsterPath does not legalise documents",
      "Third-party fees are shown upfront and are not part of our package price",
    ],
    fulfilment: { by: "partner", note: "Performed by authorities; coordinated through authorised agencies." },
  },
  {
    slug: "translation-coordination",
    title: "Certified translation coordination",
    category: "documents",
    icon: "languages",
    summary: "Arranging translations by qualified translators where your destination requires them.",
    description:
      "Universities and consulates may ask for translations by sworn or certified translators. We identify which documents need them and coordinate with qualified partners.",
    includes: [
      "Which documents need translation, and to what standard",
      "Coordination with qualified translators",
      "Checks for consistency with original documents",
    ],
    limits: [
      "AsterPath does not produce certified translations itself",
      "Translation charges are separate and shown upfront",
    ],
    fulfilment: { by: "partner", note: "Performed by qualified, independent translators." },
  },
  {
    slug: "document-verification",
    title: "Document review",
    category: "documents",
    icon: "clipboard",
    summary: "A careful second pair of eyes on every document before it goes anywhere.",
    description:
      "We check your documents for completeness, consistency of names and dates, formatting and the requirements of where they are being sent — so avoidable mistakes don't cost you time.",
    includes: [
      "Completeness and consistency checks",
      "Feedback and re-upload requests in your student portal",
      "Version history of every document",
    ],
    limits: ["We cannot certify that a document is genuine or legally valid"],
    fulfilment: directly("Reviewed by AsterPath document reviewers."),
  },
  {
    slug: "pre-departure",
    title: "Pre-departure guidance",
    category: "support",
    icon: "plane",
    summary: "Accommodation, insurance, packing and first-week planning.",
    description:
      "Once your visa is in hand, we help you plan the practical side of moving: where to live, what insurance you need, what to carry and what to do in your first days.",
    includes: [
      "Pre-departure checklist for your destination",
      "Accommodation search guidance",
      "First-week plan",
    ],
    limits: ["Travel, insurance and accommodation costs are paid directly by you"],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
  {
    slug: "post-arrival",
    title: "Post-arrival orientation",
    category: "support",
    icon: "home",
    summary: "Help with registrations and residence procedures after you land.",
    description:
      "The first weeks abroad come with their own paperwork — local registration, residence permits and university formalities. We walk you through each step for your city.",
    includes: [
      "Local registration and residence permit guidance",
      "University onboarding checklist",
      "A point of contact while you settle in",
    ],
    limits: ["Residence permits are issued by local authorities"],
    fulfilment: directly("Delivered by your AsterPath advisor."),
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
