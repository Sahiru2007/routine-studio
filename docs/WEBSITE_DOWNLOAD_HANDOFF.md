# Website download handoff — Routine Studio v0.8.0-rc.1

Checked 30 October 2026. The GitHub repository is **public**, but this release is an owner-visible **draft prerelease** because current installer lifecycle verification is blocked. Anonymous visitors cannot access draft release downloads. Do not put the asset URLs into a public website until the existing draft is deliberately published after installer qualification.

## Release identity

- Repository: <https://github.com/Sahiru2007/routine-studio>
- Visibility: public
- Tag: `v0.8.0-rc.1`
- Tagged source commit: `132d4b420d8f8082eb11f3bdd2b42baec4b6a164`
- Prerelease: yes
- Draft: yes
- Authenticated draft page: <https://github.com/Sahiru2007/routine-studio/releases/tag/untagged-4118bfd8adc5c83986e5>
- Versioned release page after publication: <https://github.com/Sahiru2007/routine-studio/releases/tag/v0.8.0-rc.1>
- CI: <https://github.com/Sahiru2007/routine-studio/actions/runs/41105370756>

Do not use `/releases/latest`: GitHub does not treat prereleases as the stable latest release, and this release is presently a draft.

## Assets

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe` | 123,326,643 | `e5c4f592d992906d19d20c3210299acb52cc730870abfa9338fc4e5859611224` |
| `Routine-Studio-0.8.0-rc.1-win-x64.zip` | 170,916,470 | `a98e107bd512b84b07c48645bc774a94a094bb7390d4fae1f58c40e775256d91` |
| `SHA256SUMS.txt` | 215 | `aa7076d33816e8076ffe19e37a109bd3181f74b9173eccad7a98389086daf819` |

GitHub's uploaded-asset digests match the two local binary hashes. Current authenticated draft asset URLs use GitHub's temporary draft slug:

- <https://github.com/Sahiru2007/routine-studio/releases/download/untagged-4118bfd8adc5c83986e5/Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe>
- <https://github.com/Sahiru2007/routine-studio/releases/download/untagged-4118bfd8adc5c83986e5/Routine-Studio-0.8.0-rc.1-win-x64.zip>
- <https://github.com/Sahiru2007/routine-studio/releases/download/untagged-4118bfd8adc5c83986e5/SHA256SUMS.txt>

After the existing draft is published, use these exact versioned public URLs:

- <https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe>
- <https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-0.8.0-rc.1-win-x64.zip>
- <https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/SHA256SUMS.txt>

## Platform and prerequisites

- Windows x64 only; no macOS build.
- Installer and executable are unsigned. Do not advise users to disable or bypass security protections.
- Install binaries and keep application data on E:. Packaged default data is `E:\Routine Studio Data`.
- Compatible Playwright Chromium is an external E: dependency for recording, inspection, execution, and CSV batches. Neither download is fully self-contained.
- Manual recording configuration and workflow editing require no model provider. Ollama and OpenAI are optional.
- Workflow values, samples, datasets, run inputs, and browser profile state are local plaintext and must not contain secrets.

Prepare with AI **is included** in the tagged binaries as an experimental, review-only feature. It proposes title/label/input-conversion changes for individual acceptance, applies accepted items only to an unsaved draft, and has no browser authority. Small synthetic evaluation results do not establish reliability.

## Verification and blocker

Passed on the development machine with isolated E: data:

- Typecheck, production build, 90/90 unit tests, and CI.
- Actual Electron Prepare with AI and assistance harnesses using loopback mocks only.
- OpenAI settings, DPAPI, consent, payload preview, and provider contracts using a loopback mock; no cloud or local model request.
- Direct unpacked executable launch from a copied E: path containing spaces.
- Real MV3 recording; workflow save, full restart, and reopen.
- Packaged CSV import and actual sequential three-row Chromium batch with exactly three independently audited demo records and exported results.
- Missing Chromium/Ollama manual-operation guidance; packaged resources, extension, workers, and sample CSV.
- Exact ZIP extraction into a separate E: path containing spaces and resource/version inspection.

One first packaged run was preserved as a failure: visible managed Chromium closed during row 2, so the run was marked interrupted and the batch never claimed completion. A foreign synthetic record showed external interaction with that visible browser. One fresh isolated rerun then passed the complete smoke without weakening assertions.

Blocked: the current unsigned installer exits with code 2 before installation from two fresh E: destinations. The previously published `v0.7.0-rc.1` installer now exits identically in the same harness, which supports a current Windows/NSIS policy limitation but does not verify the new installer. Therefore installation, restart, uninstall retention, and reinstall recovery for this exact installer remain pending. Same-machine checks are not clean-machine qualification.

## Website configuration example

Keep `enabled` false while the GitHub release is a draft:

```json
{
  "enabled": false,
  "version": "0.8.0-rc.1",
  "channel": "prerelease",
  "platform": "windows",
  "architecture": "x64",
  "unsigned": true,
  "releaseUrl": "https://github.com/Sahiru2007/routine-studio/releases/tag/v0.8.0-rc.1",
  "installer": {
    "url": "https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe",
    "sha256": "e5c4f592d992906d19d20c3210299acb52cc730870abfa9338fc4e5859611224"
  },
  "zip": {
    "url": "https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/Routine-Studio-0.8.0-rc.1-win-x64.zip",
    "sha256": "a98e107bd512b84b07c48645bc774a94a094bb7390d4fae1f58c40e775256d91"
  },
  "checksumsUrl": "https://github.com/Sahiru2007/routine-studio/releases/download/v0.8.0-rc.1/SHA256SUMS.txt",
  "requiresExternalChromium": true,
  "requiresEDrive": true,
  "prepareWithAi": "experimental-review-only"
}
```

Set `enabled` to true only after the same tagged assets pass installer acceptance and the draft prerelease is published. Do not silently substitute a rebuilt asset under the same version.
