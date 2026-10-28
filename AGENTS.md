# Routine Studio

Project boundary: E:\projects\routine-studio. Preserve existing files. Do not modify Browser Agent Lab or the portfolio. Implement Milestone 0 only until further authorization. Push or publish only when explicitly requested by the user.

## Architecture

Electron main owns SQLite, migrations, revisions, document validation and native close confirmation. The sandboxed React/TypeScript renderer uses React Flow and only the narrow typed preload bridge. Keep context isolation enabled and Node integration disabled. Validate IPC senders and inputs; do not expose generic filesystem, shell or IPC APIs. Shared Zod schemas live in packages/workflow-schema.

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

Inspect actual screenshots. Keep docs/STATUS.md accurate. Renderer-only checks do not prove Electron IPC, native dialogs or packaging. Desktop verification uses isolated synthetic data and real Windows dialog controls. No recording, browser execution, model calls or automation Chromium downloads in Milestone 0.
