# Milestone 8A Ollama evaluation v3 plan

Status: **prepared, not executed**. V3 is a separate treatment and must not overwrite or combine with the baseline or v2 evidence. No inference is authorized by this plan.

## Frozen cases and scoring

Reuse the same three workflows, six user goals, order, model, temperature, no-retry rule, title concepts, and 16 required conversion opportunities from `fixtures/assistance/milestone-8a-ollama-evaluation.json`, whose SHA-256 remains `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047`. Do not lower conversion expectations. A useful conversion still requires the corresponding frozen step; generated machine names must match one of the same allowed names after deterministic application naming.

Score separately: transport/schema validity, supplied eligible-step safety, title usefulness, label usefulness, conversion selection usefulness, generated-name usefulness, and scope discipline. Overall usefulness still requires schema/reference safety, scope discipline, every required conversion, at least 80% useful labels, and a useful title.

## V3 treatment

- Proposal contract is explicitly `contractVersion: 2`.
- The model receives safe step context produced by `makePrepareRequest`: ID, type, sanitized step label, `eligibleForInput`, and safe `fieldLabel` for eligible fills.
- Existing input names, literal values, URLs, locators, raw recording events, provenance, and unrelated evidence are absent.
- The prompt explicitly asks for one conversion selection for every eligible field that should vary for the user goal, permits empty conversions only when none should be reusable, and prohibits existing-input references, machine names, and input IDs.
- The response selects step IDs and supplies human field labels. Application code generates unique machine names; the model cannot bind existing or shared inputs.
- Full JSON Schema transmission and identical prompt grounding remain enabled, so v3 changes context, prompt instructions, and proposal contract together. Results cannot isolate one change or be attributed solely to model capability.

## Separate evidence

- Manifest: `fixtures/assistance/milestone-8a-ollama-evaluation-v3.json`.
- Manifest SHA-256: `FBC03B1B8827FA8B3418A7AF0DB4007132DBF80C0FEFD925F8C70AD9D2079663`.
- Result: ignored `artifacts/milestone-8a/ollama-evaluation-v3-results.json`.
- Rejected diagnostics: ignored `artifacts/milestone-8a/ollama-evaluation-v3-rejected.jsonl` under the existing explicit synthetic-evaluation gates.

Execute each request once and manually review it before the next. Preserve failures, usage, durations, raw bounded diagnostics, incorrect suggestions, and manual corrections. Never apply suggestions or dispatch browser actions. If interrupted, preserve partial evidence and do not silently restart.
