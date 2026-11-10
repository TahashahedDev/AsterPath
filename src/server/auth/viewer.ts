import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TeamRole } from "@/lib/supabase/types";

export type Viewer =
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "signed-in"; userId: string; email: string; name: string | null; role: TeamRole | null };

/**
 * Who is making this request, checked with Supabase Auth (not just read from the
 * cookie). Profile and team role are read as the user, so Row Level Security
 * decides what comes back. Cached for the duration of one request.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "not-configured" };

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { status: "signed-out" };

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle(),
    supabase.from("team_members").select("role, active").eq("user_id", data.user.id).maybeSingle(),
  ]);

  return {
    status: "signed-in",
    userId: data.user.id,
    email: data.user.email ?? "",
    name: profile?.full_name ?? null,
    role: membership?.active ? membership.role : null,
  };
});
