# Milestone 8A Ollama follow-up evaluation v2

Status: **prepared, not executed**. This is a separately versioned follow-up to the immutable failed baseline in `OLLAMA_PREPARE_EVALUATION_RESULTS.md`. It must not overwrite, merge with, or reinterpret `artifacts/milestone-8a/ollama-evaluation-results.json`.

## Frozen inputs

- Reuse the same six cases, goals, order, acceptance criteria, model, and no-rerun rule from `fixtures/assistance/milestone-8a-ollama-evaluation.json`.
- Re-verify baseline fixture SHA-256 `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047` before any inference.
- Code-under-test difference: Ollama `format` now receives the full JSON Schema and the same schema is serialized into the prompt. This is the intentional v2 treatment; no fixture, goal, scoring, temperature, order, or model change is allowed.
- Use only the already installed `qwen3:8b-q4_K_M`. Confirm availability through metadata without generation. Do not download or substitute a model.

## Separate evidence

- Result: ignored `artifacts/milestone-8a/ollama-evaluation-v2-results.json`.
- Rejected-output diagnostics: ignored `artifacts/milestone-8a/ollama-evaluation-v2-rejected.jsonl`.
- Set `ROUTINE_STUDIO_SYNTHETIC_EVAL=1` and set `ROUTINE_STUDIO_ASSISTANCE_DIAGNOSTICS` to the absolute E: diagnostics path only for this synthetic evaluation. Production retains no rejected raw response by default.
- Each diagnostic record is JSONL, limited to 16,000 characters of serialized parsed output. Fields whose names resemble password, secret, token, API key, or authorization are replaced with `[REDACTED]`; `sk-...` and bearer-like values are also redacted. `truncated` states whether content was cut. Validation errors are separately bounded to 600 characters.
- Record Ollama `prompt_eval_count` and `eval_count` as input/output usage even when strict application validation rejects the parsed response.

## Execution protocol

Follow the baseline procedure and manual scoring criteria exactly. Run each request once, in order, with automatic retries disabled. After each terminal response, preserve its result and complete its manual review before dispatching the next request. Never repair, translate, or resubmit malformed output. Never apply a proposal or dispatch browser actions.

The final report must compare v2 with the baseline only after all six v2 terminal outcomes and reviews exist. It must distinguish transport/schema compliance from useful conversions, labels, titles, and scope discipline. A schema-valid result is not automatically useful. If interrupted, mark v2 partial and do not silently restart it.

Execution requires separate explicit authorization. No inference is authorized by this preparation document.
