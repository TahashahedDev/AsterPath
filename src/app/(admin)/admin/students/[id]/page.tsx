import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { applicationStatusLabels, degreeLabels, destinationLabels, documentStatusLabels, taskStatusLabels, visaStatusLabels } from "@/features/operations/types";
import { DemoNotice, PageHeader, Panel, StatusPill, formatDate, formatDateTime } from "@/components/dashboard/ui";
import { DemoUnavailable, Facts, Timeline } from "@/components/admin/admin-ui";
import { applicationStatusTone, documentStatusTone, instalmentLabels, instalmentTone, priorityLabels, priorityTone, visaTone, workflowLabel } from "@/components/admin/format";
import { WorkflowTrack } from "@/components/admin/workflow-track";
import { LiveCaseDetail } from "@/components/admin/live-casework";
import { getCase } from "@/server/services/cases";
import { listCaseDocuments, listDocumentTypes } from "@/server/services/documents";
import { getTeamDirectory } from "@/server/services/lead-directory";
import {
  demoActivity, demoApplications, demoDocuments, demoInvoices, demoMessages, demoTasks, isDemoWorkspaceEnabled, journeyFor, staffById, studentById,
} from "@/server/demo/workspace";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = { title: "Student case" };

export default async function StudentCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = /^[0-9a-f-]{36}$/.test(id) ? await getCase(id) : null;
  if (live === undefined) notFound();
  if (live) {
    const [team, documents, documentTypes] = await Promise.all([getTeamDirectory(), listCaseDocuments(live.id), listDocumentTypes()]);
    return <LiveCaseDetail c={live} team={team} documents={documents ?? []} documentTypes={documentTypes ?? []} />;
  }
  if (!isDemoWorkspaceEnabled()) {
    return (
      <div>
        <PageHeader eyebrow="Casework" title="Student case" />
        <DemoUnavailable module="Student case records" />
      </div>
    );
  }
  const student = studentById(id);
  if (!student) notFound();

  const advisor = staffById(student.advisorId);
  const applications = demoApplications.filter((a) => a.studentId === id);
  const documents = demoDocuments.filter((d) => d.studentId === id);
  const tasks = demoTasks.filter((t) => t.studentId === id);
  const messages = demoMessages.filter((m) => m.studentId === id).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const invoices = demoInvoices.filter((i) => i.studentId === id);
  const activity = demoActivity.filter((e) => e.studentId === id).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const journey = journeyFor(student.destination);

  return (
    <div>
      <Link href="/admin/students" className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All students
      </Link>
      <PageHeader
        eyebrow={`${destinationLabels[student.destination]} · ${student.intake}`}
        title={student.name}
        description={`${degreeLabels[student.level]} · ${student.course}. Advisor: ${advisor?.name ?? "Unassigned"}.`}
        actions={<StatusPill tone="primary">{workflowLabel(student.stage)}</StatusPill>}
      />
      <DemoNotice />
      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        When live, this record is permission-gated by Row Level Security: only the assigned advisor, reviewers and administrators can open personal data, and every view is audited.
      </p>

      <Panel title="Case workflow" className="mt-6">
        <WorkflowTrack stages={journey.map((value) => ({ value, label: workflowLabel(value) }))} current={student.stage} />
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-paper-deep/50 px-4 py-3 text-sm">
          <span className="font-medium text-ink">Visa</span>
          <StatusPill tone={visaTone[student.visaStatus]}>{visaStatusLabels[student.visaStatus]}</StatusPill>
          <span className="text-xs text-muted">Tracked separately from university applications — an admission never implies a visa outcome.</span>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Profile" className="min-w-0 lg:col-span-2">
          <Facts
            items={[
              { label: "Email", value: student.email },
              { label: "WhatsApp", value: <span className="tabular-nums">{student.whatsapp}</span> },
              { label: "City", value: student.city },
              { label: "Course", value: student.course },
              { label: "Academic background", value: student.academicSummary },
              { label: "Last activity", value: formatDateTime(student.lastActivityAt) },
            ]}
          />
        </Panel>
        <Panel title="Shortlist" className="min-w-0">
          {student.shortlist.length === 0 ? (
            <p className="text-sm text-muted">No universities shortlisted yet.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {student.shortlist.map((u, i) => (
                <li key={u} className="flex gap-3">
                  <span className="w-4 text-right text-subtle tabular-nums">{i + 1}</span>
                  <span className="text-ink">{u}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title="Applications" className="mt-4" bodyClassName="p-0" action={<Link href="/admin/applications" className="inline-flex min-h-10 items-center text-xs font-medium text-primary hover:underline">All applications</Link>}>
        {applications.length === 0 ? (
          <p className="p-5 text-sm text-muted">No applications yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{a.university}</p>
                  <p className="text-xs text-muted">{a.programme} · {a.intake}</p>
                </div>
                <p className="text-xs text-muted tabular-nums">Deadline {formatDate(a.deadline)}</p>
                <StatusPill tone={applicationStatusTone[a.status]}>{applicationStatusLabels[a.status]}</StatusPill>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Documents" className="min-w-0" bodyClassName="p-0">
          {documents.length === 0 ? (
            <p className="p-5 text-sm text-muted">No documents requested yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/documents/${d.id}`} className="flex min-h-12 items-center gap-3 px-5 py-3 hover:bg-paper-deep/40">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{d.title}</span>
                      <span className="block text-xs text-muted">{d.category}</span>
                    </span>
                    <StatusPill tone={documentStatusTone[d.status]}>{documentStatusLabels[d.status]}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Tasks" className="min-w-0" bodyClassName="p-0">
          {tasks.length === 0 ? (
            <p className="p-5 text-sm text-muted">No tasks.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tasks.map((t) => (
                <li key={t.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 text-sm text-ink">{t.title}</span>
                    <StatusPill tone={t.audience === "internal" ? "neutral" : "gold"}>{t.audience === "internal" ? "Internal" : "Student task"}</StatusPill>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted tabular-nums">
                    Due {formatDate(t.dueAt)} · {taskStatusLabels[t.status]}
                    <StatusPill tone={priorityTone[t.priority]}>{priorityLabels[t.priority]}</StatusPill>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Messages" className="min-w-0" action={<Link href="/admin/communications" className="inline-flex min-h-10 items-center text-xs font-medium text-primary hover:underline">Communications</Link>}>
          {messages.length === 0 ? (
            <p className="text-sm text-muted">No messages yet.</p>
          ) : (
            <ol className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className={m.from === "advisor" ? "ml-6 rounded-xl bg-primary-soft px-3.5 py-2.5" : "mr-6 rounded-xl bg-paper-deep px-3.5 py-2.5"}>
                  <p className="text-sm text-ink">{m.body}</p>
                  <p className="mt-1 text-xs text-muted">{m.authorName} · <time dateTime={m.at}>{formatDateTime(m.at)}</time></p>
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel title="Payment status" className="min-w-0" action={<Link href="/admin/payments" className="inline-flex min-h-10 items-center text-xs font-medium text-primary hover:underline">Payments</Link>}>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted">No invoice issued.</p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id}>
                <p className="text-xs text-muted">{inv.number} · issued {formatDate(inv.issuedAt)} · total {formatInr(inv.totalInr)}</p>
                <ul className="mt-2 divide-y divide-border">
                  {inv.instalments.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 text-ink">{i.label}</span>
                      <span className="text-xs text-muted tabular-nums">{formatDate(i.dueAt)}</span>
                      <span className="w-20 text-right tabular-nums">{formatInr(i.amountInr)}</span>
                      <StatusPill tone={instalmentTone[i.status]}>{instalmentLabels[i.status]}</StatusPill>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2">Internal notes <StatusPill>Staff only</StatusPill></span>} className="min-w-0">
          {student.internalNotes.length === 0 ? (
            <p className="text-sm text-muted">No internal notes.</p>
          ) : (
            <ul className="space-y-2 text-sm text-ink-soft">
              {student.internalNotes.map((n) => (
                <li key={n} className="rounded-lg bg-paper-deep/60 px-3 py-2">{n}</li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Activity" className="min-w-0">
          <Timeline
            items={activity.map((e) => ({
              id: e.id,
              at: e.at,
              when: formatDateTime(e.at),
              title: (
                <>
                  <span className="font-medium">{e.actor}</span> — {e.summary}
                </>
              ),
              meta: e.visibleToStudent ? "Visible to student" : "Internal only",
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}
