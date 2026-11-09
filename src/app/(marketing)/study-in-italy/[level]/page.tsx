import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { entranceTests } from "@/content/italy/facts";
import { getLevel, studyLevels } from "@/content/italy/levels";
import { processStages } from "@/content/italy/process";
import { universities } from "@/content/italy/universities";
import { CheckList, ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { ButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ level: string }> };

const ctaNoun: Record<string, string> = { bachelors: "a bachelor's degree", masters: "a master's degree", phd: "a PhD" };

export const dynamicParams = false;

export function generateStaticParams() {
  return studyLevels.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = getLevel((await params).level);
  if (!level) return {};
  return {
    title: `${level.title} in Italy for Indian students`,
    description: level.summary,
    alternates: { canonical: `/study-in-italy/${level.slug}` },
  };
}

export default async function LevelPage({ params }: Props) {
  const level = getLevel((await params).level);
  if (!level) notFound();
  const showTests = level.slug === "bachelors";

  return (
    <>
      <section className="section-s">
        <div className="page-container">
          <nav aria-label="Breadcrumb" className="label">
            <Link href="/study-in-italy" className="link">
              Study in Italy
            </Link>
          </nav>
          <h1 className="mt-6">{level.title}</h1>
          <p className="label mt-4">
            {level.italianName}, {level.duration}
          </p>
          <p className="lead mt-6 text-ink-2">{level.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href={`/contact?level=${level.slug}`}>Book a free consultation</ButtonLink>
            <ReviewStatus className="max-w-[52ch]" />
          </div>
        </div>
      </section>

      <section className="section band-moss" aria-label="Eligibility and admission">
        <div className="page-container cols gap-y-[var(--space-2xl)]">
          <div className="col-span-6">
            <h2 className="text-[length:var(--text-title)]">Who is eligible</h2>
            <CheckList items={level.eligibility} className="mt-6" />
          </div>
          <div className="col-span-6">
            <h2 className="text-[length:var(--text-title)]">How admission works</h2>
            <CheckList items={level.admissions} className="mt-6" />
          </div>
        </div>
      </section>

      {showTests && (
        <section className="section" aria-labelledby="tests-title">
          <div className="page-container cols">
            <h2 id="tests-title" className="col-span-4">
              Entrance tests.
            </h2>
            <ul className="rows col-span-8">
              {entranceTests.map((t) => (
                <li key={t.name} className="py-6">
                  <h3 className="text-[1.25rem]">{t.name}</h3>
                  <p className="label mt-1">{t.who}</p>
                  <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-2">{t.body}</p>
                </li>
              ))}
            </ul>
            <SourceNote ids={["cisia"]} className="col-span-8 col-start-5 mt-6" />
          </div>
        </section>
      )}

      <section className="section" aria-label="Documents and watch-outs">
        <div className="page-container cols gap-y-[var(--space-2xl)]">
          <div className="col-span-7">
            <h2 className="text-[length:var(--text-title)]">Documents you will need</h2>
            <p className="mt-3 text-ink-2">Your exact list depends on the programme and university.</p>
            <CheckList items={level.documents} className="mt-6" />
            <Link href="/documents" className="btn btn--secondary mt-6">
              Attestation, apostille and DOV
            </Link>
          </div>
          <div className="col-span-5 bg-warning-bg p-[var(--space-xl)] text-warning-fg">
            <h2 className="text-[length:var(--text-title)]">Watch out for</h2>
            <ul className="mt-5 space-y-4">
              {level.watchOuts.map((w) => (
                <li key={w} className="leading-relaxed">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="unis-title">
        <div className="page-container cols items-end gap-y-6">
          <div className="col-span-7">
            <h2 id="unis-title">Where you can study.</h2>
            <p className="lead mt-5 text-ink-2">
              Our index lists all {universities.length} public universities, polytechnics and higher schools. Most offer this level; the higher schools
              focus on graduate study and research. Programmes taught in English change each year, so we check each one for you.
            </p>
          </div>
          <div className="col-span-5 lg:text-right">
            <ButtonLink href="/universities" variant="secondary">
              Browse the universities
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="page-container">
          <h2 id="how-title">How we take you through it.</h2>
          <ol className="cols mt-[var(--space-2xl)] gap-y-10">
            {processStages.map((stage, i) => (
              <li key={stage.slug} className={i < 2 ? "col-span-3" : "col-span-2"}>
                <span className="figure-xl block text-[clamp(2.75rem,4.5vw,4rem)] text-accent">{stage.number}</span>
                <h3 className="mt-3">{stage.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{stage.outcome}</p>
              </li>
            ))}
          </ol>
          <SourceNote ids={["universitaly", "studyInItaly", "cimea"]} className="mt-[var(--space-xl)]" />
        </div>
      </section>

      <CtaSection title={`Planning ${ctaNoun[level.slug]} in Italy?`} />
    </>
  );
}
