# Milestones 4A/4B — current status

Routine Studio v0.5.0, verified on 28 October 2026 (Asia/Colombo). CSV preparation was completed and verified before connecting supervised batch execution. Existing recording, inspection, workflow editing, evidence and standalone execution remain available. The direct user request authorizes commit/push after successful checks, overriding the attachment's no-commit/no-push wording for the final handoff only. No release, installer, paid/model service, real account, unattended real-site work or automatic repair/reconciliation.

## Implemented

- Background UTF-8/BOM CSV parser with strict quoting/encoding/width/header/size limits. Strings/zeros/long IDs/dates/formula-like text are preserved; whitespace trims only by explicit mapping choice. Native file cancellation is safe.
- Explicit saved-workflow snapshots, stable-input column/constant/shared-column mapping, actual-value validation without sample fallback, source record/physical-line references, 20-row preview/filtering and resolved steps. Preview performs no browser actions. Datasets/mappings save/delete locally with unsaved-change and deletion protection; saved mappings own private source/workflow copies.
- Immutable approved batch snapshots of exact included/excluded records, resolved inputs, origins and bounded settings. Concurrency 1 reuses the verified Runner/worker, unique-target and assertion semantics. Batch-wide browser reservation blocks recording/inspection/standalone competition even between rows.
- Pause/Resume/Stop, default pause-on-error, explicit continue-after-definite-failure, mandatory pause on uncertain/interrupted outcomes. No click/assertion/row retry. Stop is not rollback. Only never-dispatched rows can enter a NEW acknowledged remaining-only review after confirmed worker exit; previous dispatched/completed/failed/uncertain rows are excluded.
- SQLite migrations v6/v7 preserve previous workflow/recording/revision/run bytes, adding datasets/mappings/batches and independent run notes. Durable row/step history and exception filters distinguish outcomes; notes never change them. Startup starts nothing and marks unfinished work interrupted/uncertain. A persisted PID lease blocks takeover while a prior worker is alive/unconfirmed.
- Native JSON/CSV summary exports. Formula-protected CSV transformation affects exports only. Profiles, cookies, raw HTML and unmapped source columns are not exported. Plaintext storage is explained.
- Six synthetic CSV fixtures and labeled disposable demo rejection/delayed-response controls. Runtime never reads demo data as a business-success shortcut.

## Actual results

| Check | Result |
| --- | --- |
| TypeScript / production build | PASS: main, CSV background worker, browser execution worker, preload, renderer and MV3 extension |
| Focused tests | PASS: 62 tests in 8 files, including parser/mapping/bounds, snapshot linkage/immutability, migration preservation, deadlines, PID takeover guard and dispatch/state prevention |
| Actual CSV preparation | PASS: native Cancel/import, mapping, resolved no-action preview, explicit save/restart/reopen, future source-cell edits, unsaved Cancel/discard and deletion confirmations |
| Ten valid rows | PASS: actual Electron → worker → Chromium, one row at a time; independent demo-file audit found exactly ten correct ordered customers, no extras |
| Invalid/excluded rows | PASS: one valid/two invalid fixture; exactly one row run, invalid records absent from dispatch/run records |
| Pause/Resume / Stop | PASS: no repeated step dispatch, preserved ordering; queued rows not run after Stop; explicitly approved remaining-only work excluded previous dispatches and produced no duplicates |
| Definite failures | PASS: intentional demo rejection created no customer; failed explicit check paused by default; explicit Resume skipped that row; reviewed continue policy advanced without retry |
| Uncertain submissions | PASS: demo write followed by delayed response paused even with continue enabled; no retry or next row |
| Browser/worker/app interruption | PASS: actual Chromium closure, worker termination after a real write, actual Electron main termination/restart; durable honest states and no automatic resume |
| Remaining work after restart | PASS: independent investigation/acknowledgment and new review ran only the never-dispatched final row; completed/uncertain writes were not repeated |
| Historical snapshots | PASS: source/workflow edits did not alter prior batch plans; original recording/raw revision regressions preserved |
| Unexpected origins | PASS: independent local destination received zero requests while held; approval was required again for the next row; denial prevented contact and stopped dispatch |
| Exports / notes | PASS: actual native JSON save, CSV save/cancel; JSON matched persisted outcomes; unsafe title/input CSV cells gained an apostrophe, original strings unchanged; standalone note/filter retained its original assertion failure |
| Existing regressions | PASS: actual single execution, configuration/read-only inspection/migration, MV3 recording/privacy/lifecycle, desktop/native unsaved/deletion checks |
| Screenshots/video | Actual mapping, validation, review, live/paused/failed/uncertain progress, exception timelines, origin approval and restart history inspected; short real CSV preparation/reopen videos recorded on E: |
| Storage | E: dependency/cache/parser/browser/profile/data/temp/artifact paths; existing Chromium/FFmpeg reused, no browser download |

Machine evidence: `artifacts/milestone-4/preparation-results.json`, `results.json`, screenshots and `walkthrough/*.webm`. Earlier Milestone 3 stop instructions and local-only handoff are historical in STATUS-MILESTONE-3-ARCHIVE.md and VERIFICATION-MILESTONE-3-ARCHIVE.md, not current restrictions. Earlier archives remain intact.

## Limits / unresolved scope

Supported execution remains one original tab and ordinary top-level HTML. No frames/shadow DOM, multi-tab/popup flow, upload, arbitrary widgets, dialogs, secret storage, service-worker/WebSocket flows or arbitrary production-site reliability claim. Execution profile/session/application state is shared across rows; no row isolation or exactly-once guarantee. All imported cells and historical actual inputs are plaintext; use synthetic/nonsecret data only.

Uncertain outcomes were detected and persisted; automatic reconciliation was NOT established. Never-dispatched continuation does not prove prior writes correct. Independent investigation is required. PID reuse/permissions may conservatively block takeover rather than kill an unverified process. Completed configured steps or UI checks do not prove database correctness. Stop cannot undo changes. Row/total wall-clock budgets include pauses/approval waits.

CSV is comma-separated UTF-8 only, with 2 MiB/1000 rows/50 columns/10000 characters per field/100000 per record bounds. Batch limits are 100 valid rows, 100 steps/row and an 8 MiB snapshot. History lists newest 200 summaries; retention/deeper history UI, secure erase, full screen-reader/DPI coverage and fresh-machine installer/distribution are deferred. Native file/legacy close dialogs were automated; a dedicated new active-batch native-close Cancel/Confirm test was not added. Browser/worker/app termination paths were exercised directly.

Early verification-helper failures (Windows controls exposed as panes, a non-exact accessible-name selector, and a test that forgot to revalidate after a mapping edit) were corrected and rerun. They are not counted as passes. No known failing final check is hidden.

## Acceptance / next milestone

Run `npm.cmd run build` then `npm.cmd start` in E:\projects\routine-studio. Start/reset the app-managed disposable demo at port 4177. Configure a saved customer workflow with three inputs and deliberately add the visible saved-message check. Import `fixtures/csv/customers-ten.csv`, save dataset/mapping, validate, review included/excluded rows and limits, explicitly approve/Start, inspect progress/history and independently inspect the customer directory. Try missing-values/rejection/delay fixtures only on the disposable demo. README and VERIFICATION contain exact commands and artifact paths.

Suggested next milestone: user-assisted investigation/reconciliation design and better retention/accessibility coverage, separately authorized. No automatic repair, retry of uncertain writes or next milestone was started. The verified build is open for review on the normal E: data root (approximately 13:35 Asia/Colombo, 28 October 2026), after every verification process finished. Launch stderr is empty. A read-only before/after SHA-256 audit confirmed exact workflow/revision/recording bytes across migration to database v7; see artifacts/milestone-4/normal-data-preservation.json. No workflow/batch was automatically started.