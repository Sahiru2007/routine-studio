# Milestone 8A local Ollama evaluation plan

Status: **executed once on 29 October 2026**. All six requests were attempted exactly once; all failed strict schema validation. See [the result report](OLLAMA_PREPARE_EVALUATION_RESULTS.md). This document otherwise preserves the frozen protocol used for the run.

Frozen fixture SHA-256: `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047`.

The frozen inputs are in `fixtures/assistance/milestone-8a-ollama-evaluation.json`: three distinct synthetic recordings of the existing disposable customer demo, with two goals each. Execute exactly six requests in listed order against the already configured `qwen3:8b-q4_K_M` only after separate authorization. Use the normal Milestone 8A `prepare` schema and request controls. Do not add sample/literal values, change the prompts, reorder cases, retry, or replace a response because another answer might score better.

## Procedure

1. Record model/version, application commit, start time, and the frozen fixture SHA-256.
2. Confirm the provider is local Ollama and the endpoint is the approved unauthenticated loopback origin. Do not download/load another model or use OpenAI.
3. For each `requestId`, combine its frozen `goal` with the workflow's frozen title, existing input names, and steps. Send once with temperature 0 through the production adapter.
4. Record duration, structured response, schema acceptance/rejection, and token accounting when available. A timeout, malformed response, refusal, or transport failure is the result; do not retry.
5. Score usefulness manually before starting the next request. Do not apply or save any suggestion during evaluation.
6. Write one result document to the ignored path `artifacts/milestone-8a/ollama-evaluation-results.json`. Mark overall completion only after all six terminal outcomes and manual reviews are present.

## Acceptance criteria per request

- Schema/reference safety: only supplied step IDs; no duplicate IDs; conversions only for literal fills; valid new input names; no collision with `existingInputNames`; no extra fields.
- Input usefulness: every `requiredConversions` step is proposed with one of its allowed case-insensitive names. No navigate/click step is converted. Record missing, needless, misleading, duplicated, or over-broad conversions.
- Label usefulness: proposed labels must identify the demonstrated action and object, remain concise, preserve the observed order, and avoid claiming success, database state, checks, or actions not recorded. Generic labels such as “Process data” are not useful even if schema-valid.
- Title usefulness: the title must express the listed concepts naturally without claiming execution success or unsupported scope.
- Scope discipline: no checks, selectors, new steps, CSV mappings, instructions, or browser commands may appear.

A response passes usefulness only when schema/reference safety and scope discipline pass, every required conversion is useful, at least 80% of proposed labels are useful, and the title is useful. Valid JSON alone is not a pass.

## Incorrect-suggestion and correction record

For every incorrect or omitted suggestion, append an entry with:

- `requestId`, proposal category, affected step ID, and exact proposed text/name;
- classification: unsafe reference, missing conversion, unnecessary conversion, poor input name, vague label, misleading label, weak title, scope expansion, or other;
- why it fails the frozen criterion;
- the manual correction a reviewer would make;
- whether the correction changes only the unsaved draft;
- confirmation that no automatic rerun was made.

Manual corrections are evaluation notes only. Do not feed them back to the model, apply them automatically, alter acceptance criteria, or claim the provider learned from them.

## Overall report

Report six terminal outcomes, per-request usefulness pass/fail, aggregate useful conversions, useful labels, incorrect suggestions, manual corrections, and limitations. This sample is too small to establish reliability. It assesses one local model/version on synthetic customer-demo metadata and does not establish real-site quality, privacy beyond the bounded request, or execution correctness.
