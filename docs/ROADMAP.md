# Roadmap

Milestones 0–2 are implemented. The Milestone 2 instruction supersedes earlier stop rules. Stop after Milestone 2; later milestones require separate authorization.

0. Local draft foundation: library/editor, validation, SQLite migrations/revisions, synthetic example, settings and real desktop verification.
1. Recording (implemented): explicit sessions in dedicated Playwright Chromium with a persistent profile, Manifest V3 extension, session-bound validation, review/input conversion and saving as new editable drafts.
2. Editable validated recordings (implemented): target alternatives/provenance, preferred locator configuration, explicit read-only inspection, shared inputs/validation, deliberate visible/text check definitions, saveable incomplete drafts, format migration and content-only revisions. No execution.
3. Proposed next scope: local CSV parsing, column-to-input mapping, validation and preview only. Require explicit authorization; no replay, batches or model assistance as part of Milestone 2.
4. Execution: a TypeScript worker, browser lifecycle, per-row progress and honest saved results.
5. Control and resilience: pause, takeover, exceptions, checkpoints and crash recovery.
6. Optional local Ollama suggestions: opt-in proposals requiring review; core functionality remains usable without a model.

Never use the everyday browser profile. Milestone 1 reused existing compatible Chromium on E:. No model weights or inference are required. Subsequent milestones require separate authorization.
