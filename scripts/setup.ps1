$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if ($projectRoot -notmatch '^E:\\') { throw 'Routine Studio must stay on E:' }
Set-Location -LiteralPath $projectRoot
$env:TEMP = Join-Path $projectRoot '.runtime\temp'
$env:TMP = $env:TEMP
$env:npm_config_cache = 'E:\AI\Caches\npm'
$env:electron_config_cache = 'E:\AI\Cache\electron'
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
$env:PLAYWRIGHT_BROWSERS_PATH = 'E:\AI\Caches\ms-playwright'
Remove-Item Env:NODE_COMPILE_CACHE -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $env:TEMP,$env:npm_config_cache,$env:electron_config_cache | Out-Null
npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
node node_modules/electron/install.js
if ($LASTEXITCODE -ne 0) { throw 'Electron runtime installation failed' }
$chromiumPath = node -e "process.stdout.write(require('playwright').chromium.executablePath())"
if (-not (Test-Path -LiteralPath $chromiumPath)) {
  node node_modules/playwright/cli.js install --no-shell chromium
  if ($LASTEXITCODE -ne 0) { throw 'Playwright Chromium installation failed' }
}
