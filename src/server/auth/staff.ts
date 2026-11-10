import "server-only";
import { getViewer } from "@/server/auth/viewer";
import type { TeamRole } from "@/lib/supabase/types";

/**
 * Server-side staff check for actions and route handlers (layouts alone do not
 * protect server actions). Without Supabase, only a development build gets a
 * preview identity; production refuses.
 */
export async function requireStaff(allowed?: TeamRole[]): Promise<{ ok: true; actorId: string } | { ok: false }> {
  const viewer = await getViewer();
  if (viewer.status === "not-configured") {
    return process.env.NODE_ENV === "production" ? { ok: false } : { ok: true, actorId: "dev-preview" };
  }
  if (viewer.status !== "signed-in" || !viewer.role) return { ok: false };
  if (allowed && !allowed.includes(viewer.role)) return { ok: false };
  return { ok: true, actorId: viewer.userId };
}
