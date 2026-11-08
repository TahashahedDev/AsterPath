import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Country, KnowledgeReview } from "@/content/countries";
import type { Fulfilment, Service } from "@/content/services";
import { Flag } from "@/components/marketing/flag";
import { ServiceIcon } from "@/components/marketing/service-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DestinationCard({ country, className }: { country: Country; className?: string }) {
  return (
    <Link
      href={`/destinations/${country.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-7",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <Flag code={country.slug} className="h-8 w-12" />
        <ArrowUpRight className="size-5 text-subtle transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden="true" />
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-tight text-ink">{country.name}</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{country.headline}</p>
      <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-ink-soft">
        {country.procedures.slice(0, 3).map((procedure) => (
          <li key={procedure.title} className="flex gap-2.5">
            <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
            {procedure.title}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-deep transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
        <ServiceIcon name={service.icon} className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{service.title}</h3>
      <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{service.summary}</p>
      {!compact && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <FulfilmentBadge fulfilment={service.fulfilment} />
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">Learn more</span>
        </div>
      )}
    </Link>
  );
}

const fulfilmentLabel: Record<Fulfilment["by"], { label: string; tone: "primary" | "gold" | "neutral" }> = {
  asterpath: { label: "Delivered by AsterPath", tone: "primary" },
  partner: { label: "Via authorised partners", tone: "gold" },
  authority: { label: "Decided by authorities", tone: "neutral" },
};

export function FulfilmentBadge({ fulfilment }: { fulfilment: Fulfilment }) {
  const { label, tone } = fulfilmentLabel[fulfilment.by];
  return <Badge tone={tone}>{label}</Badge>;
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
          <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Makes the verification state of country information impossible to miss. */
export function ReviewStatus({ review, className }: { review: KnowledgeReview; className?: string }) {
  const reviewed = review.status === "published" && review.lastReviewedOn;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 text-sm", className)}>
      {reviewed ? (
        <Badge tone="primary">Reviewed {new Date(review.lastReviewedOn!).toLocaleDateString("en-IN", { dateStyle: "medium" })}</Badge>
      ) : (
        <Badge tone="warning">Draft — not yet verified</Badge>
      )}
      <span className="text-muted">
        {reviewed
          ? `Checked against official sources by ${review.reviewer}.`
          : "Last reviewed: not yet reviewed. Always confirm details on the official sources listed."}
      </span>
    </div>
  );
}
