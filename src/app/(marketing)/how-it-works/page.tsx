import type { Metadata } from "next";
import { journeyOwnerLabel, journeySteps, type JourneyOwner } from "@/content/journey";
import { CtaSection } from "@/components/marketing/cta-section";
import { JourneyTimeline } from "@/components/marketing/journey-timeline";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "How we work",
  description: "The eleven stages of an AsterPath study journey, from first enquiry to settling in abroad — and who is responsible at each step.",
  alternates: { canonical: "/how-it-works" },
};

const ownerDescriptions: Record<JourneyOwner, string> = {
  you: "Steps only you can take, like submitting from your own accounts or attending appointments.",
  asterpath: "Work we do and are accountable for.",
  together: "Shared steps where we prepare and review, and you confirm and act.",
  institution: "Decisions made by universities, consulates or other authorities.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How we work"
        title={<>Eleven steps. <span className="serif-accent text-primary">No surprises.</span></>}
        description="This is the general shape of a study journey with AsterPath. Actual requirements and their order vary by country, university and your individual circumstances — your personal timeline is set up for your case."
      />

      <section className="page-container mt-16 grid gap-16 lg:grid-cols-[1.6fr_1fr]">
        <JourneyTimeline steps={journeySteps} />

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-7">
            <h2 className="text-lg font-semibold tracking-tight">Who is responsible</h2>
            <dl className="mt-5 space-y-5">
              {(Object.keys(journeyOwnerLabel) as JourneyOwner[]).map((owner) => (
                <div key={owner}>
                  <dt className="text-sm font-medium text-ink">{journeyOwnerLabel[owner]}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{ownerDescriptions[owner]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      <CtaSection title="Ready for step one?" />
    </>
  );
}
