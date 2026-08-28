import { createAnthropicProvider } from "./anthropic.ts";
import { createGeminiProvider } from "./gemini.ts";
import { createOpenAiProvider } from "./openai.ts";
import type { LlmProvider } from "./types.ts";

export type { ChatCompletionRequest, ChatCompletionResult, LlmProvider, TokenUsage, ChatMessage } from "./types.ts";
export { createOpenAiProvider } from "./openai.ts";
export { createAnthropicProvider } from "./anthropic.ts";
export { createGeminiProvider } from "./gemini.ts";

export type ProviderId = "openai" | "anthropic" | "gemini";

export function createProvider(
  id: ProviderId,
  apiKey: string,
  opts?: { maxRetries?: number },
): LlmProvider {
  if (id === "openai") return createOpenAiProvider(apiKey, opts);
  if (id === "anthropic") return createAnthropicProvider(apiKey, opts);
  if (id === "gemini") return createGeminiProvider(apiKey, opts);
  throw new Error(`Unknown provider: ${id}`);
}
