# Routine Studio

Milestone 8A is authorized and supersedes the prior Milestone 7 release stop rule for source work only. Implement only review-first “Prepare with AI” for a recorded workflow: a short goal may produce a typed proposal for title, existing-step labels, and literal-fill-to-input conversions. References must be validated against the exact supplied draft; individual acceptance and one atomic unsaved-draft application are required. Reject stale proposals, preserve recording/revision evidence, and keep ordinary validation authoritative. Suggestions never add checks/steps, edit CSV mappings, dispatch browser actions, save automatically, or gain execution authority. Verification must use loopback mocks only—no cloud/local inference, model loading or downloads. Do not package, commit, push or publish. Stop after Milestone 8A.

Milestone 7 is authorized and supersedes the historical Milestone 6B stop rule below. The current release candidate adds optional OpenAI API assistance beside No AI and local Ollama, while preserving all manual functionality. Never make a real provider request during automated verification: OpenAI and Ollama contracts must use loopback mocks. API keys must use Windows DPAPI or explicit session memory only, never plaintext fallback. Cloud requests require disclosure and consent, use bounded minimized structured payloads, `store:false`, no tools, no automatic retry/fallback, and remain review-only. The user explicitly authorizes logical commits, push, CI inspection, and publication of one unsigned GitHub prerelease for the exact verified source commit. Do not change repository visibility, force-push, sign, purchase services, or publish elsewhere.

Project boundary: E:\projects\routine-studio. Preserve existing workflows/evidence; do not modify Browser Agent Lab or the portfolio. Milestone 6B authorizes one unsigned Windows installer and isolated install/upgrade/uninstall verification beyond previous stop rules. Keep payloads, state, build/cache/temp and test installations on E:, preserve the normal database, and treat Chromium as an explicit external dependency. Windows-managed installer bookkeeping may use system locations. The current handoff explicitly authorizes a source checkpoint commit and push only; no signing purchase, clean-machine claim, paid service, model download/call, release or publication. Stop after Milestone 6B.

## Milestone 6B invariants

The assisted per-user NSIS installer allows an explicit E: destination and never starts the application automatically, creates shortcuts, downloads runtime dependencies or deletes application data on uninstall. Writable state remains under the configured absolute E: data root, separate from installed binaries. Upgrade must retain compatible workflows, immutable recordings, datasets, mappings, batches and run history; uninstall preserves data. Unsupported downgrades are not guaranteed. Chromium remains external and Ollama optional/unmanaged. The installer and application are unsigned. Same-machine lifecycle checks are not clean-machine verification.

## Milestone 6A invariants

Packaged resources are read-only. Writable databases, profiles, logs, caches, temp and exports use the configured absolute E: data root; never silently fall back to C:. The candidate includes production bundles, workers, extension and synthetic CSV samples, while excluding user data, source trees, profiles, logs, artifacts and caches. Use the existing E: Chromium only when explicitly configured and show readiness/missing setup honestly. Missing Chromium blocks browser features, not manual editing; missing Ollama never blocks manual operation. Same-machine verification is not clean-machine verification. The candidate is unsigned and unpacked, not an installer.

## Milestone 5 invariants

Local assistance is opt-in, review-first and serialized. Only unauthenticated HTTP loopback origins are accepted and redirects are rejected. Context/output/time/request sizes are bounded; cancellation and duplicate prevention are mandatory. Do not persist full prompts/responses by default. Mapping suggestions use stable supplied IDs and never overwrite a binding without explicit review. Issue guidance cannot alter validation. Target assistance ranks locally extracted visible top-level descriptors only; never expose values, hidden/sensitive elements, HTML, cookies, arbitrary selectors, JavaScript, navigation or browser commands. Highlight is read-only and applying changes only an unsaved draft. Model output grants no execution authority.

## Architecture

Electron main owns SQLite, migrations, revisions, browser/recording lifecycle, document validation and native close confirmation. The sandboxed React/TypeScript renderer uses React Flow and only the narrow typed preload bridge. Keep context isolation enabled and Node integration disabled. Validate IPC senders and inputs; do not expose generic filesystem, shell or IPC APIs. Shared Zod schemas live in packages/workflow-schema and packages/recorder-schema. The MV3 extension uses isolated content scripts plus a service worker. Its authenticated loopback transport accepts only events, warnings and heartbeats; never add general-purpose commands.

## E: storage

All project dependencies, downloads, caches, temporary files, application data, logs and artifacts stay on E:. Current npm cache is E:\AI\Caches\npm; Electron cache is E:\AI\Cache\electron. Electron 45 uses electron_config_cache, not ELECTRON_CACHE. Runtime data and test databases stay in .runtime; screenshots and verification evidence stay in artifacts. scripts/run.mjs sets E: temp/cache paths and removes inherited ELECTRON_RUN_AS_NODE and NODE_COMPILE_CACHE before launching Electron. Never reuse the everyday browser profile.

## Commands

- Setup: powershell.exe -ExecutionPolicy Bypass -File scripts/setup.ps1
- Development: npm.cmd run dev
- Build: npm.cmd run build
- Launch production build: npm.cmd start
- Type check: npm.cmd run typecheck
- Logic/persistence tests: npm.cmd test
- Actual Electron checks: npm.cmd run test:desktop
- Actual Electron/extension/Chromium recording checks: npm.cmd run test:recording
- Actual configuration/read-only inspection/migration checks: npm.cmd run test:configuration
- Actual supervised worker/Chromium execution: npm.cmd run test:execution
- CSV-only import/mapping/restart verification: npm.cmd run test:csv
- Actual supervised batch verification: npm.cmd run test:batch
- Optional short preparation video: npm.cmd run test:csv -- --video
- Standalone disposable demo: npm.cmd run demo
- Reset stopped standalone demo: npm.cmd run demo:reset

Reuse compatible Playwright Chromium at E:\AI\Caches\ms-playwright; otherwise setup.ps1 installs the required browser there. Persistent automation profiles, downloads and session-specific extension copies stay under the app data root on E:. Never use everyday browser profiles. Never capture password/hidden/known sensitive field values, full page HTML or cookies. Keep immutable raw events separate from edited workflows.

## Milestone 2 invariants

Workflow document v2 separates bounded structural draft validation from actionable configuration issues. Safe incomplete drafts remain saveable; never drop unsupported/malformed steps silently. Database migration v4 preserves IDs/revisions and original raw recording/historical revision bytes. Only content changes create saved revisions. Original target alternatives/provenance remain immutable; preferred locators are editable separately.

Inspection is read-only, uses the original supported tab and top-level DOM, and is rejected during recording. Never automatically navigate, click, fill or submit. Require the user to open the required page. The bridge accepts bounded locator data, never arbitrary JavaScript or generic browser commands. Configuration-ready means schema/configuration checks passed, not tested execution or semantic target correctness. Explicit checks are deliberately added, never inferred. Samples are local plain text, not secrets storage.

Inspect actual screenshots. Keep docs/STATUS.md and docs/VERIFICATION.md accurate. Renderer-only checks do not prove Electron IPC, extension capture or packaging. Verification uses isolated synthetic data and real Windows dialog controls. Assert visible lifecycle states; a client disconnect does not prove browser-process closure.

## Milestone 3 invariants

Main owns the durable run journal and dispatch. A separate bounded worker owns execution Chromium. Snapshot a saved revision and actual input values; never use samples as fallback. Require explicit Start and approval before contacting unreviewed navigation origins, including every redirect hop. Exactly one preferred target; no alternative fallback or automatic click retry. Persist dispatch before action and result afterward. Unfinished dispatches stay interrupted/uncertain after termination; never auto-resume. Pause applies between steps; Stop is not undo. All configured steps completed does not prove business/database success. Recording, inspection and execution share one exclusive manager lease. Execution uses its own E: profile. Run history persists plain-text values; never supply secrets.

## Milestone 4 invariants

Use maintained csv-parse in a background worker; preserve strings and whitespace unless explicit trim. Native file choices and all storage stay on E:. Import limits: 2 MiB, 1000 rows, 50 columns, 10000 characters/field, 100000 characters/record. Explicitly save/delete datasets/mappings; mapping and batch snapshots never silently follow live revision edits. Preview performs no browser actions.

Reuse Runner/worker locator/check semantics. Concurrency 1; batch-wide browser reservation spans row gaps. Each row opens a fresh context/page using the intended persistent execution profile: cookies/login/application state are shared, not isolated. Persist dispatch and ownership lease before initialization; block takeover until prior worker PID is confirmed gone. No automatic row retry or restart. Uncertain outcomes always pause; Resume after definite failure skips that row. Remaining-only work needs confirmed worker exit, acknowledgment, a NEW immutable review and explicit approval; exclude every prior dispatched row. This is not exactly-once execution or automatic reconciliation.

Export concise summaries only after explicit native choices. Protect CSV formula prefixes while keeping imported/historical values unchanged. Notes/acknowledgment never change outcomes. Independent test graders may read disposable demo files; runtime may not read them as a success shortcut.
