/**
 * Normalized token usage from a single LLM API call.
 * Missing metrics are left undefined (never fabricated).
 */
export type TokenUsage = {
  input_tokens?: number;
  output_tokens?: number;
  cached_input_tokens?: number;
  cache_write_tokens?: number;
  reasoning_tokens?: number;
  total_tokens?: number;
  /** Provider-raw usage object for debugging */
  raw?: Record<string, unknown>;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  /** When true, request JSON object output if the provider supports it. */
  json_object?: boolean;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  usage: TokenUsage;
  latency_ms: number;
  provider: string;
  retries: number;
};

export interface LlmProvider {
  readonly id: string;
  complete(req: ChatCompletionRequest): Promise<ChatCompletionResult>;
}
