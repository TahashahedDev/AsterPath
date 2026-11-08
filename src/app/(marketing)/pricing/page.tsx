import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { packageComparison, packageExclusions, servicePackages } from "@/content/packages";
import { checkSchedule, milestoneShares } from "@/features/payments/milestones";
import { CtaSection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqList } from "@/components/marketing/faq-list";
import { faqs } from "@/content/faqs";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — transparent packages and milestone payments",
  description: "Published starting prices for AsterPath packages, an example milestone schedule, and a full list of third-party costs that are never hidden in our fees.",
  alternates: { canonical: "/pricing" },
};

const pricingFaqs = faqs.filter((f) => /price|payment|included/i.test(f.question));

export default function PricingPage() {
  const example = servicePackages.find((p) => p.exampleMilestones);
  const schedule = example?.exampleMilestones ?? [];
  // Never show a schedule that doesn't add up to the package price.
  const scheduleValid = example ? checkSchedule(schedule, example.startingPrice).ok : false;
  const shares = scheduleValid ? milestoneShares(schedule) : [];

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Clear prices. <span className="serif-accent text-primary">Fair payments.</span></>}
        description="Our packages start from published prices, you pay in stages as work is delivered, and every external cost is listed separately. Your final quote is confirmed in writing after a free profile assessment."
      />

      <section className="page-container mt-16">
        <PricingCards />
      </section>

      {example && scheduleValid && (
        <section className="page-container mt-24 grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Milestone payments</p>
            <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.025em]">Pay as each stage is delivered.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              An example schedule for {example.name} at its indicative starting price of {formatInr(example.startingPrice)}. Your
              actual schedule and due dates are set out in your written agreement.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 sm:p-8">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-deep" aria-hidden="true">
              {schedule.map((m, i) => (
                <span key={m.label} className={i % 2 === 0 ? "bg-primary" : "bg-gold"} style={{ width: `${shares[i]}%` }} />
              ))}
            </div>
            <ol className="mt-6 divide-y divide-border">
              {schedule.map((m, i) => (
                <li key={m.label} className="flex items-baseline justify-between gap-6 py-4">
                  <span className="flex gap-3">
                    <span className="font-serif text-xl text-gold-deep tabular-nums">{i + 1}</span>
                    <span className="text-[0.9375rem] text-ink-soft">{m.label}</span>
                  </span>
                  <span className="font-medium tabular-nums">{formatInr(m.amount)}</span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-6 pt-4">
                <span className="font-medium">Total</span>
                <span className="text-lg font-semibold tabular-nums">{formatInr(example.startingPrice)}</span>
              </li>
            </ol>
          </div>
        </section>
      )}

      <section className="page-container mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compare packages</h2>
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card" role="region" aria-label="Package comparison (scrolls sideways on small screens)" tabIndex={0}>
          <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
            <caption className="sr-only">Features included in each AsterPath package</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-5 font-medium text-muted">Feature</th>
                {servicePackages.map((p) => (
                  <th key={p.slug} scope="col" className="p-5 text-center font-semibold">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packageComparison.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <th scope="row" className="p-5 font-normal text-ink-soft">{row.feature}</th>
                  {servicePackages.map((p) => {
                    const value = row.values[p.slug];
                    return (
                      <td key={p.slug} className="p-5 text-center">
                        {value === true ? (
                          <Check className="mx-auto size-4 text-primary" aria-label="Included" />
                        ) : value === false || value === undefined ? (
                          <Minus className="mx-auto size-4 text-subtle" aria-label="Not included" />
                        ) : (
                          <span className="text-sm text-ink-soft">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-container mt-24 grid gap-10 rounded-[1.5rem] border border-border bg-paper-deep/60 p-7 sm:p-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <p className="eyebrow mb-4">Never hidden</p>
          <h2 className="text-3xl leading-[1.1] font-semibold tracking-[-0.025em]">What our price doesn&rsquo;t include</h2>
          <p className="mt-5 leading-relaxed text-muted">
            These are paid to universities, governments and other third parties. We help you estimate them early, and where we
            coordinate a third-party service, its fee is shown to you before you commit.
          </p>
        </div>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {packageExclusions.map((item) => (
            <li key={item} className="flex gap-3 border-b border-border pb-3 text-[0.9375rem] text-ink-soft">
              <Minus className="mt-1 size-4 shrink-0 text-gold-deep" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="page-container mt-24 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-3xl font-semibold tracking-[-0.025em]">Pricing questions</h2>
        <FaqList faqs={pricingFaqs} />
      </section>

      <CtaSection title="Get a quote for your situation." description="Your free profile assessment ends with a written quote — what's included, what it costs and when each payment is due." />
    </>
  );
}
