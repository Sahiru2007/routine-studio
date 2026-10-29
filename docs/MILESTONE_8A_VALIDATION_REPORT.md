# Milestone 8A validation and usability report

Completed 29 October 2026 using isolated E: data and the disposable customer demo. Detailed v3 scoring is in `OLLAMA_PREPARE_EVALUATION_V3_RESULTS.md`; frozen walkthrough expectations are in `MILESTONE_8A_WALKTHROUGH_PROTOCOL.md`.

## Three actual Electron/Chromium walkthroughs

Each case was recorded with the real MV3 recorder and dedicated Chromium, sent through the production Ollama adapter once, reviewed without automatic acceptance, saved deliberately, given a manual visible confirmation check, executed with different synthetic values, and graded independently from `demo/customers.json`.

- **A — support contact / fixed company:** valid proposal. It selected the expected name and email, but also incorrectly selected the explicitly fixed company. The company conversion was rejected; the two useful conversions were accepted. The corrected run created exactly Ava Reviewed / `ava.reviewed@example.test` / Routine Studio Support Lab, with zero extras.
- **B — partner intake:** the model returned a schema-shaped response whose last label referenced an unknown step ID. Strict supplied-ID validation discarded the whole proposal; bounded diagnostics retained the rejected response and error. All three conversions and the check were configured manually. The run created exactly Noah Reviewed / `noah.reviewed@example.test` / Synthetic Fjord Partners, with zero extras.
- **C — tenant entry / fixed email:** valid proposal. It selected the expected name and company and unnecessarily selected the explicitly fixed email. Email was rejected; the useful conversions were accepted. The first corrected run honestly failed because the recorded return-to-directory tail preceded the newly appended saved-page check. The editable tail was removed manually while immutable recording evidence stayed unchanged; the next run created exactly Mina Reviewed / `demo-inbox@example.test` / Synthetic Maple Works, with zero extras.

Unedited proposal quality was therefore: one fully discarded invalid response, two valid responses that each contained one unnecessary conversion, and no walkthrough proposal accepted wholesale. Successful final workflows depended on human review and manual correction. The walkthroughs dispatched exactly three inference requests; there were no retries. Their harness preserved outcomes and bounded rejected output but, unlike the frozen v3 harness, did not persist returned token accounting or adapter-only durations. Walkthrough token totals and precise per-request durations are therefore unavailable and are not reconstructed from screenshot timestamps. Usage/duration coverage is complete for 6/9 total authorized requests and missing for the three walkthrough requests.

## Usability defect fixed

A rejected refresh previously reported only in the global banner and could leave an older proposal visible. Preparation now clears the prior proposal/selections before a request and displays a bounded inline alert stating that no draft change occurred and manual configuration remains available. This changes no request, prompt, schema, or model behavior.

## Checks

- Frozen v3: six dispatched requests, 6/6 terminal valid responses, no retry.
- Walkthrough inference: three dispatched requests, no retry; one invalid response retained under the explicit synthetic diagnostic gate.
- Actual Electron walkthrough runs: A, B, and final C completed; independent state was exactly one intended record and zero extras for each.
- Original raw recording documents: unchanged after accepted edits, saves, and runs for all three cases.
- Focused assistance/provider tests: 19 passed.
- Typecheck: passed.
- Production build: passed. The first sandboxed attempt could not write generated `out/` files; the identical permitted run passed.
- Actual mocked Electron preparation: five checks passed, including partial acceptance, stale rejection, explicit save/evidence preservation, and the new inline error/old-proposal clearing behavior.

Screenshots are ignored evidence under `artifacts/milestone-8a/walkthrough`: `a-01-proposal.png`, `failure.png` (B rejection), `c-02-reviewed-draft.png`, and `a-03-run-completed.png`, `b-03-run-completed.png`, `c-03-run-completed.png`.

## Limits and recommendation

The model still did not reliably obey natural-language fixed-value intent, and titles/navigation labels remained weak in frozen v3. Field-label-only context deliberately withholds values, so value-specific fixed intent can be hard to ground even when present in the goal. Schema validity is not usefulness. Manual review, ordinary validation, explicit checks, and independent outcome inspection remain required.

Recommended next step: a **small private user pilot** focused on whether the review UI saves time despite correction needs. Do not expand suggestion authority or start another milestone automatically.
