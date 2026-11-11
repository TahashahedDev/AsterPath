/**
 * Public, non-secret site settings. Values that differ per deployment come from
 * NEXT_PUBLIC_* variables so they can change without a code edit. These will move
 * to admin-editable site settings once the database exists.
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "393311104575").replace(/\D/g, "");

/** The canonical origin: https, or plain http only on this machine. A bad value fails the build loudly. */
export function parseSiteUrl(raw: string | undefined): string {
  const url = new URL(raw ?? "http://localhost:3000");
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.username || url.password || url.search || url.hash || !(url.protocol === "https:" || (url.protocol === "http:" && local))) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an https origin such as https://asterpath.example");
  }
  return url.origin + url.pathname.replace(/\/$/, "");
}

export const siteConfig = {
  name: "AsterPath",
  tagline: "Your next chapter starts here.",
  positioning: "Study in Italy, done properly.",
  description:
    "Study in Italy from India with one dedicated advisor: universities, Universitaly, DOV and attestation, DSU scholarships and the study visa, in one plan.",
  url: parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@asterpath.example",
  /** False while the address is the reserved .example placeholder: never show it as a working address. */
  contactEmailLive: !(process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@asterpath.example").endsWith(".example"),
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
  entityType: "[Entity type, e.g. Private Limited, LLP or Proprietorship]",
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
  // Italian mobile numbers: +39 331 110 4575 style grouping; fall back to raw digits.
  if (digits.startsWith("39") && digits.length === 12) {
    return `+39 ${digits.slice(2, 5)} ${digits.slice(5, 12)}`;
  }
  return `+${digits}`;
}

export const mainNav = [
  { href: "/destinations", label: "Destinations" },
  { href: "/universities", label: "Universities" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "How it works" },
  { href: "/pricing", label: "The plan" },
] as const;
