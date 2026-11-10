import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/features/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Finishes a Google sign-in or an email confirmation by exchanging the one-time code for a session. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requested = request.nextUrl.searchParams.get("next");
  const supabase = await createSupabaseServerClient();

  if (supabase && code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Without an explicit destination, team members go to the workspace and students to their portal.
      const { data: membership } = await supabase.from("team_members").select("active").eq("user_id", data.user.id).maybeSingle();
      const home = membership?.active ? "/admin" : "/portal";
      return NextResponse.redirect(new URL(requested ? safeNextPath(requested, home) : home, request.url));
    }
    console.error("[auth] code exchange failed", error.code ?? error.status);
  }
  return NextResponse.redirect(new URL("/sign-in?error=link", request.url));
}
