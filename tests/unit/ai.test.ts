import { afterEach, describe, expect, it, vi } from "vitest";
import { agentRegistry, enabledAgentIds } from "@/features/ai/agents";
import { knowledgeBase, retrieve } from "@/server/ai/knowledge";
import { runAgent } from "@/server/ai/run-agent";

afterEach(() => vi.unstubAllGlobals());

describe("approved knowledge", () => {
  it("cites an official source and a checked date for every passage", () => {
    for (const passage of knowledgeBase) {
      expect(passage.sources.length).toBeGreaterThan(0);
      expect(passage.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("retrieves the DOV passage for a DOV question", () => {
    expect(retrieve("What is the Declaration of Value (DOV)?").map((p) => p.id)).toContain("dov");
  });
});

describe("agent registry", () => {
  it("enables only the three knowledge and drafting agents, none reading case records", () => {
    expect(enabledAgentIds).toEqual(["student_support", "university_research", "marketing_assistant"]);
    for (const agent of agentRegistry.filter((a) => a.enabled)) expect(agent.reads).not.toContain("case_records");
  });
});

describe("runAgent", () => {
  it("refuses instead of calling the model when no approved source matches", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const run = await runAgent("student_support", "zzqx blorptastic");
    expect(run.status).toBe("no_sources");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports the LLM as not connected when Ollama is down, without failing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const run = await runAgent("student_support", "How much money do I need for an Italian study visa?");
    expect(run.status).toBe("provider_unavailable");
    expect(run.sources.length).toBeGreaterThan(0);
    expect(run.review).toBe("draft_requires_human_review");
  });

  it("sends only approved knowledge to the model and returns it as a reviewable draft", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ response: "Draft answer [1]", prompt_eval_count: 10, eval_count: 5 })));
    vi.stubGlobal("fetch", fetchSpy);
    const run = await runAgent("student_support", "How much money do I need for an Italian study visa?");
    expect(run.status).toBe("completed");
    const body = JSON.parse(fetchSpy.mock.calls[0]![1].body as string) as { system: string };
    expect(body.system).toContain("Never make legal determinations");
    expect(body.system).toContain("checked");
  });
});
