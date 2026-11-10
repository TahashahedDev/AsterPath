import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { DemoNotice, EmptyState, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { DueLabel } from "@/components/portal/due-label";
import { LiveTasks, NoCaseYet } from "@/components/portal/live-case";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { getMyCase } from "@/server/services/cases";
import { priorityLabels, priorityTone, taskTone } from "@/components/portal/tones";
import { taskStatusLabels } from "@/features/operations/types";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const header = <PageHeader eyebrow="Tasks" title="What we need from you" description="Tasks your advisor has assigned to you. Work we're doing on your behalf is tracked by the team and shows up in your activity." />;
  const live = await getMyCase();
  if (live !== null) return <>{header}{live ? <LiveTasks c={live} /> : <NoCaseYet />}</>;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="tasks" /></>;
  const tasks = [...getDemoPortal().tasks].sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || a.dueAt.localeCompare(b.dueAt));

  return (
    <div>
      {header}
      <DemoNotice />
      {tasks.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={ListChecks} title="Nothing to do right now" description="When your advisor needs something from you, it will appear here with a due date." />
        </div>
      ) : (
        <ul className="mt-8 space-y-3" aria-label="Your tasks">
          {tasks.map((t) => (
            <li key={t.id}>
              <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="min-w-0 font-semibold text-ink">{t.title}</h2>
                  <StatusPill tone={taskTone[t.status]}>{taskStatusLabels[t.status]}</StatusPill>
                </div>
                {t.description && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t.description}</p>}
                <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <div>
                    <dt className="sr-only">Due</dt>
                    <dd>
                      <DueLabel iso={t.dueAt} done={t.status === "done"} />
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Priority</dt>
                    <dd>
                      <StatusPill tone={priorityTone[t.priority]}>{priorityLabels[t.priority]}</StatusPill>
                    </dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Responsible:</dt>
                    <dd className="font-medium text-ink">You</dd>
                  </div>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
