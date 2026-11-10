"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TeamRole } from "@/lib/supabase/types";

const roles = ["owner", "admin", "advisor", "document_reviewer", "finance", "marketing", "analyst"] as const satisfies readonly TeamRole[];

const inviteSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Enter their full name." }).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address." })),
  role: z.enum(roles, { error: "Choose a role." }),
});

export type InviteState = { status: "idle" | "error" | "sent"; message?: string; fieldErrors?: Partial<Record<string, string[]>> };

/**
 * Invites a team member: Supabase emails them a link to set a password, then
 * they add two-factor sign-in on first visit. Only people allowed to manage the
 * team may invite, and only an owner may invite another owner. The membership
 * row is written as the inviter, so Row Level Security and the audit log apply.
 */
export async function inviteTeamMember(_: InviteState, form: FormData): Promise<InviteState> {
  const parsed = inviteSchema.safeParse({ fullName: form.get("fullName"), email: form.get("email"), role: form.get("role") });
  if (!parsed.success) return { status: "error", fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  if (!supabase || !admin) return { status: "error", message: "Supabase isn't fully connected (the server key is missing)." };

  const [{ data: canManage }, { data: myRole }] = await Promise.all([
    supabase.rpc("has_permission", { requested: "team.manage" }),
    supabase.rpc("current_team_role"),
  ]);
  if (!canManage) return { status: "error", message: "Only owners and administrators can invite team members." };
  if (parsed.data.role === "owner" && myRole !== "owner") return { status: "error", fieldErrors: { role: ["Only an owner can invite another owner."] } };

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.fullName },
    redirectTo: `${siteConfig.url}/auth/callback?next=/reset-password`,
  });
  if (inviteError || !invited.user) {
    if (inviteError?.code === "email_exists") return { status: "error", fieldErrors: { email: ["This email already has an AsterPath account. Ask them for a different work email, or add them in Supabase."] } };
    console.error("[team] invite failed", inviteError?.code ?? inviteError?.status);
    return { status: "error", message: "The invitation couldn't be sent. Please try again." };
  }

  const { error: memberError } = await supabase.from("team_members").insert({ user_id: invited.user.id, role: parsed.data.role });
  if (memberError) {
    console.error("[team] membership insert failed", memberError.code);
    return { status: "error", message: "The email was sent, but the role couldn't be saved. Please add the role again." };
  }
  revalidatePath("/admin/team");
  return { status: "sent", message: `Invitation sent to ${parsed.data.email}. They'll set a password, then add two-factor sign-in on their first visit.` };
}

const updateSchema = z.object({
  userId: z.uuid(),
  role: z.enum(roles, { error: "Choose a role." }),
  active: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export type MemberUpdateState = { status: "idle" | "error" | "saved"; message?: string };

/**
 * Changes a member's role or deactivates them. Runs as the signed-in manager, so
 * Row Level Security decides (only owners touch owners) and the audit trigger
 * records it. Nobody can change their own row, so an owner can't lock themselves out.
 */
export async function updateTeamMember(_: MemberUpdateState, form: FormData): Promise<MemberUpdateState> {
  const parsed = updateSchema.safeParse({ userId: form.get("userId"), role: form.get("role"), active: form.get("active") });
  if (!parsed.success) return { status: "error", message: "Choose a valid role and status." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Supabase isn't connected." };
  const [{ data: { user } }, { data: canManage }] = await Promise.all([supabase.auth.getUser(), supabase.rpc("has_permission", { requested: "team.manage" })]);
  if (!user || !canManage) return { status: "error", message: "Only owners and administrators can change the team." };
  if (user.id === parsed.data.userId) return { status: "error", message: "You can't change your own role or status. Ask another owner." };

  const { data, error } = await supabase
    .from("team_members")
    .update({ role: parsed.data.role, active: parsed.data.active })
    .eq("user_id", parsed.data.userId)
    .select("user_id");
  if (error || !data?.length) {
    if (error) console.error("[team] update failed", error.code);
    return { status: "error", message: "Not saved. Only an owner can change an owner, or promote someone to owner." };
  }
  revalidatePath("/admin/team");
  return { status: "saved", message: "Saved." };
}
