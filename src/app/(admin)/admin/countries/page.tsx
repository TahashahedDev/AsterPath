import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { regions } from "@/content/italy/regions";
import { CONTENT_CHECKED_ON, contentReview, sources } from "@/content/italy/sources";
import { universities } from "@/content/italy/universities";

export const metadata: Metadata = { title: "Countries" };

export default function CountriesPage() {
  return (
    <div>
      <PageHeader eyebrow="Content" title="Countries" description="Which destinations AsterPath offers, and the official sources behind each one." />
      <Panel
        className="mt-8"
        title={<span className="display text-2xl">Italy</span>}
        action={<StatusPill tone="success">Active</StatusPill>}
      >
        <dl className="grid grid-cols-1 gap-4 text-sm min-[420px]:grid-cols-2 sm:grid-cols-4">
          {[
            ["Universities listed", universities.length],
            ["Regions covered", regions.length],
            ["Official sources", Object.keys(sources).length],
            ["Last checked", formatDate(CONTENT_CHECKED_ON)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-paper-deep/60 px-4 py-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="display mt-1 text-2xl text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">
          Review status: {contentReview.status === "reviewed" ? `reviewed by ${contentReview.reviewedBy}` : "researched, awaiting a named reviewer"}.
        </p>
        <h3 className="mt-6 text-xs font-semibold tracking-[0.14em] text-subtle uppercase">Sources</h3>
        <ul className="mt-2 divide-y divide-border">
          {Object.values(sources).map((s) => (
            <li key={s.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline sm:min-h-0 sm:w-80">
                {s.label}
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <span className="text-xs text-muted">{s.publisher}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {["Germany", "France"].map((country) => (
          <Panel key={country} title={<span className="display text-2xl">{country}</span>} action={<StatusPill>Not yet offered</StatusPill>}>
            <p className="text-sm leading-relaxed text-ink-soft">Content needs verification before publishing. No requirements, deadlines or costs are shown for {country} until they are checked against official sources.</p>
            <p className="mt-2 text-xs text-muted">Enquiries mentioning {country} are kept on a waitlist in the CRM.</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
