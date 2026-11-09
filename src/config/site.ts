/**
 * Public, non-secret site settings. Values that differ per deployment come from
 * NEXT_PUBLIC_* variables so they can change without a code edit. These will move
 * to admin-editable site settings once the database exists.
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "393331104575").replace(/\D/g, "");

export const siteConfig = {
  name: "AsterPath",
  tagline: "Your next chapter starts here.",
  positioning: "Study in Italy, done properly.",
  description:
    "AsterPath is an Italy-specialist study consultancy for Indian students: university applications, Universitaly pre-enrolment, DOV and attestation, regional DSU scholarships and your Italian study visa — with published prices and one dedicated advisor.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@asterpath.example",
  whatsapp: {
    number: whatsappNumber,
    display: formatWhatsappDisplay(whatsappNumber),
    defaultMessage: "Hello AsterPath, I am interested in studying in Italy and would like to discuss my options.",
  },
} as const;

/**
 * Legal identity shown in the terms, privacy policy and footer.
 * Every value here is a placeholder until the founder supplies the real details.
 */
export const legalEntity = {
  confirmed: false,
  registeredName: "[Registered business name]",
  entityType: "[Entity type — e.g. Private Limited / LLP / Proprietorship]",
  registeredAddress: "[Registered office address]",
  gstin: "[GSTIN, if registered]",
  grievanceOfficer: "[Grievance officer name]",
  grievanceEmail: "[grievance email]",
  governingCity: "[City for jurisdiction of courts]",
} as const;

/** Real team members, shown on /about. Leave empty until the founder supplies details. */
export const founders: { name: string; role: string; bio: string; photo?: string }[] = [];

/**
 * Service commitments shown on the site. These are promises to students —
 * keep them true. Response times must match how the team actually works.
 */
export const commitments = {
  responseTimeWorkingDays: 1,
  activeStageUpdateCadence: "weekly",
} as const;

function formatWhatsappDisplay(digits: string): string {
  // Italian mobile numbers: +39 333 110 4575 style grouping; fall back to raw digits.
  if (digits.startsWith("39") && digits.length === 12) {
    return `+39 ${digits.slice(2, 5)} ${digits.slice(5, 12)}`;
  }
  return `+${digits}`;
}

export const mainNav = [
  { href: "/study-in-italy", label: "Study in Italy" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/process", label: "How we work" },
  { href: "/documents", label: "Documents" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
] as const;
