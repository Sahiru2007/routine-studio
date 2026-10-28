$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if ($projectRoot -notmatch '^E:\\') { throw 'Routine Studio must stay on E:' }
Set-Location -LiteralPath $projectRoot
$env:TEMP = Join-Path $projectRoot '.runtime\temp'
$env:TMP = $env:TEMP
$env:npm_config_cache = 'E:\AI\Caches\npm'
$env:electron_config_cache = 'E:\AI\Cache\electron'
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
Remove-Item Env:NODE_COMPILE_CACHE -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $env:TEMP,$env:npm_config_cache,$env:electron_config_cache | Out-Null
npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
node node_modules/electron/install.js
if ($LASTEXITCODE -ne 0) { throw 'Electron runtime installation failed' }
