import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/content/faqs";
import { plan } from "@/content/plan";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqList } from "@/components/marketing/faq-list";
import { PageHero } from "@/components/marketing/page-hero";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The AsterPath plan: one plan, everything in it",
  description: "One plan per student for studying in Italy: every service and the costs along the way, from the English test to your visa file, paid in instalments.",
  alternates: { canonical: "/pricing" },
};

export default function PlanPage() {
  return (
    <>
      <PageHero
        eyebrow="The plan"
        title={
          <>
            One plan. <span className="display-italic text-primary">Everything in it.</span>
          </>
        }
        description={`${plan.intakeNote} Each student gets one plan, one advisor and one written figure.`}>
        <ButtonLink href="/contact">Book a free consultation</ButtonLink>
      </PageHero>

      {/* What we do */}
      <section className="section" aria-labelledby="services-title">
        <div className="page-container cols">
          <h2 id="services-title" className="col-span-4">
            What we do.
          </h2>
          <ol className="rows col-span-8">
            {plan.services.map((service, i) => (
              <li key={service} className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-4 py-5">
                <span className="figure-xl text-2xl text-accent">{i + 1}</span>
                <span className="text-[1.0625rem]">{service}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we pay */}
      <section className="field section" aria-labelledby="cover-title">
        <div className="page-container cols">
          <div className="col-span-5">
            <h2 id="cover-title">The costs we pay for you.</h2>
            <p className="lead mt-6">From the English test to your visa insurance, these are inside the plan.</p>
          </div>
          <ul className="col-span-6 col-start-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {plan.weCover.map((item) => (
              <li key={item} className="text-[1.0625rem] leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Credited and not included */}
      <section className="section" aria-labelledby="credit-title">
        <div className="page-container cols gap-y-[var(--space-3xl)]">
          <div className="col-span-6">
            <h2 id="credit-title" className="text-[length:var(--text-title)]">
              Paid by you, credited back
            </h2>
            <p className="mt-3 text-ink-2">Consulate rules say these must come from you. The plan returns the amount.</p>
            <ul className="rows mt-6">
              {plan.weCredit.map((c) => (
                <li key={c.item} className="py-5">
                  <p className="font-medium">{c.item}</p>
                  <p className="mt-1 text-[0.9375rem] text-ink-2">{c.why}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-6">
            <h2 className="text-[length:var(--text-title)]">Not in the plan</h2>
            <p className="mt-3 text-ink-2">Listed now, so nothing surprises you later.</p>
            <ul className="rows mt-6">
              {plan.notIncluded.map((c) => (
                <li key={c.item} className="py-5">
                  <p className="font-medium">{c.item}</p>
                  <p className="mt-1 text-[0.9375rem] text-ink-2">{c.why}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Instalments */}
      <section className="section" aria-labelledby="instalments-title">
        <div className="page-container">
          <h2 id="instalments-title" className="max-w-[16ch]">
            Paid as each stage begins.
          </h2>
          <ol className="cols mt-[var(--space-2xl)] gap-y-10">
            {plan.instalments.map((step, i) => (
              <li key={step.stage} className={i < 2 ? "card col-span-3" : "card col-span-2"}>
                <span className="figure-xl block text-[clamp(3rem,5vw,4.5rem)] text-accent">{i + 1}</span>
                <h3 className="mt-4">{step.stage}</h3>
                <p className="label mt-1">{step.when}</p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{step.covers}</p>
              </li>
            ))}
          </ol>
          <p className="mt-[var(--space-xl)] max-w-[60ch] text-ink-2">
            Your written agreement sets every amount and date before you pay anything. Read the{" "}
            <Link href="/legal/refunds" className="link">
              refund and cancellation policy
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="plan-faq-title">
        <div className="page-container cols">
          <h2 id="plan-faq-title" className="col-span-4">
            About the plan.
          </h2>
          <div className="col-span-8">
            <FaqList faqs={faqs.filter((f) => f.topic === "pricing")} />
          </div>
        </div>
      </section>

      <CtaSection title="Get your figure in writing." description="Your free consultation ends with one written figure for your plan, and the dates of each instalment." />
    </>
  );
}
