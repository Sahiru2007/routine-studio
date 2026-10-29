# Milestone 8A Ollama evaluation v3 results

Executed once on 29 October 2026 under the frozen `OLLAMA_PREPARE_EVALUATION_V3.md` protocol. The manifest SHA-256 matched `FBC03B1B8827FA8B3418A7AF0DB4007132DBF80C0FEFD925F8C70AD9D2079663`; the source fixture remained `39971908DCD261CBB801E9046433CC6777B7F1E0932E8D064B0DE4ED40200047`. Existing Ollama 0.40.11 and `qwen3:8b-q4_K_M` digest `500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41` were used. Exactly six production-adapter requests were dispatched in order, once each, with no retry, repair, cloud call, download, applied suggestion, or browser action.

## Aggregate

- Application/schema valid: **6/6** (v2: 3/6).
- Expected conversion selections: **16/16** (v2: 1/16).
- Useful labels: **30/40** (v2: 40/40). Repeated or vague navigation labels caused all ten losses.
- Useful titles under the frozen concepts: **1/6** (v2: 1/6).
- Generated names matching the frozen allowed sets: **12/16**.
- Scope disciplined: **6/6**; no unsupported action/check/target/navigation proposal.
- Overall useful under the unchanged strict criteria: **0/6** (v2: 0/6).
- Usage: 4,442 input + 3,052 output = **7,494 tokens**.
- Adapter duration: **46.284 seconds** total.

| Request | Valid | Title | Labels | Conversions | Names | Duration | Usage |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | yes | no | 5/5 | 3/3 | 1/3 | 11.495 s | 647 + 441 |
| 2 | yes | no | 5/5 | 3/3 | 1/3 | 5.845 s | 648 + 442 |
| 3 | yes | no | 4/7 | 2/2 | 2/2 | 6.548 s | 755 + 490 |
| 4 | yes | no | 4/7 | 2/2 | 2/2 | 6.537 s | 758 + 490 |
| 5 | yes | yes | 5/8 | 3/3 | 3/3 | 8.000 s | 814 + 598 |
| 6 | yes | no | 7/8 | 3/3 | 3/3 | 7.859 s | 820 + 591 |

Manual corrections were mainly clearer titles and destination-specific navigation labels. Requests 1–2 also needed `email_address` and `company_name` renamed to the frozen allowed names. The raw ignored result is `artifacts/milestone-8a/ollama-evaluation-v3-results.json`; it records each request, response, accounting, scoring, and correction before the next dispatch. No rejected-response diagnostic was produced because all six outputs passed strict validation.

V3 changed contract, safe context, and prompt instructions together. The improvement in structural validity and conversion selection cannot be attributed to one change or solely to model capability. Six related synthetic requests do not establish statistical reliability.

