# Historical archive — superseded by Milestone 2

This file preserves earlier verification history only. All earlier stop-at-0/1 instructions and statements about the app being open apply to those past sessions, not the current implementation. Read STATUS.md, AGENTS.md and ROADMAP.md for current scope and results.

# Milestone 1 status

Completed and verified on 28 October 2026, with the final recorder run at 10:26 Asia/Colombo. Milestone 0 functionality is preserved. The final user instruction conditionally authorizes committing and pushing this verified milestone; no release publication is authorized. No paid service, model call, replay, CSV execution, AI suggestion or installer work was added.

## Implemented

- Dedicated Playwright Chromium with a persistent automation profile on E:, managed solely by Electron main. Reused the exact existing revision 1248 (Chromium 156.0.8078.4); no browser download was needed.
- Manifest V3 worker and isolated content scripts, explicit app/browser recording indicators, Start/Stop/Cancel, final-field flush and review. Browser/tab closure, extension heartbeat loss and normal app shutdown have recovery/cleanup paths.
- Session-bound event-only loopback channel: random bearer capability, exact extension origin, session UUID, strict shared schemas, body limits, contiguous event/document ordering and a 1000-event bound. No general-purpose local command server exists.
- Ordinary top-level document navigation, native link/button clicks and text-like field changes. Final values are coalesced. A submit click plus submit event produces one action. Targets retain labels, role candidates, stable attributes, fieldset context and editable selectors. No assertions/success checks are generated.
- Sensitive/password/hidden field exclusion before values are read, including fields hidden by ancestors before flush. Known authentication/payment metadata is also excluded and checked at worker/main schema boundaries. No full HTML, cookies or unrelated history is collected by the recorder.
- Review edits/removal, literal-fill conversion into workflow inputs, and new-draft-only saving. Workflow IDs cannot overwrite an existing draft through recording-save. SQLite migration v3 stores immutable filtered raw events separately and atomically with the workflow/revision. Workflow deletion cascades raw recordings.
- Isolated disposable customer directory, form, saved page and guide, with managed-demo controls plus standalone demo/reset commands. All demo data is synthetic and local.

## Actual check results

| Check | Result |
| --- | --- |
| TypeScript checks | PASS |
| Focused tests | PASS: 21 tests in 3 files, including normalization/order, sensitive metadata, invalid/session mismatches, input conversion, migrations, atomic raw/workflow saving and rollback/cascade behavior |
| Production build | PASS: MV3 extension, Electron main, preload and React renderer |
| Actual Electron + extension + Chromium | PASS: 14 groups of assertions in scripts/recording-test.mjs |
| Recording workflow | PASS: Start in app; real demo navigation, sequential typing, customer submission; exact normalized ordering; single submit action; Stop/review/input conversion/save/restart/reopen |
| Privacy | PASS: synthetic password/payment/hidden sentinels absent from raw events and persisted documents; a field hidden by an ancestor before flush was excluded |
| Stop | PASS: focused/unblurred final field flushed; browser banner changed to stopped; event listener closed; later real interactions/navigation left raw events unchanged |
| Boundaries | PASS: unauthenticated, wrong-origin and wrong-session messages rejected; invalid reviews cannot overwrite an existing workflow or cross sessions |
| Cancel/recovery | PASS: Cancel saved no workflow; actual Browser.close caused visible interruption; disabling the actual extension caused a visible heartbeat-loss interruption; cancellation allowed subsequent recording |
| App shutdown | PASS: native unsaved-recording prompt exercised; managed Chromium closed; fresh app restarted idle without an extra workflow |
| Milestone 0 regressions | PASS: complete existing Electron lifecycle suite, including real native close dialog, references/reorder/save/restart, deletion cancellation and deletion persistence |
| Standalone demo/reset | PASS: documented npm commands launched/reset; HTTP directory/form/guide checked; only the demo process started for this check was stopped |
| Setup script | PowerShell syntax PASS; fresh-machine npm ci/browser-install branch not run |
| Screenshots | Inspected app recording/review/input conversion, real Chromium banner, reopened editor, actual interrupted states and native shutdown dialog |
| Renderer exceptions | None in final recorder or Milestone 0 desktop runs |

Resolved verification failures: an initial test read the test CDP port before startup had completed; it now waits for the visible recording state and enabled Stop control. A browser-close check originally disconnected an attached Playwright client instead of closing Chromium. The strengthened test now sends Browser.close and waits for the visible interrupted UI plus main state. Earlier native screen capture could include an overlapping window; PrintWindow now captures only the identified native dialog HWND. These earlier attempts are superseded by the final passing runs, not counted as evidence.

## Evidence and storage

- Final recorder JSON: E:\projects\routine-studio\artifacts\milestone-1\results.json
- Final recorder test root: E:\projects\routine-studio\.runtime\recording-test-1793163339939
- Chromium executable: E:\AI\Caches\ms-playwright\chromium-1248\chrome-win64\chrome.exe
- Normal persistent profile: E:\projects\routine-studio\.runtime\data\automation-profile
- Browser cache/downloads/session extension copies: automation-cache, downloads and recorder-sessions beneath the app data root on E:.
- Temporary files: E:\projects\routine-studio\.runtime\temp
- npm/Electron caches remain on E: as documented below. Runtime, dependencies, caches, profiles, test data and screenshots are excluded from Git.

Screenshots under E:\projects\routine-studio\artifacts\milestone-1: 01-ready.png, 02-recording.png, 03-browser-demo.png, 04-review.png, 04-review-input.png, 05-reopened.png, 06-interrupted.png, 07-extension-disconnected.png and 08-shutdown-prompt.png. The final screenshots show the actual interrupted UI, rather than an earlier still-recording frame. Long review/editor panels scroll; long workflow titles now use available heading width. The graph can be zoomed when many nodes are visible.

## Commands, walkthrough and limits

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run build
npm.cmd start
```

Record workflow → Start local demo site → Start recording → demonstrate synthetic customer entry in the dedicated browser → Stop recording → review/edit/remove → Convert to workflow input if needed → Save recording as new draft. README.md contains setup, standalone demo/reset and a full walkthrough; VERIFICATION.md contains repeatable checks.

Supported scope is ordinary top-level HTTP/HTTPS document navigation, native clicks and text-like inputs/textarea in the original tab. Selects, frames, shadow DOM, multiple tabs, uploads and custom widgets are unsupported. Detection warnings are best effort; closed shadow roots and arbitrary dynamic widgets cannot be reliably detected. Query strings/fragments, SPA/history-only navigation and intermediate HTTP redirect chains are not recorded as separate navigations. IME and arbitrary production sites are unverified. Sensitive-field heuristics can have false positives and cannot identify every secret placed in an ordinary text field. Review captures before saving. Limit/disconnection may omit an unflushed final field. Raw recordings persist only after Save; abrupt process/OS termination can lose unsaved work. The dedicated Chromium profile persists its own browser state and is not a secrets store. No packaged installer or release is claimed.

Stop after Milestone 1. The next milestone is improved validation/locator review of recordings; replay and CSV/model features are not part of this work.

---

# Historical Milestone 0 verification

Verified on 28 October 2026 (Asia/Colombo). Final desktop run completed at 09:57 local time. Milestone 0 draft functionality is working; the app is launched for review using its normal data directory. No recording, execution, model calls, pushes or publication were performed in this verification task.

## Fixes and completed work

- Investigated accessible-name failures: decorative symbols and the changing library count were included in button names. Navigation, creation, input/step addition, step selection and card actions now have explicit names. Desktop selectors use exact roles/names, with contextual workflow names for repeated card actions. No assertion was removed to obtain a pass.
- Modal focus stays within the dialog; Escape cancels. Native close still uses the real Electron/Windows dialog.
- Fixed example resurrection after deleting the last workflow. Database migration v2 adds a durable seed marker and preserves v1 documents. Deleted examples stay deleted after restart.
- Workflow library, title/description editing, four supported steps, properties inspector, ordered step list, React Flow map, workflow input references, explicit save and visible unsaved status are implemented. SQLite stores validated format-v1 documents and saved revisions with stable IDs.
- Added setup, architecture, roadmap and project instructions alongside this status report.

## Checks and actual results

| Check | Result |
| --- | --- |
| npm.cmd run typecheck | PASS |
| npm.cmd test | PASS: 10 tests across schema/editing and SQLite migration/persistence suites |
| npm.cmd run build | PASS: main, sandbox-compatible preload and renderer production bundles |
| npm.cmd run test:desktop | PASS: actual Electron 45.0.0 production app, real preload/IPC and SQLite |
| Create/edit/reorder/remove/save/reopen | PASS: intermediate order asserted in both directions; surviving step IDs and input references checked exactly |
| Full process restart | PASS: exact saved document, revision, title, description, input IDs and steps preserved |
| Invalid input references | PASS: understandable UI error; main IPC independently rejects missing reference; rejected save does not change saved revision |
| Referenced input removal | PASS: blocked with an explanation; input remains intact; input rename preserves UUID reference |
| Unsaved navigation | PASS: Cancel, Escape and confirmed discard; unsaved title preserved on cancel and lost on discard |
| Native window close | PASS: actual Windows dialog, Keep editing and Discard changes; confirmed discard followed by full app restart |
| Deletion cancellation | PASS: exact saved document retained, including after full restart |
| Confirmed deletion | PASS: workflow absent after restart; last workflow/example deletion leaves library empty |
| Example labeling | PASS: synthetic example explicitly marked never recorded or executed |
| Renderer errors | None during final desktop run |
| Screenshot inspection | Inspected library, example editor, validation error, both prompt types, reopened document, deletion prompt, empty library, settings and normal review launch |
| Setup script | PowerShell syntax parsed successfully; fresh npm ci/setup was not rerun |
| Git whitespace check | PASS; Git reports normal LF/CRLF conversion notices |

The native dialog investigation found Windows exposes TaskDialog command links as Pane/CCCommandLink, without InvokePattern. The test helper checks the displayed choice, prompt text and native control class, then activates its real HWND. It targets Electron's actual process ID, rather than Playwright's Windows launcher PID. No dialog API is mocked.

## E: storage evidence

The final desktop run interrogated the Electron main process and asserted E: paths for the executable, userData, sessionData, logs, crashDumps, temporary directory, Chromium disk cache and Electron download cache. Runtime safety preferences were sandbox=true, contextIsolation=true, nodeIntegration=false; window.require was unavailable.

- Electron executable: E:\projects\routine-studio\node_modules\electron\dist\electron.exe
- Electron download archive/cache: E:\AI\Cache\electron
- Effective npm cache reported by npm config get cache: E:\AI\Caches\npm (environment override; project .npmrc also points to E:).
- Default review database: E:\projects\routine-studio\.runtime\data\workflows.sqlite
- Test temp: E:\projects\routine-studio\.runtime\temp
- Final isolated test database root: E:\projects\routine-studio\.runtime\desktop-test-1793161638661
- Machine-readable evidence: E:\projects\routine-studio\artifacts\desktop-results.json

No runtime/browser download occurred during verification. A pre-existing Electron 40 cache on C: dated 17 October was inspected and preserved; this task's Electron 45 archive resides on E:. These checks verify configured and observed application paths, not a system-wide filesystem trace of Windows internals.

## Screenshots on E:

All files are under E:\projects\routine-studio\artifacts:

1. 01-library.png
2. 02-example-editor.png
3. 03-invalid-reference.png
4. 04-discard-prompt.png
5. 05-native-close-prompt.png (actual OS dialog and desktop window)
6. 06-reopened-after-restart.png
7. 07-delete-prompt.png
8. 08-empty-after-deletion-restart.png
9. 09-settings.png
10. 10-review-launch.png (normal app launched for user review)

Screenshots show readable controls, inspector and workflow map, clear example/status text and honest empty states. Long step/input panels scroll; the validation banner can cause outer-window scrolling. Native close uses Windows' own light-themed dialog. A full screen-reader/contrast audit and exhaustive DPI/window-size matrix were not performed.

## Review launch and limitations

The production app was launched with npm.cmd start and its live window/executable path verified. The library contains the synthetic Customer entry example in normal storage; verification deletions affected isolated test databases only. No existing user workflow was deleted. Test databases and screenshots are retained on E: and ignored by Git.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd start
```

For a rebuild first run npm.cmd run build. Exact setup and verification commands are in README.md. Signed installer creation, packaged installation, automatic updates, crash recovery, history UI and secrets storage are not implemented or verified. SQLite currently runs synchronously for bounded draft documents. Production execution from the local build and IPC are verified; this is not proof of installer/packaging behavior. Windows UI automation checks require an interactive desktop and English native dialog labels.

Proposed Milestone 1: explicit recording sessions in a separate Playwright Chromium profile plus a Manifest V3 recorder extension, with validated event import. Never reuse the everyday browser profile. Milestone 1 is not started; stop here for review.
