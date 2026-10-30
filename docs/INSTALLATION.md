# Routine Studio installation

Routine Studio `v0.8.0-rc.1` is an unsigned Windows x64 prerelease. It has not completed clean-machine, SmartScreen, antivirus, or broad Windows distribution qualification. There is no macOS build.

> **Current availability:** `v0.8.0-rc.1` is still a GitHub draft because installer execution is blocked under the present verification machine's Windows/NSIS policy. The links below are reserved versioned URLs and are not available anonymously until the existing draft passes installer qualification and is published. See [Website download handoff](WEBSITE_DOWNLOAD_HANDOFF.md).

## Downloads

- Installer: [`Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe`](https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe)
- Unpacked alternative: [`Routine-Studio-0.8.0-rc.1-win-x64.zip`](https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-0.8.0-rc.1-win-x64.zip)
- Checksums: [`SHA256SUMS.txt`](https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/SHA256SUMS.txt)
- Release notes: <https://github.com/Sahiru2007/routine-studio/releases/tag/v0.8.0-rc.1>

Verify the downloaded SHA-256 value before opening a binary:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'E:\Downloads\Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe'
```

The executable is intentionally unsigned. Windows or organizational policy may block it. Do not disable antivirus, SmartScreen, or other protections; stop if your policy does not permit an unsigned prerelease.

## Prerequisites and storage

Routine Studio currently requires:

- Windows x64.
- An E: drive for application data, browser files, caches, downloads, and temporary state.
- Compatible Playwright Chromium installed separately on E: for recording, target inspection, execution, and CSV batches.

Chromium is not bundled with either download, so the ZIP is not fully self-contained. Manual workflow editing and persistence remain available when Chromium is missing. Ollama and OpenAI are optional and are not required for manual operation.

The packaged default application-data directory is `E:\Routine Studio Data`; the default browser directory is `E:\AI\Caches\ms-playwright`. To use different E: locations, launch from a PowerShell session configured like this:

```powershell
$env:ROUTINE_STUDIO_DATA='E:\Routine Studio Data'
$env:ROUTINE_STUDIO_BROWSER_PATH='E:\AI\Caches\ms-playwright'
& 'E:\Apps\Routine Studio\Routine Studio.exe'
```

Both paths must be absolute E: paths. Startup fails clearly instead of falling back to C: when storage is unavailable or configured elsewhere. Routine Studio keeps SQLite, browser profiles, recordings, caches, logs, temporary files, downloads, and exports under the data root. Workflow values, samples, datasets, inputs, and browser profile state are local plaintext; never enter passwords, payment data, API keys, or client secrets as workflow values.

## Install or extract

### Installer

1. Download and verify the installer.
2. Open it only if unsigned software is permitted by your policy.
3. Choose an installation destination on E:, preferably a path such as `E:\Apps\Routine Studio`.
4. Finish setup. The installer does not auto-start Routine Studio or create shortcuts.
5. Launch `Routine Studio.exe` directly from the selected directory.

### ZIP

1. Download and verify the ZIP.
2. Extract the entire archive to an E: directory.
3. Launch `Routine Studio.exe` from the extracted `Routine Studio-win32-x64` directory.

Do not run the executable from inside the ZIP. Packaged resources and workers must retain their relative layout.

## Chromium setup

Routine Studio expects the Playwright Chromium layout beneath `ROUTINE_STUDIO_BROWSER_PATH`. The source setup command can install the compatible browser entirely on E::

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
powershell.exe -ExecutionPolicy Bypass -File scripts/setup.ps1
```

That setup requires the source checkout and network access; it is not an in-app download. If you already have a compatible Playwright Chromium installation on E:, point `ROUTINE_STUDIO_BROWSER_PATH` at its browser directory. Open **Settings & status** after launch and confirm the exact executable reports **Ready**. A browser from an everyday profile is not supported and must not be reused.

## First workflow

1. Open **Settings & status** and confirm application storage and browser readiness.
2. Start the disposable customer demo from **Record workflow**. Demo actions change synthetic local data only.
3. Record the customer form in the dedicated Chromium window, stop, and review the captured steps.
4. Configure inputs and deliberately add a visible confirmation check. A UI check does not prove database correctness.
5. Optionally use **Prepare with AI** to request a review-only proposal. Inspect each item; no suggestion is selected or applied automatically.
6. Import the packaged sample shown in Settings (`resources\app\fixtures\csv\packaged-customers.csv`).
7. Validate, review, and explicitly start a small sequential batch. Inspect row evidence and independently inspect disposable demo records.
8. Export results to the configured E: data area. Investigate uncertain outcomes; Routine Studio does not retry them automatically.

Supported browser scope is one original top-level tab with ordinary native HTML controls. Frames, shadow DOM, multiple tabs, file uploads, contenteditable controls, and arbitrary custom widgets are not supported.

## Assistance providers

Choose **No AI assistance**, **Local · Ollama**, or **Cloud · OpenAI API** in Settings. Prepare with AI is experimental and review-only. Provider suggestions cannot execute browser actions or save a workflow. OpenAI requires your own key, explicit consent, and may incur charges; Ollama remains locally managed. The release verification uses loopback mocks and makes no provider requests.

## Uninstall and data retention

Uninstall removes installed application binaries and preserves the external application-data directory by default. Reinstalling a compatible version can reopen retained data. Back up the closed SQLite database before an upgrade. Unsupported downgrade migrations are not guaranteed. Delete retained data only through a deliberate manual operation after verifying its exact E: path.

## Common startup errors

- **Application data must be configured on E:** — set `ROUTINE_STUDIO_DATA` to an existing or creatable absolute E: directory and restart.
- **Chromium storage must be configured on E:** — set `ROUTINE_STUDIO_BROWSER_PATH` to the E: Playwright browser directory and restart.
- **Browser not ready** — install the compatible Playwright Chromium build or correct the configured directory. Manual editing still works.
- **Windows blocks the executable** — the build is unsigned. Follow Windows and organizational policy; do not bypass security controls.
- **Packaged resource or worker missing** — re-extract the complete ZIP or reinstall; do not copy only the executable.
- **Ollama unavailable or OpenAI not configured** — choose **No AI assistance**. Recording, editing, and supervised execution do not require a model provider.

Report reproducible issues at <https://github.com/Sahiru2007/routine-studio/issues> with the version, Windows version, exact error, and whether the installer or ZIP was used. Do not attach databases, profiles, credentials, raw recordings, or client data.
