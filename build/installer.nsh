!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER
Var RoutineStudioDesktopShortcutCheckbox
Var RoutineStudioDesktopShortcutState

!macro customPageAfterChangeDir
  Page custom RoutineStudioShortcutPageCreate RoutineStudioShortcutPageLeave
!macroend

Function RoutineStudioShortcutPageCreate
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ${NSD_CreateLabel} 0 0 100% 24u "Choose how Routine Studio should be available after installation."
  Pop $0
  ${NSD_CreateCheckbox} 0 34u 100% 12u "Create a desktop shortcut"
  Pop $RoutineStudioDesktopShortcutCheckbox
  ${NSD_Check} $RoutineStudioDesktopShortcutCheckbox
  nsDialogs::Show
FunctionEnd

Function RoutineStudioShortcutPageLeave
  ${NSD_GetState} $RoutineStudioDesktopShortcutCheckbox $RoutineStudioDesktopShortcutState
FunctionEnd

!macro customInstall
  ${If} $RoutineStudioDesktopShortcutState == ${BST_UNCHECKED}
    Delete "$newDesktopLink"
    WinShell::UninstShortcut "$newDesktopLink"
    System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
  ${EndIf}
!macroend
!endif
