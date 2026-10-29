# Next session handoff — after Milestone 8A

The Ollama schema-transmission defect behind the six failed baseline requests is fixed locally. Preserve the baseline result unchanged. The separately versioned follow-up is prepared, not executed: read `docs/OLLAMA_PREPARE_EVALUATION_V2.md` and verify its manifest before requesting any inference authorization. Do not reuse or overwrite the baseline artifact.

Milestone 8A stabilization is complete locally and intentionally uncommitted. The historical assistance harness is no longer allowed to pass on stale or incomplete evidence. Its current evidence contract is implemented by `scripts/assistance-test-runner.mjs`, `assistance-test.mjs`, and `assistance-evidence.mjs`; the last corrected run completed all four Electron checks with zero renderer errors.

The separately authorized local-quality evaluation in `docs/OLLAMA_PREPARE_EVALUATION.md` is complete. The fixture hash matched, and exactly six requests ran once against the existing `qwen3:8b-q4_K_M`; every response failed the strict proposal schema. Do not rerun weak or failed cases. Preserve `docs/OLLAMA_PREPARE_EVALUATION_RESULTS.md` and the ignored raw result in `artifacts/milestone-8a`. A future change should first decide whether rejected raw output and usage can be retained safely for diagnostics and why this model emitted the obsolete/wrong `steps` shape; that is new work and requires separate authorization.

Milestone 8A source work is complete and intentionally uncommitted. Start with `docs/STATUS.md` and `docs/VERIFICATION.md`. The new path is `PrepareWorkflow.tsx` → narrow `assistanceRun({kind:'prepare'})` IPC → `assistance-manager.ts` → strict contracts and atomic transformation in `packages/assistance-schema/index.ts`. Focused actual-Electron evidence is produced by `npm.cmd run test:prepare` under ignored `artifacts/milestone-8a` and isolated `.runtime/prepare-workflow-test-*` data.

Do not treat Milestone 8A as part of the published `v0.7.0-rc.1` binaries. No package was rebuilt. The exact deferred scope is instruction-based workflow editing, suggested explicit checks, CSV mapping changes, new demos and packaging. A future milestone must be separately authorized and must preserve strict typed proposals, individual review, stale rejection, ordinary validation and zero browser authority.

Storage remains E:-only. Do not use the normal database for tests, and do not make live OpenAI/Ollama requests unless a future instruction explicitly authorizes them. The next safe verification command after relevant code changes is `npm.cmd run test:prepare`; repeat broader suites only when their boundaries are affected.

## Historical Milestone 7 release handoff

Current target: `0.7.0-rc.1`. Preserve all Milestone 0–7 data and evidence. OpenAI and Ollama verification must remain mocked unless a future user explicitly authorizes a bounded live smoke test with their own credential and accepts possible charges. Manual operation requires no AI.

Milestone 7 architecture pointers: `apps/desktop/main/assistance-manager.ts` owns provider selection and serialization; `credential-store.ts` owns Windows DPAPI persistence; `packages/assistance-schema/index.ts` validates settings, requests, responses and accounting; `AssistanceSettings.tsx` owns disclosure/consent/preview/tests; `scripts/openai-assistance-test.mjs` is the actual Electron loopback-mock verification. Release output is under `artifacts/release/0.7.0-rc.1` and remains ignored by Git.

Exact next step if publication is incomplete: rebuild from the final documentation commit, confirm hashes, push, wait for CI, then publish one GitHub prerelease without changing repository visibility. Implementation, full packaged/offline/manual/browser verification, mocked provider checks, and focused installer install/uninstall are complete. Same-machine checks are not clean-machine verification.

## Historical Milestone 6B handoff

Milestone 6B is complete and the current handoff authorizes a source-only checkpoint push. Preserve normal data, ignored installer/baseline artifacts, isolated test databases/backups and screenshots. Do not sign, publish or start another milestone without separate authorization.

## Milestone 6B acceptance handoff

- Installer: `E:\projects\routine-studio\artifacts\milestone-6b\final\Routine-Studio-Setup-0.6.1-unsigned.exe`
- SHA-256: `C1801425C47920C5658C0E20A2DABC45E0C5C924FFC5A9B24E4E688DFC8A3222`
- Verified install: `E:\AI\Downloads\Temp\Routine Studio 6B Installed With Spaces\Routine Studio.exe`
- Isolated data: `E:\projects\routine-studio\.runtime\installer-test-data`
- Pre-upgrade backup: `E:\projects\routine-studio\.runtime\installer-test-backups\before-upgrade-workflows.sqlite`
- External Chromium: `E:\AI\Caches\ms-playwright\chromium-1248\chrome-win64\chrome.exe`

The installer is unsigned, offline and per-user. Interactive setup must choose an E: destination. It creates no shortcuts and does not force a launch. Writable state stays in the configured E: data root, separate from installed resources; uninstall preserves it. Chromium is external. Ollama is optional/unmanaged and must not be contacted for acceptance.

```powershell
$env:ROUTINE_STUDIO_DATA='E:\Routine Studio Acceptance Data'
$env:ROUTINE_STUDIO_BROWSER_PATH='E:\AI\Caches\ms-playwright'
& 'E:\Path With Spaces\Routine Studio\Routine Studio.exe'
```

Installer architecture: `scripts/build-installer.mjs`; lifecycle verification: `scripts/installer-test.mjs`; storage/resources: `apps/desktop/main/index.ts`; migrations: `apps/desktop/main/store.ts`; actual evidence: ignored `artifacts/milestone-6b/installer-results.json` and screenshots 01–04. npm cache is `E:\AI\Caches\npm`, builder cache `E:\AI\Caches\electron-builder`, Electron cache `E:\AI\Cache\electron`. Windows may use normal system-managed registry/process/prefetch/installer bookkeeping. Unsupported downgrades are not guaranteed.

No Windows Sandbox, Hyper-V, VirtualBox or VMware environment was available. Same-machine verification is not clean-machine verification. On a separately supplied clean Windows x64 VM/machine:

1. Verify installer hash/AuthentiCode `NotSigned`; record SmartScreen/antivirus behavior without bypassing policy.
2. Use interactive setup, confirm the destination chooser, install to an E: path containing spaces, and confirm no forced launch, shortcut, auto-start, telemetry or dependency download.
3. Record Add/Remove Programs and other Windows-managed bookkeeping. Launch directly with fresh E: data; confirm resource/data paths, missing-Chromium guidance and manual operation without Ollama.
4. Configure compatible E: Chromium; create/save/reopen a workflow; record/configure/check the disposable demo; import the packaged sample; execute a small batch; independently audit demo data and export.
5. Back up the closed database. Verify a compatible earlier installation upgrades to 0.6.1 with workflows, recordings, datasets and history retained.
6. Uninstall through Windows UI if registered (otherwise the installed uninstaller), confirm binaries are gone/data remains, reinstall and reopen retained data. Confirm all processes exit.

After the authorized checkpoint, do not create accounts, download Windows images, install virtualization, alter system settings, purchase signing, use models, make further pushes or publish without explicit authorization.

## Historical Milestone 6A handoff

Milestone 6A is complete locally and intentionally uncommitted. Preserve the current working tree, normal data, ignored unpacked artifact and verification evidence. Do not build an installer, commit, push or publish without separate authorization.

## Start here

Read, in order:

1. `AGENTS.md`
2. `docs/STATUS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/VERIFICATION.md`
5. `docs/ROADMAP.md`

Then inspect `git status --short --branch` and `git diff --check`; do not reset the Milestone 6A changes. The exact next action is to review actual 6A results and obtain separate authorization for Milestone 6B.

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

Milestone 6A added: typecheck; 69 focused tests; production/unpacked package build; direct copied-executable packaged suite covering recording, restart, CSV import, actual batch, independent data audit, export, missing dependencies, and clean shutdown. Do not repeat without relevant changes. See `artifacts/milestone-6a`, `packaged-results.json`, screenshots 01–05 and `SHA256SUMS.txt`.

## Historical proposal that led to completed Milestone 6B

Milestone 6B selected Electron Builder/NSIS, defined E: data and retention behavior, and completed isolated same-machine install/upgrade/uninstall/reinstall checks. Clean Windows, SmartScreen/antivirus and signing/release decisions remain pending. GitHub Releases, auto-update, telemetry, store submission and public distribution remain separate explicit decisions. Packaging did not broaden browser support, add model downloads or change uncertain-run recovery semantics.
