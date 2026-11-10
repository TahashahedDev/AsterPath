"use client";

import { useActionState } from "react";
import { updateTeamMember, type MemberUpdateState } from "@/app/(admin)/admin/team/actions";
import type { TeamRole } from "@/lib/supabase/types";

const select = "h-9 rounded-lg border border-border-strong bg-paper px-2 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

/** Inline role and status editor for one team member; the server and RLS make the final call. */
export function MemberRowForm({ userId, name, role, active, roleLabels, canAssignOwner }: { userId: string; name: string; role: TeamRole; active: boolean; roleLabels: Record<TeamRole, string>; canAssignOwner: boolean }) {
  const [state, action, pending] = useActionState<MemberUpdateState, FormData>(updateTeamMember, { status: "idle" });
  const options = (Object.keys(roleLabels) as TeamRole[]).filter((r) => r !== "owner" || canAssignOwner || role === "owner");

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>Role for {name}</label>
      <select id={`role-${userId}`} name="role" defaultValue={role} className={select}>
        {options.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
      </select>
      <label className="sr-only" htmlFor={`active-${userId}`}>Status for {name}</label>
      <select id={`active-${userId}`} name="active" defaultValue={String(active)} className={select}>
        <option value="true">Active</option>
        <option value="false">Deactivated</option>
      </select>
      <button type="submit" disabled={pending} className="h-9 rounded-lg border border-border-strong px-3 text-sm font-medium text-ink hover:bg-ink/5 disabled:opacity-50">
        {pending ? "Saving…" : "Save"}
      </button>
      {state.message && (
        <span role={state.status === "saved" ? "status" : "alert"} className={`text-xs ${state.status === "saved" ? "text-primary-deep" : "text-danger"}`}>{state.message}</span>
      )}
    </form>
  );
}
