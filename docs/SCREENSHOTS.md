# Screenshot guide

The README gallery uses screenshots from actual Routine Studio Electron verification. Every scene uses disposable synthetic customer data and isolated application storage. The tracked images are curated presentation copies; raw test output remains ignored under `artifacts/`.

## Workflow editor

`docs/images/workflow-editor.png` shows the packaged `v0.7.0-rc.1` workflow editor with an ordered nine-step customer workflow, the React Flow design view, the selected step inspector, input definitions, and a configuration-ready result.

This demonstrates that the packaged renderer can display a persisted configured workflow. It does not prove that the targets are semantically correct or that an execution will succeed.

Source evidence: `artifacts/milestone-6a/02-packaged-configured-workflow.png`.

## Read-only target inspection

`docs/images/target-inspection.png` shows the actual target inspector reporting exactly one top-level DOM match for a bounded CSS locator. The explanatory text visible in the UI states that no click, fill, submit, or navigation occurred.

This demonstrates the match-count result and inspection UI. One match is not proof that the selected element is the intended semantic target.

Source evidence: `artifacts/milestone-2/02-one-match.png`.

## Batch results

`docs/images/batch-results.png` shows an actual packaged three-row synthetic batch after all reviewed rows reached terminal states. It includes the durable summary, configured-check count, per-row outcome evidence, and timeline controls.

This demonstrates the batch result interface and its deliberately qualified language. The independent demo-data grader—not this screen—was used during verification to check created records.

Source evidence: `artifacts/milestone-6a/04-packaged-batch-complete.png`.

## Assistance settings

`docs/images/assistance-settings.png` shows the actual Milestone 7 settings interface with explicit cloud consent, DPAPI/session key choices, separate provider test actions, and a bounded payload preview.

The scene was exercised against a loopback mock. It contains no API key and does not claim live OpenAI compatibility, model quality, zero retention, or free API usage.

Source evidence: `artifacts/milestone-7/01-openai-settings-mocked.png`.

## Prepare proposal review

`docs/images/prepare-review.png` shows an actual source-only Milestone 8A proposal returned by the local `qwen3:8b-q4_K_M` model. Every checkbox is initially clear. The proposal incorrectly included a fixed Company field; the walkthrough rejected that conversion before applying the useful selections.

This demonstrates the real review interface and one unedited local-model response. The feature is included experimentally in `v0.8.0-rc.1`; the image does not establish model reliability and does not show automatic application or browser authority.

Source evidence: `artifacts/milestone-8a/walkthrough/a-01-proposal.png`.

## CSV mapping preview

`docs/images/csv-mapping.png` shows the actual Electron CSV mapping and preview interface with synthetic values. Preview performs no browser actions.

Source evidence: `artifacts/milestone-4/01-mapping-preview.png`.

## Exception detail

`docs/images/exception-detail.png` shows actual durable batch exception evidence for a configured assertion failure. The interface keeps the failed result visible and does not silently retry it.

Source evidence: `artifacts/milestone-4/08-exception-detail.png`.

## Privacy and maintenance

- No screenshot contains a real customer, credential, API key, everyday browser profile, cookie, or production URL.
- Machine-local `E:` paths visible in verification screens are test paths, not portable defaults or secrets.
- Raw screenshots, videos, JSON results, databases, profiles, logs, installers, and packaged binaries remain excluded by `.gitignore`.
- Update the gallery only from a visually inspected actual-app run. Keep the caveats beside each screenshot when UI wording or supported behavior changes.
