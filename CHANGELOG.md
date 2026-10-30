# Changelog

## 0.8.0-rc.2 — 2026-10-31

- Apply the established Routine Studio website mark to the executable, Electron window, installer, uninstaller, shortcuts, and Installed apps registration.
- Add a reproducible transparent multi-resolution Windows ICO with 16–256px frames.
- Add assisted per-user Start menu registration, a default-checked optional desktop shortcut, and the standard optional launch-on-finish action.
- Add product description, version, publisher, copyright, and stable AppUserModelID metadata.
- Preserve the existing application identity and E:-only payload/data behavior while retaining application data through upgrade and uninstall.

No workflow or assistance feature behavior changed. The candidate remains unsigned and depends on external compatible Chromium.

## 0.8.0-rc.1 — 2026-10-30

- Add experimental **Prepare with AI** proposals for titles, existing-step labels, and eligible literal-fill conversions with individual review and atomic application to an unsaved draft.
- Generate stable input IDs and valid unique machine names in application code; reject unknown, duplicate, conflicting, or stale model proposals without repairing them silently.
- Keep provider context bounded and nonsecret, retain ordinary validation authority, and prohibit suggestions from adding actions, checks, targets, navigation, or browser execution.
- Strengthen assistance evidence so incomplete or stale runs fail clearly, and add serialized-request regression coverage for strict Ollama/OpenAI structured output.
- Add the engineering case study, current installation guidance, and versioned Windows prerelease download experience.

This prerelease remains unsigned, Windows x64 only, and dependent on external compatible Chromium on E:. Prepare with AI is experimental and requires human review. Same-machine verification is not clean-machine qualification.

## 0.7.0-rc.1 — 2026-10-28

- Add explicit No AI, local Ollama, and OpenAI API assistance providers without changing manual recording, configuration, execution, or CSV batching.
- Add official OpenAI Responses API structured-output integration with bounded payloads, `store:false`, no tools, no automatic retry, explicit cancellation, and review-only results.
- Add Windows DPAPI-protected API-key persistence with session-only and remove/replace controls; keys are never returned to the renderer.
- Add provider disclosure, consent, payload preview, distinct credential/compatibility tests, usage reporting, and honest refusal/incomplete/error handling.
- Add mocked provider contract tests and actual Electron verification. No real OpenAI or Ollama requests were used for this release candidate.
- Add minimal-permission Windows CI and release-specific unpacked/installer output paths.

This prerelease remains unsigned. Chromium is an external dependency. Same-machine verification is not clean-machine or broad Windows distribution qualification.
