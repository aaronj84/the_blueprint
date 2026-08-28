import type {
  ChatCompletionRequest,
  ChatCompletionResult,
  LlmProvider,
  TokenUsage,
} from "./types.ts";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeGeminiUsage(raw: Record<string, unknown> | undefined): TokenUsage {
  if (!raw) return {};
  const usage: TokenUsage = { raw };
  const prompt = Number(raw.promptTokenCount);
  const candidates = Number(raw.candidatesTokenCount);
  const thoughts = Number(raw.thoughtsTokenCount);
  const cached = Number(raw.cachedContentTokenCount);
  const total = Number(raw.totalTokenCount);
  if (Number.isFinite(prompt)) usage.input_tokens = prompt;
  if (Number.isFinite(candidates) || Number.isFinite(thoughts)) {
    usage.output_tokens = (Number.isFinite(candidates) ? candidates : 0) +
      (Number.isFinite(thoughts) ? thoughts : 0);
  }
  if (Number.isFinite(thoughts)) usage.reasoning_tokens = thoughts;
  if (Number.isFinite(cached)) usage.cached_input_tokens = cached;
  if (Number.isFinite(total)) usage.total_tokens = total;
  else if (usage.input_tokens != null && usage.output_tokens != null) {
    usage.total_tokens = usage.input_tokens + usage.output_tokens;
  }
  return usage;
}

export function createGeminiProvider(apiKey: string, opts?: { maxRetries?: number }): LlmProvider {
  const maxRetries = opts?.maxRetries ?? 2;

  return {
    id: "gemini",
    async complete(req: ChatCompletionRequest): Promise<ChatCompletionResult> {
      let retries = 0;
      let lastErr: Error | null = null;
      const started = Date.now();

      const systemParts = req.messages.filter((m) => m.role === "system").map((m) => m.content);
      const system = systemParts.join("\n\n");
      const contents: { role: string; parts: { text: string }[] }[] = [];
      for (const m of req.messages) {
        if (m.role === "system") continue;
        const role = m.role === "assistant" ? "model" : "user";
        const last = contents[contents.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += "\n\n" + m.content;
        } else {
          contents.push({ role, parts: [{ text: m.content }] });
        }
      }
      if (!contents.length) throw new Error("Gemini requires at least one user message");
      if (contents[0].role !== "user") {
        contents.unshift({ role: "user", parts: [{ text: "(continue)" }] });
      }

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: req.temperature ?? 0.1,
          ...(req.json_object ? { responseMimeType: "application/json" } : {}),
        },
      };
      if (system) body.systemInstruction = { parts: [{ text: system }] };

      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent`;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
          retries = attempt;
          await sleep(Math.min(8000, 500 * 2 ** (attempt - 1)));
        }
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "x-goog-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          if (res.status === 429 || res.status >= 500) {
            const errText = await res.text();
            lastErr = new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 500)}`);
            continue;
          }
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 800)}`);
          }
          const json = await res.json();
          const parts = json?.candidates?.[0]?.content?.parts || [];
          const text = parts
            .filter((p: { thought?: boolean }) => !p?.thought)
            .map((p: { text?: string }) => p.text || "")
            .join("");
          if (!text) throw new Error("Empty Gemini response");
          return {
            content: text,
            model: String(json?.modelVersion || req.model),
            usage: normalizeGeminiUsage(json?.usageMetadata),
            latency_ms: Date.now() - started,
            provider: "gemini",
            retries,
          };
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          if (attempt >= maxRetries) break;
          if (!String(lastErr.message).includes("HTTP 4")) continue;
          throw lastErr;
        }
      }
      throw lastErr || new Error("Gemini request failed");
    },
  };
}
