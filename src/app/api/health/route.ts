import { NextResponse, connection } from "next/server";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Liveness and readiness for an uptime monitor: 200 when the site can store
 * enquiries, 503 when it can't. Says nothing about configuration beyond that.
 * Polled every few minutes, it also keeps a Free-plan Supabase project from
 * pausing for inactivity.
 */
export async function GET() {
  await connection();
  const started = performance.now();
  let database: "ok" | "down" | "not-configured" = "not-configured";

  if (getServerEnv().LEAD_STORE === "supabase") {
    const db = createSupabaseAdminClient();
    if (db) {
      const { error } = await db.from("permissions").select("key", { head: true, count: "exact" }).limit(1).abortSignal(AbortSignal.timeout(5_000));
      database = error ? "down" : "ok";
      if (error) console.error("[health] database check failed", error.code);
    } else {
      database = "down";
    }
  }

  // In production an unconnected database is an outage too: enquiries can't be stored.
  const healthy = database === "ok" || (database === "not-configured" && process.env.NODE_ENV !== "production");
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", database, latencyMs: Math.round(performance.now() - started), commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
