import Link from "next/link";
import { siteConfig } from "@/config/site";
import { countries } from "@/content/countries";
import { Logo } from "@/components/layout/logo";
import { whatsappUrl } from "@/lib/whatsapp";
import { ThemeSwitcher } from "@/components/theme/theme-controls";

const columns = [
  {
    title: "Destinations",
    links: [{ href: "/destinations", label: "All destinations" }, ...countries.map((c) => ({ href: `/destinations/${c.slug}`, label: c.name }))],
  },
  {
    title: "Services",
    links: [
      { href: "/services", label: "All services" },
      { href: "/services/masters-admissions", label: "Master's applications" },
      { href: "/services/visa-preparation", label: "Study visa preparation" },
      { href: "/services/work-pathways", label: "Work pathways" },
    ],
  },
  {
    title: "AsterPath",
    links: [
      { href: "/how-it-works", label: "How we work" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact", label: "Contact" },
      { href: "/sign-in", label: "Student sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-paper-deep/60">
      <div className="page-container grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-5 font-serif text-2xl leading-snug text-ink">{siteConfig.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            International education guidance for students applying from India to Italy, Germany and France.
          </p>
          <ThemeSwitcher className="mt-6" />
          <div className="mt-6 space-y-1.5 text-sm">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="block text-ink hover:text-primary">
              WhatsApp {siteConfig.whatsapp.display}
            </a>
            <a href={`mailto:${siteConfig.contactEmail}`} className="block text-ink hover:text-primary">
              {siteConfig.contactEmail}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-medium text-ink">{column.title}</h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="page-container flex flex-col gap-4 pt-6 pb-24 text-xs leading-relaxed text-muted sm:pb-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl">
            AsterPath provides guidance and preparation support. Admission decisions are made by universities and visa decisions by
            government authorities. We do not guarantee admission, scholarships, employment or visa outcomes.
          </p>
          <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <span>© {new Date().getFullYear()} {siteConfig.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
