# Milestone 0 status

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
