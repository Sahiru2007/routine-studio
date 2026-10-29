# Milestone 8A verification (current source working tree)

Commands actually run:

```powershell
npm.cmd test -- packages/assistance-schema/assistance.test.ts packages/assistance-schema/providers.test.ts
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:prepare
npm.cmd run test:configuration
```

Results: 15 focused assistance/provider tests PASS, including mocked Ollama and OpenAI preparation responses; typecheck PASS; production build PASS; actual Electron mock-provider flow PASS; actual configuration/inspection regression PASS (5 checks). `test:prepare` seeds a validated synthetic recording of the existing customer-entry demo in isolated E: storage, opens it in the actual Electron editor, submits a short goal to a loopback Ollama-compatible mock, reviews nine before/after proposal rows, accepts only four, and confirms the title, one label and two input conversions change together in the unsaved draft while unchecked changes and the saved workflow remain unchanged.

The Electron check also asserts that the provider prompt contains the user goal but none of the captured name/email/company literal values; recording stays idle; no execution worker starts; no explicit check is generated; explicit Save creates exactly one revision; the separate raw recording JSON remains byte-for-byte equivalent; and a subsequent draft edit causes stale proposal rejection before application. Screenshots: `artifacts/milestone-8a/01-prepare-proposal-review.png` and `02-prepare-applied-draft.png`.

No cloud request, local inference, model load/download, managed Chromium action from a suggestion, broad regression suite, packaging, commit, push or publication was performed. The historical `npm.cmd run test:assistance` harness terminated without refreshing its evidence or printing its assertions in this session and is therefore not reported as passing. Model quality, live-provider compatibility for this new schema, screen-reader coverage and clean-machine behavior remain untested.

## Historical Milestone 7 verification

Verified on the same Windows machine with synthetic data and a loopback mock only: `npm.cmd run typecheck`; 74 tests in 10 files; production build; and `npm.cmd run test:openai-assistance`. The actual Electron test saved a fake key through Windows DPAPI, confirmed the credential file and rendered UI contained no plaintext key, previewed the exact bounded payload with zero requests, exercised distinct credential and structured compatibility requests against `/v1/models` and `/v1/responses`, checked `store:false`, strict schema, no tools, token accounting, removal/no fallback, No AI mode, manual persistence and full restart. Screenshot `artifacts/milestone-7/01-openai-settings-mocked.png` was inspected.

Unit coverage includes provider persistence, official request shape, refusals, incomplete output, invented IDs, authentication/rate errors, in-flight cancellation, provider-change locking, key removal, session-only use and secure-storage fail-closed behavior. No real OpenAI/Ollama request, real key, model load, or model download occurred. A future optional live smoke test must be explicitly user-authorized and cannot be treated as reliability evidence.

The copied unpacked build in an E: path containing spaces passed the full actual packaged suite: direct resources/storage, real MV3 recording, configured workflow/check and restart, packaged CSV import, actual worker/Chromium three-row batch, independent demo-record audit, export, absence of source/development-server dependency, missing Chromium/Ollama guidance and manual persistence. The mocked provider suite then passed against both copied-unpacked and freshly installed executables. Focused silent NSIS install/direct launch/uninstall passed; uninstall removed binaries and retained isolated data. Upgrade behavior was not changed, so the expensive historical 0.6.0→0.6.1 retention matrix was not repeated. These remain same-machine checks, not clean-machine verification.

Pre-publication artifact hashes: installer `d2b771c437f5c111756600f586c102d7c662dd4e1c14a94a6c357d40cd8d25a1`; application ZIP `d59126f76e673083adc9d408294ecc81a1360eaa245e965b3b9ded10ea43068e`. The exact final source commit, CI run, release URL, and final rebuilt hashes are recorded after publication.

## Historical Milestone 6B verification

Final installer: `E:\projects\routine-studio\artifacts\milestone-6b\final\Routine-Studio-Setup-0.6.1-unsigned.exe`; SHA-256 `C1801425C47920C5658C0E20A2DABC45E0C5C924FFC5A9B24E4E688DFC8A3222`; Authenticode `NotSigned`.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
$env:ELECTRON_BUILDER_CACHE='E:\AI\Caches\electron-builder'
$env:npm_config_cache='E:\AI\Caches\npm'
npm.cmd run package:installer
node scripts/installer-test.mjs
npm.cmd run typecheck
npm.cmd test
```

Actual same-machine lifecycle PASS: install 0.6.0 to an E: path containing spaces/no forced launch; direct installed executable/resources; real MV3 recording and configured workflow; packaged CSV and actual three-row worker/Chromium batch; closed-database backup; 0.6.1 in-place upgrade and full restart with all workflow/revision/recording/dataset/mapping/batch/run counts unchanged; uninstall removed binaries and preserved data; reinstall reopened data; missing Chromium guidance and offline manual save; final metadata rebuild reinstall smoke. Screenshots 01–04 were inspected. Normal user data and Ollama were untouched. Typecheck and 69 tests pass. Broad suites were not repeated because this focused installed-app test exercised the changed packaging boundary.

No suitable local Windows VM/Sandbox exists. These results are not clean-machine verification. Follow the clean Windows checklist in `docs/NEXT_SESSION.md`; record SmartScreen/antivirus, prerequisite and Add/Remove Programs behavior honestly.

## Historical Milestone 5 verification

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
