import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  LlmProvider,
  TokenUsage,
} from "./types.ts";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeAnthropicUsage(raw: Record<string, unknown> | undefined): TokenUsage {
  if (!raw) return {};
  const input = Number(raw.input_tokens);
  const output = Number(raw.output_tokens);
  const cacheRead = Number(raw.cache_read_input_tokens);
  const cacheWrite = Number(raw.cache_creation_input_tokens);
  const usage: TokenUsage = { raw };
  if (Number.isFinite(input)) usage.input_tokens = input;
  if (Number.isFinite(output)) usage.output_tokens = output;
  if (Number.isFinite(cacheRead)) usage.cached_input_tokens = cacheRead;
  if (Number.isFinite(cacheWrite)) usage.cache_write_tokens = cacheWrite;
  if (Number.isFinite(input) && Number.isFinite(output)) {
    usage.total_tokens = input + output;
  }
  return usage;
}

/**
 * Anthropic Messages API adapter.
 * Same semantic content as OpenAI: system prompt + messages; JSON requested via prompt when json_object is set.
 */
export function createAnthropicProvider(apiKey: string, opts?: { maxRetries?: number }): LlmProvider {
  const maxRetries = opts?.maxRetries ?? 2;

  return {
    id: "anthropic",
    async complete(req: ChatCompletionRequest): Promise<ChatCompletionResult> {
      let retries = 0;
      let lastErr: Error | null = null;
      const started = Date.now();

      const systemParts = req.messages.filter((m) => m.role === "system").map((m) => m.content);
      let system = systemParts.join("\n\n");
      if (req.json_object) {
        system = `${system}\n\nRespond with a single JSON object only. No markdown fences.`;
      }
      const messages = req.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      if (messages.length === 0) {
        throw new Error("Anthropic requires at least one user message");
      }
      // Anthropic requires alternating roles starting with user; merge if needed
      const normalized: { role: "user" | "assistant"; content: string }[] = [];
      for (const m of messages) {
        const last = normalized[normalized.length - 1];
        if (last && last.role === m.role) {
          last.content += "\n\n" + m.content;
        } else {
          normalized.push({ ...m });
        }
      }
      if (normalized[0]?.role !== "user") {
        normalized.unshift({ role: "user", content: "(continue)" });
      }

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          retries = attempt;
          await sleep(Math.min(8000, 500 * 2 ** (attempt - 1)));
        }
        try {
          const body: Record<string, unknown> = {
            model: req.model,
            max_tokens: 4096,
            temperature: req.temperature ?? 0.1,
            messages: normalized,
          };
          if (system) body.system = system;

          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (res.status === 429 || res.status >= 500) {
            const errText = await res.text();
            lastErr = new Error(`Anthropic HTTP ${res.status}: ${errText.slice(0, 500)}`);
            continue;
          }
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Anthropic HTTP ${res.status}: ${errText.slice(0, 800)}`);
          }

          const json = await res.json();
          const blocks = Array.isArray(json?.content) ? json.content : [];
          const text = blocks
            .filter((b: { type?: string }) => b?.type === "text")
            .map((b: { text?: string }) => b.text || "")
            .join("");
          if (!text) throw new Error("Empty Anthropic response");

          return {
            content: text,
            model: String(json?.model || req.model),
            usage: normalizeAnthropicUsage(json?.usage),
            latency_ms: Date.now() - started,
            provider: "anthropic",
            retries,
          };
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          if (attempt >= maxRetries) break;
          if (!String(lastErr.message).includes("HTTP 4")) continue;
          throw lastErr;
        }
      }
      throw lastErr || new Error("Anthropic request failed");
    },
  };
}
