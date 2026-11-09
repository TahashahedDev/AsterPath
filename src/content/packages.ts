/**
 * Italy service packages — founder-proposed, for discussion.
 *
 * Not validated prices or contractual offers. In Phase 6 they move to
 * service_packages / payment_milestones and become admin-editable. The included
 * university-fee allowances change the economics of each package: confirm the
 * amounts with the founder before launch.
 */

export type PackageMilestone = { label: string; amount: number }; // INR, whole rupees

export type ServicePackage = {
  slug: string;
  name: string;
  audience: string;
  startingPrice: number; // INR, whole rupees
  highlighted: boolean;
  features: string[];
  /** Third-party fees AsterPath pays on the student's behalf within this package. */
  includedFees: string[];
  milestones: PackageMilestone[];
};

export const packagesStatus = {
  approved: false,
  note: "Indicative starting prices. Your final quote is confirmed in writing after a free consultation, before you pay anything.",
} as const;

/** Allowances for university fees included in packages — founder to confirm. */
export const feeAllowances = {
  applicationUniversities: 5,
  applicationFeesEur: 150,
} as const;

export const servicePackages: ServicePackage[] = [
  {
    slug: "admissions",
    name: "Admissions",
    audience: "For students who want expert help getting into the right Italian programmes.",
    startingPrice: 39_900,
    highlighted: false,
    features: [
      "Profile evaluation and course matching",
      `Shortlist and applications to up to ${feeAllowances.applicationUniversities} universities`,
      "SOP and CV review",
      "Universitaly pre-enrolment guidance",
      "DOV / CIMEA file preparation",
      "Dedicated advisor",
    ],
    includedFees: [`University application fees, up to €${feeAllowances.applicationFeesEur} in total`],
    milestones: [
      { label: "Onboarding and document plan", amount: 15_000 },
      { label: "Applications submitted", amount: 24_900 },
    ],
  },
  {
    slug: "complete",
    name: "Complete Journey",
    audience: "From your first shortlist to your Italian study visa — the full process.",
    startingPrice: 99_000,
    highlighted: true,
    features: [
      "Everything in Admissions",
      "Admission and enrolment support",
      "Regional DSU scholarship and ISEE parificato guidance",
      "Study visa file preparation and review",
      "Biometrics appointment preparation",
      "Pre-departure checklist",
    ],
    includedFees: [
      `University application fees, up to €${feeAllowances.applicationFeesEur} in total`,
      "Enrolment administrative fees at your chosen university (regional tax and revenue stamp)",
    ],
    milestones: [
      { label: "Onboarding and document plan", amount: 15_000 },
      { label: "Shortlist and applications", amount: 30_000 },
      { label: "Admission, Universitaly pre-enrolment and DOV", amount: 29_000 },
      { label: "Visa preparation", amount: 25_000 },
    ],
  },
  {
    slug: "concierge",
    name: "Complete + Arrival",
    audience: "For students and families who want us beside them until they are settled in Italy.",
    startingPrice: 139_000,
    highlighted: false,
    features: [
      "Everything in Complete Journey",
      "Coordination of notary, HRD attestation, apostille and translations",
      "Accommodation search guidance",
      "Residence permit (permesso di soggiorno) guidance on arrival",
      "Codice fiscale, registration and health cover guidance",
      "Priority advisor availability",
    ],
    includedFees: [
      `University application fees, up to €${feeAllowances.applicationFeesEur} in total`,
      "Enrolment administrative fees at your chosen university (regional tax and revenue stamp)",
    ],
    milestones: [
      { label: "Onboarding and document plan", amount: 20_000 },
      { label: "Shortlist and applications", amount: 35_000 },
      { label: "Admission, Universitaly pre-enrolment and DOV", amount: 34_000 },
      { label: "Visa preparation", amount: 30_000 },
      { label: "Arrival support", amount: 20_000 },
    ],
  },
];

/** Third-party costs never included in AsterPath's package price. */
export const packageExclusions = [
  "University tuition and contributions",
  "IELTS, TOEFL or other test fees",
  "Notary charges",
  "State HRD attestation fees",
  "MEA apostille fees",
  "Translation charges",
  "Paid DOV or CIMEA fees",
  "Visa fees and VFS service charges",
  "Health and travel insurance",
  "Flights",
  "Accommodation rent and deposits",
  "Residence permit fees in Italy",
  "Courier charges",
];

export type ComparisonRow = { feature: string; values: Record<ServicePackage["slug"], boolean | string> };

export const packageComparison: ComparisonRow[] = [
  { feature: "Free first consultation", values: { admissions: true, complete: true, concierge: true } },
  { feature: "Dedicated advisor", values: { admissions: true, complete: true, concierge: "Priority" } },
  { feature: "University applications", values: { admissions: `Up to ${feeAllowances.applicationUniversities}`, complete: `Up to ${feeAllowances.applicationUniversities}`, concierge: `Up to ${feeAllowances.applicationUniversities}` } },
  { feature: "Application fees included", values: { admissions: `Up to €${feeAllowances.applicationFeesEur}`, complete: `Up to €${feeAllowances.applicationFeesEur}`, concierge: `Up to €${feeAllowances.applicationFeesEur}` } },
  { feature: "Universitaly pre-enrolment", values: { admissions: true, complete: true, concierge: true } },
  { feature: "DOV / CIMEA preparation", values: { admissions: true, complete: true, concierge: true } },
  { feature: "Enrolment administrative fees included", values: { admissions: false, complete: true, concierge: true } },
  { feature: "DSU scholarship and ISEE guidance", values: { admissions: false, complete: true, concierge: true } },
  { feature: "Study visa file and review", values: { admissions: false, complete: true, concierge: true } },
  { feature: "Attestation, apostille and translation coordination", values: { admissions: false, complete: false, concierge: true } },
  { feature: "Arrival: permesso di soggiorno guidance", values: { admissions: false, complete: false, concierge: true } },
];
