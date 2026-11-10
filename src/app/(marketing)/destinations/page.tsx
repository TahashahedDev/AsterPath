import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { upcomingDestinations } from "@/content/destinations";
import { regions } from "@/content/italy/regions";
import { universities } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { Flag } from "@/components/marketing/flag";
import { PageHero } from "@/components/marketing/page-hero";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Destinations: Italy now, Germany and France next",
  description: "Where AsterPath helps Indian students study abroad. Italy is fully launched; Germany and France are opening next.",
  alternates: { canonical: "/destinations" },
};

const italyLinks = [
  { href: "/study-in-italy", title: "Study in Italy", body: "Levels, entrance tests, documents and the visa, from India." },
  { href: "/universities", title: `${universities.length} public universities`, body: "Every state university, by region, with its official website." },
  { href: "/scholarships", title: "Regional scholarships", body: `DSU grants across ${regions.length} regions, and the ISEE parificato.` },
];

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={
          <>
            Where you can study <span className="display-italic text-primary">with us.</span>
          </>
        }
        description="We open a destination only when we know its universities, documents and visa process in real detail. Italy is fully launched. Germany and France are next."
      />

      {/* Italy, the flagship */}
      <section className="page-container mt-20" aria-labelledby="italy-title">
        <div className="reveal ring-gradient relative overflow-hidden rounded-[1.75rem] p-7 shadow-[var(--shadow-lift)] sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Flag code="italy" className="h-6 w-9" />
                <Badge tone="primary">Fully launched</Badge>
              </div>
              <h2 id="italy-title" className="display mt-6 text-5xl leading-[1.02] text-ink sm:text-6xl">
                Italy, open now
              </h2>
              <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted">
                Public universities, Universitaly pre-enrolment, the Declaration of Value, regional scholarships and the study visa from the four Italian
                missions in India. Every page is checked against official sources and dated.
              </p>
              <ButtonLink href="/study-in-italy" size="lg" className="mt-9">
                Explore Italy <ArrowRight aria-hidden="true" />
              </ButtonLink>
            </div>
            <ul className="grid gap-3">
              {italyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="glow-card group flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-border bg-card p-6">
                    <span>
                      <span className="display block text-2xl text-ink">{l.title}</span>
                      <span className="mt-1 block text-[0.9375rem] leading-relaxed text-muted">{l.body}</span>
                    </span>
                    <ArrowUpRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Opening next */}
      <section className="page-container mt-28" aria-labelledby="next-title">
        <div className="reveal max-w-2xl">
          <p className="eyebrow mb-5">Opening next</p>
          <h2 id="next-title" className="display text-4xl leading-[1.06] text-ink sm:text-5xl">
            Germany and France, once we have checked them
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            We are not publishing requirements, costs or visa rules for these countries yet. You can already talk to us about your profile and join the
            list for when each one opens.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {upcomingDestinations.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/destinations/${d.slug}`}
                className="reveal glow-card group flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9"
              >
                <div className="flex items-center gap-3">
                  <Flag code={d.flag} className="h-5 w-7.5" />
                  <Badge tone="gold">Opening next</Badge>
                </div>
                <h3 className="display mt-6 text-4xl text-ink">{d.name}</h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">{d.summary}</p>
                <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  What we can help with now <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <CtaSection
        title="Not sure which country fits?"
        description="Start with a free profile evaluation. We tell you honestly what is realistic in Italy today, and keep you posted as new destinations open."
      />
    </>
  );
}
