import type { Metadata } from "next";
import { countries } from "@/content/countries";
import { DestinationCard, ReviewStatus } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { Flag } from "@/components/marketing/flag";

export const metadata: Metadata = {
  title: "Study destinations — Italy, Germany and France",
  description: "Compare studying in Italy, Germany and France from India: application systems, national procedures, languages and visa routes.",
  alternates: { canonical: "/destinations" },
};

const comparison: { label: string; values: Record<string, string> }[] = [
  {
    label: "National step before or alongside applying",
    values: { italy: "Universitaly pre-enrolment", germany: "APS academic verification", france: "Campus France — Études en France" },
  },
  {
    label: "How applications are made",
    values: { italy: "Directly to each university", germany: "Directly or via uni-assist", france: "Études en France platform, or directly to some schools" },
  },
  {
    label: "Teaching languages",
    values: { italy: "Italian and English", germany: "German and English", france: "French and English" },
  },
  {
    label: "Visa applications through",
    values: { italy: "Italian consular network", germany: "German missions in India", france: "France-Visas" },
  },
];

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={<>Three countries. <span className="serif-accent text-primary">Three different systems.</span></>}
        description="Italy, Germany and France each have their own application platforms, document rules and visa procedures. Here's how they differ at a glance."
      >
        <ReviewStatus review={countries[0]!.review} />
      </PageHero>

      <section className="page-container mt-16 grid gap-5 md:grid-cols-3">
        {countries.map((country) => (
          <DestinationCard key={country.slug} country={country} />
        ))}
      </section>

      <section className="page-container mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">At a glance</h2>
        <p className="mt-3 max-w-2xl text-muted">A simplified overview. Your actual route depends on your programme, university and circumstances.</p>
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card" role="region" aria-label="Destination comparison (scrolls sideways on small screens)" tabIndex={0}>
          <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
            <caption className="sr-only">Comparison of study procedures in Italy, Germany and France</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="w-1/4 p-5 font-medium text-muted">
                  <span className="sr-only">Topic</span>
                </th>
                {countries.map((c) => (
                  <th key={c.slug} scope="col" className="p-5 font-semibold">
                    <span className="flex items-center gap-2.5">
                      <Flag code={c.slug} className="h-4 w-6" />
                      {c.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <th scope="row" className="p-5 align-top text-sm font-medium text-muted">{row.label}</th>
                  {countries.map((c) => (
                    <td key={c.slug} className="p-5 align-top text-ink-soft">{row.values[c.slug]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CtaSection title="Not sure which country fits you?" description="Tell us about your degree, budget and goals. We'll give you an honest comparison — including where you're less likely to be a strong fit." />
    </>
  );
}
