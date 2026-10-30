# Routine Studio v0.8.0-rc.1

This unsigned Windows x64 prerelease brings the experimental **Prepare with AI** review flow into the packaged application while preserving the existing local-first recording, target review, supervised execution, and CSV batch workflow.

## Draft blocker

This release is intentionally still a GitHub draft. The unpacked application passed direct launch, persistence/restart, real extension recording, packaged CSV import, an actual three-row Chromium batch with an independent demo-state audit, export, missing-dependency guidance, and resource/worker checks. However, both the newly built installer and the previously published `v0.7.0-rc.1` installer now exit with code 2 before installation under the present machine's Windows/NSIS policy. Because the current installer could not be installed, restarted, uninstalled, and reinstalled in this release run, the prerelease has not been published. A separate permitted Windows x64 environment must complete that check first.

## Included

- Record navigation, native clicks, and ordinary form fills in dedicated Playwright Chromium.
- Review and edit bounded semantic targets; inspect match counts without acting.
- Configure reusable inputs and deliberately add visible UI checks.
- Supervise one workflow run or a sequential synthetic CSV batch with durable outcomes.
- Choose No AI, local Ollama, or OpenAI assistance without giving providers browser authority.
- Enter a short goal in Prepare with AI and individually review a proposed title, existing-step labels, and eligible literal-fill conversions.

Prepare with AI applies accepted items atomically to an unsaved draft, rejects stale/invalid proposals, preserves original recording evidence, and never adds actions, targets, navigation, checks, or execution. Its small frozen local-model evaluation was structurally valid 6/6 with all 16 expected conversion selections, but strict overall usefulness remained 0/6; human review is required.

## Downloads

- `Routine-Studio-Setup-0.8.0-rc.1-unsigned.exe`
- `Routine-Studio-0.8.0-rc.1-win-x64.zip`
- `SHA256SUMS.txt`

Use the versioned checksums asset to verify both binaries. The installer and executable are unsigned. Chromium is an external dependency and is not included in the installer or ZIP. Application data and Chromium must currently be configured on E:. Ollama and OpenAI are optional.

## Important limitations

- Windows x64 only; no macOS build.
- Same-machine verification with isolated data is not clean-machine qualification.
- SmartScreen, antivirus, broad hardware, and enterprise-policy behavior remain pending.
- One top-level tab and ordinary native HTML controls only; no frames, shadow DOM, multiple tabs, uploads, contenteditable, or arbitrary widgets.
- Values, samples, datasets, inputs, and browser profile state are local plaintext and must not contain secrets.
- Visible checks do not prove database correctness. Consequential clicks are not retried automatically after uncertain outcomes.
- Prepare with AI is experimental, review-only, and does not establish model reliability.

See [Installation](INSTALLATION.md), [Verification](VERIFICATION.md), [Status](STATUS.md), and the [engineering case study](CASE_STUDY.md).
