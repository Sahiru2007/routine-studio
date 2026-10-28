# Milestone 1 verification

Run from E:\projects\routine-studio on an interactive Windows desktop:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:recording
npm.cmd run test:desktop
```

Recording verification uses the actual Electron main/preload/UI, real MV3 extension, existing Playwright Chromium and an isolated local demo. It creates a unique .runtime/recording-test-* directory. No everyday browser profile is used. Sensitive test strings are synthetic. Artifacts are ignored by Git.

## Assertions

1. Click Record workflow → Start local demo site → Start recording. Wait for visible recording state, enabled Stop control and the browser's recording banner.
2. Verify actual Chromium version and E: executable/profile/cache/download/temp paths.
3. Reject unauthenticated, wrong-origin and session-mismatched transport requests; event count/content must remain unchanged. These are negative tests, not simulated successful capture.
4. Perform real link clicks, sequential typing, ordinary text changes and customer submission across four document navigations. Assert exact normalized action order, final field values, semantic candidates and one submit action.
5. Enter a synthetic password and payment value; assert neither they nor the hidden sentinel appears in raw events. Verify separately persisted raw data and saved workflow contain none of those values.
6. Stop; assert the browser banner says stopped and its transport is closed. Interact/navigate again and assert raw events remain exactly unchanged. A separate case stops with a focused unblurred text field and verifies its final coalesced value. Another conceals the field's ancestor before flush and verifies that hidden value is excluded.
7. Edit a captured value, convert it to an input, remove a captured step, save as a new draft, restart the whole app and compare the entire saved document. Verify raw events are separate and unchanged by review.
8. Cancel another real recording and verify no workflow was added.
9. Send the actual Chromium Browser.close command, wait for the app's visible interrupted state, then Cancel/restart. Disconnecting the Playwright client alone is not considered browser closure.
10. Disable the actual extension through chrome://extensions; wait for the visible heartbeat-loss interruption, review warning and successful cancellation/restart.
11. Close the app during an active recording. Use the actual native Cancel recording and close choice; confirm managed Chromium's test port closes and restart is idle with no added workflow.
12. Rerun all Milestone 0 lifecycle checks: schema validation, SQLite migrations/revisions, stable references, reordering/deletion, unsaved navigation/native-close prompts and deletion across restart.

## Evidence

Latest recorder results: artifacts/milestone-1/results.json. It records the exact data root, browser version/paths, passed assertions, filtered synthetic raw events and renderer errors. Milestone 0 evidence: artifacts/desktop-results.json.

Recorder screenshots (under artifacts/milestone-1):

- 01-ready.png — initial recording page and managed demo URL.
- 02-recording.png — live app state and Stop/Cancel.
- 03-browser-demo.png — real demo directory and browser recording banner.
- 04-review.png — review heading and captured steps.
- 04-review-input.png — edited values and converted input.
- 05-reopened.png — persisted workflow in the existing editor after restart.
- 06-interrupted.png — actual browser-closure recovery.
- 07-extension-disconnected.png — extension-disconnection warning/partial review.
- 08-shutdown-prompt.png — native unsaved-recording dialog, captured from its own HWND.

## Limits of the evidence

Tests cover the local ordinary HTML demo, not arbitrary production sites. Selects, frames, shadow DOM, multiple tabs, uploads and custom widgets are explicitly unsupported; warning detection is best effort. Full screen-reader/DPI coverage, browser crashes under OS termination, IME, SPA navigation, packaged installers and fresh-machine installation have not been verified. Raw events remain in memory until Save; app/process crashes can lose unsaved recordings. Sensitive-field detection is heuristic, not a guarantee that arbitrary text is free of secrets. Profiles retain their own dedicated browser state on E:.

See STATUS.md for the latest actual check results and any failures encountered during development. A test that times out or only checks renderer state must not be reported as successful Electron/extension verification.
