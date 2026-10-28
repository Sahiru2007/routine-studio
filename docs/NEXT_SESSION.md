# Next session handoff

Milestone 5 is complete and published to the existing source repository after explicit follow-up authorization. Preserve application data and verification evidence. Do not start Milestone 6 or packaging without separate authorization.

## Start here

Read, in order:

1. `AGENTS.md`
2. `docs/STATUS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/VERIFICATION.md`
5. `docs/ROADMAP.md`

Then inspect `git status --short --branch` and confirm `main` is clean and synchronized with `origin/main`. The exact next action is to review the proposed packaging scope below with the user; do not implement it until separately authorized.

## Launch commands

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
npm.cmd run build
npm.cmd start
```

Optional local assistance requires the existing installation and model; Routine Studio does not start or reconfigure Ollama:

```powershell
$env:OLLAMA_MODELS='E:\AI\OllamaModels'
$env:OLLAMA_HOST='127.0.0.1:11434'
& 'E:\AI\Ollama\ollama.exe' serve
```

Manual recording, configuration, execution and CSV batching remain available when Ollama is offline. Do not pull another model or add cloud fallback.

## Architecture pointers

- `apps/desktop/main/assistance.ts`: loopback-only, serialized, cancellable bounded Ollama client.
- `packages/assistance-schema/index.ts`: strict request/result schemas, supplied-ID validation and deterministic offline guidance.
- `apps/desktop/main/inspection.ts`: local visible top-level candidate extraction and read-only highlighting.
- `apps/desktop/renderer/BatchPanel.tsx`: review/accept/discard mapping suggestions.
- `apps/desktop/renderer/ConfigurationTools.tsx`: issue guidance and supplied-candidate target review.
- `apps/desktop/main/index.ts` and `apps/desktop/preload/index.ts`: narrow validated IPC bridge.
- `apps/desktop/main/runner.ts`, `batches.ts`, `recorder.ts`: existing exclusive browser ownership and immutable execution/recording boundaries.
- `scripts/assistance-test.mjs`, `scripts/batch-test.mjs`: actual Electron evidence, including active-batch native close Cancel/Confirm.

## Storage rules

- Everything stays on E:. Project: `E:\projects\routine-studio`.
- Application data defaults to `.runtime\data`; tests use isolated `.runtime\*-test-*` roots.
- Browser binaries/cache: `E:\AI\Caches\ms-playwright`; npm cache: `E:\AI\Caches\npm`; Electron cache: `E:\AI\Cache\electron`.
- Existing Ollama models: `E:\AI\OllamaModels`. Never download a model automatically.
- Evidence remains ignored under `artifacts`; do not add profiles, caches, databases, customer data, prompts/responses or generated binaries to Git.
- Preserve normal workflows, revisions, recordings, batch/run journals and historical evidence. Never reuse the everyday browser profile.

## Verification already completed

Do not repeat these unless relevant code changes: typecheck; 69 focused tests; production build; actual assistance, full batch, execution, configuration, recording and desktop suites. Real-local validation used exactly three synthetic inference requests and the temporary server was stopped. See `artifacts/milestone-5` and `docs/VERIFICATION.md`.

## Proposed packaging scope — not authorized

A separately authorized packaging milestone should remain Windows-local and reproducible: choose one documented Electron packaging tool/version; emit unsigned installer/portable artifacts only on E:; preserve `.runtime\data` across upgrades/uninstall choices; keep browser/model downloads out of the installer; verify first launch, upgrade, uninstall/data retention, E: cache/temp placement, native dialogs, sandbox/context isolation and offline operation on a clean Windows account or VM. Produce checksums and an artifact manifest. Code signing, GitHub Releases, auto-update, telemetry, store submission and public distribution should remain separate explicit decisions. Packaging must not broaden browser support, add model downloads or change uncertain-run recovery semantics.
