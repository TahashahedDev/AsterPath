import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";

/**
 * Keeps the Supabase session fresh on the signed-in areas and sends signed-out
 * visitors to sign in. This is an optimistic check only: the portal and admin
 * layouts, and Row Level Security in the database, make the real decisions.
 */
export async function proxy(request: NextRequest) {
  const config = supabaseConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  if (!signedIn && (pathname.startsWith("/portal") || pathname.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    // The team has its own sign-in page; students use the main one.
    url.pathname = pathname.startsWith("/admin") ? "/staff/sign-in" : "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/sign-in", "/sign-up", "/staff/:path*", "/reset-password", "/auth/:path*"],
};
