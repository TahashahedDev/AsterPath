import { packagesStatus, servicePackages, type ServicePackage } from "@/content/packages";
import { ButtonLink } from "@/components/ui/button";
import { CheckList } from "@/components/marketing/cards";
import { formatInr, cn } from "@/lib/utils";

function PricingCard({ pkg }: { pkg: ServicePackage }) {
  const hi = pkg.highlighted;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[var(--radius-card)] border p-7 sm:p-8",
        hi ? "border-transparent bg-inverse text-on-inverse shadow-[var(--shadow-lift)] dark:border-primary/35" : "border-border bg-card",
      )}
    >
      {hi && <span className="absolute -top-3 left-7 rounded-full bg-terracotta-soft px-3 py-1 text-xs font-semibold text-terracotta-deep ring-1 ring-terracotta/30">Most complete</span>}
      <h3 className={cn("display text-2xl", hi ? "text-on-inverse" : "text-ink")}>{pkg.name}</h3>
      <p className={cn("mt-2 min-h-12 text-sm leading-relaxed", hi ? "text-on-inverse/75" : "text-muted")}>{pkg.audience}</p>
      <div className="mt-6">
        <p className={cn("text-xs font-semibold tracking-wide uppercase", hi ? "text-on-inverse/75" : "text-muted")}>From</p>
        <p className="mt-1 text-4xl font-bold tracking-[-0.03em] tabular-nums">{formatInr(pkg.startingPrice)}</p>
        <p className={cn("mt-1 text-sm", hi ? "text-on-inverse/75" : "text-muted")}>In {pkg.milestones.length} instalments</p>
      </div>
      <CheckList items={pkg.features} className={cn("mt-7 flex-1 border-t pt-6", hi ? "border-on-inverse/15 [&_li]:text-on-inverse/90 [&_svg]:text-accent-on-inverse" : "border-border")} />
      <div className={cn("mt-6 rounded-xl p-4 text-sm", hi ? "bg-on-inverse/10" : "bg-primary-soft/60")}>
        <p className={cn("font-semibold", hi ? "text-on-inverse" : "text-primary-deep")}>Included university fees</p>
        <ul className={cn("mt-1.5 space-y-1 leading-relaxed", hi ? "text-on-inverse/80" : "text-ink-soft")}>
          {pkg.includedFees.map((fee) => (
            <li key={fee}>{fee}</li>
          ))}
        </ul>
      </div>
      <ButtonLink href={`/contact?package=${pkg.slug}`} variant={hi ? "primary" : "secondary"} className="mt-6 w-full">
        Book a free consultation
      </ButtonLink>
    </div>
  );
}

export function PricingCards() {
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
        {servicePackages.map((pkg) => (
          <PricingCard key={pkg.slug} pkg={pkg} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">{packagesStatus.note}</p>
    </div>
  );
}
