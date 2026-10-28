# Architecture

## Process boundaries

Electron main owns SQLite, recording/browser lifecycle and privileged operations. The sandboxed React/TypeScript renderer accesses a narrow typed contextBridge API for workflows, recording Start/Stop/Cancel/status/save and the disposable demo. No arbitrary shell/filesystem APIs are exposed. IPC checks the sender, main frame and renderer URL. Zod validates documents in the UI, on main-process save and after loading. Node integration is disabled; context isolation is enabled. Electron renderer navigation, new windows and permission requests are denied. Production uses local assets and a restrictive CSP.

electron-vite builds main, a sandbox-compatible CommonJS preload and the Vite/React renderer. Vite separately bundles the TypeScript MV3 worker/content script. The desktop UI uses local assets without a web server. Two bounded loopback listeners are justified by Milestone 1: an optional disposable demonstration site and an authenticated event-only recorder channel. Both live inside main; there is no Python, general-purpose command server or separately deployed microservice. React Flow visualizes ordered draft steps; list controls reorder them.

## Storage

Default root: E:\projects\routine-studio\.runtime\data. It contains workflows.sqlite, userData, sessionData, cache, logs and crashDumps. Temp files use .runtime/temp. setup.ps1 and run.mjs configure E: caches. Electron's runtime executable is under node_modules/electron/dist on E:.

SQLite uses WAL, foreign keys and immediate save transactions. Database v1 creates workflows/revisions; v2 adds a durable example-seeded marker; v3 adds separate raw recording documents. Existing documents survive migration; deleted examples do not return on restart. Future database versions are rejected. Saving a recording atomically inserts a new workflow, revision and validated raw recording. The main recording-save boundary rejects existing workflow IDs and nonzero revisions. Stale ordinary editor writes fail. Deletion cascades revisions and associated raw recordings.

Workflow document format v1 contains workflow UUID, title, description, example flag, revision, timestamp, ordered steps and inputs. Step/input UUIDs remain stable. Fill values reference input UUIDs or literal text. Renaming inputs preserves references; referenced inputs cannot be removed. Missing references and unknown versions are rejected. Database migrations and document versions are separate.

## Milestone 1 recorder

The implemented recorder launches Playwright's bundled Chromium in a persistent context with the MV3 extension loaded. It reuses compatible E:\AI\Caches\ms-playwright\chromium-1248. The dedicated automation-profile, automation-cache, downloads and session-specific extension copies are under the application data root on E:. Everyday profiles are never read. Downloads are not accepted, and their configured destination stays on E:.

Isolated content scripts operate only after the extension worker confirms an explicit active session and the original tab ID. The worker checks sender tab/frame, validates payloads, serializes them into one global sequence and maintains per-document sequencing. Chrome session storage preserves counters through MV3 worker suspension. Content scripts send pending fills before click/navigation, coalesce changes at blur/change/Stop, and deduplicate a submit click against the resulting submit event. Full-document navigation is captured without queries/fragments. No assertions are invented. Select changes are warned about rather than extending the workflow schema.

Targets retain bounded label, role, stable attribute and fieldset candidates, plus an editable CSS selector. Structural fallback warnings explain fragility. Sensitive/hidden field checks occur before reading .value, then again through shared schemas in the worker and main. Heuristics are intentionally conservative and cannot recognize every unlabeled secret. The recorder never requests cookies, complete HTML, page screenshots or unrelated browser history.

### Session-bound transport

Main opens an ephemeral 127.0.0.1 listener with only POST /event, /warning and /heartbeat. Each session has a random 256-bit bearer capability written only into its isolated extension worker copy on E:. Main pins the exact chrome-extension:// origin discovered from that worker, validates the session UUID, strict schemas, body-size limits, contiguous global/per-document sequence, event count and lifecycle state. No CORS allowance or general browser/filesystem/shell command route exists. Page scripts cannot read the worker's secret. Same-account malicious local processes are outside this isolation boundary; this is not a host-malware defense.

The channel exists only during capture/flush. Stop flushes final text, disables the extension and browser banner, revokes the token and closes the listener before review. Browser remains visible after normal Stop; Save/Cancel closes it. Cancel persists neither events nor a workflow. Heartbeat loss (approximately 10–12 seconds), target closure or browser closure creates a warned partial review and closes the managed context. Cleanup is serialized so another recording can reuse the dedicated profile safely. Lifecycle calls have bounded waits. App close confirms loss of an unsaved recording, then closes Chromium/listeners before SQLite shutdown. Abrupt OS/process kill recovery is not implemented.

### Review and persistence

Raw recording format v1 is separate from workflow format v1: session UUID, timestamps, immutable filtered events and warnings. Main normalizes a fresh editable workflow for review. The renderer can edit labels, selectors and values, remove steps and convert literal fills into stable input references. Raw events are not rewritten by review edits. Both documents are schema-validated before their atomic save. There is no overwrite mode, execution, or inferred success state.

### Test boundary

Only ROUTINE_STUDIO_TEST=1 enables a Chromium CDP port and privileged main-process test inspection. Neither is exposed through the preload bridge or enabled during normal launches. End-to-end tests click the actual app and interact with real Chromium pages; malformed transport messages are used only for rejection checks. Native dialogs are captured with PrintWindow on their own HWND, avoiding screenshots of unrelated windows.

## Planned worker

A future TypeScript worker will own execution, pause/takeover and durable per-row checkpoints; main remains storage authority. CSV mapping and optional local Ollama suggestions come later. Recording/editing require no model.

## Limits and references

SQLite is synchronous for bounded draft documents. Revisions have no history UI. No signed installer, recovery UI or secrets store exists. Packaged installation is unverified. Production currently uses file assets; a custom application protocol is future distribution hardening.

Official references checked: https://electron-vite.org/guide/, https://www.electronjs.org/docs/latest/tutorial/security and https://playwright.dev/docs/chrome-extensions. Playwright's extension guide requires a persistent context and its bundled Chromium; Chrome/Edge no longer provide the needed sideload flags.
