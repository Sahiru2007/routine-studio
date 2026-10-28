# Routine Studio

A local desktop application for recording and designing reusable browser workflow drafts. Milestone 1 adds a dedicated Playwright Chromium window, a Manifest V3 recorder extension, a review screen and saving captures as new editable workflows. Milestone 0's library, editor, input references, React Flow visualization, explicit saving and SQLite revisions remain available.

Replay/execution, CSV batches, model assistance and installer packaging are not implemented. The original customer-entry example is synthetic and has never been recorded or executed. No account, paid API or model is required.

## Setup and launch

Windows and Node 24.22+ are the verified environment. Keep the project on E:. Initial setup may require network access for dependencies, Electron and Playwright Chromium. setup.ps1 reuses compatible Chromium from E:\AI\Caches\ms-playwright or installs it there. The implementation reused revision 1248; no browser download was needed.

```powershell
Set-Location -LiteralPath 'E:\projects\routine-studio'
powershell.exe -ExecutionPolicy Bypass -File scripts/setup.ps1
npm.cmd run build
npm.cmd start
```

Dependencies are pinned by package-lock.json; use npm ci through setup.ps1 to reproduce them. Development: npm.cmd run dev. Vite's development server is tooling; the production app loads local assets without a web server.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:desktop
npm.cmd run test:recording
```

Desktop checks require an interactive Windows desktop. They drive real Electron/Chromium, the MV3 extension and OS dialogs, using isolated synthetic data under .runtime. Screenshots and JSON evidence appear in artifacts; recorder screenshots are under artifacts/milestone-1.

Default database: E:\projects\routine-studio\.runtime\data\workflows.sqlite. Settings shows the actual path. Keep .runtime to retain saved workflows. An optional ROUTINE_STUDIO_DATA override must point to an absolute E: directory. Dependencies, runtime files and artifacts are ignored by Git.

See docs/STATUS.md for actual results and limitations, docs/ARCHITECTURE.md for process/storage boundaries, and docs/ROADMAP.md for later milestones. A signed installer and release distribution are not implemented.

## Record your first workflow

1. Launch the app, select **Record workflow**, then **Start local demo site**. This selects the managed demo's local URL. **Reset disposable demo data** clears only this demo's synthetic customers.
2. Select **Start recording**. Use the dedicated Chromium window with its RECORDING banner. This profile is separate from your everyday browser.
3. Choose **Create a customer**, fill synthetic customer details and select **Save customer**. Visit **Return to directory** to include another navigation.
4. Return to Routine Studio and select **Stop recording**. Review labels, selectors and values; remove unwanted steps. Expand semantic target candidates if useful.
5. Use **Convert to workflow input** beside a captured fill value, then name the input and check its sample.
6. Name the workflow and select **Save recording as new draft**. It opens in the existing editor and survives app restart. Saving never overwrites another workflow. **Cancel recording** discards the session without saving.

The browser remains open after Stop so the stopped status is visible; capture is disabled and its event channel is closed. Save/Cancel closes it. Unexpected browser closure or extension disconnection produces a partial review with warnings and a restart path. App close asks before discarding an unsaved recording and cleans up its managed browser.

## Supported recording scope and privacy

One original tab, ordinary top-level HTTP/HTTPS pages: full document navigation, native link/button clicks, text/email/tel/url/search/number input changes and textarea changes. Typing is coalesced into final field values, including when Stop is pressed without blur. A submit click and resulting submit event produce one action. No assert-visible or success checks are inferred. The manual editor still supports assert-visible.

Targets include labels, accessible-role candidates, stable attributes and fieldset context. CSS selectors are editable; structural fallbacks are warned about. Review is necessary; no locator reliability or replay success is claimed.

Password inputs, hidden fields and known payment/authentication metadata are excluded before reading values and validated again at message boundaries. Detection uses field type, name, ID, autocomplete and label heuristics. Unlabeled secrets in ordinary text fields cannot be reliably detected. Never demonstrate real secrets. URL query strings/fragments are omitted; paths and safe field text can still contain sensitive data. No full page HTML, cookies, screenshots or unrelated history are collected by the recorder.

Selects, frames, shadow DOM, multiple tabs, file uploads, contenteditable and custom widgets are unsupported. Presence/change warnings cover detectable cases; closed shadow roots and all dynamic custom widgets cannot be reliably detected. SPA/history-only navigation, unusual browser dialogs and IME combinations are not claimed. Recordings are limited to 1000 raw events; disconnection/limit interruptions may omit the final unflushed field. Saving stores raw filtered events separately from edited workflow documents; deleting the workflow removes its raw recording too. Cancelled sessions are not persisted. Chromium's dedicated profile persists its own browser state on E: and is not a secrets store.

## Standalone disposable demo

The app can manage its own isolated demo on an ephemeral loopback port. Alternatively:

```powershell
npm.cmd run demo
# Open http://127.0.0.1:4177 in a recording session.
# Stop the standalone demo with Ctrl+C before resetting:
npm.cmd run demo:reset
npm.cmd run demo
```

Standalone demo data is .runtime/demo/customers.json; the app-managed demo uses its data root's demo directory. The directory, customer form, saved page and guide use disposable synthetic data only. The local site cannot control the browser or filesystem outside its own demo file.
