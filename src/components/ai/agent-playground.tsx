"use client";

import { useActionState, useState } from "react";
import { ExternalLink, LoaderCircle, Sparkles } from "lucide-react";
import { runAgentAction, type RunAgentState } from "@/app/(admin)/admin/ai/actions";
import type { AgentDefinition } from "@/features/ai/agents";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusCopy: Record<string, { label: string; tone: string }> = {
  completed: { label: "Draft — needs human review", tone: "bg-gold-soft text-gold-deep ring-gold/30" },
  no_sources: { label: "Refused: no approved source", tone: "bg-warning-bg text-warning-fg ring-warning-border" },
  provider_unavailable: { label: "LLM not connected", tone: "bg-warning-bg text-warning-fg ring-warning-border" },
  failed: { label: "Failed", tone: "bg-danger/10 text-danger ring-danger/25" },
};

export function AgentPlayground({ agents, llmReady }: { agents: AgentDefinition[]; llmReady: boolean }) {
  const [state, action, pending] = useActionState<RunAgentState, FormData>(runAgentAction, {});
  const [agentId, setAgentId] = useState(agents[0]!.id);
  const agent = agents.find((a) => a.id === agentId)!;
  const run = state.run;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <form action={action} className="space-y-4">
        <fieldset>
          <legend className="text-sm font-medium text-ink">Agent</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {agents.map((a) => (
              <label key={a.id} className={cn("cursor-pointer rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary", agentId === a.id ? "border-primary bg-primary-soft text-primary-deep" : "border-border bg-card text-ink-soft hover:border-border-strong")}>
                <input type="radio" name="agentId" value={a.id} checked={agentId === a.id} onChange={() => setAgentId(a.id)} className="sr-only" />
                <span className="font-semibold">{a.name}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{agent.purpose}</p>
        </fieldset>
        <div>
          <label htmlFor="agent-input" className="text-sm font-medium text-ink">
            {agent.output === "draft_for_review" ? "Brief" : "Question"}
          </label>
          <textarea
            id="agent-input"
            name="input"
            rows={5}
            maxLength={1200}
            required
            placeholder={agent.placeholder}
            className="mt-2 w-full rounded-xl border border-border-strong bg-card px-3.5 py-3 text-[0.9375rem] text-ink placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-muted">Never paste student names, passport numbers or financial details here.</p>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
          {pending ? "Running locally…" : "Run agent"}
        </Button>
        {!llmReady && <p className="text-sm text-warning-fg">Ollama isn&rsquo;t running, so runs will report &ldquo;LLM not connected&rdquo;.</p>}
      </form>

      <div aria-live="polite" className="min-h-48 rounded-[var(--radius-card)] border border-border bg-paper-deep/50 p-5">
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {!state.error && !run && <p className="text-sm text-muted">Output appears here. Every result is a draft: a team member checks it before anything is shared.</p>}
        {run && (
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("rounded-full px-2.5 py-0.5 font-medium ring-1 ring-inset", statusCopy[run.status]?.tone)}>{statusCopy[run.status]?.label}</span>
              <span className="text-muted">
                {run.model} · {(run.durationMs / 1000).toFixed(1)}s{run.outputTokens != null && ` · ${run.outputTokens} tokens`}
              </span>
            </div>
            <div className="mt-4 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">{run.output}</div>
            {run.sources.length > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">Sources given to the model</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {run.sources.map((s, i) => (
                    <li key={`${s.url}-${i}`}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                        [{i + 1}] {s.label} <ExternalLink className="size-3" aria-hidden="true" />
                      </a>{" "}
                      <span className="text-muted">· checked {s.checkedOn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
