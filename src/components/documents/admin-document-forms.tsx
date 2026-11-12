"use client";

import { useActionState } from "react";
import { requestDocument, reviewDocument, type DocumentFormState } from "@/app/(admin)/admin/documents/actions";
import type { DocumentTypeRow } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

const field = "h-10 w-full rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";
const idle: DocumentFormState = { status: "idle" };

function Message({ state }: { state: DocumentFormState }) {
  if (!state.message) return null;
  return <p role={state.status === "saved" ? "status" : "alert"} className={`text-sm ${state.status === "saved" ? "text-primary-deep" : "text-danger"}`}>{state.message}</p>;
}

/** Ask the student for one document. Only types relevant to this case are worth requesting; nothing is requested automatically. */
export function RequestDocumentForm({ caseId, types }: { caseId: string; types: DocumentTypeRow[] }) {
  const [state, action, pending] = useActionState(requestDocument, idle);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <label htmlFor="doc-type" className="mb-1.5 block text-xs font-medium text-muted">Type</label>
        <select id="doc-type" name="typeKey" required className={field} defaultValue="">
          <option value="" disabled>Choose a type</option>
          {types.map((t) => <option key={t.key} value={t.key}>{t.label}{t.sensitivity === "financial" ? " (financial)" : ""}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="doc-title" className="mb-1.5 block text-xs font-medium text-muted">What to send</label>
        <input id="doc-title" name="title" required maxLength={120} className={field} placeholder="e.g. All eight semester mark sheets" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="doc-instructions" className="mb-1.5 block text-xs font-medium text-muted">Instructions (optional)</label>
        <textarea id="doc-instructions" name="instructions" rows={2} maxLength={1000} className="w-full rounded-lg border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. One PDF, every page, colour scan" />
      </div>
      <div>
        <label htmlFor="doc-due" className="mb-1.5 block text-xs font-medium text-muted">Due (optional)</label>
        <input id="doc-due" name="dueOn" type="date" className={field} />
      </div>
      <div>
        <label htmlFor="doc-expiry" className="mb-1.5 block text-xs font-medium text-muted">Expires (optional, e.g. passport)</label>
        <input id="doc-expiry" name="expiresOn" type="date" className={field} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" size="md" disabled={pending}>{pending ? "Requesting…" : "Request document"}</Button>
        <Message state={state} />
      </div>
    </form>
  );
}

/** Approve, ask for a replacement, reject or withdraw. Which buttons show depends on the state; the database decides. */
export function ReviewDocumentForm({ requestId, versionId, decisions, canWithdraw }: { requestId: string; versionId: string; decisions: ("approved" | "rejected" | "reupload_required")[]; canWithdraw: boolean }) {
  const [state, action, pending] = useActionState(reviewDocument, idle);
  if (decisions.length === 0 && !canWithdraw) return null;
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="versionId" value={versionId} />
      <div>
        <label htmlFor="review-note" className="mb-1.5 block text-xs font-medium text-muted">Feedback for the student (required to reject or ask for a replacement)</label>
        <textarea id="review-note" name="note" rows={3} maxLength={1000} className="w-full rounded-lg border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none" placeholder="e.g. Semester 4 is missing; please include all eight." />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {decisions.map((d) => (
          <Button key={d} type="submit" name="decision" value={d} size="md" variant={d === "approved" ? "primary" : "secondary"} disabled={pending}>
            {d === "approved" ? "Approve" : d === "reupload_required" ? "Ask for a replacement" : "Reject"}
          </Button>
        ))}
        {canWithdraw && (
          <Button type="submit" name="decision" value="withdrawn" size="md" variant="secondary" disabled={pending}>No longer needed</Button>
        )}
      </div>
      <Message state={state} />
    </form>
  );
}
