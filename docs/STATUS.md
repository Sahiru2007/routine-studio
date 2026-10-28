# Milestone 2 — current status

Completed and verified on 28 October 2026 (Asia/Colombo), with final checks finishing at approximately 10:59. Milestones 0 and 1 are preserved. The current instruction supersedes the earlier stop-at-1 rule and conditionally authorizes a commit/push after successful checks. Stop after Milestone 2; no release, replay/execution, CSV batches, model calls, paid services or installer work is included.

## Implemented behavior

- Editor target review shows captured CSS/label/role/attribute alternatives and original recording UUID/event/page/candidate provenance. Preferred targets can be selected/edited independently. Original alternatives and provenance are restored from saved evidence on edits; immutable raw recordings are never rewritten.
- Explicit read-only inspection opens the dedicated persistent Chromium profile without loading a workflow page. The user opens the required page. Check target reports zero/one/multiple top-level DOM matches, highlights up to 20 temporarily, and does not click, fill, submit, scroll or navigate the target page. Other tabs/frames/shadow DOM are excluded; inspection is blocked during starting/active/stopping recording. One match is explicitly not semantic proof.
- Literal-to-input conversion, shared fill bindings, unbinding back to literal text, stable input renaming, required/optional flags, samples, Text/simple Email and character-bound validation. Referenced input removal is blocked with an explanation. Samples are local plain text, not secrets storage.
- Deliberate assert-visible configuration supports an optional exact/contains expected-text condition. Matching is case sensitive after whitespace collapse/trim; visibility means a nonzero box, display not none and visibility not hidden/collapse, without opacity evaluation. These definitions are not executed and do not prove database correctness. Recording never adds checks automatically.
- Persistent readiness summary, a Review validation shortcut, blocking issues versus review warnings, and issue buttons that select steps/focus inputs without navigation. Configuration-ready explicitly means schema/configuration checks passed; execution remains untested.
- Safely representable incomplete drafts can be saved/reopened. Unsupported/malformed legacy step JSON is retained in bounded wrappers; no steps are silently dropped. Unsafe structural corruption (wrong field types, duplicate IDs, oversized/unsupported document versions) is rejected.
- Workflow format v2 and explicit database migration v4 preserve valid workflow/step/input IDs, timestamps and revision numbers. Latest workflow metadata is upgraded; original recording and historical revision bytes stay unchanged. No-op saves retain the saved revision/timestamp; only content changes create a revision.

## Actual results

| Check | Result |
| --- | --- |
| TypeScript | PASS |
| Focused tests | PASS: 30 tests in 4 files |
| Production build | PASS: extension, Electron main, preload and renderer |
| Actual Electron configuration suite | PASS: existing-data migration copy, all four locator strategies, zero/one/multiple matches, original-tab restriction, temporary highlight removal, input/check/invalid-draft persistence, no-op revisions/evidence and inspection blocked during recording |
| Read-only behavior | PASS: unchanged form input values and bounding box; zero POSTs or target-page navigation; zero demo customers created |
| Required page not open | PASS: app asks to open the required page; browser URL remains unchanged |
| Bind/unbind/shared inputs | PASS: sample restored on unbind; two fills share the same stable ID; renamed input and optional/max-length settings survive save/restart |
| Explicit checks | PASS: recorded workflow initially contains zero checks; exactly one check is added by explicit UI action, with persisted expected text |
| Invalid drafts | PASS: invalid URL and input name show linked errors; safe save/restart preserves all 7 steps and bindings |
| Immutable evidence / revisions | PASS: original raw document bytes unchanged after target/input/check edits; unchanged save retains full document and revision count |
| Existing workflows | PASS: live normal database snapshotted through a read-only connection and the copy migrated in actual Electron; IDs/content/revision history preserved. It predates the recordings table; a separate explicit v3 recorded-workflow fixture verifies raw-byte preservation and provenance backfill. |
| Recording regressions | PASS: actual Electron/MV3/Chromium flow, navigation/order/typing, privacy exclusion, review/save/restart, Cancel, browser closure, extension disable and shutdown |
| Desktop regressions | PASS: actual isolated Electron/IPC, stable step edits/references/reorder, unsafe structural rejection, unsaved Cancel/Discard including real native dialog, deletion Cancel/confirm across restart |
| Renderer exceptions | None in final suites |
| Screenshot inspection | Inspected target provenance, all match counts, actual browser highlight/banner, explicit check definition, incomplete/ready validation panels and recording-blocked inspection |
| Git whitespace | PASS, with normal Windows LF/CRLF notices |

Resolved development failures were test expectations/setup issues: the existing-data snapshot initially assumed a recordings table, but the actual normal database was older; the test now checks its schema and migrates the copy. Inspection startup initially read the test-only CDP port before launch completed; the test now waits for the actual browser-open result. Earlier Milestone 0 expectations rejected incomplete configuration; they were updated for the explicitly requested saveable-draft behavior while retaining unsafe-structure rejection and missing-reference/unsaved/deletion assertions. No failed attempt is counted as evidence of a supported capability.

## Evidence and E: storage

- Configuration: E:\projects\routine-studio\artifacts\milestone-2\results.json
- Final isolated configuration data: E:\projects\routine-studio\.runtime\configuration-test-1793165331109
- Recorder regression: E:\projects\routine-studio\artifacts\milestone-1\results.json
- Desktop regression: E:\projects\routine-studio\artifacts\desktop-results.json
- Browser reused: E:\AI\Caches\ms-playwright\chromium-1248\chrome-win64\chrome.exe
- Profiles/cache/downloads/session copies remain under the selected E: application-data root. Test temp is .runtime/temp. npm/Electron caches remain on E:.

No original normal-data file was modified by the migration verification; it used SQLite backup through a read-only source connection. Test copies and artifacts are retained on E: and ignored by Git. No browser download was needed. The focused CSS parser dependency and types were installed with npm/temp caches on E:.

Screenshots under E:\projects\routine-studio\artifacts\milestone-2:

- 01-target-provenance.png
- 02-one-match.png
- 03-browser-highlight.png
- 04-zero-matches.png
- 05-multiple-matches.png
- 06-explicit-check.png
- 06-incomplete-draft.png
- 07-configuration-ready.png
- 08-inspection-blocked-recording.png

The final validation screenshots show visible blocking/review sections and the readiness qualifier. Long property panels scroll; the summary/shortcut keeps validation discoverable. Browser highlighting is visibly distinct from red recording status.

## Launch and walkthrough

Close any older Routine Studio build before launching the updated app.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run build
npm.cmd start
```

Open a recorded draft → select a step → choose/edit Preferred target → Open inspection browser and manually open Required page URL → Check target → configure/share inputs → deliberately add assert-visible/expected text if wanted → Review validation → Save. README.md includes full setup/demo commands; VERIFICATION.md includes all repeatable checks.

## Limitations and next scope

Inspection covers the original supported tab and top-level DOM only. It includes hidden matches, rejects more than 2000 matches and highlights at most 20. Role/name candidates use a bounded native/ARIA-label matcher, not a complete accessibility-tree implementation. Locators can become stale on dynamic/changed sites. Page identity compares origin/path/query and ignores fragments; recorded URLs omitted queries, so manually adjust Required page URL when necessary. A match does not prove meaning or application/database correctness. Visibility/text checks are configuration only. No replay/execution exists.

Input samples and browser profiles are not secrets stores. Sensitive-field detection remains heuristic. Incomplete drafts intentionally remain saveable, while structurally unsafe documents fail validation. Arbitrary custom widgets, frames/shadow DOM, SPA navigation, IME, OS-level kill/crash recovery, fresh-machine install and installer packaging are not claimed. Full screen-reader/DPI coverage and production-site locator reliability were not tested.

Proposed Milestone 3: local CSV parsing, column-to-input mapping, required/optional/text validation and preview/error review. This needs separate authorization and must not add execution/batches implicitly. Stop here after Milestone 2.

Earlier Milestone 0/1 status, stale launch claims and superseded stop rules are retained only in STATUS-MILESTONE-1-ARCHIVE.md, explicitly marked historical; they are not current instructions.
