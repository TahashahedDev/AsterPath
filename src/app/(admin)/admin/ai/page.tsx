import type { Metadata } from "next";
import { connection } from "next/server";
import { Bot, ShieldAlert } from "lucide-react";
import { AgentPlayground } from "@/components/ai/agent-playground";
import { DataTable, PageHeader, Panel, StatusPill, formatDateTime } from "@/components/dashboard/ui";
import { agentGuardrails, agentRegistry } from "@/features/ai/agents";
import { checkOllama } from "@/server/integrations/registry";
import { getRecentRuns } from "@/server/ai/run-agent";
import { knowledgeBase } from "@/server/ai/knowledge";

export const metadata: Metadata = { title: "AI workspace" };

const readsLabel = { approved_knowledge: "Approved knowledge", marketing_brief: "Marketing brief", aggregate_metrics: "Aggregate metrics", case_records: "Case records (needs privacy review)" } as const;

export default async function AiWorkspacePage() {
  // Live checks: render per request, never at build time.
  await connection();
  const ollama = await checkOllama();
  const runs = getRecentRuns();
  const llmReady = ollama.status === "connected";
  const enabled = agentRegistry.filter((a) => a.enabled);

  return (
    <>
      <PageHeader
        eyebrow="AI workspace"
        title={
          <>
            Drafts, <span className="display-italic text-primary">never decisions.</span>
          </>
        }
        description="Local-first AI that answers from AsterPath's sourced knowledge and drafts copy for review. It never sees student records and cannot act on its own."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Provider</p>
          <p className="mt-2 font-semibold text-ink">Ollama (local)</p>
          <div className="mt-2">
            <StatusPill tone={llmReady ? "success" : "warning"}>{llmReady ? "Connected" : "LLM not connected"}</StatusPill>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{ollama.detail}</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Models available</p>
          <p className="mt-2 font-semibold text-ink">{ollama.models.length ? ollama.models.join(", ") : "—"}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">Hosted or GPU providers plug in behind the same interface later.</p>
        </Panel>
        <Panel>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Approved knowledge</p>
          <p className="display mt-1 text-3xl text-ink tabular-nums">{knowledgeBase.length}</p>
          <p className="mt-1 text-xs text-muted">sourced passages, each with an official link and checked date</p>
        </Panel>
      </div>

      <Panel title="Run an agent" className="mt-6">
        <AgentPlayground agents={enabled} llmReady={llmReady} />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="registry-heading">
          <h2 id="registry-heading" className="mb-3 font-semibold text-ink">
            Agent registry
          </h2>
          <DataTable
            caption="AI agents"
            rows={agentRegistry}
            rowKey={(a) => a.id}
            primary="name"
            columns={[
              { key: "name", header: "Agent", cell: (a) => <span className="font-medium text-ink">{a.name}</span> },
              { key: "purpose", header: "Purpose", cell: (a) => a.purpose, desktopOnly: true },
              { key: "reads", header: "Reads", cell: (a) => a.reads.map((r) => readsLabel[r]).join(", ") },
              { key: "status", header: "Status", cell: (a) => <StatusPill tone={a.enabled ? "primary" : "neutral"}>{a.enabled ? "Enabled" : "Planned"}</StatusPill> },
            ]}
          />
        </section>
        <Panel title={<span className="inline-flex items-center gap-2"><ShieldAlert className="size-4 text-terracotta-deep" aria-hidden="true" /> What AI can never do</span>}>
          <ul className="space-y-2 text-sm text-ink-soft">
            {agentGuardrails.map((g) => (
              <li key={g} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                {g}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">Agents that would read case records stay disabled until a privacy-reviewed workflow is approved.</p>
        </Panel>
      </div>

      <section className="mt-6" aria-labelledby="runs-heading">
        <h2 id="runs-heading" className="mb-3 font-semibold text-ink">
          Recent runs <span className="text-sm font-normal text-muted">(this server session only — persistent run log ships with the ai_executions table)</span>
        </h2>
        {runs.length === 0 ? (
          <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong p-5 text-sm text-muted">
            <Bot className="size-5 text-subtle" aria-hidden="true" /> No runs yet.
          </div>
        ) : (
          <DataTable
            caption="Recent agent runs"
            rows={runs}
            rowKey={(r) => r.id}
            primary="agent"
            columns={[
              { key: "agent", header: "Agent", cell: (r) => agentRegistry.find((a) => a.id === r.agentId)?.name },
              { key: "at", header: "Started", cell: (r) => formatDateTime(r.startedAt) },
              { key: "status", header: "Status", cell: (r) => <StatusPill tone={r.status === "completed" ? "gold" : "warning"}>{r.status.replace("_", " ")}</StatusPill> },
              { key: "duration", header: "Duration", cell: (r) => `${(r.durationMs / 1000).toFixed(1)}s` },
              { key: "tokens", header: "Tokens", cell: (r) => (r.outputTokens != null ? `${r.promptTokens ?? "?"} in / ${r.outputTokens} out` : "—") },
              { key: "review", header: "Review", cell: () => "Needs human review" },
            ]}
          />
        )}
      </section>
    </>
  );
}
