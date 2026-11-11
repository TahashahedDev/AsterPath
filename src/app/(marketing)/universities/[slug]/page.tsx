import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { regions } from "@/content/italy/regions";
import { getUniversity, universities, universitiesInRegion, universityKindLabel } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { SourceNote } from "@/components/marketing/cards";
import { ButtonLink, ExternalButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return universities.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = getUniversity((await params).slug);
  if (!u) return {};
  return {
    title: u.name.length > 38 ? u.name : `${u.name}: applying from India`,
    description: `Applying to ${u.name} (${u.city}) from India: programmes, Universitaly pre-enrolment, DOV or CIMEA and DSU scholarships.`,
    alternates: { canonical: `/universities/${u.slug}` },
  };
}

export default async function UniversityPage({ params }: Props) {
  const u = getUniversity((await params).slug);
  if (!u) notFound();
  const region = regions.find((r) => r.code === u.regionCode)!;
  const neighbours = universitiesInRegion(u.regionCode).filter((x) => x.slug !== u.slug);

  const steps = [
    { title: "Find the programme", body: `Browse ${u.name}'s own catalogue for programmes taught in English, their entry requirements and their application rounds.` },
    { title: "Apply on the university portal", body: "Submit your documents, statement of purpose and English result in the round that fits your timeline." },
    { title: "Pre-enrol on Universitaly", body: "Once admitted, complete pre-enrolment on Universitaly; the university validates it." },
    { title: "DOV or CIMEA, if required", body: `Check whether ${u.name} asks for a Declaration of Value or a CIMEA statement for your degree.` },
  ];

  return (
    <>
      <section className="section-s">
        <div className="page-container">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/universities" className="link">
              Universities
            </Link>
            {" / "}
            <Link href={`/regions/${region.slug}`} className="link">
              {region.name}
            </Link>
          </nav>
          <h1 className="mt-6 max-w-[18ch]">{u.name}</h1>
          <p className="lead mt-6 text-ink-2">
            {universityKindLabel[u.kind]} in {u.city}, {region.name}.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ExternalButtonLink href={u.url}>Visit the official website</ExternalButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Ask us about this university
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section band-moss" aria-labelledby="apply-title">
        <div className="page-container cols">
          <h2 id="apply-title" className="col-span-4">
            Applying from India
          </h2>
          <ol className="rows col-span-8">
            {steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-6">
                <span className="figure-xl text-3xl text-accent">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="dsu-title">
        <div className="page-container cols gap-y-[var(--space-2xl)]">
          <div className="col-span-6">
            <h2 id="dsu-title" className="text-[length:var(--text-title)]">
              Scholarships in {region.name}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-2">Regional DSU support for students at {u.name} is run by:</p>
            <ul className="mt-4 space-y-2">
              {region.dsu.map((b) => (
                <li key={b.name}>
                  {b.url ? (
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="link text-lg font-medium">
                      {b.name}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="text-lg font-medium">{b.name}</span>
                  )}
                  {b.note && <p className="mt-1 text-[0.9375rem] text-ink-2">{b.note}</p>}
                </li>
              ))}
            </ul>
            <Link href="/scholarships" className="btn btn--secondary mt-6">
              How DSU scholarships work
            </Link>
          </div>
          {neighbours.length > 0 && (
            <div className="col-span-6">
              <h2 className="text-[length:var(--text-title)]">Also in {region.name}</h2>
              <ul className="rows mt-4">
                {neighbours.map((n) => (
                  <li key={n.slug} className="py-3">
                    <Link href={`/universities/${n.slug}`} className="link">
                      {n.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <SourceNote ids={["universitaly", "cimea"]} className="col-span-12" />
        </div>
      </section>

      <CtaSection title={`Thinking of ${u.city}?`} description="We check the programme's real entry requirements against your marks before you spend anything on an application." />
    </>
  );
}
