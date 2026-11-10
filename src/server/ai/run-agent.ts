import "server-only";
import { agentGuardrails, agentRegistry, type AgentId } from "@/features/ai/agents";
import { retrieve, type KnowledgePassage } from "@/server/ai/knowledge";
import { getLlmProvider, ProviderUnavailableError } from "@/server/ai/provider";

export type AgentRun = {
  id: string;
  agentId: AgentId;
  startedAt: string;
  status: "completed" | "no_sources" | "provider_unavailable" | "failed";
  model: string;
  durationMs: number;
  promptTokens: number | null;
  outputTokens: number | null;
  output: string;
  sources: { label: string; url: string; checkedOn: string }[];
  review: "draft_requires_human_review";
};

/**
 * Recent runs in this server process only. The persistent `ai_executions`
 * table arrives with the AI phase; until then the UI says so.
 */
const recentRuns: AgentRun[] = [];
export const getRecentRuns = () => [...recentRuns];

function systemPrompt(agentId: AgentId, passages: KnowledgePassage[]): string {
  const agent = agentRegistry.find((a) => a.id === agentId)!;
  const knowledge = passages.map((p, i) => `[${i + 1}] ${p.topic} (checked ${p.checkedOn}): ${p.text}`).join("\n");
  const rules = agentGuardrails.map((r) => `- ${r}`).join("\n");
  const task =
    agentId === "marketing_assistant"
      ? "Write draft social or web copy in AsterPath's voice: warm, precise, honest, never hype. Any factual claim must come from the knowledge below. Mark the output as a DRAFT."
      : "Answer using ONLY the numbered knowledge below and cite passages like [1]. If the knowledge does not answer the question, say you don't know and suggest speaking to an AsterPath advisor. Keep it under 180 words.";
  return `You are the AsterPath ${agent.name} agent. ${agent.purpose}\n\nRules you must follow:\n${rules}\n\n${task}\n\nKnowledge:\n${knowledge || "(none)"}`;
}

export async function runAgent(agentId: AgentId, input: string): Promise<AgentRun> {
  const passages = retrieve(input);
  const base = {
    id: crypto.randomUUID(),
    agentId,
    startedAt: new Date().toISOString(),
    sources: [...new Map(passages.flatMap((p) => p.sources.map((s) => [s.url, { ...s, checkedOn: p.checkedOn }] as const))).values()],
    review: "draft_requires_human_review" as const,
  };
  const provider = getLlmProvider();
  let run: AgentRun;

  // Knowledge agents refuse rather than improvise when nothing approved matches.
  if (passages.length === 0 && agentId !== "marketing_assistant") {
    run = { ...base, status: "no_sources", model: provider.model, durationMs: 0, promptTokens: null, outputTokens: null, output: "No approved source covers this question, so the agent will not answer it. Please refer it to an advisor." };
  } else {
    try {
      const result = await provider.generate({ system: systemPrompt(agentId, passages), prompt: input, temperature: agentId === "marketing_assistant" ? 0.7 : 0.1 });
      run = { ...base, status: "completed", model: result.model, durationMs: result.durationMs, promptTokens: result.promptTokens, outputTokens: result.outputTokens, output: result.text };
    } catch (error) {
      const unavailable = error instanceof ProviderUnavailableError;
      run = { ...base, status: unavailable ? "provider_unavailable" : "failed", model: provider.model, durationMs: 0, promptTokens: null, outputTokens: null, output: unavailable ? "LLM not connected. Start Ollama locally (ollama serve) to use AI drafting." : "The agent failed to run." };
    }
  }
  recentRuns.unshift(run);
  recentRuns.length = Math.min(recentRuns.length, 20);
  return run;
}
