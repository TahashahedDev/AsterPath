import { packagesStatus, servicePackages, type ServicePackage } from "@/content/packages";
import { ButtonLink } from "@/components/ui/button";
import { CheckList } from "@/components/marketing/cards";
import { formatInr, cn } from "@/lib/utils";

function PricingCard({ pkg }: { pkg: ServicePackage }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[var(--radius-card)] border p-7",
        pkg.highlighted ? "border-transparent bg-inverse text-on-inverse shadow-[var(--shadow-lift)] dark:border-primary/35" : "border-border bg-card",
      )}
    >
      {pkg.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 text-xs font-medium text-inverse">Most complete support</span>
      )}
      <h3 className={cn("text-lg font-semibold tracking-tight", pkg.highlighted ? "text-on-inverse" : "text-ink")}>{pkg.name}</h3>
      <p className={cn("mt-2 min-h-12 text-sm leading-relaxed", pkg.highlighted ? "text-on-inverse/70" : "text-muted")}>{pkg.audience}</p>
      <div className="mt-6">
        <p className={cn("text-xs tracking-wide uppercase", pkg.highlighted ? "text-on-inverse/70" : "text-muted")}>Indicative from</p>
        <p className="mt-1 text-4xl font-semibold tracking-[-0.03em] tabular-nums">{formatInr(pkg.startingPrice)}</p>
        <p className={cn("mt-1 text-sm", pkg.highlighted ? "text-on-inverse/70" : "text-muted")}>Paid in milestones, not upfront</p>
      </div>
      <CheckList
        items={pkg.features}
        className={cn("mt-7 flex-1 border-t pt-6", pkg.highlighted ? "border-on-inverse/15 [&_li]:text-on-inverse/85 [&_svg]:text-gold" : "border-border")}
      />
      <ButtonLink href={`/contact?package=${pkg.slug}`} variant={pkg.highlighted ? "primary" : "secondary"} className="mt-8 w-full">
        Get a free assessment
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
