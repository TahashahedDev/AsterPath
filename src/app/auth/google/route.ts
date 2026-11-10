import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { safeNextPath } from "@/features/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Starts Google sign-in. A plain link (not a form) points here, so the browser
 * follows the redirect chain to Google as a normal navigation.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(new URL("/sign-in", request.url));

  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteConfig.url}/auth/callback?next=${encodeURIComponent(next)}`, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    console.error("[auth] Google sign-in unavailable", error?.code ?? error?.status);
    return NextResponse.redirect(new URL("/sign-in?error=google", request.url));
  }
  return NextResponse.redirect(data.url);
}
