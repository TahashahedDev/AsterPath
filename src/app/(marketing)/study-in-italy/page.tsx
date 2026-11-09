import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Banknote, GraduationCap, Landmark, Plane } from "lucide-react";
import { afterGraduation, dsuBasics, visaFunds } from "@/content/italy/facts";
import { studyLevels } from "@/content/italy/levels";
import { regions } from "@/content/italy/regions";
import { CtaSection } from "@/components/marketing/cta-section";
import { ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Study in Italy from India — the complete guide",
  description: "How Italian degrees work, the yearly timeline for an autumn intake, costs, scholarships and life after graduation — for students applying from India.",
  alternates: { canonical: "/study-in-italy" },
};

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

const reasons = [
  { icon: GraduationCap, title: "Public universities, English-taught degrees", body: "Centuries-old public universities and polytechnics offer a wide range of bachelor's and master's programmes taught in English." },
  { icon: Banknote, title: "Fees linked to family income", body: "Many public universities set student contributions according to family income and assets, assessed through the ISEE — so costs can be far lower than you expect." },
  { icon: Landmark, title: "Regional scholarships", body: "Means-tested DSU support can include a grant, housing, meals and a tuition waiver, run separately in each region." },
  { icon: Plane, title: "A route after graduation", body: "Graduates can apply for a job-seeker permit of up to 12 months, convertible into a work permit." },
];

const timeline = [
  { when: "October – December", what: "Free consultation, profile review, passport check, and the start of attestation and apostille." },
  { when: "November – February", what: "English test planning, booking and — if needed — a retake." },
  { when: "January – April", what: "University applications. Many universities run several rounds from winter to spring." },
  { when: "April – July", what: "Admission letters, Universitaly pre-enrolment, and your DOV or CIMEA statement." },
  { when: "May – July", what: "ISEE parificato preparation for regional scholarships; calls usually open around July." },
  { when: "June – September", what: "Study visa file, biometrics appointment and decision. DSU deadlines in late summer." },
  { when: "September – October", what: "Arrival, residence permit application and university enrolment." },
];

const featuredCities = ["Milan", "Turin", "Bologna", "Padua", "Florence", "Pisa", "Rome", "Naples"];

export default function StudyInItalyPage() {
  const cities = regions.flatMap((r) => r.cities.map((c) => ({ ...c, region: r.name, universities: r.universities }))).filter((c) => featuredCities.includes(c.name));
  return (
    <>
      <PageHero
        eyebrow="Study in Italy"
        title={<>Everything you need to know, <span className="display-italic text-primary">in the order you need it.</span></>}
        description="Not a brochure. How Italian degrees actually work for applicants from India, what happens when, what it costs and what comes after."
      >
        <ReviewStatus />
      </PageHero>

      <section className="page-container mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, body }) => (
          <div key={title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-6">
            <Icon className="size-7 text-terracotta" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-5 font-bold text-ink">{title}</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="page-container mt-28">
        <SectionHeading eyebrow="The degree system" title={<>Three levels, <span className="display-italic text-primary">three different routes.</span></>} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {studyLevels.map((level) => (
            <Link
              key={level.slug}
              href={`/study-in-italy/${level.slug}`}
              className="reveal group flex flex-col rounded-[var(--radius-card)] border border-border bg-card p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">{level.italianName}</p>
              <h3 className="display mt-3 text-3xl text-ink">{level.title}</h3>
              <p className="mt-2 text-sm font-semibold text-ink-soft">{level.duration}</p>
              <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-muted">{level.summary}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Full guide <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-28 border-y border-border bg-card/60 py-24">
        <div className="page-container grid gap-14 lg:grid-cols-[1fr_1.5fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Timeline"
              title={<>A year in the life <span className="display-italic text-primary">of an application.</span></>}
              description="An indicative calendar for a September or October intake. Each university and Italian mission sets its own dates — we build yours from them."
            />
          </div>
          <ol className="relative border-l border-border-strong pl-8">
            {timeline.map((step) => (
              <li key={step.when} className="reveal relative pb-10 last:pb-0">
                <span className="absolute top-1.5 -left-[2.3rem] size-3 rotate-45 bg-terracotta ring-4 ring-paper" aria-hidden="true" />
                <p className="text-sm font-bold tracking-wide text-terracotta-deep uppercase">{step.when}</p>
                <p className="mt-2 text-lg leading-relaxed text-ink-soft">{step.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-container mt-28 grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Costs" title={<>What to <span className="display-italic text-primary">plan for.</span></>} />
          <div className="mt-8 space-y-5 text-[1.0625rem] leading-relaxed text-ink-soft">
            <p>
              <strong className="font-bold text-ink">Proof of funds for the visa.</strong> For the {visaFunds.appliesTo}, the minimum is{" "}
              <strong className="font-bold text-ink">{eur.format(visaFunds.annualEur)} per year</strong> (it was {eur.format(visaFunds.previousAnnualEur)}).{" "}
              {visaFunds.note}
            </p>
            <p>
              <strong className="font-bold text-ink">Tuition.</strong> Public universities usually set contributions by family income and assets. Without
              an ISEE, the highest band normally applies. Private universities set fixed fees.
            </p>
            <p>
              <strong className="font-bold text-ink">One-off costs in India.</strong> Attestation, apostille, translations, English test, visa and VFS
              fees, insurance and flights. We list them for you upfront.
            </p>
          </div>
          <SourceNote ids={visaFunds.sources} className="mt-8" />
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep/70 p-7 sm:p-9">
          <h3 className="display text-3xl text-ink">Scholarships in brief</h3>
          <p className="mt-4 leading-relaxed text-ink-soft">{dsuBasics.summary}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">{dsuBasics.isee}</p>
          <Link href="/scholarships" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-deep">
            Explore scholarships by region <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="page-container mt-28">
        <SectionHeading eyebrow="Where students go" title={<>University cities, <span className="display-italic text-primary">north to south.</span></>} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((city) => (
            <li key={city.name} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">{city.region}</p>
              <h3 className="display mt-2 text-2xl text-ink">{city.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{city.universities.slice(0, 2).join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="page-container mt-28">
        <div className="reveal rounded-[1.75rem] border border-border bg-card p-7 sm:p-12">
          <p className="eyebrow mb-5">After graduation</p>
          <p className="display max-w-3xl text-3xl leading-snug text-ink">{afterGraduation.summary}</p>
          <p className="mt-6 text-sm text-muted">{afterGraduation.note}</p>
        </div>
      </section>

      <CtaSection title="Is Italy right for you?" description="Tell us your background, budget and goals. We'll give you an honest answer — including when another path would serve you better." />
    </>
  );
}
