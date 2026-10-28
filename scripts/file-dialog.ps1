param([int]$NativeProcessId,[string]$FilePath,[switch]$Cancel,[string]$DialogTitle='Import UTF-8 CSV from E:')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class FileDialogClick { [DllImport("user32.dll",CharSet=CharSet.Unicode,EntryPoint="SendMessageW")] public static extern IntPtr SetText(IntPtr h,uint m,IntPtr w,string text); [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h,uint m,IntPtr w,IntPtr l); }
'@
function FindButton($dialog,[string]$name){return $dialog.FindFirst([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.AndCondition]::new([System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty,$name),[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ClassNameProperty,'Button')))}
function ClickButton($button){if($button.Current.NativeWindowHandle){[void][FileDialogClick]::SendMessage([IntPtr]$button.Current.NativeWindowHandle,0x00F5,[IntPtr]::Zero,[IntPtr]::Zero)}else{$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()}}
$deadline=[DateTime]::UtcNow.AddSeconds(20)
$actionName=if($DialogTitle.StartsWith('Export')){'Save'}else{'Open'}
do {
 $windows=[System.Windows.Automation.AutomationElement]::RootElement.FindAll([System.Windows.Automation.TreeScope]::Children,[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ProcessIdProperty,$NativeProcessId))
 foreach($window in $windows){
  $dialog=$window.FindFirst([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::NameProperty,$DialogTitle))
  if($window.Current.Name -eq $DialogTitle){$dialog=$window}
  if($null -eq $dialog){continue}
  if($Cancel){$button=FindButton $dialog 'Cancel';if($button){ClickButton $button;Write-Output 'Cancelled native file dialog';exit 0}}
  else {
   $combo=$dialog.FindFirst([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::AutomationIdProperty,'1148'))
   $edit=if($combo){$combo.FindFirst([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::ClassNameProperty,'Edit'))}else{$dialog.FindFirst([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.PropertyCondition]::new([System.Windows.Automation.AutomationElement]::AutomationIdProperty,'1001'))}
   if($edit){[void][FileDialogClick]::SetText([IntPtr]$edit.Current.NativeWindowHandle,0x000C,[IntPtr]::Zero,$FilePath);$button=FindButton $dialog $actionName;if($button){ClickButton $button;Write-Output 'Selected explicit E: file in native dialog';exit 0}}
  }
 }
 Start-Sleep -Milliseconds 200
}while([DateTime]::UtcNow -lt $deadline)
throw "Native file dialog not found: $DialogTitle"
