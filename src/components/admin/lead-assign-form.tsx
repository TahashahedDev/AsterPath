"use client";

import { useActionState } from "react";
import { assignLead, type AssignState } from "@/app/(admin)/admin/crm/actions";
import type { StaffMember } from "@/features/operations/types";
import { Button } from "@/components/ui/button";

const field = "h-10 w-full rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

/** Owner and next follow-up for one lead. The playbook expects one named advisor and a dated next step on every live lead. */
export function LeadAssignForm({ leadId, advisorId, followUp, staff }: { leadId: string; advisorId: string | null; followUp: string | null; staff: StaffMember[] }) {
  const [state, action, pending] = useActionState<AssignState, FormData>(assignLead, { status: "idle" });

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={leadId} />
      <div>
        <label htmlFor="lead-advisor" className="mb-1.5 block text-xs font-medium text-muted">Advisor</label>
        <select id="lead-advisor" name="advisorId" defaultValue={advisorId ?? ""} className={field}>
          <option value="">Unassigned</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="lead-follow-up" className="mb-1.5 block text-xs font-medium text-muted">Next follow-up</label>
        <input id="lead-follow-up" name="followUp" type="date" required defaultValue={followUp ? new Date(followUp).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : ""} className={field} />
      </div>
      <Button type="submit" disabled={pending} size="md">{pending ? "Saving…" : "Save"}</Button>
      {state.message && (
        <p role={state.status === "saved" ? "status" : "alert"} className={`text-sm ${state.status === "saved" ? "text-primary-deep" : "text-danger"}`}>{state.message}</p>
      )}
    </form>
  );
}
