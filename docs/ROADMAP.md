# Roadmap

Milestones 0 and 1 are implemented. Stop after Milestone 1; later milestones require separate authorization.

0. Local draft foundation: library/editor, validation, SQLite migrations/revisions, synthetic example, settings and real desktop verification.
1. Recording (implemented): explicit sessions in dedicated Playwright Chromium with a persistent profile, Manifest V3 extension, session-bound validation, review/input conversion and saving as new editable drafts.
2. Editable validated recordings: normalize events into stable steps, strengthen locators and validation, and support review/repair.
3. CSV input mapping: local parsing, column-to-input mapping, validation and preview.
4. Execution: a TypeScript worker, browser lifecycle, per-row progress and honest saved results.
5. Control and resilience: pause, takeover, exceptions, checkpoints and crash recovery.
6. Optional local Ollama suggestions: opt-in proposals requiring review; core functionality remains usable without a model.

Never use the everyday browser profile. Milestone 1 reused existing compatible Chromium on E:. No model weights or inference are required. Subsequent milestones require separate authorization.
