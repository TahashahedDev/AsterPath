"use client";

import { useActionState } from "react";
import { addLeadNote, openCase, type FormState } from "@/app/(admin)/admin/crm/actions";
import { addApplication, addCaseTask, updateCaseStage } from "@/app/(admin)/admin/students/actions";
import { confirmInstalment } from "@/app/(admin)/admin/payments/actions";
import { workflowStages } from "@/features/operations/types";
import type { CaseStage } from "@/lib/supabase/types";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const field = "h-10 w-full rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";
const idle: FormState = { status: "idle" };

function Message({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role={state.status === "saved" ? "status" : "alert"} className={`text-sm ${state.status === "saved" ? "text-primary-deep" : "text-danger"}`}>
      {state.message}
    </p>
  );
}

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(addLeadNote, idle);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="leadId" value={leadId} />
      <label htmlFor="lead-note" className="text-xs font-medium text-muted">Add a note</label>
      <textarea id="lead-note" name="body" rows={3} maxLength={2000} required className="w-full rounded-lg border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="What was said, what was agreed, what happens next" />
      <div className="flex items-center gap-3">
        <Button type="submit" size="md" variant="secondary" disabled={pending}>{pending ? "Saving…" : "Add note"}</Button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function OpenCaseForm({ leadId, quotes }: { leadId: string; quotes: { id: string; total: number; createdAt: string }[] }) {
  const [state, action, pending] = useActionState(openCase, idle);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <div>
        <label htmlFor="open-quote" className="mb-1.5 block text-xs font-medium text-muted">Agreed quote</label>
        <select id="open-quote" name="quoteId" className={field}>
          {quotes.map((q) => (
            <option key={q.id} value={q.id}>{formatInr(q.total)} · saved {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-muted">Only after the agreement is signed. The student&apos;s first instalment becomes due, and their portal fills in once finance confirms it.</p>
      <Button type="submit" size="md" disabled={pending}>{pending ? "Opening…" : "Open student case"}</Button>
      <Message state={state} />
    </form>
  );
}

export function CaseStageForm({ caseId, stage }: { caseId: string; stage: CaseStage }) {
  const [state, action, pending] = useActionState(updateCaseStage, idle);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="caseId" value={caseId} />
      <div className="min-w-48 flex-1">
        <label htmlFor="case-stage" className="mb-1.5 block text-xs font-medium text-muted">Stage</label>
        <select id="case-stage" name="stage" defaultValue={stage} className={field}>
          {workflowStages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <Button type="submit" size="md" disabled={pending}>{pending ? "Saving…" : "Save stage"}</Button>
      <Message state={state} />
    </form>
  );
}

export function AddCaseTaskForm({ caseId }: { caseId: string }) {
  const [state, action, pending] = useActionState(addCaseTask, idle);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium text-muted">Task for the student</label>
        <input id="task-title" name="title" required maxLength={160} className={field} placeholder="e.g. Upload all eight semester mark sheets" />
      </div>
      <div>
        <label htmlFor="task-due" className="mb-1.5 block text-xs font-medium text-muted">Due (optional)</label>
        <input id="task-due" name="dueOn" type="date" className={field} />
      </div>
      <Button type="submit" size="md" disabled={pending}>{pending ? "Adding…" : "Add task"}</Button>
      <div className="sm:col-span-3"><Message state={state} /></div>
    </form>
  );
}

export function ConfirmPaymentForm({ instalmentId, label }: { instalmentId: string; label: string }) {
  const [state, action, pending] = useActionState(confirmInstalment, idle);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9.5rem_auto] sm:items-end">
      <input type="hidden" name="instalmentId" value={instalmentId} />
      <div>
        <label htmlFor={`ref-${instalmentId}`} className="mb-1 block text-xs font-medium text-muted">Bank UTR or Razorpay ID for {label}</label>
        <input id={`ref-${instalmentId}`} name="reference" required maxLength={80} autoComplete="off" className={field} />
      </div>
      <div>
        <label htmlFor={`date-${instalmentId}`} className="mb-1 block text-xs font-medium text-muted">Received on</label>
        <input id={`date-${instalmentId}`} name="paidOn" type="date" required className={field} />
      </div>
      <Button type="submit" size="md" disabled={pending}>{pending ? "Saving…" : "Confirm paid"}</Button>
      <div className="sm:col-span-3"><Message state={state} /></div>
    </form>
  );
}

export function AddApplicationForm({ caseId }: { caseId: string }) {
  const [state, action, pending] = useActionState(addApplication, idle);
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_auto] sm:items-end">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <label htmlFor="app-uni" className="mb-1.5 block text-xs font-medium text-muted">University</label>
        <input id="app-uni" name="university" required maxLength={160} className={field} placeholder="e.g. Politecnico di Milano" />
      </div>
      <div>
        <label htmlFor="app-prog" className="mb-1.5 block text-xs font-medium text-muted">Programme</label>
        <input id="app-prog" name="programme" required maxLength={200} className={field} placeholder="e.g. MSc Data Science" />
      </div>
      <div>
        <label htmlFor="app-deadline" className="mb-1.5 block text-xs font-medium text-muted">Deadline</label>
        <input id="app-deadline" name="deadline" type="date" className={field} />
      </div>
      <Button type="submit" size="md" disabled={pending}>{pending ? "Adding…" : "Add"}</Button>
      <div className="sm:col-span-4"><Message state={state} /></div>
    </form>
  );
}
