import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, CreditCard, FileStack, LifeBuoy, ListChecks, Route } from "lucide-react";
import { DemoNotice, Panel, formatDate, formatDateTime } from "@/components/dashboard/ui";
import { AdvisorCard } from "@/components/portal/advisor-card";
import { DueLabel } from "@/components/portal/due-label";
import { stageCopy } from "@/components/portal/journey-copy";
import { LiveOverview, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { ButtonLink } from "@/components/ui/button";
import { destinationLabels } from "@/features/operations/types";
import { daysUntil, getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Overview" };

const priorityRank = { urgent: 0, high: 1, normal: 2, low: 3 } as const;
const outstanding = new Set(["requested", "reupload_required", "rejected", "expired"]);

export default async function PortalOverviewPage() {
  const live = await getMyCase();
  if (live !== null) {
    return (
      <>
        <h1 className="display text-3xl text-ink sm:text-4xl">{live ? <>Welcome, <span className="display-italic text-primary">{live.full_name.split(" ")[0]}</span></> : "Welcome"}</h1>
        {live ? <div className="mt-6"><LiveOverview c={live} /></div> : <NoCaseYet />}
      </>
    );
  }
  if (!isPortalDemoEnabled()) {
    return (
      <>
        <h1 className="display text-3xl text-ink sm:text-4xl">Welcome back</h1>
        <PortalUnavailable what="overview" />
      </>
    );
  }
  const p = getDemoPortal();
  const total = p.journey.length;
  const current = stageCopy[p.journey[p.stageIndex] ?? p.student.stage];
  const next = p.journey[p.stageIndex + 1];
  const progress = Math.round(((p.stageIndex + 0.5) / total) * 100);
  const nextTask = p.tasks.filter((t) => t.status !== "done").sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.dueAt.localeCompare(b.dueAt))[0];
  const docsOutstanding = p.documents.filter((d) => outstanding.has(d.status)).length;
  const deadlines = [
    ...p.applications.map((a) => ({ id: a.id, title: `${a.university} application`, at: a.deadline })),
    ...p.tasks.filter((t) => t.status !== "done").map((t) => ({ id: t.id, title: t.title, at: t.dueAt })),
    ...p.invoices.flatMap((i) => i.instalments.filter((x) => x.status === "due" || x.status === "overdue").map((x) => ({ id: x.id, title: `${x.label} instalment`, at: x.dueAt }))),
  ]
    .filter((d) => daysUntil(d.at) >= 0)
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">Student portal</p>
        <h1 className="display mt-2 text-3xl leading-[1.08] text-ink sm:text-4xl">
          Welcome back, <span className="display-italic text-primary">{p.firstName}</span>
        </h1>
        <p className="mt-2 text-[0.9375rem] text-muted">
          {p.student.course} · {destinationLabels[p.student.destination]} · {p.student.intake}
        </p>
        <DemoNotice />
      </header>

      <section aria-labelledby="journey-hero" className="overflow-hidden rounded-[var(--radius-card)] bg-inverse p-6 text-on-inverse shadow-[var(--shadow-lift)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent-on-inverse uppercase">
              Stage {p.stageIndex + 1} of {total}
            </p>
            <h2 id="journey-hero" className="display mt-2 text-3xl sm:text-4xl">
              {current.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-inverse/80">{current.you}</p>
          </div>
          <Link href="/portal/journey" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full px-1 text-sm font-medium text-accent-on-inverse underline-offset-4 hover:underline lg:self-auto">
            See your full journey <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6">
          <div role="progressbar" aria-label="Journey progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-on-inverse/15">
            <div className="h-full rounded-full bg-accent-on-inverse motion-safe:transition-[width] motion-safe:duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-on-inverse/70">{next ? `Next: ${stageCopy[next].title}` : "Final stage"}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {nextTask && (
            <section aria-labelledby="next-action" className="rounded-[var(--radius-card)] border border-gold/40 bg-gold-soft/60 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">Your next step</p>
              <h2 id="next-action" className="display mt-2 text-2xl text-ink">
                {nextTask.title}
              </h2>
              {nextTask.description && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{nextTask.description}</p>}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DueLabel iso={nextTask.dueAt} />
                <ButtonLink href="/portal/tasks" size="md" className="w-full sm:w-auto">
                  Open task <ArrowRight aria-hidden="true" />
                </ButtonLink>
              </div>
            </section>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/portal/documents" className="group rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-border-strong">
              <p className="flex items-center justify-between text-xs font-medium tracking-wide text-muted uppercase">
                Documents to action <FileStack className="size-4 text-terracotta-deep" aria-hidden="true" />
              </p>
              <p className="display mt-3 text-4xl text-terracotta-deep tabular-nums">{docsOutstanding}</p>
              <p className="mt-1.5 text-xs text-muted group-hover:text-ink">Requested, re-upload or expired →</p>
            </Link>
            <Link href="/portal/applications" className="group rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] hover:border-border-strong">
              <p className="flex items-center justify-between text-xs font-medium tracking-wide text-muted uppercase">
                Applications <ClipboardList className="size-4 text-subtle" aria-hidden="true" />
              </p>
              <p className="display mt-3 text-4xl text-terracotta-deep tabular-nums">{p.applications.length}</p>
              <p className="mt-1.5 text-xs text-muted group-hover:text-ink">One card per university →</p>
            </Link>
          </div>

          <Panel title="Upcoming deadlines" action={<CalendarClock className="size-4 text-subtle" aria-hidden="true" />} bodyClassName="p-0">
            {deadlines.length ? (
              <ul className="divide-y divide-border">
                {deadlines.map((d) => (
                  <li key={d.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-ink">{d.title}</span>
                    <DueLabel iso={d.at} prefix="" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-muted">No deadlines in the coming weeks.</p>
            )}
          </Panel>

          <Panel title="Recent activity" bodyClassName="p-0">
            <ol className="divide-y divide-border">
              {p.activity.slice(0, 5).map((e) => (
                <li key={e.id} className="px-5 py-3.5">
                  <p className="text-sm text-ink">{e.summary}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {e.actor === p.student.name ? "You" : e.actor} · <time dateTime={e.at}>{formatDateTime(e.at)}</time>
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="space-y-6" aria-label="Your advisor and shortcuts">
          <AdvisorCard advisor={p.advisor} studentFirstName={p.firstName} />
          <nav aria-labelledby="quick-links" className="rounded-[var(--radius-card)] border border-border bg-card p-2 shadow-[var(--shadow-card)]">
            <h2 id="quick-links" className="px-3 pt-3 pb-1 text-xs font-semibold tracking-[0.16em] text-terracotta-deep uppercase">
              Quick links
            </h2>
            <ul>
              {[
                { href: "/portal/journey", label: "My journey", icon: Route },
                { href: "/portal/tasks", label: "Tasks", icon: ListChecks },
                { href: "/portal/payments", label: "Payments", icon: CreditCard },
                { href: "/portal/support", label: "Get help", icon: LifeBuoy },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft hover:bg-paper-deep hover:text-ink">
                    <Icon className="size-4 text-subtle" aria-hidden="true" />
                    {label}
                    <ArrowRight className="ml-auto size-4 text-subtle" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="px-1 text-xs text-muted">Last updated {formatDate(p.student.lastActivityAt)}</p>
        </aside>
      </div>
    </div>
  );
}
