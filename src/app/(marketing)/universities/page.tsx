import type { Metadata } from "next";
import Link from "next/link";
import { regions } from "@/content/italy/regions";
import { universities, universityKindLabel } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SourceNote } from "@/components/marketing/cards";

export const metadata: Metadata = {
  title: "Public universities in Italy, region by region",
  description: `All ${universities.length} Italian state universities, polytechnics and higher schools, by region, with links to each official website.`,
  alternates: { canonical: "/universities" },
};

export default function UniversitiesPage() {
  const byRegion = regions.map((r) => ({ region: r, list: universities.filter((u) => u.regionCode === r.code) })).filter((g) => g.list.length > 0);
  return (
    <>
      <PageHero
        eyebrow="Universities"
        title={
          <>
            {universities.length} public universities, <span className="display-italic text-primary">one index.</span>
          </>
        }
        description="Every Italian state university, polytechnic and higher school, by region. Open one for how applying from India works there, or go straight to its website."
      >
        <nav aria-label="Jump to a region" className="flex flex-wrap gap-x-5 gap-y-2">
          {byRegion.map(({ region }) => (
            <a key={region.code} href={`#${region.slug}`} className="link text-[0.9375rem]">
              {region.name}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="pt-[var(--space-xl)] pb-[var(--section-gap)]">
        <div className="page-container">
          {byRegion.map(({ region, list }) => (
            <div key={region.code} id={region.slug} className="cols scroll-mt-28 border-t border-rule py-10">
              <div className="col-span-4">
                <h2 className="text-[length:var(--text-title)]">
                  <Link href={`/regions/${region.slug}`} className="transition-colors duration-200 hover:text-mark">
                    {region.name}
                  </Link>
                </h2>
              </div>
              <ul className="rows col-span-8">
                {list.map((u) => (
                  <li key={u.slug} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_10rem] sm:items-baseline sm:gap-6">
                    <Link href={`/universities/${u.slug}`} className="text-[1.0625rem] font-medium transition-colors duration-200 hover:text-mark">
                      {u.name}
                    </Link>
                    <span className="text-[0.9375rem] text-ink-2">{u.city}</span>
                    <a href={u.url} target="_blank" rel="noopener noreferrer" className="link text-[0.9375rem] text-muted">
                      Official website<span className="visually-hidden">: {u.name} (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mt-4 text-sm text-muted">
            {Object.values(universityKindLabel).join(", ")}. Non-state and private universities are not listed. Every website was checked on 9 November 2026.
          </p>
          <SourceNote ids={["universitaly"]} className="mt-2" />
        </div>
      </section>

      <CtaSection title="Not sure which one fits?" description="We shortlist with you from your marks, your subject and your budget, with every requirement checked on the university's own pages." />
    </>
  );
}
