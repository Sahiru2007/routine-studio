# Routine Studio

A local desktop application for designing reusable browser workflow drafts. Milestone 0 implements a workflow library, editable title/description, navigate/fill/click/assert-visible steps, workflow inputs, stable references, step ordering, React Flow visualization, inspector, explicit saving, confirmation prompts and SQLite revisions.

Recording, execution, CSV batches and model assistance are not implemented. The customer-entry example is synthetic and has never been recorded or executed. No account, paid API or model is required.

## Setup and launch

Windows and Node 24.22+ are the verified environment. Keep the project on E:. Initial dependency installation requires network access, including Electron's desktop runtime. It does not install a separate automation browser.

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
```

Desktop checks require an interactive Windows desktop. They drive Electron's own runtime through Playwright, use real OS dialogs, and create only isolated synthetic databases under .runtime. Screenshots and JSON evidence appear in artifacts.

Default database: E:\projects\routine-studio\.runtime\data\workflows.sqlite. Settings shows the actual path. Keep .runtime to retain saved workflows. An optional ROUTINE_STUDIO_DATA override must point to an absolute E: directory. Dependencies, runtime files and artifacts are ignored by Git.

See docs/STATUS.md for actual results and limitations, docs/ARCHITECTURE.md for process/storage boundaries, and docs/ROADMAP.md for later milestones. A signed installer and release distribution are not implemented.
