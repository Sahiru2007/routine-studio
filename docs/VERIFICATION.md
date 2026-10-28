# Milestone 5 verification (current)

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:assistance
npm.cmd run test:batch
```

Focused tests cover loopback-only endpoints, redirect rejection, unavailable/malformed responses, strict unknown/duplicate-ID and unexpected-field rejection, injection-like headers, cancellation/duplicate requests and deterministic offline guidance. `test:assistance` uses actual Electron and the real inspection Chromium against a bounded local mock contract; it captures successful mapping/target and offline states under `artifacts/milestone-5`. It asserts saved mappings/history remain unchanged until explicit ordinary save, no execution worker starts, and highlighting changes no form data.

The real-local sample is deliberately separate: start only the existing E: Ollama installation/model, run `node scripts/real-assistance-validation.mjs`, then stop that test-owned server. It made 3 of the allowed 8 inference requests, recorded exact limits/durations/outcomes in `real-local-results.json`, used synthetic descriptors only, and did not retry for favorable answers. Do not describe this sample as reliability evidence.

The actual `test:batch` native dialog now selects `Keep app open` and `Stop batch and close` by verified accessible name/class/HWND. Cancel retained `paused_error`; Confirm/restart persisted `interrupted` with no running row. Screenshots: `artifacts/milestone-4/12-active-batch-close-cancel.png` and `13-active-batch-close-confirm.png`.

## Historical Milestones 4A/4B verification

Verified environment: interactive Windows, Node 24.22, Electron/Playwright bundled Chromium on E:. Use synthetic data only; close older app/demo windows. Native dialogs are driven through their actual HWND/accessible name and class—not mocked file responses.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
# Dependency order: preparation first, then browser execution
npm.cmd run test:csv
npm.cmd run test:batch
npm.cmd run test:execution
npm.cmd run test:configuration
npm.cmd run test:recording
npm.cmd run test:desktop
# Optional short real preparation walkthrough
npm.cmd run test:csv -- --video
# Only after all verification processes finish:
npm.cmd start
```

## Actual preparation and batch checks

`scripts/batch-test.mjs --prepare-only` uses real Electron, the native Open dialog (including Cancel), the CSV worker, explicit UI mapping/save, resolved preview and restart/reopen. It asserts no browser worker, no customer creation and identical saved mapping content. Preparation-only verification additionally edits/saves a source cell, verifies unsaved navigation Cancel/discard, and exercises actual mapping/dataset deletion cancellation/confirmation. `--video` records the actual Electron page under `artifacts/milestone-4/walkthrough`; two short clips cover import/map/preview and reopen. Native OS file dialogs themselves are outside the page video; their controls are independently driven and their results asserted.

The full script then starts actual Chromium workers and audits only this project's disposable `demo/customers.json` from test code. Ten valid rows must create exactly ten customers with exact name/email/company in source order; every configured step has exactly one dispatch/completion event. Pause/resume holds dispatch and preserves ordering. Invalid source rows never get run records. Stop prevents queued rows, and explicitly acknowledged NEW remaining-only reviews exclude every previous dispatch and preserve unique customer emails.

Rejection fixture: `DEMO-REJECT` creates nothing, causing the deliberate confirmation to fail. Default policy must pause; explicit Resume skips the failed row, while a reviewed continue setting advances automatically only after definite failure. Delay fixture: `DEMO-DELAY` writes one customer then delays response 15 seconds. The worker must mark the invoked action uncertain, pause even with continue enabled, never retry and never dispatch the later row. Actual browser close and worker kill are exercised, then the actual Electron main PID is killed/restarted. History remains honest; no browser starts automatically. Only the never-dispatched final row may enter a new acknowledged review after worker exit.

An independent two-origin local fixture verifies that redirected destinations receive zero requests pending approval. Approval is scoped to one row; the next row must ask again. Denial prevents destination contact and stops further dispatch. Browser ownership checks reject recording, inspection and standalone preparation while a batch is paused. Source/workflow edits are compared against exact historical batch snapshot JSON. Native JSON/CSV exports are read back; unsafe title/input formulas must be prefixed in CSV while original inputs stay unchanged. Cancel must write nothing. A standalone deliberate assertion failure remains failed after adding an investigation note through the exception UI.

Runtime does NOT read the demo file/database to decide success. The independent audit is a test grader only. Completed configured steps/checks never imply database correctness. Uncertain detection/persistence is not automatic reconciliation or exactly-once execution.

## Focused tests / migration coverage

62 tests in 8 files pass: BOM/commas/escaped quotes/multiline, string IDs/zeros/dates/formulas, UTF-8 and header/width/size errors, limits, explicit trim/constants/shared columns, actual-input validation/no samples, selected/excluded rows, snapshot source/workflow/value/limit consistency, immutable histories, main/worker sequence/session guards, dispatch-before-send, pause/error/uncertain/Stop transitions, row/total deadlines, restart prevention and alive prior-worker PID takeover blocking. Explicit v5→v7 migration checks preserve prior documents/revisions/run bytes. Existing v3/v4 raw/provenance migration tests and the actual existing-database read-only copy regression remain in place.

## Evidence on E:

Directory: `E:\projects\routine-studio\artifacts\milestone-4` (ignored by Git).

- `preparation-results.json`, `results.json`: timestamps, isolated E: data paths, actual check names, batch ID and zero renderer errors.
- `01-mapping-preview.png`: explicit bindings and no-action validation; `02-batch-review.png`: exact rows, values and origin/settings scope.
- `03-paused-progress.png`, `04-live-progress.png`, `05-ten-completed.png`: real controls/progress and terminal counts.
- `06-invalid-rows.png`: actionable invalid data; `07-paused-definite-failure.png`, `08-exception-detail.png`: paused failure and step evidence.
- `09-paused-uncertain.png`: no-retry warning; `10-restart-history.png`: durable interrupted/completed/queued outcomes.
- `11-origin-approval.png`: explicit held row destination.
- `summary-*.json`, `summary-*.csv`: actual native result exports used for independent assertions.
- `walkthrough/csv-import-map-preview.webm`, `walkthrough/csv-reopen-edit-delete.webm`: short real preparation/reopen/edit/delete captures; original page@*.webm files are retained.

Screenshots were inspected directly. Verification waits for actual lifecycle states/progress, not merely an async request being sent. On failure a screenshot is saved and the suite exits nonzero; stale failure screenshots from early helper/selector mistakes are not proof of a current defect. Those issues were corrected, not hidden by weaker assertions.

Existing evidence remains under `artifacts/milestone-1`, `milestone-2`, `milestone-3` and desktop artifact paths. Current regressions rerun actual recorder lifecycle/privacy/order, read-only inspection/configuration, raw evidence/no-op revisions, single-record execution/origin/uncertainty, native unsaved/deletion dialogs and E: paths. M3 verification is explicitly archived and its superseded stop rule does not apply.

## Acceptance and limitations

Follow README's **Import and run a supervised CSV batch** walkthrough. Start the app-managed disposable demo at `http://127.0.0.1:4177` (do not run standalone on the same port). Standalone commands: `npm.cmd run demo`; stop it before `npm.cmd run demo:reset`. Import clean ten rows, map three inputs to a saved confirmed customer workflow, save, preview, review/approve/Start, inspect live results and reopen history. Independently inspect the demo directory/data. Use rejection/delay fixtures only on disposable local data.

Limits and untested areas: comma-separated UTF-8 only; bounded files/rows/steps/snapshots; plaintext storage; shared browser/application state; one top-level tab and ordinary native HTML controls; no arbitrary-site reliability, frames/shadow DOM/custom widgets/upload/multi-tab, authentication/service-worker/WebSocket support, full screen-reader/DPI, secure erase/retention UI or installer. Active-batch native-close confirmation exists but its specific Cancel/Confirm pair was not separately automated; actual interruption/restart and legacy native close paths were tested. No real account, paid/model call, automatic reconciliation/repair or retry of uncertain writes. Future scope requires separate authorization.
