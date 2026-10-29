# Milestone 8A Ollama schema diagnosis

## Cause

The six-request baseline did not exercise Ollama schema-constrained output. `assistanceSchema(command)` constructed the correct preparation schema, including required `title`, `stepLabels`, and `inputConversions`, but `OllamaProvider` sent the string `"json"` in the `/api/chat` `format` field. That selects JSON mode rather than the constructed JSON Schema. The user prompt said only that output should match “the requested schema” and did not include the schema or name its required top-level fields. No adapter transformation removed fields; the schema was simply unused on the Ollama path. Strict Zod and supplied-ID validation then correctly rejected the model's different shape.

The official Ollama structured-output documentation says to provide a JSON Schema directly to `format` and recommends also supplying the schema in the prompt. The `/api/chat` reference likewise defines `format` as either `json` or a JSON Schema. Ollama response accounting is returned as `prompt_eval_count` and `eval_count`. Sources checked on 29 October 2026: [Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs) and [Generate a chat message](https://docs.ollama.com/api/chat).

## Test gap

The actual Electron mock parsed request data from the prompt and always returned a hand-built schema-valid proposal. It checked value minimization and UI behavior, but not the serialized `format` field. OpenAI tests asserted their structured-output controls; the Ollama preparation path lacked the equivalent transport assertion.

## Correction

- `format` now contains the full per-command JSON Schema.
- The prompt contains the exact same serialized schema for grounding.
- The strict response schema and reference/duplicate/literal-fill/input-name checks are unchanged.
- Ollama token accounting is extracted before parsed-output validation, including malformed structured content.
- Rejected parsed or malformed output can be retained only through an explicit callback. The Electron app wires that callback only when `ROUTINE_STUDIO_SYNTHETIC_EVAL=1` and `ROUTINE_STUDIO_ASSISTANCE_DIAGNOSTICS` is an absolute E: artifacts path. Normal production behavior retains no raw rejected output.
- Diagnostics are JSONL. Serialized raw output is capped at 16,000 characters; a flag records truncation. Sensitive-looking keys and `sk-`/bearer-like strings are redacted. Validation messages remain capped at 600 characters.

Remaining uncertainty is model behavior under the corrected schema. Mocked transport and application validation can prove the request contract but cannot prove that `qwen3:8b-q4_K_M` will produce useful titles, labels, or conversions. The separately versioned v2 protocol is prepared but intentionally unexecuted.
