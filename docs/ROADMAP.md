# Roadmap

Only Milestone 0 is implemented and authorized for this task.

0. Local draft foundation: library/editor, validation, SQLite migrations/revisions, synthetic example, settings and real desktop verification.
1. Recording: explicit sessions in a separate dedicated automation browser, Playwright bundled Chromium with a persistent profile, and a Manifest V3 recorder extension.
2. Editable validated recordings: normalize events into stable steps, strengthen locators and validation, and support review/repair.
3. CSV input mapping: local parsing, column-to-input mapping, validation and preview.
4. Execution: a TypeScript worker, browser lifecycle, per-row progress and honest saved results.
5. Control and resilience: pause, takeover, exceptions, checkpoints and crash recovery.
6. Optional local Ollama suggestions: opt-in proposals requiring review; core functionality remains usable without a model.

Never use the everyday browser profile. No automation Chromium or model weights are downloaded for Milestone 0. Subsequent milestones require separate authorization.
