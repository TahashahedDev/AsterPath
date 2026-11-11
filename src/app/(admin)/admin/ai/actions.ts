"use server";

import { z } from "zod";
import { multiLine } from "@/lib/validation/fields";
import { enabledAgentIds } from "@/features/ai/agents";
import { runAgent, type AgentRun } from "@/server/ai/run-agent";
import { requireStaff } from "@/server/auth/staff";
import { createSharedRateLimiter } from "@/server/rate-limit";

const inputSchema = z.object({
  agentId: z.enum(enabledAgentIds),
  input: multiLine({ label: "Your question", min: 3, max: 1200, maxLinks: 3 }),
});

// Local models are slow; a small allowance per staff member keeps the machine usable.
const limiter = createSharedRateLimiter({ name: "ai", limit: 20, windowMs: 10 * 60 * 1000 });

export type RunAgentState = { run?: AgentRun; error?: string };

export async function runAgentAction(_prev: RunAgentState, formData: FormData): Promise<RunAgentState> {
  const staff = await requireStaff(["owner", "admin", "advisor", "marketing"]);
  if (!staff.ok) return { error: "You don't have access to the AI workspace." };
  const rate = await limiter(staff.actorId);
  if (!rate.allowed) return { error: `Too many runs. Try again in ${rate.retryAfterSeconds} seconds.` };
  const parsed = inputSchema.safeParse({ agentId: formData.get("agentId"), input: formData.get("input") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  return { run: await runAgent(parsed.data.agentId, parsed.data.input) };
}
