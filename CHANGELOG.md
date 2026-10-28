# Changelog

## 0.7.0-rc.1 — 2026-10-28

- Add explicit No AI, local Ollama, and OpenAI API assistance providers without changing manual recording, configuration, execution, or CSV batching.
- Add official OpenAI Responses API structured-output integration with bounded payloads, `store:false`, no tools, no automatic retry, explicit cancellation, and review-only results.
- Add Windows DPAPI-protected API-key persistence with session-only and remove/replace controls; keys are never returned to the renderer.
- Add provider disclosure, consent, payload preview, distinct credential/compatibility tests, usage reporting, and honest refusal/incomplete/error handling.
- Add mocked provider contract tests and actual Electron verification. No real OpenAI or Ollama requests were used for this release candidate.
- Add minimal-permission Windows CI and release-specific unpacked/installer output paths.

This prerelease remains unsigned. Chromium is an external dependency. Same-machine verification is not clean-machine or broad Windows distribution qualification.
