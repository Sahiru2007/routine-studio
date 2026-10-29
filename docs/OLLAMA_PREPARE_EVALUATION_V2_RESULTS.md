# Milestone 8A Ollama follow-up evaluation v2 results

Executed once on 29 October 2026 against the existing local `qwen3:8b-q4_K_M` model (digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`, Ollama 0.40.11). The source fixture SHA-256 matched `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047`. Each request ran once, in frozen order, without retry, repair, proposal application, browser action, cloud request, or download.

| Request | Application schema/reference result | Useful title | Useful labels | Useful conversions | Input/output tokens | Adapter duration |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 1 | PASS | No | 5/5 | 0/3 | 541 / 306 | 10.516 s |
| 2 | PASS | No | 5/5 | 0/3 | 542 / 281 | 4.018 s |
| 3 | FAIL: `Customer name` violates input-name syntax | No | 7/7 | 1/2 | 655 / 490 | 7.013 s |
| 4 | PASS | No | 7/7 | 0/2 | 658 / 387 | 5.557 s |
| 5 | FAIL: all conversions reuse existing `operator_note` | Yes | 8/8 | 0/3 | 709 / 591 | 8.465 s |
| 6 | FAIL: company conversion reuses existing `operator_note` | No | 8/8 | 0/3 | 715 / 489 | 7.011 s |

Aggregate: 3/6 application-valid proposals; 0/6 usefulness passes; 1/6 useful titles; 40/40 useful action/object labels; 1/16 useful required conversions; 6/6 scope-disciplined. Usage totaled 3,820 input and 2,544 output tokens (6,364 total). Adapter duration totaled 42.580 seconds.

Request 1 omitted all three conversions and used weak title `Prepare Synthetic Customers`. Request 2 omitted all conversions and used `Record Customer Information`, which did not clearly express entry/intake. Request 3 proposed `Customer name` (invalid and not an allowed frozen name) and useful `Email`; its title omitted onboarding/creation. Request 4 omitted both conversions and its title omitted directory/entry. Request 5 mapped company, name, and email to the unrelated existing `operator_note`; request 6 did so for company and omitted name/email. Required manual corrections are recorded per request in the ignored result artifact; no correction was applied and no response was rerun.

Compared with the baseline, which had 0/6 schema-valid results because it used only JSON mode, v2 produced the required top-level structured shape in all six raw responses and passed full application/reference validation in three. This comparison changed **both** schema transmission and prompt grounding together, so it cannot isolate either treatment or attribute the difference solely to model capability. The remaining failures show that JSON Schema shape compliance does not enforce every application rule: input-name syntax and collisions with supplied existing names still require strict application validation.

One pre-dispatch harness interruption was preserved in the v2 result with `inferenceDispatched: false`; an unresolved bridge promise caused the preflight assertion. The harness await was corrected transparently, then request 1 was dispatched for the first and only time. This was not an inference retry.

Evidence: ignored `artifacts/milestone-8a/ollama-evaluation-v2-results.json` and `ollama-evaluation-v2-rejected.jsonl`. Rejected outputs were bounded, untruncated, and retained only under the explicitly enabled synthetic-evaluation diagnostic path. The original baseline artifact was not overwritten.

Recommendation: keep strict application validation and human review authoritative. Before considering a broader evaluation, align the transmitted JSON Schema more closely with deterministic input-name syntax where Ollama supports it, and clarify in the prompt that useful literal-fill conversions are expected while existing input names must not be reused. Any such change creates a new treatment/version; do not rerun v2 or reinterpret these six outcomes. Six synthetic cases are insufficient to claim reliability.
