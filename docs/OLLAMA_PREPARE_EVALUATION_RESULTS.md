# Milestone 8A local Ollama evaluation results

Executed once on 29 October 2026 against the existing local `qwen3:8b-q4_K_M` model. The frozen fixture SHA-256 was verified as `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047` before inference. Model availability was confirmed through Ollama metadata endpoints without an extra generation. No request was retried, no cloud provider was contacted, and no suggestion was applied or sent to a browser.

## Results

| Request | Case / goal summary | Duration | Schema | Usefulness |
| --- | --- | ---: | --- | --- |
| 1 | Direct three fields / repeated customers | 10.837 s | FAIL | FAIL / not semantically scorable |
| 2 | Direct three fields / teammate-readable entry | 4.935 s | FAIL | FAIL / not semantically scorable |
| 3 | Directory navigation / reusable onboarding | 6.870 s | FAIL | FAIL / not semantically scorable |
| 4 | Directory navigation / new-operator clarity | 6.931 s | FAIL | FAIL / not semantically scorable |
| 5 | Company-first return / repeated contacts | 7.188 s | FAIL | FAIL / not semantically scorable |
| 6 | Company-first return / concise reusable flow | 7.013 s | FAIL | FAIL / not semantically scorable |

All six requests reached a terminal failure after one attempt. In every case, the model returned an unsupported top-level `steps` field and omitted the required `stepLabels` and `inputConversions` arrays. Request 5 additionally returned `inputConversions` as an object. The strict production validator rejected each response before it became a proposal. Returned usage was unavailable at that validation boundary; the recorded durations are wall-clock request durations derived from the persisted start/finish timestamps.

Consequently, useful conversions were **0 accepted of 16 required conversion opportunities**, useful labels were **0 accepted**, and useful titles were **0 accepted**. These zeros mean no schema-valid suggestion was available to review; they do not assert that every inaccessible piece of generated prose was semantically poor. The adapter preserved bounded validation errors but not the rejected raw model body, so exact proposed label/title/conversion text cannot be safely reconstructed or scored.

## Incorrect suggestions and manual corrections

For requests 1–4 and 6, classification is `other: malformed proposal shape`: remove the unsupported `steps` key and return the strict proposal object with `title`, `stepLabels: []`, and `inputConversions: []`, using only supplied step IDs and allowed literal-fill conversions. For request 5 the same correction is required, and `inputConversions` must be an array rather than an object. These are reviewer notes only; no correction was applied, no draft was changed, and no automatic rerun occurred.

Because the rejected raw body is not retained, omitted conversions, label quality, title concepts, scope expansions, and exact manual wording corrections cannot be evaluated honestly. The runner advanced after each terminal schema rejection and the manual aggregate review was performed after all six requests; this differs from the protocol's requested per-response review before the next request, but did not alter prompts, ordering, limits, responses, or retry behavior.

## Limitations

This small evaluation establishes only that this model/version failed the current strict Milestone 8A proposal contract on all six frozen synthetic requests. It does not establish broader model reliability, real-site quality, execution correctness, or privacy beyond the bounded request. Raw rejected output and token accounting were not exposed by the production validation path. Evidence is preserved at ignored path `artifacts/milestone-8a/ollama-evaluation-results.json`.
