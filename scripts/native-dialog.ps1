param([int]$NativeProcessId,[ValidateSet('Keep editing','Discard changes','Cancel recording and close')][string]$Choice,[string]$ScreenshotPath,[string]$PromptText='Discard your unsaved workflow changes?')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class NativeDialogControl {
  [DllImport("user32.dll", CharSet=CharSet.Auto)]
  public static extern IntPtr SendMessage(IntPtr handle, uint message, IntPtr wParam, IntPtr lParam);
  [DllImport("user32.dll")]
  public static extern bool PrintWindow(IntPtr handle, IntPtr hdc, uint flags);
}
'@
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
  $windows = [System.Windows.Automation.AutomationElement]::RootElement.FindAll(
    [System.Windows.Automation.TreeScope]::Children,
    [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ProcessIdProperty,$NativeProcessId))
  foreach ($window in $windows) {
    $button = $window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,
      [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty,$Choice))
    if ($null -ne $button) {
      $message = $window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,
        [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty,$PromptText))
      if ($null -eq $message) { continue }
      if ($ScreenshotPath) {
        $dialogWindow = $window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,
          [System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Window))
        if ($null -eq $dialogWindow) { throw 'Native dialog window not found for screenshot' }
        $rect = $dialogWindow.Current.BoundingRectangle
        $bitmap = [System.Drawing.Bitmap]::new([int]$rect.Width,[int]$rect.Height)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $hdc = $graphics.GetHdc()
        try {
          if (-not [NativeDialogControl]::PrintWindow([IntPtr]$dialogWindow.Current.NativeWindowHandle,$hdc,2)) { throw 'Native dialog screenshot failed' }
        } finally { $graphics.ReleaseHdc($hdc) }
        $bitmap.Save($ScreenshotPath,[System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose(); $bitmap.Dispose()
      }
      # Windows exposes Electron's TaskDialog command links as Pane/CCCommandLink,
      # without InvokePattern. Activate the identified native command-link HWND.
      if ($button.Current.ClassName -ne 'CCCommandLink') { throw 'Unexpected native dialog control class' }
      [void][NativeDialogControl]::SendMessage([IntPtr]$button.Current.NativeWindowHandle,0x00F5,[IntPtr]::Zero,[IntPtr]::Zero)
      Write-Output "Clicked native dialog button: $Choice"
      exit 0
    }
  }
  Start-Sleep -Milliseconds 200
} while ([DateTime]::UtcNow -lt $deadline)
throw "Native unsaved dialog button not found: $Choice"
