# Changelog

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
