import Link from "next/link";
import { legalEntity, siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { Flag } from "@/components/marketing/flag";
import { ThemeSwitcher } from "@/components/theme/theme-controls";
import { whatsappUrl } from "@/lib/whatsapp";

const columns = [
  {
    title: "Study in Italy",
    links: [
      { href: "/study-in-italy", label: "Overview" },
      { href: "/study-in-italy/bachelors", label: "Bachelor's" },
      { href: "/study-in-italy/masters", label: "Master's" },
      { href: "/study-in-italy/phd", label: "PhD and research" },
      { href: "/universities", label: "Universities" },
      { href: "/scholarships", label: "Scholarships (DSU)" },
    ],
  },
  {
    title: "Working with us",
    links: [
      { href: "/process", label: "How we work" },
      { href: "/documents", label: "Documents and DOV" },
      { href: "/pricing", label: "The plan" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Free consultation" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/refunds", label: "Refunds and cancellation" },
      { href: "/legal/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-border bg-paper-deep/60">
      <div className="page-container grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="display mt-6 text-3xl leading-tight text-ink">{siteConfig.positioning}</p>
          <p className="mt-4 flex items-center gap-2 text-sm leading-relaxed text-muted">
            <Flag code="india" className="h-3 w-[1.125rem]" />
            <span aria-hidden="true">→</span>
            <Flag code="italy" className="h-3 w-[1.125rem]" />
            An Italy specialist for students from India.
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
              <h2 className="text-sm font-semibold text-ink">{column.title}</h2>
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
        <div className="page-container flex flex-col gap-4 pt-6 pb-24 text-xs leading-relaxed text-muted sm:pb-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <p>
              AsterPath provides guidance and preparation support. Admission decisions are made by universities, scholarship decisions by the awarding bodies,
              and visa decisions by the Italian authorities. We do not guarantee admission, scholarships or visas, and we are not affiliated with the Italian
              government or any university.
            </p>
            <p>
              {legalEntity.registeredName} · {legalEntity.registeredAddress}
            </p>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
