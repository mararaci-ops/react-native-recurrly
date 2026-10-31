import { posthog } from "@/lib/posthog";

type AiMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

type CaptureAiGenerationOptions = {
  /** One stable conversation identifier shared across its turns. */
  sessionId: string;
  /** One identifier per user turn, shared by every model call in that turn. */
  traceId: string;
  model: string;
  provider: string;
  input: AiMessage[];
  outputChoices: AiMessage[];
  inputTokens?: number;
  outputTokens?: number;
  latencySeconds?: number;
};

/**
 * Records one completed LLM generation for AI Observability.
 * The configured PostHog client supplies the authenticated distinct ID.
 */
export function captureAiGeneration({
  sessionId,
  traceId,
  model,
  provider,
  input,
  outputChoices,
  inputTokens,
  outputTokens,
  latencySeconds,
}: CaptureAiGenerationOptions): void {
  posthog?.capture("$ai_generation", {
    $ai_trace_id: traceId,
    $ai_session_id: sessionId,
    $ai_model: model,
    $ai_provider: provider,
    $ai_input: input,
    $ai_output_choices: outputChoices,
    $ai_input_tokens: inputTokens,
    $ai_output_tokens: outputTokens,
    $ai_latency: latencySeconds,
  });
}
