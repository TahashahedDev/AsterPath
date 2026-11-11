import type { Metadata } from "next";
import { documentStages, legalisationChain } from "@/content/italy/documents";
import { dovRules, visaChecklist } from "@/content/italy/facts";
import { IndiaMissionsMap } from "@/components/maps/india-missions-map";
import { CheckList, ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Documents for Italy: attestation, apostille and DOV",
  description: "The complete document list for Indian students going to Italy: the attestation chain, DOV or CIMEA, the 2026/27 study visa checklist, scholarship documents and arrival.",
  alternates: { canonical: "/documents" },
};

export default function DocumentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Documents and DOV"
        title={
          <>
            Every document, <span className="display-italic text-primary">in the right order.</span>
          </>
        }
        description="One wrong attestation can cost months. We plan the chain for every document before you visit a single office.">
        <ReviewStatus />
      </PageHero>

      {/* The chain */}
      <section className="field section" aria-labelledby="chain-title">
        <div className="page-container">
          <h2 id="chain-title" className="max-w-[18ch]">
            The chain, always in this order
          </h2>
          <ol className="cols mt-[var(--space-2xl)] gap-y-12">
            {legalisationChain.map((step, i) => (
              <li key={step.title} className={i === 0 || i === legalisationChain.length - 1 ? "col-span-3" : "col-span-2"}>
                <span className="figure-xl block text-[clamp(3rem,5vw,4.5rem)]">{i + 1}</span>
                <h3 className="mt-4">{step.title}</h3>
                <p className="label mt-1">{step.who}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Everything, by stage */}
      <section className="section" aria-labelledby="stages-title">
        <div className="page-container">
          <h2 id="stages-title" className="max-w-[20ch]">
            What you need, stage by stage
          </h2>
          <div className="mt-[var(--space-2xl)]">
            {documentStages.map((stage) => (
              <div key={stage.title} className="cols border-t border-rule py-8">
                <div className="col-span-4">
                  <h3 className="text-[length:var(--text-title)]">{stage.title}</h3>
                  <p className="label mt-1">{stage.when}</p>
                </div>
                <CheckList items={stage.items} className="col-span-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The visa file */}
      <section className="section" aria-labelledby="visa-title">
        <div className="page-container">
          <div className="cols items-end">
            <h2 id="visa-title" className="col-span-6">
              The study visa file
            </h2>
            <p className="lead col-span-5 col-start-8 text-ink-2">
              Last dates for bachelor&rsquo;s and master&rsquo;s visas: {visaChecklist.lastDates.map((d) => `${d.date} for ${d.intake}`).join(", ")}.
            </p>
          </div>
          <div className="cols mt-[var(--space-2xl)] gap-y-12">
            {visaChecklist.groups.map((g) => (
              <div key={g.title} className="col-span-6">
                <h3>{g.title}</h3>
                <CheckList items={g.items} className="mt-4" />
              </div>
            ))}
          </div>
          <div className="cols mt-[var(--space-2xl)] gap-y-10">
            <div className="col-span-6">
              <h3>Under 18</h3>
              <CheckList items={visaChecklist.minors} className="mt-4" />
            </div>
            <div className="col-span-6">
              <h3>Your appointment</h3>
              <p className="mt-4 leading-relaxed text-ink-2">{visaChecklist.appointmentRule}</p>
            </div>
          </div>
          <SourceNote ids={[visaChecklist.sourceId]} className="mt-[var(--space-xl)]" />
        </div>
      </section>

      {/* DOV or CIMEA */}
      <section className="section" aria-labelledby="dov-title">
        <div className="page-container cols">
          <div className="col-span-4">
            <h2 id="dov-title">DOV or CIMEA.</h2>
            <p className="lead mt-5 text-ink-2">A Declaration of Value can take up to {dovRules.maxProcessingDays} days. Check first whether you need one at all.</p>
          </div>
          <div className="col-span-8">
            <CheckList items={dovRules.points} />
            <SourceNote ids={dovRules.sources} className="mt-6" />
          </div>
        </div>
      </section>

      {/* Where your file goes */}
      <section className="section" aria-labelledby="missions-title">
        <div className="page-container">
          <h2 id="missions-title" className="max-w-[20ch]">
            Four Italian missions in India
          </h2>
          <p className="lead mt-5 text-ink-2">Which office handles your DOV and visa depends on where your degree was issued and where you live.</p>
          <div className="mt-[var(--space-2xl)]">
            <IndiaMissionsMap />
          </div>
          <p className="mt-8 text-sm text-muted">Country outline: Natural Earth, India point-of-view dataset.</p>
        </div>
      </section>

      <CtaSection title="Not sure where to start?" description="In your free consultation we review what you have and give you a dated plan for every attestation." />
    </>
  );
}
