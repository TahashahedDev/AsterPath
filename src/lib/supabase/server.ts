import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/types";

/**
 * A Supabase client acting as the signed-in visitor (Row Level Security applies).
 * Create one per request; never share it. Null until Supabase is configured.
 */
export async function createSupabaseServerClient() {
  // Signed-in areas are always decided per request, even before Supabase is configured.
  await connection();
  const config = supabaseConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
