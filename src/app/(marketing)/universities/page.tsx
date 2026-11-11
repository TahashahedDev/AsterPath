import type { Metadata } from "next";
import { regions } from "@/content/italy/regions";
import { universities, universityKindLabel } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SourceNote } from "@/components/marketing/cards";
import { UniversityDirectory } from "@/components/marketing/university-directory";

export const metadata: Metadata = {
  title: "Public universities in Italy, region by region",
  description: `All ${universities.length} Italian state universities, polytechnics and higher schools, by region, with links to each official website.`,
  alternates: { canonical: "/universities" },
};

export default function UniversitiesPage() {
  const regionOptions = regions.map(({ code, slug, name }) => ({ code, slug, name })).filter((r) => universities.some((u) => u.regionCode === r.code));
  return (
    <>
      <PageHero
        eyebrow="Universities"
        title={
          <>
            {universities.length} public universities, <span className="display-italic text-primary">one index.</span>
          </>
        }
        description="Every Italian state university, polytechnic and higher school, by region. Search by name or city."
      />

      <section className="pt-[var(--space-xl)] pb-[var(--section-gap)]">
        <div className="page-container">
          <UniversityDirectory universities={universities} regions={regionOptions} kindLabels={universityKindLabel} />
          <p className="mt-4 text-sm text-muted">
            {Object.values(universityKindLabel).join(", ")}. Non-state and private universities are not listed. Programmes change every year, so we do not filter by course: check each university&rsquo;s own catalogue. Every website was checked on 9 November 2026.
          </p>
          <SourceNote ids={["universitaly"]} className="mt-2" />
        </div>
      </section>

      <CtaSection title="Not sure which one fits?" description="We shortlist with you from your marks, your subject and your budget, with every requirement checked on the university's own pages." />
    </>
  );
}
