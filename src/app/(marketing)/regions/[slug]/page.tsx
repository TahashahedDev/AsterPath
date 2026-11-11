import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dsu2026 } from "@/content/italy/facts";
import { getRegionBySlug, regions } from "@/content/italy/regions";
import { universitiesInRegion } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { SourceNote } from "@/components/marketing/cards";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRegionBySlug((await params).slug);
  if (!r) return {};
  return {
    title: `${r.name}: universities and DSU grants`,
    description: `Public universities in ${r.name} and who runs its DSU scholarships, for Indian students planning to study in Italy.`,
    alternates: { canonical: `/regions/${r.slug}` },
  };
}

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

export default async function RegionPage({ params }: Props) {
  const region = getRegionBySlug((await params).slug);
  if (!region) notFound();
  const list = universitiesInRegion(region.code);
  const awayFromHome = dsu2026.amounts[0]!;

  return (
    <>
      <section className="section-s">
        <div className="page-container">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/scholarships" className="link">
              Regions and scholarships
            </Link>
          </nav>
          <h1 className="mt-6">Studying in {region.name}.</h1>
          <p className="lead mt-6 text-ink-2">
            {list.length} public {list.length === 1 ? "university" : "universities"}, and one place to apply for regional scholarships.
          </p>
        </div>
      </section>

      <section className="field section" aria-labelledby="dsu-title">
        <div className="page-container cols">
          <div className="col-span-5">
            <h2 id="dsu-title">Scholarships here</h2>
            <p className="lead mt-6">
              For {dsu2026.year}, the national minimum for a student living away from home is {eur.format(awayFromHome.eur)} a year. Regions may pay more.
            </p>
          </div>
          <ul className="rows col-span-6 col-start-7">
            {region.dsu.map((b) => (
              <li key={b.name} className="py-5">
                {b.url ? (
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="link font-display text-[length:var(--text-title)] font-medium tracking-[-0.02em]">
                    {b.name}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="font-display text-[length:var(--text-title)] font-medium tracking-[-0.02em]">{b.name}</span>
                )}
                {b.note && <p className="mt-2">{b.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="unis-title">
        <div className="page-container cols">
          <h2 id="unis-title" className="col-span-4">
            Public universities
          </h2>
          <ul className="rows col-span-8">
            {list.map((u) => (
              <li key={u.slug} className="grid gap-1 py-5 sm:grid-cols-[minmax(0,1fr)_9rem_10rem] sm:items-baseline sm:gap-6">
                <Link href={`/universities/${u.slug}`} className="font-display text-[length:var(--text-title)] font-medium tracking-[-0.02em] transition-colors duration-200 hover:text-mark">
                  {u.name}
                </Link>
                <span className="text-ink-2">{u.city}</span>
                <a href={u.url} target="_blank" rel="noopener noreferrer" className="link text-[0.9375rem] text-muted">
                  Official website<span className="visually-hidden">: {u.name} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <SourceNote ids={["murDsu", "universitaly"]} className="col-span-8 col-start-5 mt-8" />
        </div>
      </section>

      <CtaSection title={`Planning ${region.name}?`} description="We match universities in the region to your profile and plan your DSU application and ISEE parificato in time." />
    </>
  );
}
