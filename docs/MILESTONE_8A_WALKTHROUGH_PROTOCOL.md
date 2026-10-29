# Milestone 8A real-application walkthrough protocol

Frozen before any walkthrough inference on 29 October 2026. These three demonstrations are separate from the six v3 evaluation cases. Each permits exactly one production-adapter request with `qwen3:8b-q4_K_M`, no retry or repair request. All people and companies are synthetic and demo data is disposable.

## Walkthrough A — support contact with a fixed company

- Record through the actual Electron recorder from the disposable directory to the add-customer form and saved page.
- Demonstrated fill order: Email, Customer name, Company.
- Recorded literals: `ava.support@example.test`, `Ava Support`, and fixed `Routine Studio Support Lab`.
- Goal: `Prepare this support-contact flow so the person's name and email can vary, while Routine Studio Support Lab remains a fixed demonstrated company.`
- Expected conversions: Email and Customer name.
- Expected non-conversion: Company, because the goal explicitly says the demonstrated company is fixed.
- Run values after review: `ava.reviewed@example.test`, `Ava Reviewed`; company remains `Routine Studio Support Lab`.

## Walkthrough B — reusable partner intake

- Record through the actual Electron recorder from the customer directory to the add-customer form and saved page.
- Demonstrated fill order: Company, Email, Customer name.
- Recorded literals: `Synthetic Harbor Partners`, `noah.partner@example.test`, and `Noah Partner`.
- Goal: `Prepare this disposable partner-intake workflow so company, contact email, and contact name are reusable inputs.`
- Expected conversions: Company, Email, and Customer name.
- Expected non-conversions: Navigation and Save customer actions.
- Run values after review: `Synthetic Fjord Partners`, `noah.reviewed@example.test`, `Noah Reviewed`.

## Walkthrough C — named demo tenant with fixed email

- Record through the actual Electron recorder from the directory, through the add-customer form, to the saved page and back to the directory.
- Demonstrated fill order: Customer name, Company, Email.
- Recorded literals: `Mina Tenant`, `Synthetic Cedar Works`, and fixed `demo-inbox@example.test`.
- Goal: `Prepare this tenant-entry flow so customer name and company vary, but keep demo-inbox@example.test as the fixed shared demo inbox.`
- Expected conversions: Customer name and Company.
- Expected non-conversion: Email, because the goal explicitly says the demonstrated address is fixed; navigation/click actions are never conversions.
- Run values after review: `Mina Reviewed`, `Synthetic Maple Works`; email remains `demo-inbox@example.test`.

## Review boundary

For each unedited proposal, record structural validity, title/label usefulness, every expected/missing/unnecessary/incorrect conversion, and generated names. Reject incorrect suggestions, accept only useful suggestions, make manual corrections explicitly, add the confirmation check manually, save explicitly, run with the different values above, and independently inspect disposable demo state for the intended single record and extras. A corrected successful workflow is not evidence that the model proposal was correct.
