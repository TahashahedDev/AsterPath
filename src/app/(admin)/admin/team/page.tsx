import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TeamRole } from "@/lib/supabase/types";
import { EmptyPanel } from "@/components/dashboard/dashboard-shell";
import { InviteMemberForm } from "@/components/admin/invite-member-form";
import { MemberRowForm } from "@/components/admin/member-row-form";

export const metadata: Metadata = { title: "Team" };

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Administrator",
  advisor: "Advisor",
  document_reviewer: "Document reviewer",
  finance: "Finance",
  marketing: "Marketing",
  analyst: "Analyst",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** The team and their roles, as Row Level Security allows the viewer to see them. */
export default async function TeamPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <EmptyPanel title="Team" description="Connect Supabase to manage the team." />;

  const [{ data: members, error }, { data: canManage }, { data: myRole }, { data: { user } }] = await Promise.all([
    supabase.from("team_members").select("user_id, role, active, created_at").order("created_at"),
    supabase.rpc("has_permission", { requested: "team.manage" }),
    supabase.rpc("current_team_role"),
    supabase.auth.getUser(),
  ]);
  const ids = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] };
  const names = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-[-0.025em]">Team</h1>
      <p className="mt-2 text-muted">
        {canManage
          ? "Everyone with access to the admin workspace and what their role allows."
          : "Your own membership. Only owners and administrators see the whole team."}{" "}
        Team accounts are invitation-only and every member signs in with two factors.
      </p>
      {canManage && (
        <section aria-labelledby="invite-heading" className="mt-8 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 id="invite-heading" className="text-[0.9375rem] font-semibold text-ink">Invite a team member</h2>
          <p className="mt-1 mb-4 text-sm text-muted">They get an email to set a password, then add an authenticator app on their first sign-in. Choose the narrowest role that fits.</p>
          <InviteMemberForm canInviteOwner={myRole === "owner"} />
        </section>
      )}
      {error ? (
        <p className="mt-8 text-danger" role="alert">The team could not be loaded. Please try again.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card" tabIndex={0} role="region" aria-label="Team members">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Role</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
                <th scope="col" className="px-5 py-3 font-medium">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(members ?? []).map((m) => (
                <tr key={m.user_id}>
                  <td className="px-5 py-3 font-medium text-ink">{names.get(m.user_id) ?? "Name not set"}</td>
                  {canManage && m.user_id !== user?.id ? (
                    <td colSpan={2} className="px-5 py-3">
                      <MemberRowForm userId={m.user_id} name={names.get(m.user_id) ?? "this member"} role={m.role} active={m.active} roleLabels={roleLabels} canAssignOwner={myRole === "owner"} />
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-3">{roleLabels[m.role]}{m.user_id === user?.id && <span className="ml-2 text-xs text-muted">(you)</span>}</td>
                      <td className="px-5 py-3">{m.active ? "Active" : "Deactivated"}</td>
                    </>
                  )}
                  <td className="px-5 py-3 text-muted">{dateFormat.format(new Date(m.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
