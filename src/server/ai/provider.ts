import "server-only";
import { getServerEnv } from "@/lib/env";

/**
 * Language-model provider boundary. Ollama (local) is the only implementation
 * today; a hosted API or self-hosted GPU endpoint plugs in behind the same
 * interface without touching agents or UI. Providers never see student records.
 */
export type GenerateRequest = { system: string; prompt: string; temperature?: number; maxTokens?: number };
export type GenerateResult = { text: string; model: string; durationMs: number; promptTokens: number | null; outputTokens: number | null };

export interface LlmProvider {
  readonly id: string;
  readonly model: string;
  generate(request: GenerateRequest): Promise<GenerateResult>;
}

export class ProviderUnavailableError extends Error {}

class OllamaProvider implements LlmProvider {
  readonly id = "ollama";
  constructor(
    private readonly baseUrl: string,
    readonly model: string,
  ) {}

  async generate({ system, prompt, temperature = 0.2, maxTokens = 600 }: GenerateRequest): Promise<GenerateResult> {
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(new URL("/api/generate", this.baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: this.model, system, prompt, stream: false, options: { temperature, num_predict: maxTokens } }),
        cache: "no-store",
        signal: AbortSignal.timeout(90_000),
      });
    } catch {
      throw new ProviderUnavailableError("The local model is not running.");
    }
    if (!res.ok) throw new ProviderUnavailableError(`The local model answered ${res.status}.`);
    const body = (await res.json()) as { response?: string; prompt_eval_count?: number; eval_count?: number };
    return {
      text: (body.response ?? "").trim(),
      model: this.model,
      durationMs: Date.now() - started,
      promptTokens: body.prompt_eval_count ?? null,
      outputTokens: body.eval_count ?? null,
    };
  }
}

export function getLlmProvider(): LlmProvider {
  const { OLLAMA_BASE_URL, OLLAMA_MODEL } = getServerEnv();
  return new OllamaProvider(OLLAMA_BASE_URL, OLLAMA_MODEL);
}
