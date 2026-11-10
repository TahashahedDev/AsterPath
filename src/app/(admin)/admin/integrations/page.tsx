import type { Metadata } from "next";
import { connection } from "next/server";
import { CheckCircle2, CircleDashed, ExternalLink, KeyRound, RefreshCw } from "lucide-react";
import { PageHeader, StatusPill, formatDateTime, type PillTone } from "@/components/dashboard/ui";
import { getIntegrationReports, type IntegrationStatus } from "@/server/integrations/registry";

export const metadata: Metadata = { title: "Integrations" };

const statusUi: Record<IntegrationStatus, { label: string; tone: PillTone }> = {
  connected: { label: "Connected", tone: "success" },
  not_configured: { label: "Not configured", tone: "neutral" },
  demo: { label: "Demo", tone: "gold" },
  error: { label: "Error", tone: "danger" },
  needs_attention: { label: "Needs attention", tone: "warning" },
};

export default async function IntegrationsPage() {
  // Live checks: render per request, never at build time.
  await connection();
  const reports = await getIntegrationReports();
  const connected = reports.filter((r) => r.status === "connected").length;

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title={
          <>
            Integrations, <span className="display-italic text-primary">tested live.</span>
          </>
        }
        description={`${connected} of ${reports.length} services working. Each status comes from a real, read-only request made just now, not from whether a key exists. Secret values are never shown.`}
        actions={
          <form>
            <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border-strong bg-card px-4 text-sm font-medium text-ink hover:bg-ink/5">
              <RefreshCw className="size-4" aria-hidden="true" /> Re-run checks
            </button>
          </form>
        }
      />

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <li key={r.id} className="flex flex-col rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-terracotta-deep uppercase">{r.category}</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{r.name}</h2>
              </div>
              <StatusPill tone={statusUi[r.status].tone}>{statusUi[r.status].label}</StatusPill>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{r.description}</p>
            <p className="mt-3 rounded-lg bg-paper-deep/60 px-3 py-2 text-sm text-ink-soft">{r.detail}</p>
            <ul className="mt-4 space-y-1.5 text-sm" aria-label={`${r.name} configuration`}>
              {r.requirements.map((req) => (
                <li key={req.name} className="flex items-center gap-2">
                  {req.set ? <CheckCircle2 className="size-4 text-primary" aria-hidden="true" /> : <CircleDashed className="size-4 text-subtle" aria-hidden="true" />}
                  <code className="text-[0.8125rem] break-all text-ink-soft">{req.name}</code>
                  {req.secret && <KeyRound className="size-3.5 text-subtle" aria-label="secret, server-only" />}
                  <span className="sr-only">{req.set ? "set" : "not set"}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-xs text-muted">
              <span>Checked {formatDateTime(r.checkedAt)}</span>
              <a href={r.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline">
                Setup guide <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Keys are set as environment variables on the server (see <code>.env.example</code>), never in this screen. Disconnecting a service means removing its variables and redeploying.
      </p>
    </>
  );
}
