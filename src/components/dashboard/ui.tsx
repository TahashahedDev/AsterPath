import Link from "next/link";
import { FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Building blocks for the admin workspace and student portal. Server components
 * only; anything interactive lives next to the page that needs it.
 */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">{eyebrow}</p>}
        <h1 className="display mt-2 text-3xl leading-[1.08] text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Required on every page that renders fixtures from server/demo. */
export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div role="note" className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-warning-border bg-warning-bg/70 px-4 py-3 text-sm text-warning-fg">
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">Demo data.</strong>{" "}
        {children ?? "Every name, file and amount on this page is synthetic. Nothing is saved, and no real student record is shown."}
      </p>
    </div>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return <span className={cn("rounded-full bg-warning-bg px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-warning-fg uppercase ring-1 ring-warning-border ring-inset", className)}>Demo</span>;
}

export function Panel({ title, action, className, children, bodyClassName }: { title?: React.ReactNode; action?: React.ReactNode; className?: string; bodyClassName?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          {title && <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: LucideIcon; tone?: "default" | "attention" }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
        {Icon && <Icon className={cn("size-4", tone === "attention" ? "text-terracotta-deep" : "text-subtle")} aria-hidden="true" />}
      </div>
      <p className="display mt-3 text-4xl text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export type PillTone = "neutral" | "primary" | "gold" | "warning" | "danger" | "success";
const pillTones: Record<PillTone, string> = {
  neutral: "bg-ink/[0.05] text-ink-soft ring-border-strong",
  primary: "bg-primary-soft text-primary-deep ring-primary/20",
  gold: "bg-gold-soft text-gold-deep ring-gold/30",
  warning: "bg-warning-bg text-warning-fg ring-warning-border",
  danger: "bg-danger/10 text-danger ring-danger/25",
  success: "bg-primary-soft text-primary-deep ring-primary/25",
};

export function StatusPill({ tone = "neutral", children, className }: { tone?: PillTone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset", pillTones[tone], className)}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon?: LucideIcon; title: string; description: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-border-strong bg-card/60 px-6 py-12 text-center">
      {Icon && <Icon className="size-7 text-subtle" strokeWidth={1.5} aria-hidden="true" />}
      <h2 className="mt-4 font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export type Column<T> = { key: string; header: string; cell: (row: T) => React.ReactNode; className?: string; /** Hidden in the mobile card view. */ desktopOnly?: boolean };

/**
 * A table on wide screens and a stacked list on phones, so neither scrolls sideways.
 * `primary` is the column used as the card title on mobile.
 */
export function DataTable<T>({ rows, columns, rowKey, primary, caption, href }: { rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string; primary: string; caption: string; href?: (row: T) => string }) {
  const first = columns.find((c) => c.key === primary)!;
  const rest = columns.filter((c) => c.key !== primary && !c.desktopOnly);
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-paper-deep/60 text-xs tracking-wide text-muted uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-3 font-medium", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="align-top hover:bg-paper-deep/40">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3.5 text-ink-soft", c.className)}>
                  {c.key === primary && href ? (
                    <Link href={href(row)} className="font-medium text-ink underline-offset-4 hover:text-primary hover:underline">
                      {c.cell(row)}
                    </Link>
                  ) : (
                    c.cell(row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-border md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="p-4">
            <p className="font-medium text-ink">{href ? <Link href={href(row)} className="underline-offset-4 hover:underline">{first.cell(row)}</Link> : first.cell(row)}</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {rest.map((c) => (
                <div key={c.key} className="contents">
                  <dt className="text-muted">{c.header}</dt>
                  <dd className="min-w-0 text-ink-soft">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-deep", className)}>
      {initials}
    </span>
  );
}
