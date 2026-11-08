/**
 * Proposed service packages — Phase 1 seed.
 *
 * These are founder-proposed starting points for discussion, NOT validated
 * prices or contractual offers. In Phase 6 they move to service_packages /
 * package_features / payment_milestones and become admin-editable. Nothing in
 * application logic should read prices from here directly once that lands.
 */

export type PackageMilestone = {
  label: string;
  amount: number; // INR, whole rupees
};

export type ServicePackage = {
  slug: string;
  name: string;
  audience: string;
  startingPrice: number; // INR, whole rupees
  highlighted: boolean;
  features: string[];
  /** Example schedule only — the real schedule is confirmed in each student's written agreement. */
  exampleMilestones: PackageMilestone[] | null;
};

export const packagesStatus = {
  approved: false,
  note: "Indicative starting prices. Your final quote is confirmed in writing after a free profile assessment.",
} as const;

export const servicePackages: ServicePackage[] = [
  {
    slug: "application-starter",
    name: "Application Starter",
    audience: "For students who need focused help choosing universities and applying.",
    startingPrice: 39_900,
    highlighted: false,
    features: [
      "Academic profile evaluation",
      "University and course shortlist",
      "Application assistance for an agreed number of programmes",
      "Statement of purpose and CV feedback",
      "Document checklist and review",
      "Student portal with progress tracking",
    ],
    exampleMilestones: null,
  },
  {
    slug: "complete-journey",
    name: "Complete Journey",
    audience: "For students who want support from shortlist through to visa preparation.",
    startingPrice: 99_000,
    highlighted: true,
    features: [
      "Everything in Application Starter",
      "Admission and enrolment support",
      "Country-specific pre-enrolment, where applicable",
      "Study visa document preparation and review",
      "Visa appointment guidance",
      "Scholarship guidance",
      "Pre-departure checklist",
    ],
    exampleMilestones: [
      { label: "Initial onboarding", amount: 15_000 },
      { label: "University shortlist and application stage", amount: 30_000 },
      { label: "Admission, enrolment and applicable pre-enrolment support", amount: 29_000 },
      { label: "Visa preparation stage", amount: 25_000 },
    ],
  },
  {
    slug: "concierge-support",
    name: "Concierge Support",
    audience: "For students who want a more comprehensive level of coordination and support.",
    startingPrice: 139_000,
    highlighted: false,
    features: [
      "Everything in Complete Journey",
      "Coordination of translations, apostilles and legalisation with authorised partners",
      "Priority advisor availability",
      "Accommodation search guidance",
      "Post-arrival orientation and registration guidance",
    ],
    exampleMilestones: null,
  },
];

/** Third-party costs that are never included in AsterPath's package price. */
export const packageExclusions = [
  "University application fees",
  "Government visa fees",
  "Visa centre and appointment fees",
  "Courier charges",
  "Translation charges",
  "Apostille and legalisation fees",
  "University tuition and deposits",
  "Health and travel insurance",
  "Flights and travel",
  "Any other external third-party expenses",
];

export type ComparisonRow = {
  feature: string;
  values: Record<ServicePackage["slug"], boolean | string>;
};

export const packageComparison: ComparisonRow[] = [
  { feature: "Academic profile evaluation", values: { "application-starter": true, "complete-journey": true, "concierge-support": true } },
  { feature: "University and course shortlist", values: { "application-starter": true, "complete-journey": true, "concierge-support": true } },
  { feature: "Application assistance", values: { "application-starter": "Agreed number", "complete-journey": "Agreed number", "concierge-support": "Agreed number" } },
  { feature: "SOP and CV feedback", values: { "application-starter": true, "complete-journey": true, "concierge-support": true } },
  { feature: "Admission and enrolment support", values: { "application-starter": false, "complete-journey": true, "concierge-support": true } },
  { feature: "National pre-enrolment, where applicable", values: { "application-starter": false, "complete-journey": true, "concierge-support": true } },
  { feature: "Visa document preparation", values: { "application-starter": false, "complete-journey": true, "concierge-support": true } },
  { feature: "Scholarship guidance", values: { "application-starter": false, "complete-journey": true, "concierge-support": true } },
  { feature: "Translation, apostille and legalisation coordination", values: { "application-starter": false, "complete-journey": false, "concierge-support": true } },
  { feature: "Accommodation search guidance", values: { "application-starter": false, "complete-journey": false, "concierge-support": true } },
  { feature: "Post-arrival orientation", values: { "application-starter": false, "complete-journey": false, "concierge-support": true } },
  { feature: "Milestone-based payments", values: { "application-starter": true, "complete-journey": true, "concierge-support": true } },
];
