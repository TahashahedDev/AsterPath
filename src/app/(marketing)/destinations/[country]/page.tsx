import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, Languages, MapPin, Trophy } from "lucide-react";
import { countries, getCountry } from "@/content/countries";
import { CheckList, ReviewStatus } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { Flag } from "@/components/marketing/flag";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";
import { destinationEnquiryMessage, whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ country: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return countries.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const country = getCountry((await params).country);
  if (!country) return {};
  return {
    title: `Study in ${country.name} from India`,
    description: `${country.headline} Universities, national procedures, documents and visa guidance for studying in ${country.name}.`,
    alternates: { canonical: `/destinations/${country.slug}` },
  };
}

export default async function CountryPage({ params }: Props) {
  const country = getCountry((await params).country);
  if (!country) notFound();

  const notes = [
    { icon: Languages, title: "Language requirements", body: country.languageNote },
    { icon: Trophy, title: "Scholarships", body: country.scholarshipNote },
    { icon: MapPin, title: "After you arrive", body: country.arrivalNote },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hairline-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="page-container relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="motion-safe:animate-rise">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <Link href="/destinations" className="hover:text-ink">Destinations</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span aria-current="page" className="text-ink">{country.name}</span>
            </nav>
            <Flag code={country.slug} label={`Flag of ${country.name}`} className="mt-8 h-12 w-[4.5rem]" />
            <h1 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">
              Study in <span className="serif-accent text-primary">{country.name}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{country.summary}</p>
          </div>
          <div className="flex flex-col gap-3 motion-safe:animate-rise motion-safe:[animation-delay:120ms] sm:flex-row lg:flex-col">
            <ButtonLink href={`/contact?destination=${country.slug}`} size="lg">Plan my {country.name} application</ButtonLink>
            <ExternalButtonLink href={whatsappUrl(destinationEnquiryMessage(country.name))} variant="secondary" size="lg">
              Ask about {country.name} on WhatsApp
            </ExternalButtonLink>
          </div>
        </div>
      </section>

      <div className="page-container">
        <ReviewStatus review={country.review} className="mt-8 rounded-xl border border-border bg-card px-5 py-4" />
      </div>

      <section className="page-container mt-16 grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <BookOpen className="size-7 text-primary" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Study opportunities</h2>
        </div>
        <CheckList items={country.studyHighlights} />
      </section>

      <section className="page-container mt-20">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Key procedures</h2>
        <p className="mt-3 max-w-2xl text-muted">The main stages most applicants from India go through. The exact order and requirements depend on your programme and circumstances.</p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2">
          {country.procedures.map((procedure, index) => (
            <li key={procedure.title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="font-serif text-3xl text-gold-deep tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{procedure.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{procedure.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-container mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep/60 p-7 sm:p-9">
          <h2 className="text-2xl font-semibold tracking-tight">Documents commonly requested</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
            Not everyone needs everything. Your personal checklist depends on your programme, university, intake and circumstances.
          </p>
          <CheckList items={country.commonDocuments} className="mt-6" />
        </div>
        <div className="grid gap-8">
          {notes.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                <Icon className="size-5 text-primary" strokeWidth={1.6} aria-hidden="true" /> {title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container mt-20">
        <h2 className="text-2xl font-semibold tracking-tight">Official sources</h2>
        <p className="mt-3 max-w-2xl text-muted">Requirements change. These official sites are the authority — we check our guidance against them.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {country.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-card p-5 transition-colors hover:border-primary/30"
              >
                <span className="flex items-center justify-between font-medium">
                  {source.label}
                  <ArrowUpRight className="size-4 text-subtle group-hover:text-primary" aria-hidden="true" />
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-muted">{source.description}</span>
                <span className="mt-3 truncate text-xs text-muted">{source.url.replace(/^https:\/\//, "")}</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <CtaSection
        title={`Thinking about ${country.name}?`}
        description={`Tell us about your background and goals. We'll explain what applying to ${country.name} would realistically involve for you.`}
        whatsappMessage={destinationEnquiryMessage(country.name)}
      />
    </>
  );
}
