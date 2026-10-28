# Routine Studio

Project boundary: E:\projects\routine-studio. Preserve existing files. Do not modify Browser Agent Lab or the portfolio. Milestones 0–2 are authorized; stop after Milestone 2. The current request explicitly supersedes the earlier stop rule and conditionally authorizes a commit and push only after successful verification. No release publication, replay, CSV batches, paid services, model calls or installer work is authorized.

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
- Standalone disposable demo: npm.cmd run demo
- Reset stopped standalone demo: npm.cmd run demo:reset

Reuse compatible Playwright Chromium at E:\AI\Caches\ms-playwright; otherwise setup.ps1 installs the required browser there. Persistent automation profiles, downloads and session-specific extension copies stay under the app data root on E:. Never use everyday browser profiles. Never capture password/hidden/known sensitive field values, full page HTML or cookies. Keep immutable raw events separate from edited workflows.

## Milestone 2 invariants

Workflow document v2 separates bounded structural draft validation from actionable configuration issues. Safe incomplete drafts remain saveable; never drop unsupported/malformed steps silently. Database migration v4 preserves IDs/revisions and original raw recording/historical revision bytes. Only content changes create saved revisions. Original target alternatives/provenance remain immutable; preferred locators are editable separately.

Inspection is read-only, uses the original supported tab and top-level DOM, and is rejected during recording. Never automatically navigate, click, fill or submit. Require the user to open the required page. The bridge accepts bounded locator data, never arbitrary JavaScript or generic browser commands. Configuration-ready means schema/configuration checks passed, not tested execution or semantic target correctness. Explicit checks are deliberately added, never inferred. Samples are local plain text, not secrets storage.

Inspect actual screenshots. Keep docs/STATUS.md and docs/VERIFICATION.md accurate. Renderer-only checks do not prove Electron IPC, extension capture or packaging. Verification uses isolated synthetic data and real Windows dialog controls. Assert visible lifecycle states; a client disconnect does not prove browser-process closure.
