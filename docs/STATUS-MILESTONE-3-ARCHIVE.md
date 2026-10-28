# Historical Milestone 3 evidence — superseded by the current STATUS.md

# Milestone 3 — current status

Implemented on 28 October 2026 (Asia/Colombo). Milestones 0–2 remain available. The current request authorizes supervised single-record execution beyond the old stop rule. The user clarified **keep changes local**: no commit, push or publication. Stop after Milestone 3; no CSV batches, model calls, paid services, automatic recovery or installer work.

## Implemented

- Choose a saved revision, supply actual inputs, review immutable resolved steps/targets and navigation origins, explicitly approve and Start. Missing required values never fall back to samples. Incomplete/invalid workflows are blocked before actions.
- Separate validated Node-mode Electron worker owns dedicated persistent Chromium execution profile on E:. Main owns SQLite and dispatch; recording/inspection/execution have one exclusive browser lease. Recording evidence and editor/revision behavior are preserved.
- Navigate, native text-like fill, native click and deliberate assert-visible/optional normalized exact/contains text checks. Exactly one preferred match for fill/click; no first match, alternatives or automatic retry. Bounded actions/checks; sensitive/hidden targets reject without reading field values.
- Per-hop request interception holds unknown top-level origins, including HTTP redirects, before contact. Explicit approve/deny; unreviewed resources blocked. Pause between steps, Resume, Stop, live timestamps/failure details and distinct honest outcomes.
- Database migration v5 adds immutable run snapshots/actual values, step dispatch/result events and terminal states. Dispatch is persisted before action. Browser/worker/app termination retains unfinished dispatch as interrupted/uncertain; startup never automatically resumes or retries. Run history survives restart and workflow edits/deletion.
- Stable app-managed disposable demo URL http://127.0.0.1:4177. Standalone demo must not use that port simultaneously. Existing recordings with old ephemeral URLs need explicit URL review/editing; no hidden migration.

## Actual verification

| Check | Result |
| --- | --- |
| TypeScript / build | PASS: main, separate worker, preload, renderer and MV3 extension |
| Focused tests | PASS: 41 tests in 6 files; schema/configuration/persistence plus execution snapshot, input resolution, strict messages, dispatch-before-send, transition guards and uncertain recovery |
| Real customer task | PASS: recorded actual MV3/browser interactions; bound name/email/company; deliberately added exact visible confirmation; executed with different synthetic values |
| Independent grader | PASS: test-only customer-file read found exactly one Executed Blair / blair@example.test / Execution Example Co; runtime makes no database-success claim |
| Missing values / invalid drafts | PASS: useful UI errors and no worker/browser actions |
| Target failures | PASS: zero/multiple matches stop without clicking; actual password target rejected without reading/filling |
| Checks | PASS: failed text and hidden-element checks remain assertion failures |
| Pause / Resume / Stop | PASS: held between steps, resumed, stopped before later submission; browser exclusivity rejected recording/inspection during execution |
| Origins | PASS: independent second local origin received zero requests while redirect approval was pending; explicit approval allowed continuation; denial prevented contact and stopped |
| Termination | PASS: actual Chromium closure, worker termination after submission, and app termination with unfinished dispatch leave honest persisted states; no further dispatch or automatic retry |
| Restart / evidence | PASS: completed/uncertain history survives restart; original raw recording bytes unchanged; passwords absent from raw events and saved run snapshot |
| Existing regressions | PASS: actual desktop/native dialogs, MV3 recording lifecycle/privacy/order and configuration/read-only inspection/migration suites |
| Storage | PASS: existing E: Chromium reused without download; actual execution profile/cache flags on E:; app/dependencies/temp/data/artifacts remain on E: |

Evidence: [verification](VERIFICATION.md), `artifacts/milestone-3/results.json` and actual run screenshots. Earlier M2 results are in STATUS-MILESTONE-2-ARCHIVE.md and VERIFICATION-MILESTONE-2-ARCHIVE.md, explicitly historical; earlier M0/M1 evidence is archived separately. Stale stop rules in those archives do not apply.

## Review and limits

The verified production build was launched for review at approximately 12:10 on 28 October 2026, using the existing normal E: data root. The visible Routine Studio process uses E:\projects\routine-studio\node_modules\electron\dist\electron.exe; launch stderr is empty. No workflow was automatically started.

Run `npm.cmd run build` then `npm.cmd start` from E:\projects\routine-studio. README contains the first-workflow walkthrough, demo/reset commands and targeting/check semantics. No workflow executes merely by launch or selecting history.

This is supervised ordinary top-level HTML, one original tab, not production-site reliability certification. No frames/shadow DOM, multi-tab/popup flow, upload, arbitrary widget, browser dialog, SPA/IME guarantee, WebSocket/service-worker workflow or secret storage. Separate execution profile does not inherit recording login state. Hidden matches count toward ambiguity; role/label matching is intentionally bounded rather than a complete accessibility-name algorithm. Visibility ignores opacity/occlusion. Text checks read at most 10,000 target-text characters. Sensitive detection is heuristic and cannot recognize every secret: use synthetic/nonsecret values.

Unknown-origin approval is navigation scope, not a hostile-page security sandbox; approved pages can change application data. UI completion/assertions do not establish database correctness. Stop is not undo. Uncertain actions need independent manual investigation; there is no reconciliation/recovery UI and no automatic rerun. Values and snapshots are persisted as local plain text. Run history has no deletion/retention UI; newest 200 summaries are listed. Fresh-machine install, installer/signing, full screen-reader/DPI and arbitrary production sites remain untested.

Proposed Milestone 4: local CSV mapping/validation/preview only, separately authorized. Execution was deliberately verified on one record before introducing row multiplication. No CSV or batch runtime was added.