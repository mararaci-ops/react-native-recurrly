# PostHog AI Observability setup

## Status

**Wired, unverified.** The project has no LLM provider SDK, model call, conversation loop, or registered AI tools today. The manual-capture integration is ready for the first LLM call path, but no generation can be sent until that path exists and calls the helper below.

## What changed

- Selected the `ai-observability-manual-capture` workflow because `package.json` contains no LLM vendor or agent-framework SDK.
- Reused the existing `posthog-react-native` client rather than adding a server-only SDK to an Expo mobile app.
- Added `src/lib/ai-observability.ts` with `captureAiGeneration()`.
  - It sends `$ai_generation` events with model, provider, input/output messages, token counts, latency, one `$ai_session_id` per conversation, and one `$ai_trace_id` per turn.
  - It relies on the existing identified PostHog client for the stable distinct ID; it does not send user PII as event properties.
- Configured the existing client’s environment variables for the supplied EU PostHog ingestion host.
- Wrote the AI Observability run record to `.posthog-wizard-cache/.posthog-ai.json`.

## How to instrument the first LLM call

When an LLM-backed feature is added, invoke `captureAiGeneration()` immediately after each successful model response. Pass:

- a stable `sessionId` that is shared by every turn in one conversation;
- one new `traceId` for each user turn, reused by every model call in that turn;
- the actual model and provider names; and
- the request and response messages, token counts, and elapsed latency from the provider response.

Use the same `traceId` for tool spans if the new feature registers and executes tools. Because this project has no current conversation, user-turn function, or tool dispatch loop, no call site was added.

For production LLM providers, make model requests from a server or trusted backend rather than embedding vendor credentials in the mobile application. After choosing a provider SDK, rerun the matching provider-specific AI Observability workflow for automatic instrumentation if appropriate.

## Verification

- `npm run lint` completed successfully.
- The existing PostHog client reads `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST` from Expo environment variables; Expo reported both variables as loaded during lint.
- No model request exists to trigger, so delivery has not been verified in PostHog.

After a model call is wired, trigger one conversation turn, then open **AI Observability → Traces** in the EU PostHog project. Confirm that the new trace contains its generation. Trigger a second turn in the same conversation and confirm both traces share one session ID. If a single turn invokes multiple model calls, confirm they share the same trace ID.

## Privacy mode

The manual helper currently captures prompt and completion content through `$ai_input` and `$ai_output_choices` in `src/lib/ai-observability.ts` (the effective privacy mode is off). Manual capture has no SDK-wide `privacyMode` switch in this app.

Before sending sensitive prompts or responses, update the helper or its future call site to omit `$ai_input` and `$ai_output_choices`; leave model, provider, token, latency, and trace metadata intact. This change affects future captures only and does not remove previously stored events or arbitrary custom properties. See [AI Observability privacy mode](https://posthog.com/docs/ai-observability/privacy-mode).

## Next step

Add the first LLM call path, then call `captureAiGeneration()` with correctly scoped conversation and turn identifiers. No dashboard or existing analytics code was changed.
