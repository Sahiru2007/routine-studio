param(
  [Parameter(Mandatory=$true)][string]$Shortcut,
  [Parameter(Mandatory=$true)][string]$ExpectedExecutable,
  [Parameter(Mandatory=$true)][string]$Screenshot,
  [Parameter(Mandatory=$true)][string]$DataPath,
  [Parameter(Mandatory=$true)][string]$BrowserPath
)
$ErrorActionPreference='Stop'
foreach($path in @($ExpectedExecutable,$Screenshot,$DataPath,$BrowserPath)){if($path -notmatch '^E:[\\/]'){throw "Verification payload and data paths must stay on E:: $path"}}
if(-not (Test-Path -LiteralPath $Shortcut)){throw "Shortcut missing: $Shortcut"}
$env:ROUTINE_STUDIO_DATA=$DataPath
$env:ROUTINE_STUDIO_BROWSER_PATH=$BrowserPath
$env:TEMP=Join-Path $DataPath 'temp'
$env:TMP=$env:TEMP
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
Remove-Item Env:NODE_COMPILE_CACHE -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $env:TEMP,(Split-Path -Parent $Screenshot) | Out-Null
Start-Process -FilePath $Shortcut
$deadline=(Get-Date).AddSeconds(30)
$process=$null
do{
  Start-Sleep -Milliseconds 250
  $process=Get-Process -Name 'Routine Studio' -ErrorAction SilentlyContinue | Where-Object {$_.Path -eq $ExpectedExecutable -and $_.MainWindowHandle -ne 0} | Select-Object -First 1
}while(-not $process -and (Get-Date) -lt $deadline)
if(-not $process){throw "Shortcut did not open the expected installed application: $Shortcut"}
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class RoutineStudioWindow {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
}
'@
[RoutineStudioWindow]::SetForegroundWindow($process.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 750
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
$bounds=[System.Windows.Forms.SystemInformation]::VirtualScreen
$bitmap=New-Object System.Drawing.Bitmap $bounds.Width,$bounds.Height
$graphics=[System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location,[System.Drawing.Point]::Empty,$bounds.Size)
$bitmap.Save($Screenshot,[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose();$bitmap.Dispose()
$result=[ordered]@{shortcut=$Shortcut;target=$ExpectedExecutable;processId=$process.Id;windowTitle=$process.MainWindowTitle;screenshot=$Screenshot}
$process.CloseMainWindow() | Out-Null
if(-not $process.WaitForExit(15000)){$process.Kill();$process.WaitForExit()}
$result | ConvertTo-Json -Compress
