# Milestone 8A v2 conversion audit

## Supported findings

All six frozen requests supplied readable fill labels. The three workflow shapes exposed `Customer name`, `Email`, and, where present, `Company`, so basic field identity was available without literal values. V2 produced 40/40 useful step labels, confirming that its action/object context was adequate for labeling.

Conversion intent was under-specified. The v2 prompt said to propose conversions only for literal-fill steps, but did not say that every eligible field which should vary for the user goal was expected. Four responses returned an empty conversion array despite goals about reusable or repeated customer entry.

V2 sent `existingInputNames`, including unrelated `operator_note` in requests 5 and 6. Those two responses reused it for Company, and request 5 reused it for all three fields. The retained raw diagnostics prove the correlation and strict rejection. They do not prove the model's internal reason; treating the only existing name as a preferred binding is a hypothesis.

The v2 JSON Schema described `inputName` only as a string. The underscore-only syntax and collision rules were enforced later by application validation, not accurately communicated through the model schema. Request 3 therefore emitted `Customer name`, which was human-readable but not a valid machine name.

No retained response or diagnostic justifies sending literal values. A masked or redacted field label is not evidence that its value is safe. The revised extractor excludes values unconditionally and marks sensitive, hidden, masked, or redacted fields ineligible.

## Focused correction

Preparation proposal contract version 2 gives the model only selection and human-label authority. It may select supplied eligible literal-fill step IDs and propose a bounded human-readable `fieldLabel`. It cannot propose an input ID, machine name, existing-input binding, shared binding, action, target, navigation, or check.

Application code deterministically converts field labels to valid lowercase underscore names, resolves case-insensitive collisions with `_2`, `_3`, and so on, and creates stable workflow input IDs only for explicitly accepted conversions. Generated names are displayed in the review UI before acceptance. Each accepted conversion creates one new input; manual shared-input binding remains available in the existing editor.

Provider-visible context is limited to contract version, goal, sanitized workflow title, supplied step ID/type, bounded safe step label, eligibility, and safe field label. Existing input names, literals, URLs, locators, raw events, provenance, and unrelated evidence are excluded. Strict response, eligible-ID, duplicate, stale-draft, atomic application, ordinary validation, and immutable-evidence checks remain authoritative.
