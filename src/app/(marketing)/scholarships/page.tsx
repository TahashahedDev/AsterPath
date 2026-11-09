import type { Metadata } from "next";
import { CalendarClock, FileStack, Home, Utensils, Wallet, GraduationCap } from "lucide-react";
import { dsuBasics, maeciScholarship } from "@/content/italy/facts";
import { regions } from "@/content/italy/regions";
import { buildItalyRegionMap } from "@/lib/geo";
import { RegionExplorer } from "@/components/maps/region-explorer";
import { CtaSection } from "@/components/marketing/cta-section";
import { ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Scholarships in Italy for Indian students — DSU by region",
  description: "How regional DSU scholarships work, which body runs them in each of Italy's 20 regions, the ISEE parificato, and Italian government scholarships.",
  alternates: { canonical: "/scholarships" },
};

const benefits = [
  { icon: Wallet, title: "Cash grant", body: "Paid in instalments during the year, depending on the region and your economic band." },
  { icon: Home, title: "Student housing", body: "A place in a regional residence, where available." },
  { icon: Utensils, title: "Meals", body: "Free or subsidised meals at university canteens." },
  { icon: GraduationCap, title: "Tuition waiver", body: "Exemption from university contributions in many cases." },
];

const iseeSteps = [
  { title: "Collect family documents in India", body: "Income, property and family composition documents, as listed by the region or university for that year." },
  { title: "Legalise and translate", body: "Documents are legalised for use in Italy and translated into Italian, following the current requirements of the call." },
  { title: "Get the ISEE parificato", body: "Issued in Italy, usually through an authorised assistance centre (CAF) or the university, using your documents." },
  { title: "Apply to the regional body", body: "Submit the DSU application to the body that serves your university's region, before its deadline." },
];

export default function ScholarshipsPage() {
  const map = buildItalyRegionMap();
  return (
    <>
      <PageHero
        eyebrow="Scholarships"
        title={<>Italy rewards need and merit — <span className="display-italic text-primary">region by region.</span></>}
        description={dsuBasics.summary}
      >
        <ReviewStatus />
      </PageHero>

      <section className="page-container mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, body }) => (
          <div key={title} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-6">
            <Icon className="size-7 text-terracotta" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-5 font-bold text-ink">{title}</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
        <p className="text-sm text-muted sm:col-span-2 lg:col-span-4">What you receive depends on the region, your ISEE band and available funding. Awards are decided by the regional body.</p>
      </section>

      <section className="mt-24 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            eyebrow="Explore by region"
            title={<>Who runs support <span className="display-italic text-primary">where.</span></>}
            description="You apply to the body serving your university's region. Select a region to see its body and main public universities."
          />
          <div className="mt-12">
            <RegionExplorer map={map} regions={regions} />
          </div>
          <p className="mt-8 text-sm text-muted">Map boundaries: ISTAT, via openpolis (CC BY 4.0). Agency links checked against their official websites.</p>
        </div>
      </section>

      <section className="page-container mt-28 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <FileStack className="size-9 text-terracotta" strokeWidth={1.4} aria-hidden="true" />
          <SectionHeading className="mt-6" title={<>The ISEE parificato, <span className="display-italic text-primary">step by step.</span></>} description={dsuBasics.isee} />
        </div>
        <ol className="grid gap-4">
          {iseeSteps.map((step, i) => (
            <li key={step.title} className="reveal flex gap-5 rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="display text-4xl text-terracotta tabular-nums">{i + 1}</span>
              <div>
                <h3 className="font-bold text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-container mt-28 grid gap-6 lg:grid-cols-2">
        <div className="reveal rounded-[var(--radius-card)] border border-border bg-paper-deep/70 p-7 sm:p-9">
          <CalendarClock className="size-7 text-terracotta" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="display mt-5 text-3xl text-ink">When to apply</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">{dsuBasics.timing}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">Because the ISEE parificato needs documents from India, we start preparing it as soon as your shortlist is settled.</p>
        </div>
        <div className="reveal rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9">
          <GraduationCap className="size-7 text-terracotta" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="display mt-5 text-3xl text-ink">Government and university awards</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">{maeciScholarship.summary}</p>
          <p className="mt-4 leading-relaxed text-ink-soft">Many universities also offer merit awards and fee reductions for international students, with their own calls and deadlines.</p>
        </div>
      </section>

      <div className="page-container mt-10">
        <SourceNote ids={["studyInItaly", "mur", "universitaly"]} />
      </div>

      <CtaSection title="Find out what you could be eligible for." description="We check your profile against the calls for your universities' regions and plan your ISEE parificato in time." />
    </>
  );
}
