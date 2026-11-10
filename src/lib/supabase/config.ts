/**
 * Supabase connection settings. Both values are public by design (the anon key
 * only grants what Row Level Security allows). Returns null until the project is
 * configured, so callers can show a "not connected" state instead of failing.
 */
export type SupabaseConfig = { url: string; anonKey: string };

export function parseSupabaseUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
    const secure = url.protocol === "https:" || (url.protocol === "http:" && local);
    if (!secure || url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function supabaseConfig(): SupabaseConfig | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl || !anonKey) return null;
  const url = parseSupabaseUrl(rawUrl);
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL must be the https origin of your Supabase project, e.g. https://abc.supabase.co");
  return { url, anonKey };
}

export const isSupabaseConfigured = (): boolean => supabaseConfig() !== null;
