# Routine Studio v0.8.0-rc.2 local candidate

This local unsigned Windows x64 candidate improves branding and normal Windows installation without changing workflow features.

## Windows integration

- Established Routine Studio mint/dark mark on the executable, window, installer, uninstaller, and shortcuts.
- Multi-resolution transparent ICO with 16, 20, 24, 32, 40, 48, 64, 128, and 256px frames.
- Assisted per-user installation with an explicit E: destination.
- Start menu shortcut named **Routine Studio**.
- Default-checked optional desktop shortcut and optional launch on completion.
- Installed apps entry showing Routine Studio `0.8.0-rc.2`, publisher `Sahiru Bodahewa`, and branded uninstall icon.
- Stable application identity and AppUserModelID for upgrade/shortcut continuity.

## Verification

An isolated `v0.8.0-rc.1 → v0.8.0-rc.2` upgrade preserved synthetic workflow data. Desktop and Start shortcuts opened the installed application. Uninstall removed binaries, shortcuts, and registration while retaining data; reinstall reopened it. The user confirmed the installed application was working. Windows Search indexing UI was not completed and is not claimed.

Installer: `Routine-Studio-Setup-0.8.0-rc.2-unsigned.exe`, 123,340,320 bytes, SHA-256 `9C80B52556B5427695ED5EF73093A71EEC56703B92BE1190E710AC85CA674D95`. Authenticode status is `NotSigned`.

This candidate is not published and does not replace existing `v0.8.0-rc.1` assets. Chromium remains external, application data remains E:-only, and same-machine testing is not clean-machine qualification.
