import "server-only";
import { siteConfig } from "@/config/site";
import { getServerEnv } from "@/lib/env";
import { escape, layout, sendEmail } from "@/server/integrations/notifications";
import { createSharedRateLimiter } from "@/server/rate-limit";

/**
 * Tells the founder that the live site is failing, by email, at most once per
 * 15 minutes across every instance (a burst of errors is one alert, not a flood).
 *
 * The alert carries where and when, the error's class and digest, never its
 * message or the request body: messages can echo what a student typed. The full
 * error is in the Vercel function logs, found by the digest.
 */
const throttle = createSharedRateLimiter({ name: "error-alert", limit: 1, windowMs: 15 * 60 * 1000 });

export type ServerErrorReport = { where: string; error: unknown; path?: string };

export function errorFacts({ where, error, path }: ServerErrorReport) {
  return {
    where,
    // Path only: query strings can carry personal data.
    path: path?.split("?")[0] ?? "",
    kind: error instanceof Error ? error.name : typeof error,
    digest: typeof error === "object" && error !== null && "digest" in error ? String(error.digest).slice(0, 64) : "",
    at: new Date().toISOString(),
  };
}

export async function reportServerError(report: ServerErrorReport): Promise<void> {
  const facts = errorFacts(report);
  console.error("[server-error]", JSON.stringify(facts));
  if (process.env.NODE_ENV !== "production") return;

  const { LEAD_NOTIFY_EMAIL } = getServerEnv();
  if (!LEAD_NOTIFY_EMAIL) return;
  if (!(await throttle("site")).allowed) return;

  const rows = Object.entries(facts).filter(([, v]) => v);
  await sendEmail({
    to: LEAD_NOTIFY_EMAIL,
    subject: `${siteConfig.name} site error: ${facts.where}`,
    html: layout(
      "The live site hit an error",
      `<p style="font-size:15px;line-height:1.6">Visitors may be affected. Further errors in the next 15 minutes won't send another email.</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#58605a;font-size:14px">${escape(k)}</td><td style="padding:4px 0;font-family:monospace;font-size:14px">${escape(v)}</td></tr>`).join("")}</table>
<p style="font-size:13px;color:#58605a;line-height:1.6">Find the full error in Vercel → Logs by searching for the time or digest. Check ${escape(siteConfig.url)}/api/health for the database.</p>`,
    ),
    text: ["The live site hit an error.", ...rows.map(([k, v]) => `${k}: ${v}`), `Health: ${siteConfig.url}/api/health`].join("\n"),
  });
}
