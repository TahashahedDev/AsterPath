import type { Metadata } from "next";
import { Info } from "lucide-react";
import { commonDocuments, legalisationChain } from "@/content/italy/documents";
import { dovRules, visaRules } from "@/content/italy/facts";
import { IndiaMissionsMap } from "@/components/maps/india-missions-map";
import { CheckList, ReviewStatus, SourceNote } from "@/components/marketing/cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Documents, attestation, apostille and DOV for Italy",
  description: "The document chain for Indian students going to Italy: notary, state HRD attestation, MEA apostille, translation, Declaration of Value or CIMEA — and which Italian mission handles your file.",
  alternates: { canonical: "/documents" },
};

export default function DocumentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Documents"
        title={<>The paperwork, <span className="display-italic text-primary">without the guesswork.</span></>}
        description="Italian universities and missions are precise about documents. Here is the chain every academic document goes through, and the rules that catch students out."
      >
        <ReviewStatus />
      </PageHero>

      <section className="page-container mt-20">
        <SectionHeading eyebrow="The chain" title={<>Five steps, <span className="display-italic text-primary">always in this order.</span></>} />
        <ol className="mt-12 grid gap-4 lg:grid-cols-5">
          {legalisationChain.map((step, i) => (
            <li key={step.title} className="reveal relative flex flex-col rounded-[var(--radius-card)] border border-border bg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-terracotta-soft text-sm font-bold text-terracotta-deep tabular-nums">{i + 1}</span>
              <h3 className="display mt-5 text-2xl text-ink">{step.title}</h3>
              <p className="mt-1 text-sm font-semibold text-terracotta-deep">{step.who}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{step.description}</p>
              <p className="mt-4 border-t border-border pt-3 text-xs font-semibold tracking-wide text-ink-soft uppercase">{step.when}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-container mt-24 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="reveal rounded-[var(--radius-card)] border border-border bg-card p-7 sm:p-9">
          <h2 className="display text-3xl text-ink">Declaration of Value: the rules</h2>
          <CheckList items={dovRules.points} className="mt-6" />
          <p className="mt-6 text-sm text-muted">Processing can take up to {dovRules.maxProcessingDays} days from submission.</p>
          <SourceNote ids={dovRules.sources} className="mt-4" />
        </div>
        <div className="reveal rounded-[var(--radius-card)] border border-border bg-paper-deep/70 p-7 sm:p-9">
          <h2 className="display text-3xl text-ink">Study visa essentials</h2>
          <CheckList items={visaRules} className="mt-6" />
          <SourceNote ids={["vistoPerItalia", "consulateKolkata"]} className="mt-6" />
        </div>
      </section>

      <section className="mt-24 border-y border-border bg-card/60 py-24">
        <div className="page-container">
          <SectionHeading
            eyebrow="Where your file goes"
            title={<>Four Italian missions <span className="display-italic text-primary">in India.</span></>}
            description="Which office handles your DOV and visa depends on where your degree was issued and where you live."
          />
          <div className="mt-12">
            <IndiaMissionsMap />
          </div>
          <p className="mt-8 text-xs text-muted">Country outline: Natural Earth, India point-of-view dataset.</p>
        </div>
      </section>

      <section className="page-container mt-24">
        <SectionHeading eyebrow="Checklist" title={<>Documents most students <span className="display-italic text-primary">will need.</span></>} />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {commonDocuments.map((doc) => (
            <li key={doc.name} className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="font-bold text-ink">{doc.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{doc.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex gap-3 text-sm leading-relaxed text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          Never send passports or financial documents by email or WhatsApp. When we need your documents, we provide a secure, private way to share them.
        </p>
      </section>

      <CtaSection title="Not sure where to start with your documents?" description="In your free consultation we review what you have and give you a dated plan for every attestation." />
    </>
  );
}
