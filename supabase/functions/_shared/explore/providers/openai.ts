import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  LlmProvider,
  TokenUsage,
} from "./types.ts";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeOpenAiUsage(raw: Record<string, unknown> | undefined): TokenUsage {
  if (!raw) return {};
  const prompt = Number(raw.prompt_tokens);
  const completion = Number(raw.completion_tokens);
  const total = Number(raw.total_tokens);
  const details = (raw.prompt_tokens_details || {}) as Record<string, unknown>;
  const completionDetails = (raw.completion_tokens_details || {}) as Record<string, unknown>;
  const cached = Number(details.cached_tokens);
  const reasoning = Number(completionDetails.reasoning_tokens);
  const usage: TokenUsage = { raw };
  if (Number.isFinite(prompt)) usage.input_tokens = prompt;
  if (Number.isFinite(completion)) usage.output_tokens = completion;
  if (Number.isFinite(total)) usage.total_tokens = total;
  if (Number.isFinite(cached)) usage.cached_input_tokens = cached;
  if (Number.isFinite(reasoning)) usage.reasoning_tokens = reasoning;
  return usage;
}

export function createOpenAiProvider(apiKey: string, opts?: { maxRetries?: number }): LlmProvider {
  const maxRetries = opts?.maxRetries ?? 2;

  return {
    id: "openai",
    async complete(req: ChatCompletionRequest): Promise<ChatCompletionResult> {
      let retries = 0;
      let lastErr: Error | null = null;
      const started = Date.now();

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          retries = attempt;
          await sleep(Math.min(8000, 500 * 2 ** (attempt - 1)));
        }
        try {
          const body: Record<string, unknown> = {
            model: req.model,
            temperature: req.temperature ?? 0.1,
            messages: req.messages,
          };
          if (req.json_object) {
            body.response_format = { type: "json_object" };
          }

          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (res.status === 429 || res.status >= 500) {
            const errText = await res.text();
            lastErr = new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 500)}`);
            continue;
          }
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 800)}`);
          }

          const json = await res.json();
          const content = String(json?.choices?.[0]?.message?.content || "");
          if (!content) throw new Error("Empty OpenAI response");

          return {
            content,
            model: String(json?.model || req.model),
            usage: normalizeOpenAiUsage(json?.usage),
            latency_ms: Date.now() - started,
            provider: "openai",
            retries,
          };
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          if (attempt >= maxRetries) break;
          // Network / transient — retry
          if (!String(lastErr.message).includes("HTTP 4")) continue;
          throw lastErr;
        }
      }
      throw lastErr || new Error("OpenAI request failed");
    },
  };
}
