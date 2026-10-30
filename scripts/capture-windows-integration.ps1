param(
  [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference='Stop'
if($OutputDirectory -notmatch '^E:[\\/]'){throw 'Windows integration evidence must stay on E:'}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class RoutineStudioNativeWindow {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int command);
}
'@
function Capture-Screen([string]$Path){
  $bounds=[System.Windows.Forms.SystemInformation]::VirtualScreen
  $bitmap=New-Object System.Drawing.Bitmap $bounds.Width,$bounds.Height
  $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($bounds.Location,[System.Drawing.Point]::Empty,$bounds.Size)
  $bitmap.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose();$bitmap.Dispose()
}
function Window-Root([string[]]$Names){
  foreach($name in $Names){
    foreach($process in Get-Process -Name $name -ErrorAction SilentlyContinue){
      if($process.MainWindowHandle -ne 0){return [System.Windows.Automation.AutomationElement]::FromHandle($process.MainWindowHandle)}
    }
  }
  return $null
}

Start-Process 'ms-settings:appsfeatures'
$settings=$null
for($i=0;$i -lt 40 -and -not $settings;$i++){Start-Sleep -Milliseconds 250;$settings=Get-Process -Name SystemSettings -ErrorAction SilentlyContinue|Where-Object MainWindowHandle -ne 0|Select-Object -First 1}
if(-not $settings){throw 'Windows Settings did not open Installed apps.'}
[RoutineStudioNativeWindow]::ShowWindow($settings.MainWindowHandle,3)|Out-Null
[RoutineStudioNativeWindow]::SetForegroundWindow($settings.MainWindowHandle)|Out-Null
Start-Sleep -Seconds 2
$settingsRoot=[System.Windows.Automation.AutomationElement]::FromHandle($settings.MainWindowHandle)
$editCondition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Edit)
$search=$settingsRoot.FindAll([System.Windows.Automation.TreeScope]::Descendants,$editCondition)|Where-Object{$_.Current.AutomationId -eq 'SystemSettings_StorageSense_AppSizesListFilter_DisplayStringValue'}|Select-Object -First 1
if(-not $search){throw 'Installed apps Search control was not accessible.'}
$valuePattern=$search.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$valuePattern.SetValue('Routine Studio')
Start-Sleep -Seconds 2
$routineElements=$settingsRoot.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)|Where-Object{$_.Current.Name -like '*Routine Studio*'}|ForEach-Object{$_.Current.Name}|Select-Object -Unique
if(-not ($routineElements -contains 'Routine Studio 0.8.0-rc.2')){throw 'Installed apps did not expose the Routine Studio 0.8.0-rc.2 result.'}
$installedAppsShot=Join-Path $OutputDirectory '07-installed-apps.png'
Capture-Screen $installedAppsShot
$settings.CloseMainWindow()|Out-Null

$shell=New-Object -ComObject WScript.Shell
$shell.SendKeys('^{ESC}')
Start-Sleep -Seconds 1
$shell.SendKeys('Routine Studio')
Start-Sleep -Seconds 3
$searchRoot=Window-Root @('SearchHost','SearchApp')
$searchNames=@()
if($searchRoot){$searchNames=$searchRoot.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)|Where-Object{$_.Current.Name -like '*Routine Studio*'}|ForEach-Object{$_.Current.Name}|Select-Object -Unique}
$searchShot=Join-Path $OutputDirectory '08-windows-search.png'
Capture-Screen $searchShot
$shell.SendKeys('{ESC}')
[ordered]@{installedAppsScreenshot=$installedAppsShot;installedAppsNames=@($routineElements);searchScreenshot=$searchShot;searchNames=@($searchNames);searchResultAccessible=(@($searchNames).Count -gt 0)}|ConvertTo-Json -Depth 4
