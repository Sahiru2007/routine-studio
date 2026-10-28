# Architecture

## Process boundaries

Electron main owns SQLite and privileged operations. The sandboxed React/TypeScript renderer accesses a narrow typed contextBridge API: list, save, remove, status and dirty-state notification. No arbitrary shell/filesystem APIs are exposed. IPC checks the sender, main frame and renderer URL. Zod validates documents in the UI, on main-process save and after loading. Node integration is disabled; context isolation is enabled. New windows, navigation and permission requests are denied. Production uses local assets and a restrictive CSP.

electron-vite builds main, a sandbox-compatible CommonJS preload and the Vite/React renderer. No production web server, Python or microservice exists. React Flow visualizes ordered draft steps; list controls reorder them.

## Storage

Default root: E:\projects\routine-studio\.runtime\data. It contains workflows.sqlite, userData, sessionData, cache, logs and crashDumps. Temp files use .runtime/temp. setup.ps1 and run.mjs configure E: caches. Electron's runtime executable is under node_modules/electron/dist on E:.

SQLite uses WAL, foreign keys and immediate save transactions. Database v1 creates workflows/revisions; v2 adds a durable example-seeded marker. Existing documents survive migration; deleted examples do not return on restart. Future database versions are rejected. Saves atomically write the latest document and a revision; stale revision writes fail. Deletion cascades revisions.

Workflow document format v1 contains workflow UUID, title, description, example flag, revision, timestamp, ordered steps and inputs. Step/input UUIDs remain stable. Fill values reference input UUIDs or literal text. Renaming inputs preserves references; referenced inputs cannot be removed. Missing references and unknown versions are rejected. Database migrations and document versions are separate.

## Planned recorder/worker

Use a separate dedicated automation browser: Playwright bundled Chromium with a persistent profile. Use a Manifest V3 recorder extension. Never reuse the everyday browser profile. Captured events will be validated and normalized before editor review. No automation browser or extension is installed in Milestone 0.

A future TypeScript worker will own execution, pause/takeover and durable per-row checkpoints; main remains storage authority. CSV mapping and optional local Ollama suggestions come later. Editing requires no model.

## Limits and references

SQLite is synchronous for bounded draft documents. Revisions have no history UI. No signed installer, recovery UI or secrets store exists. Packaged installation is unverified. Production currently uses file assets; a custom application protocol is future distribution hardening.

Official references checked: https://electron-vite.org/guide/ and https://www.electronjs.org/docs/latest/tutorial/security.
