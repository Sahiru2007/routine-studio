# Milestone 8A — Prepare with AI (source working tree)

Milestone 8A is implemented without packaging or publication. A recorded workflow can accept a short user goal and request a strict typed preparation proposal through the existing Ollama/OpenAI assistance manager. The request contains the goal, current title, existing input names, and bounded step ID/type/label/literal-fill metadata; captured literal values are not sent. The response may propose one title, labels for supplied step IDs, and input conversions for supplied literal fill steps only. Unknown/duplicate IDs, nonliteral conversions, malformed names, extra fields, and collisions with existing input names are rejected.

The editor presents explicit before/after rows with every change initially unselected. Accepted changes are applied in one state update to the unsaved draft. An exact draft-snapshot comparison rejects stale proposals. Applying does not save, validate, add checks or steps, edit targets/CSV mappings, or invoke recording/inspection/execution. Explicit Save creates an ordinary revision; immutable recording evidence remains separate.

Actual results: focused assistance/provider tests PASS (15 tests); typecheck PASS; production build PASS; actual Electron loopback-mock verification PASS for value-minimized request data, individual acceptance, unchecked-change preservation, atomic unsaved application, no execution/recording activity, explicit revision save, byte-equivalent raw recording evidence, and stale-proposal rejection; actual configuration/inspection regression PASS (5 checks). Screenshots `artifacts/milestone-8a/01-prepare-proposal-review.png` and `02-prepare-applied-draft.png` were inspected. No OpenAI/Ollama inference, model loading, download, browser workflow action from a suggestion, package build, commit, push, or publication occurred.

Limits: proposal quality was not evaluated; preparation is bounded to 100 steps, and providers see the user goal plus workflow title, existing input names and step labels/types/IDs, but not literal fill values. Shared-input grouping is supported only when the proposal gives the same new input name to multiple literal fills; existing inputs must still be bound manually. The historical `test:assistance` harness terminated without refreshing evidence or printing assertions in this session, so it is not counted as passing; the new `test:prepare`, focused provider tests and actual configuration regression provide the reported coverage. Instruction-based editing, suggested checks, CSV mapping changes, new demos, and packaging are deferred.

Exact next step requires separate authorization: decide whether Milestone 8B should expand instruction-based editing and explicit-check suggestions, while retaining the same typed review/staleness boundaries.

## Historical Milestone 7 — OpenAI assistance release candidate

Milestone 7 implementation is complete and release verification is in progress for `0.7.0-rc.1`. Routine Studio now offers explicit No AI, local Ollama, and OpenAI API assistance choices. Manual recording, configuration, execution, and CSV batching remain available without any provider. OpenAI uses the official JavaScript SDK Responses API with strict structured output, `store:false`, bounded output, no tools, `maxRetries:0`, user-triggered requests, cancellation, and no provider fallback. Suggestions remain review-only and cannot execute or silently alter saved data.

Windows API-key persistence uses Electron `safeStorage`/DPAPI in the configured E: data root; session-only use is available and secure persistence fails closed. Keys are never returned over IPC or rendered. Settings provide cloud disclosure and consent, payload preview, remove/replace, and distinct credential/compatibility tests. Provider/model/duration/token accounting is shown when available; refusal, incomplete output, malformed IDs, authentication/rate errors, and cancellation stay honest.

Actual checks: typecheck PASS; production build PASS; 74 tests in 10 files PASS; actual development, copied-unpacked, and installed Electron mocked-provider verification PASS for DPAPI ciphertext/no plaintext disclosure, zero-request preview, distinct mocked official endpoint calls, strict stateless request shape, key removal/no fallback, No AI mode, manual save, and full restart. The full copied-unpacked suite also passed direct resource paths, real MV3 recording, configured inputs/check, restart, packaged CSV import, actual three-row Chromium batch with independent demo audit, export, missing-dependency guidance, and clean shutdown. Focused NSIS install/direct launch/uninstall passed; binaries were removed and isolated data preserved. Historical 0.6.0→0.6.1 upgrade retention remains the relevant same-configuration upgrade evidence and was not repeated. Screenshot `artifacts/milestone-7/01-openai-settings-mocked.png` was inspected. No real OpenAI or Ollama request, model load, model download, or real credential was used.

Release artifacts: unsigned installer `artifacts/release/0.7.0-rc.1/installer/Routine-Studio-Setup-0.7.0-rc.1-unsigned.exe`; unpacked application ZIP `artifacts/release/0.7.0-rc.1/Routine-Studio-0.7.0-rc.1-win-x64.zip`; authoritative generated manifest `SHA256SUMS.txt`. Authenticode is `NotSigned`. Release notes record the final sizes and hashes after the exact-commit rebuild. The copied executable was verified at `E:\AI\Downloads\Temp\Routine Studio 0.7 RC1 Verification Copy With Spaces\Routine Studio.exe`.

Limitations: this does not establish model quality or compatibility with every current/future model ID. `store:false` is not described as zero retention. Provider cancellation may not prevent charges for an already accepted request. Chromium remains external; the build is unsigned; clean-machine and broad Windows distribution checks remain pending. Assistance still has no execution authority and supported target context remains bounded top-level DOM metadata only.

## Historical Milestone 6B — unsigned Windows installer candidate

Milestone 6B is complete and ready for the explicitly authorized source checkpoint. Electron Builder 26.0.12 produced an offline assisted per-user NSIS installer for Electron 45.0.0. It permits an explicit E: installation destination, does not request elevation, create shortcuts, force a post-install launch, delete application data, publish, sign, auto-start, enable telemetry or download runtime dependencies during installation. No model/Ollama activity, commit, push, release or publication occurred.

Final installer: `E:\projects\routine-studio\artifacts\milestone-6b\final\Routine-Studio-Setup-0.6.1-unsigned.exe` (122,440,110 bytes). SHA-256: `C1801425C47920C5658C0E20A2DABC45E0C5C924FFC5A9B24E4E688DFC8A3222`. Authenticode status: `NotSigned`. Verified installation: `E:\AI\Downloads\Temp\Routine Studio 6B Installed With Spaces\Routine Studio.exe`. External Chromium: `E:\AI\Caches\ms-playwright\chromium-1248\chrome-win64\chrome.exe`. Isolated data: `E:\projects\routine-studio\.runtime\installer-test-data`.

Actual lifecycle PASS: installed 0.6.0 into a path containing spaces without forced launch; direct installed executable used correct `resources/app` and E: data paths; real MV3 recording created an input-bound workflow and deliberate explicit check; packaged CSV import plus actual three-row Chromium batch created workflow/revision/raw-recording/dataset/mapping/batch/run history; the closed SQLite database was backed up before upgrade; 0.6.1 upgraded in place and retained all counts across full restart (2 workflows, 2 revisions, 1 recording, 1 dataset, 1 mapping, 1 batch, 3 runs); uninstall removed the executable and retained data; reinstall reopened compatible data. Missing Chromium showed actionable guidance. Manual persistence worked with missing Chromium and Ollama offline. The final metadata-only rebuild was installed over retained data and smoke-checked.

Backup: `E:\projects\routine-studio\.runtime\installer-test-backups\before-upgrade-workflows.sqlite`, SHA-256 `AE20615D27E7912D6A7FD3D0B98CF0974BA3DA63583039BA88D5B219E6F97F60`. Evidence: ignored `artifacts/milestone-6b/installer-results.json` and inspected screenshots `01-installed-baseline-complete.png` through `04-final-reinstall-smoke.png`. All related test processes closed (0 active). The normal database was never opened or modified.

Focused results after final source changes: typecheck PASS; 69 tests in 9 files PASS; production/installer build PASS; actual installer lifecycle PASS; final rebuild retention/metadata smoke PASS. Broad desktop/recording/configuration/execution/batch suites were not repeated because the installer lifecycle itself exercised installed Electron, MV3 recording, CSV/background worker, execution worker, Chromium, migration/restart and persistence. Early helper-only failures were corrected honestly: missing REVIEW wait, stale renderer workflow list before CSV selection, an incorrect `run_events` table assumption, the standalone-vs-batch run-list API distinction, and asynchronous NSIS self-cleanup wait.

Limits: the installer and executable are unsigned and may trigger SmartScreen/antivirus warnings. Chromium is external, so the app is not self-contained. State/sample/actual values remain plaintext. No suitable Windows Sandbox, Hyper-V, VirtualBox or VMware environment was present; therefore these are same-machine checks, **not clean-machine verification**. Fresh Windows prerequisite/SmartScreen/antivirus/permissions matrices remain pending. Windows may write unavoidable OS-managed process, prefetch and installer bookkeeping outside E:; payloads, caches, test installation and data were kept on E:. No matching Add/Remove Programs entry was observed after the silent per-user test, while the installed uninstaller worked directly. Unsupported downgrade migrations are not guaranteed.

Exact next step after this source checkpoint: preserve the ignored installer, backup and evidence. On a separately provided clean Windows x64 VM/machine, follow `docs/NEXT_SESSION.md` to verify interactive destination selection, OS prerequisite behavior, SmartScreen/antivirus, Add/Remove Programs registration, uninstall and retained-data reinstall. Do not purchase signing or publish without separate authorization.

## Historical Milestone 6A status

Milestone 6A produced and verified the unsigned unpacked x64 candidate with `@electron/packager` 20.1.1. Its same-machine recording/restart/CSV/batch/export checks passed; details and hashes remain in the earlier evidence under `artifacts/milestone-6a`.

## Historical Milestone 5 status

Milestone 5 optional local workflow configuration assistance is implemented on top of preserved Milestones 0–4. The user's follow-up explicitly authorized committing and pushing this verified snapshot to the existing repository; no release/publication artifact is produced. Version: 0.6.0.

Actual results: typecheck/build pass; 69 focused tests in 9 files pass. Actual Electron assistance verification passes mapping acceptance/existing-binding protection/no-browser revalidation, discard restoration, supplied-ID-only target ranking, read-only highlighting, unsaved-only application and graceful offline/manual operation. The previously documented active-batch close gap is closed: actual native Cancel kept the app and paused-error batch; Confirm closed safely and restart persisted `interrupted` with no running row. The corrected full batch regression then passed every existing browser/worker/app interruption, uncertainty, origin, export and immutable-history check.

Bounded real-local validation made exactly 3 inference requests to the already downloaded `qwen3:8b-q4_K_M`: header-only mapping 8348 ms, issue explanation 371 ms, supplied-candidate ranking 961 ms. All three passed strict output validation. This tiny synthetic sample does not establish reliable assistance; manual configuration remains authoritative. Evidence: `artifacts/milestone-5/real-local-results.json`, `electron-results.json`, and screenshots 01–03. The temporary server was stopped afterward.

Limits: ordinary visible top-level descriptors only; heuristic sensitive-field exclusion cannot identify every secret. No frames/shadow DOM/custom widgets, model-generated selectors/code/commands, automatic repair/retry, learning from corrections, cloud inference or model download. Prompt/response content is not saved, but Ollama itself is an independently installed local process; review its own configuration/logging. Assistance UI and actual Windows checks were exercised; broad screen-reader/DPI coverage remains untested.

## Clean handoff

Milestone 5 is complete and preserved in the repository. Final checks completed on 28 October 2026 (Asia/Colombo): `npm.cmd run typecheck`, 69 focused tests in 9 files, production build, actual assistance, full batch, execution, configuration, recording and desktop suites. All passed. Five assistance/native-close screenshots were inspected. No suite was rerun for the documentation/publication handoff because no relevant code changed.

Known issues remain the documented scope limits above. The local Ollama process is not managed by Routine Studio and was stopped after validation. No normal user data migration was added in Milestone 5. A post-milestone maintenance change moved milestone identity and live local-model status into semantic React markup, removing the temporary CSS text-replacement workaround.

Exact next step: begin the next session by reading `AGENTS.md`, this file and `docs/NEXT_SESSION.md`, then confirm the branch is clean and synchronized. Do not begin packaging or Milestone 6 until the user separately authorizes that scope.

## Historical Milestones 4A/4B status

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

CSV is comma-separated UTF-8 only, with 2 MiB/1000 rows/50 columns/10000 characters per field/100000 per record bounds. Batch limits are 100 valid rows, 100 steps/row and an 8 MiB snapshot. History lists newest 200 summaries; retention/deeper history UI, secure erase, full screen-reader/DPI coverage and fresh-machine installer/distribution are deferred. Native file/legacy close dialogs and the dedicated active-batch native-close Cancel/Confirm pair were automated. Browser/worker/app termination paths were exercised directly.

Early verification-helper failures (Windows controls exposed as panes, a non-exact accessible-name selector, and a test that forgot to revalidate after a mapping edit) were corrected and rerun. They are not counted as passes. No known failing final check is hidden.

## Acceptance / next milestone

Run `npm.cmd run build` then `npm.cmd start` in E:\projects\routine-studio. Start/reset the app-managed disposable demo at port 4177. Configure a saved customer workflow with three inputs and deliberately add the visible saved-message check. Import `fixtures/csv/customers-ten.csv`, save dataset/mapping, validate, review included/excluded rows and limits, explicitly approve/Start, inspect progress/history and independently inspect the customer directory. Try missing-values/rejection/delay fixtures only on the disposable demo. README and VERIFICATION contain exact commands and artifact paths.

Suggested next milestone: user-assisted investigation/reconciliation design and better retention/accessibility coverage, separately authorized. No automatic repair, retry of uncertain writes or next milestone was started. The verified build is open for review on the normal E: data root (approximately 13:35 Asia/Colombo, 28 October 2026), after every verification process finished. Launch stderr is empty. A read-only before/after SHA-256 audit confirmed exact workflow/revision/recording bytes across migration to database v7; see artifacts/milestone-4/normal-data-preservation.json. No workflow/batch was automatically started.
