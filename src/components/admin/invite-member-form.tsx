"use client";

import { useActionState } from "react";
import { MailPlus } from "lucide-react";
import { inviteTeamMember, type InviteState } from "@/app/(admin)/admin/team/actions";
import { Button } from "@/components/ui/button";

const roleOptions = [
  { value: "advisor", label: "Advisor", hint: "Leads and their own students" },
  { value: "document_reviewer", label: "Document reviewer", hint: "Reviews documents only" },
  { value: "finance", label: "Finance", hint: "Payments; no passports" },
  { value: "marketing", label: "Marketing", hint: "Aggregate reports only" },
  { value: "analyst", label: "Analyst", hint: "Aggregate reports only" },
  { value: "admin", label: "Administrator", hint: "Everything except owners" },
  { value: "owner", label: "Owner", hint: "Full control (owners only)" },
];

const field = "h-11 w-full rounded-lg border border-border-strong bg-paper px-3 text-sm text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

export function InviteMemberForm({ canInviteOwner }: { canInviteOwner: boolean }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteTeamMember, { status: "idle" });
  const err = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={action} noValidate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_auto] lg:items-end">
      <div>
        <label htmlFor="invite-name" className="mb-1.5 block text-xs font-medium text-muted">Full name</label>
        <input id="invite-name" name="fullName" autoComplete="off" maxLength={120} className={field} aria-invalid={err("fullName") ? true : undefined} />
        {err("fullName") && <p className="mt-1 text-xs text-danger">{err("fullName")}</p>}
      </div>
      <div>
        <label htmlFor="invite-email" className="mb-1.5 block text-xs font-medium text-muted">Work email</label>
        <input id="invite-email" name="email" type="email" autoComplete="off" className={field} aria-invalid={err("email") ? true : undefined} />
        {err("email") && <p className="mt-1 text-xs text-danger">{err("email")}</p>}
      </div>
      <div>
        <label htmlFor="invite-role" className="mb-1.5 block text-xs font-medium text-muted">Role</label>
        <select id="invite-role" name="role" defaultValue="advisor" className={field}>
          {roleOptions
            .filter((r) => r.value !== "owner" || canInviteOwner)
            .map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.hint}
              </option>
            ))}
        </select>
        {err("role") && <p className="mt-1 text-xs text-danger">{err("role")}</p>}
      </div>
      <Button type="submit" disabled={pending} className="h-11">
        <MailPlus aria-hidden="true" /> {pending ? "Sending…" : "Send invite"}
      </Button>
      {state.message && (
        <p role={state.status === "sent" ? "status" : "alert"} className={`text-sm sm:col-span-2 lg:col-span-4 ${state.status === "sent" ? "text-primary-deep" : "text-danger"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
