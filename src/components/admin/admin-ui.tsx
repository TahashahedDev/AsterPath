import Link from "next/link";
import { Database, Lock, ShieldCheck } from "lucide-react";
import { DemoNotice, EmptyState } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

/**
 * Shared server-rendered pieces for the admin workspace. Interactive pieces
 * (the CRM board and its drawer) live in their own client modules.
 */

/** Shown in place of fixtures when the demo workspace is switched off. */
export function DemoUnavailable({ module }: { module: string }) {
  return (
    <div className="mt-8">
      <EmptyState
        icon={Database}
        title={`${module} is not connected yet`}
        description="This module connects to the database in a later release. Demo data is switched off in this environment, so nothing is shown rather than anything invented."
      />
    </div>
  );
}

export type DirectorySource = "supabase" | "local" | "demo" | "unavailable";

/** Says where lead figures come from: real enquiries, local development enquiries, or demo fixtures. */
export function LeadSourceNote({ source }: { source: DirectorySource }) {
  if (source === "demo") return <DemoNotice>These enquiries are synthetic fixtures. Real enquiries appear here once enquiry storage is connected.</DemoNotice>;
  if (source === "unavailable") return null;
  return (
    <p role="note" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary-deep">
      <Database className="size-3.5" aria-hidden="true" />
      {source === "supabase" ? "Live enquiries from Supabase" : "Local development enquiries (.data/leads.ndjson)"}
    </p>
  );
}

type FilterField = { name: string; label: string; value: string; options: { value: string; label: string }[] };

/** A plain GET form: filters live in the URL, so they work without JavaScript and can be shared. */
export function FilterBar({ action, search, fields, resultLabel }: { action: string; search?: { value: string; placeholder: string }; fields: FilterField[]; resultLabel: string }) {
  const active = Boolean(search?.value) || fields.some((f) => f.value);
  return (
    <form action={action} method="get" role="search" className="mt-8 flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:flex-wrap sm:items-end">
      {search && (
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted sm:min-w-56">
          Search
          <input
            type="search"
            name="q"
            defaultValue={search.value}
            placeholder={search.placeholder}
            className="h-10 rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink placeholder:text-subtle"
          />
        </label>
      )}
      {fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1 text-xs font-medium text-muted sm:w-48">
          {f.label}
          <select name={f.name} defaultValue={f.value} className="h-10 rounded-lg border border-border-strong bg-paper px-2.5 text-sm text-ink">
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <div className="flex items-center gap-2">
        <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary-deep">
          Apply
        </button>
        {active && (
          <Link href={action} className="inline-flex h-10 items-center rounded-lg px-3 text-sm text-ink-soft hover:bg-ink/5">
            Clear
          </Link>
        )}
      </div>
      <p className="text-xs text-muted sm:ml-auto sm:self-center" aria-live="polite">
        {resultLabel}
      </p>
    </form>
  );
}

export function Timeline({ items, empty = "Nothing recorded yet." }: { items: { id: string; at: string; when: string; title: React.ReactNode; meta?: React.ReactNode }[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span aria-hidden="true" className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-card bg-primary" />
          <p className="text-sm text-ink">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted tabular-nums">
            <time dateTime={item.at}>{item.when}</time>
          </p>
          {item.meta && <div className="mt-1 text-xs text-muted">{item.meta}</div>}
        </li>
      ))}
    </ol>
  );
}

/** A definition list for profile-style facts. */
export function Facts({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2", className)}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs text-muted">{i.label}</dt>
          <dd className="mt-0.5 break-words text-ink">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Buttons for actions that have no backend yet: visible so the workflow is clear, disabled so nothing pretends to work. */
export function DisabledActions({ actions, reason, id }: { actions: string[]; reason: string; id: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button key={a} type="button" disabled aria-describedby={id} className="h-10 cursor-not-allowed rounded-lg border border-border-strong bg-paper px-4 text-sm font-medium text-subtle">
            {a}
          </button>
        ))}
      </div>
      <p id={id} className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        {reason}
      </p>
    </div>
  );
}

/** A short list of rules or prerequisites, shown with a shield. */
export function RuleList({ title, items, className }: { title: string; items: React.ReactNode[]; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-border bg-paper-deep/50 p-5", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-ink-soft">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-terracotta-deep" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TextLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = "font-medium text-primary underline-offset-4 hover:underline";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
