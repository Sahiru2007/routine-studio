# Historical Milestone 3 evidence — superseded by the current VERIFICATION.md

# Milestone 3 verification (current)

Run in an interactive Windows desktop, with older app/demo windows closed. All test data is disposable, isolated on E:. No paid/model service or normal browser profile is involved.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:execution
npm.cmd run test:configuration
npm.cmd run test:recording
npm.cmd run test:desktop
npm.cmd start
```

## Execution evidence

`scripts/execution-test.mjs` launches real Electron and records a synthetic customer through the real MV3 extension and Chromium, including an excluded password field. It converts three fills to named inputs using the review UI, deliberately adds an exact visible confirmation, then runs the immutable saved revision with new actual values through the separate worker/Chromium. The independent grader reads only the disposable demo file and requires exactly one correct customer. It is test code, not runtime success logic. The raw recording document must remain byte-identical and the password must not appear in raw/run snapshots.

Real fixtures exercise zero/multiple matches without clicking, failed exact text and hidden checks, runtime password-target rejection, pause/resume/stop, mutually exclusive recording/inspection, browser closure, worker termination after a real POST, app termination/restart with unfinished dispatch, persistent history and invalid drafts/missing actual inputs blocked before actions. A separate HTTP origin must receive zero requests until redirect approval; approval and denial are both tested. No success is established by injected recorder/worker messages alone. Test-only CDP/PID hooks permit actual browser/process termination and path inspection; production exposes neither.

Focused tests cover immutable snapshot/resolution, no sample fallback, unknown/sensitive inputs, strict bounded commands/events, tampered origins/order/values, dispatch committed before send, pause/resume/stop transitions, session mismatch/unexpected results, terminal assertion failure, schema migrations, recovery and history after workflow deletion. Existing suites cover recorded event normalization/order/privacy, immutable provenance/revisions and desktop unsaved/deletion dialogs.

Artifacts (ignored by Git) under `artifacts/milestone-3`:

- `results.json`: actual check names, timestamp, isolated data directory, successful run ID and renderer errors.
- `01-pre-run-review.png`: actual reviewed values/revision/origins.
- `02-completed.png`: honest configured completion and ordered persisted events.
- `03-zero-matches.png`, `04-multiple-matches.png`: target failures.
- `05-Failed-text.png`, `05-Failed-visibility.png`: assertion failures.
- `06-paused.png`: between-step pause controls/status; `06-browser-run-status.png`: actual dedicated browser banner.
- `07-origin-approval.png`: explicit held origin request.
- `08-interrupted.png`: uncertain submission warning; no retry.
- `09-history-after-restart.png`: durable terminal history.

Screenshots are test-only explicit captures, never automatic runtime collection. Inspect actual state text and persisted records rather than assuming a screenshot proves completion. On failure the suite captures `failure.png` and exits nonzero; incomplete runs are not passes. An early test used an incorrect demo password selector, and a path probe initially lacked Chromium's automation flag; these test failures were corrected and rerun. Crash verification kills the actual Electron main PID, not only its launcher.

## Existing regression evidence

`test:configuration` snapshots the existing normal database through a read-only connection and migrates only the copy in actual Electron; verifies original IDs/revisions, historical revision/raw bytes, required-page prompting, CSS/label/role/attribute matching, zero/one/multiple counts, no POST/navigation/form/layout change, bind/unbind/shared input persistence, invalid safe drafts, deliberate checks and unchanged-save revisions. `artifacts/milestone-2/results.json` and screenshots retain that evidence.

`test:recording` uses actual extension/browser interactions and lifecycle: semantic targets, coalesced typing, order across navigation, single submit, password/payment/hidden exclusion, no collection after Stop, Cancel, browser/extension loss and app shutdown. `test:desktop` drives actual sandbox/preload, editing/reordering/save/restart, invalid references, native unsaved Cancel/Discard and deletion cancellation/confirmation across restart. See historical M2 verification archive for detailed earlier evidence; it is not a current stop instruction.

## Manual walkthrough / limitations

Use README's **Run your first customer workflow** walkthrough. Start/reset the app-managed demo at port 4177, record synthetic creation, bind three inputs, deliberately add `[role="status"]` with exact `The synthetic customer was added to disposable demo data.`, save, supply new values, review and Start. Independently inspect the demo directory/file after completion. The original synthetic library example has never been claimed to execute against example.com.

Verification covers the supported disposable forms and fixtures only. No arbitrary-site, hostile-page containment, cross-origin frame/shadow DOM, popup/multi-tab, file upload, custom widget, authentication, service-worker/WebSocket workflow, full screen-reader/DPI, fresh-machine installer or secrets claim. No automatic reconciliation/retry/recovery, CSV batch or model assistance. Completed means configured steps completed, not business success; uncertain submissions require independent investigation. All changes remain local.