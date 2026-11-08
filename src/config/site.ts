/**
 * Public, non-secret site settings. Values that differ per deployment come from
 * NEXT_PUBLIC_* variables so they can change without a code edit. These will move
 * to admin-editable site settings once the database exists.
 */
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "393331104575").replace(/\D/g, "");

export const siteConfig = {
  name: "AsterPath",
  tagline: "Your next chapter starts here.",
  description:
    "AsterPath helps students from India apply to universities in Italy, Germany and France — with transparent pricing, milestone payments and honest guidance at every step.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@asterpath.example",
  whatsapp: {
    number: whatsappNumber,
    display: formatWhatsappDisplay(whatsappNumber),
    defaultMessage:
      "Hello AsterPath, I am interested in studying in Europe and would like to discuss my options.",
  },
} as const;

function formatWhatsappDisplay(digits: string): string {
  // Italian mobile numbers: +39 333 110 4575 style grouping; fall back to raw digits.
  if (digits.startsWith("39") && digits.length === 12) {
    return `+39 ${digits.slice(2, 5)} ${digits.slice(5, 12)}`;
  }
  return `+${digits}`;
}

export const mainNav = [
  { href: "/destinations", label: "Destinations" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How we work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;
