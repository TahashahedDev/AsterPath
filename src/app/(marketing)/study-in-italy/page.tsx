import type { Metadata } from "next";
import Link from "next/link";
import { afterGraduation, dsuBasics, visaFunds } from "@/content/italy/facts";
import { studyLevels } from "@/content/italy/levels";
import { regions } from "@/content/italy/regions";
import { applicationYear } from "@/content/italy/timeline";
import { universities } from "@/content/italy/universities";
import { CtaSection } from "@/components/marketing/cta-section";
import { ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Study in Italy from India: the complete guide",
  description: "How Italian degrees work, the application year month by month, costs, scholarships and life after graduation, for students applying from India.",
  alternates: { canonical: "/study-in-italy" },
};

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

const reasons = [
  { title: "Public universities", body: "Centuries-old universities and polytechnics, with a wide range of degrees taught in English." },
  { title: "Fees linked to family income", body: "Many public universities set contributions by family income and assets, assessed through the ISEE." },
  { title: "Regional scholarships", body: "Means-tested DSU support can include a grant, housing, meals and a tuition waiver." },
  { title: "A route after graduation", body: "Graduates can apply for a job-seeker permit of up to 12 months, convertible into a work permit." },
];

const featuredCities = ["Milan", "Turin", "Bologna", "Padua", "Florence", "Pisa", "Rome", "Naples"];

export default function StudyInItalyPage() {
  const cities = regions
    .flatMap((r) => r.cities.map((c) => ({ ...c, region: r, universities: universities.filter((u) => u.city === c.name) })))
    .filter((c) => featuredCities.includes(c.name));

  return (
    <>
      <PageHero
        eyebrow="Study in Italy"
        title={
          <>
            Everything you need, <span className="display-italic text-primary">in the order you need it.</span>
          </>
        }
        description="How Italian degrees work for applicants from India, what happens when, what it costs and what comes after.">
        <ReviewStatus />
      </PageHero>

      <section className="section-s band-moss" aria-label="Why Italy">
        <div className="page-container cols gap-y-10">
          {reasons.map((r) => (
            <div key={r.title} className="card col-span-3">
              <h2 className="text-[length:var(--text-title)]">{r.title}</h2>
              <p className="mt-3 leading-relaxed text-ink-2">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="levels-title">
        <div className="page-container">
          <h2 id="levels-title">Three levels, three routes.</h2>
          <ul className="rows mt-[var(--space-2xl)]">
            {studyLevels.map((level) => (
              <li key={level.slug}>
                <Link href={`/study-in-italy/${level.slug}`} className="group cols items-baseline py-8">
                  <span className="col-span-5 font-display text-[length:var(--text-section)] leading-none font-medium tracking-[-0.03em] transition-colors duration-200 group-hover:text-mark">
                    {level.title}
                  </span>
                  <span className="col-span-3 label">
                    {level.italianName}, {level.duration}
                  </span>
                  <span className="col-span-4 leading-relaxed text-ink-2">{level.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="year-title">
        <div className="page-container cols">
          <div className="col-span-4">
            <h2 id="year-title">A year in the life of an application.</h2>
            <p className="lead mt-5 text-ink-2">For a September intake. Each university and mission sets its own dates; we build yours from them.</p>
          </div>
          <ol className="rows col-span-8">
            {applicationYear.map((step) => (
              <li key={step.when} className="grid gap-2 py-6 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8">
                <p className={step.ahead ? "font-medium text-mark" : "font-medium text-muted"}>{step.when}</p>
                <p className="text-[1.0625rem] leading-relaxed">{step.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="costs-title">
        <div className="page-container cols gap-y-[var(--space-2xl)]">
          <div className="col-span-5">
            <h2 id="costs-title">What to plan for.</h2>
            <p className="figure-xl mt-[var(--space-xl)] text-[clamp(3rem,6vw,5.5rem)]">{eur.format(visaFunds.annualEur)}</p>
            <p className="mt-3 max-w-[36ch] text-ink-2">
              The minimum yearly funds for a study visa, for {visaFunds.appliesTo}. It was {eur.format(visaFunds.previousAnnualEur)}. {visaFunds.note}
            </p>
          </div>
          <div className="col-span-6 col-start-7 space-y-8 text-[1.0625rem] leading-relaxed">
            <div>
              <h3>Tuition</h3>
              <p className="mt-2 text-ink-2">Public universities usually set contributions by family income and assets. Without an ISEE the highest band normally applies.</p>
            </div>
            <div>
              <h3>Scholarships</h3>
              <p className="mt-2 text-ink-2">{dsuBasics.summary}</p>
              <Link href="/scholarships" className="btn btn--secondary mt-3">
                How scholarships work
              </Link>
            </div>
            <div>
              <h3>Costs in India</h3>
              <p className="mt-2 text-ink-2">Attestation, apostille, translations, the English test and visa insurance. All of these are inside the AsterPath plan.</p>
            </div>
            <SourceNote ids={visaFunds.sources} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cities-title">
        <div className="page-container">
          <h2 id="cities-title">University cities, north to south.</h2>
          <ul className="cols mt-[var(--space-2xl)] gap-y-12">
            {cities.map((city) => (
              <li key={city.name} className="col-span-6 xl:col-span-3">
                <Link href={`/regions/${city.region.slug}`} className="label link">
                  {city.region.name}
                </Link>
                <h3 className="mt-2 text-[length:var(--text-section)] leading-none">{city.name}</h3>
                <ul className="mt-4 space-y-1.5 text-[0.9375rem]">
                  {city.universities.map((u) => (
                    <li key={u.slug}>
                      <Link href={`/universities/${u.slug}`} className="link">
                        {u.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="after-title">
        <div className="page-container cols">
          <h2 id="after-title" className="col-span-4">
            After graduation.
          </h2>
          <div className="col-span-7 col-start-6">
            <p className="statement text-[length:var(--text-display-s)]">{afterGraduation.summary}</p>
            <p className="mt-6 text-ink-2">{afterGraduation.note}</p>
          </div>
        </div>
      </section>

      <CtaSection title="Is Italy right for you?" description="Tell us your background, budget and goals. We give you an honest answer, including when another path would serve you better." />
    </>
  );
}
