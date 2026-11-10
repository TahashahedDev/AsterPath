import type { Metadata } from "next";
import { FileCheck2, Stamp } from "lucide-react";
import { DemoNotice, PageHeader, Panel, StatusPill, formatDate } from "@/components/dashboard/ui";
import { DueLabel } from "@/components/portal/due-label";
import { PortalUnavailable } from "@/components/portal/portal-unavailable";
import { applicationTone, visaTone } from "@/components/portal/tones";
import { applicationStatusLabels, visaStatusLabels } from "@/features/operations/types";
import { getDemoPortal } from "@/server/demo/portal";
import { isPortalDemoEnabled } from "@/server/demo/workspace";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage() {
  const header = <PageHeader eyebrow="Applications" title="Your university applications" description="Each university is a separate application with its own deadline, status and documents. Admission decisions are made by the university." />;
  if (!isPortalDemoEnabled()) return <>{header}<PortalUnavailable what="applications" /></>;
  const p = getDemoPortal();
  const apps = [...p.applications].sort((a, b) => a.deadline.localeCompare(b.deadline));

  return (
    <div>
      {header}
      <DemoNotice />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ul className="space-y-4" aria-label="Applications">
          {apps.map((a) => (
            <li key={a.id}>
              <article className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="display text-2xl text-ink">{a.university}</h2>
                    <p className="mt-1 text-sm text-ink-soft">{a.programme}</p>
                  </div>
                  <StatusPill tone={applicationTone[a.status]}>{applicationStatusLabels[a.status]}</StatusPill>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  <Fact term="Intake" value={a.intake} />
                  <Fact term="Deadline" value={a.submittedAt ? formatDate(a.deadline) : <DueLabel iso={a.deadline} prefix="" />} />
                  <Fact term="Submitted" value={a.submittedAt ? formatDate(a.submittedAt) : "Not yet"} />
                  <Fact term="Reference" value={a.reference ?? "Issued on submission"} />
                </dl>
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
                    <FileCheck2 className="size-4" aria-hidden="true" /> Required documents
                  </h3>
                  <ul className="mt-2.5 flex flex-wrap gap-2">
                    {a.requiredDocuments.map((d) => (
                      <li key={d} className="rounded-full bg-paper-deep px-3 py-1 text-xs text-ink-soft">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                {a.notes && <p className="mt-4 rounded-xl bg-primary-soft/60 px-4 py-3 text-sm text-primary-deep">{a.notes}</p>}
              </article>
            </li>
          ))}
        </ul>

        <aside>
          <Panel title="Visa status" action={<Stamp className="size-4 text-subtle" aria-hidden="true" />}>
            <StatusPill tone={visaTone[p.student.visaStatus]}>{visaStatusLabels[p.student.visaStatus]}</StatusPill>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Your visa is tracked separately from your applications. It starts after you accept an admission and complete Universitaly pre-enrolment, and the decision is made by the Italian consulate — not the university and not AsterPath.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{term}</dt>
      <dd className="mt-0.5 break-words text-ink-soft">{value}</dd>
    </div>
  );
}
