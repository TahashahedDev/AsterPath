import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { DataTable, EmptyState, PageHeader, Panel, StatusPill, formatDate, type Column, type PillTone } from "@/components/dashboard/ui";
import { CaseDocumentsPanel } from "@/components/documents/admin-documents";
import type { DocumentTypeRow } from "@/lib/supabase/types";
import type { DocumentWithHistory } from "@/server/services/documents";
import { AddApplicationForm, AddCaseTaskForm, CaseStageForm, ConfirmPaymentForm } from "@/components/admin/casework-forms";
import { workflowLabel } from "@/components/admin/format";
import { setCaseTaskDone, updateApplication } from "@/app/(admin)/admin/students/actions";
import { setInstalmentStatus } from "@/app/(admin)/admin/payments/actions";
import type { ApplicationRowStatus, CaseStatus, InstalmentRowStatus, StudentCaseRow } from "@/lib/supabase/types";
import { applicationStatusLabels } from "@/features/operations/types";
import type { StaffMember } from "@/features/operations/types";
import { formatInr } from "@/lib/utils";
import type { CaseWithMoney, LedgerRow } from "@/server/services/cases";

const caseStatus: Record<CaseStatus, { label: string; tone: PillTone }> = {
  awaiting_payment: { label: "Awaiting first payment", tone: "warning" },
  active: { label: "Active", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
};
const instalmentStatus: Record<InstalmentRowStatus, { label: string; tone: PillTone }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  due: { label: "Due", tone: "gold" },
  paid: { label: "Paid", tone: "success" },
  waived: { label: "Waived", tone: "neutral" },
};
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const smallButton = "h-9 rounded-lg border border-border-strong px-3 text-sm font-medium text-ink hover:bg-ink/5";

export function LiveCaseList({ cases, team }: { cases: StudentCaseRow[]; team: StaffMember[] }) {
  if (cases.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState icon={Users} title="No cases yet" description="A case opens from a lead once the agreement is signed: save a quote on the lead, then choose Open student case." />
      </div>
    );
  }
  const columns: Column<StudentCaseRow>[] = [
    { key: "name", header: "Student", cell: (c) => c.full_name },
    { key: "destination", header: "Destination", cell: (c) => `${titleCase(c.destination)} · ${c.level}` },
    { key: "intake", header: "Intake", cell: (c) => c.intake, className: "whitespace-nowrap", desktopOnly: true },
    { key: "advisor", header: "Advisor", cell: (c) => team.find((m) => m.id === c.advisor_id)?.name ?? "Unassigned", desktopOnly: true },
    { key: "stage", header: "Stage", cell: (c) => <StatusPill tone="primary">{workflowLabel(c.stage)}</StatusPill> },
    { key: "status", header: "Status", cell: (c) => <StatusPill tone={caseStatus[c.status].tone}>{caseStatus[c.status].label}</StatusPill> },
  ];
  return (
    <div className="mt-6">
      <DataTable rows={cases} columns={columns} rowKey={(c) => c.id} primary="name" caption="Student cases" href={(c) => `/admin/students/${c.id}`} />
    </div>
  );
}

export function LiveCaseDetail({ c, team, documents, documentTypes }: { c: CaseWithMoney; team: StaffMember[]; documents: DocumentWithHistory[]; documentTypes: DocumentTypeRow[] }) {
  return (
    <div>
      <Link href="/admin/students" className="mb-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All students
      </Link>
      <PageHeader
        eyebrow="Student case"
        title={c.full_name}
        description={`${titleCase(c.destination)} · ${c.level} · ${c.intake} · opened ${formatDate(c.opened_at)}`}
        actions={<StatusPill tone={caseStatus[c.status].tone}>{caseStatus[c.status].label}</StatusPill>}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Journey" className="lg:col-span-2">
          <CaseStageForm key={c.stage} caseId={c.id} stage={c.stage} />
          <p className="mt-3 text-xs text-muted">The student sees the stage in their portal as soon as you save it.</p>
        </Panel>
        <Panel title="People">
          <dl className="grid gap-2 text-sm">
            <div><dt className="text-xs text-muted">Advisor</dt><dd className="text-ink">{team.find((m) => m.id === c.advisor_id)?.name ?? "Unassigned (set it on the lead)"}</dd></div>
            <div><dt className="text-xs text-muted">Student email</dt><dd className="break-all text-ink">{c.student_email}</dd></div>
            {c.referral_code && <div><dt className="text-xs text-muted">Referral code</dt><dd className="font-mono text-ink">{c.referral_code}{c.referrals.length > 0 && <span className="ml-2 font-sans text-xs text-muted">used {c.referrals.length}×</span>}</dd></div>}
            <div><dt className="text-xs text-muted">Portal</dt><dd className="text-ink">{c.student_user_id ? "Linked to their account" : "Not linked yet: they sign up with this email"}</dd></div>
          </dl>
        </Panel>
      </div>

      <Panel title="University applications" className="mt-4">
        <AddApplicationForm caseId={c.id} />
        {c.applications.length > 0 && (
          <ul className="mt-5 divide-y divide-border">
            {c.applications.map((a) => (
              <li key={a.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{a.university}</p>
                  <p className="text-sm text-muted">
                    {a.programme}
                    {a.deadline && <> · deadline <span className="tabular-nums">{formatDate(a.deadline)}</span></>}
                    {a.submitted_on && <> · submitted {formatDate(a.submitted_on)}</>}
                  </p>
                </div>
                <form action={updateApplication} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="caseId" value={c.id} />
                  <input type="hidden" name="applicationId" value={a.id} />
                  <label className="sr-only" htmlFor={`st-${a.id}`}>Status for {a.university}</label>
                  <select id={`st-${a.id}`} name="status" defaultValue={a.status} className="h-9 rounded-lg border border-border-strong bg-paper px-2 text-sm text-ink">
                    {(Object.keys(applicationStatusLabels) as ApplicationRowStatus[]).map((st) => <option key={st} value={st}>{applicationStatusLabels[st]}</option>)}
                  </select>
                  <label className="sr-only" htmlFor={`ref-${a.id}`}>Portal reference for {a.university}</label>
                  <input id={`ref-${a.id}`} name="portalReference" defaultValue={a.portal_reference ?? ""} placeholder="Portal ref." maxLength={80} className="h-9 w-28 rounded-lg border border-border-strong bg-paper px-2 text-sm text-ink" />
                  <button type="submit" className={smallButton}>Save</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <CaseDocumentsPanel caseId={c.id} documents={documents} types={documentTypes} />

      <Panel title="Tasks for the student" className="mt-4">
        <AddCaseTaskForm caseId={c.id} />
        {c.tasks.length > 0 && (
          <ul className="mt-5 divide-y divide-border">
            {c.tasks.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className={t.done ? "text-muted line-through" : "text-ink"}>
                  {t.title}
                  {t.due_on && <span className="ml-2 text-xs text-muted tabular-nums">due {formatDate(t.due_on)}</span>}
                </span>
                <form action={setCaseTaskDone}>
                  <input type="hidden" name="caseId" value={c.id} />
                  <input type="hidden" name="taskId" value={t.id} />
                  <input type="hidden" name="done" value={String(!t.done)} />
                  <button type="submit" className={smallButton}>{t.done ? "Reopen" : "Mark done"}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Instalments" className="mt-4">
        {c.instalments.length === 0 ? (
          <p className="text-sm text-muted">Payment records are visible to finance, admins and owners.</p>
        ) : (
          <InstalmentList rows={c.instalments.map((i) => ({ ...i, studentName: c.full_name }))} />
        )}
      </Panel>
    </div>
  );
}

/** Instalments with finance actions. RLS decides whether the actions actually save. */
export function InstalmentList({ rows, showStudent = false }: { rows: LedgerRow[]; showStudent?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {rows.map((i) => (
        <li key={i.id} className="grid gap-3 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm">
              {showStudent && <span className="font-medium text-ink">{i.studentName} · </span>}
              <span className="text-ink">{i.position}. {i.stage}</span>
              <span className="ml-2 text-xs text-muted">
                {i.status === "paid" && i.paid_at ? `paid ${formatDate(i.paid_at)} · ref ${i.payment_reference}` : i.due_on ? `due ${formatDate(i.due_on)}` : ""}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums text-ink">{formatInr(i.amount)}</span>
              <StatusPill tone={instalmentStatus[i.status].tone}>{instalmentStatus[i.status].label}</StatusPill>
            </span>
          </div>
          {i.status !== "paid" && i.status !== "waived" && (
            <div className="grid gap-3 rounded-xl bg-paper-deep/50 p-3">
              <ConfirmPaymentForm instalmentId={i.id} label={i.stage} />
              <form action={setInstalmentStatus} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="instalmentId" value={i.id} />
                <label className="text-xs font-medium text-muted">
                  Due date
                  <input name="dueOn" type="date" defaultValue={i.due_on ?? ""} className="mt-1 block h-9 rounded-lg border border-border-strong bg-paper px-2 text-sm text-ink" />
                </label>
                <button type="submit" name="status" value="due" className={smallButton}>Request payment</button>
                {i.stage === "Arrival" && <button type="submit" name="status" value="waived" className={smallButton}>Waive (visa refused)</button>}
              </form>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
