import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { faqs } from "@/content/faqs";
import { feeAllowances, packageComparison, packageExclusions, servicePackages } from "@/content/packages";
import { checkSchedule, milestoneShares } from "@/features/payments/milestones";
import { CtaSection } from "@/components/marketing/cta-section";
import { FaqList } from "@/components/marketing/faq-list";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn, formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing — published packages, paid in instalments",
  description: "AsterPath's Italy packages with published starting prices, instalment schedules, included university fees and every third-party cost listed openly.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  // Never display a schedule that doesn't add up to its package price.
  const schedules = servicePackages.filter((p) => checkSchedule(p.milestones, p.startingPrice).ok);

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Clear prices. <span className="display-italic text-primary">Fair instalments.</span></>}
        description="Published starting prices, university application fees included, and you pay stage by stage as work begins. Your final quote is confirmed in writing after a free consultation."
      />

      <section className="page-container mt-16">
        <PricingCards />
      </section>

      <section className="page-container mt-28">
        <SectionHeading eyebrow="Instalments" title={<>Pay as each stage <span className="display-italic text-primary">begins.</span></>} description="No large upfront fee. These are the standard schedules; your written agreement sets the exact amounts and dates." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {schedules.map((pkg) => {
            const shares = milestoneShares(pkg.milestones);
            return (
              <div key={pkg.slug} className="reveal rounded-[var(--radius-card)] border border-border bg-card p-6 sm:p-7">
                <h3 className="display text-2xl text-ink">{pkg.name}</h3>
                <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-paper-deep" aria-hidden="true">
                  {pkg.milestones.map((m, i) => (
                    <span key={m.label} className={i % 2 === 0 ? "bg-primary" : "bg-terracotta"} style={{ width: `${shares[i]}%` }} />
                  ))}
                </div>
                <ol className="mt-5 divide-y divide-border">
                  {pkg.milestones.map((m, i) => (
                    <li key={m.label} className="flex items-baseline justify-between gap-4 py-3">
                      <span className="flex gap-3 text-sm text-ink-soft">
                        <span className="display text-lg text-terracotta-deep tabular-nums">{i + 1}</span>
                        {m.label}
                      </span>
                      <span className="text-sm font-bold tabular-nums">{formatInr(m.amount)}</span>
                    </li>
                  ))}
                  <li className="flex items-baseline justify-between gap-4 pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold tabular-nums">{formatInr(pkg.startingPrice)}</span>
                  </li>
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-container mt-28">
        <h2 className="display text-4xl text-ink">Compare packages</h2>
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card" role="region" aria-label="Package comparison (scrolls sideways on small screens)" tabIndex={0}>
          <table className="w-full min-w-[42rem] text-left text-[0.9375rem]">
            <caption className="sr-only">Features included in each AsterPath package</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-5 font-semibold text-muted">Feature</th>
                {servicePackages.map((p) => (
                  <th key={p.slug} scope="col" className={cn("p-5 text-center font-bold", p.highlighted && "text-primary")}>{p.name}</th>
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
                          <span className="text-sm font-semibold text-ink-soft">{value}</span>
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

      <section className="page-container mt-28 grid gap-6 lg:grid-cols-2">
        <div className="reveal rounded-[1.75rem] border border-border bg-primary-soft/50 p-7 sm:p-10">
          <p className="eyebrow mb-5">Included</p>
          <h2 className="display text-3xl text-ink">University fees we pay for you</h2>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3 text-ink-soft">
              <Plus className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="font-bold text-ink">Application fees</strong> for up to {feeAllowances.applicationUniversities} universities, up to €{feeAllowances.applicationFeesEur} in
                total — in every package.
              </span>
            </li>
            <li className="flex gap-3 text-ink-soft">
              <Plus className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <strong className="font-bold text-ink">Enrolment administrative fees</strong> at your chosen university — the regional tax and revenue stamp — in the
                Complete Journey and Complete + Arrival packages.
              </span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-muted">Fees above the allowance, or for extra universities, are agreed with you in advance.</p>
        </div>
        <div className="reveal rounded-[1.75rem] border border-border bg-paper-deep/70 p-7 sm:p-10">
          <p className="eyebrow mb-5">Never hidden</p>
          <h2 className="display text-3xl text-ink">Not included</h2>
          <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {packageExclusions.map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] text-ink-soft">
                <Minus className="mt-1 size-4 shrink-0 text-terracotta" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">We estimate these with you early, and show any third-party fee before you commit.</p>
        </div>
      </section>

      <section className="page-container mt-28 grid gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="display text-4xl text-ink">Pricing questions</h2>
          <p className="mt-5 text-muted">
            Read our{" "}
            <Link href="/legal/refunds" className="font-semibold text-primary underline-offset-4 hover:underline">
              refund and cancellation policy
            </Link>
            .
          </p>
        </div>
        <FaqList faqs={faqs.filter((f) => f.topic === "pricing")} />
      </section>

      <CtaSection title="Get a written quote for your situation." description="Your free consultation ends with a written quote: what's included, what it costs and when each instalment is due." />
    </>
  );
}
