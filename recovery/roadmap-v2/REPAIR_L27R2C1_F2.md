# L27R2C1-F2 — Replace descriptive-string assertions with structured coupling evidence

## Trigger

Roadmap V2 Reconciliation run `35327689495` failed in R2C1 because the validator searched descriptive finding text for the exact filename `math-main-e383912-inventory.json`.

## Root cause

Human-readable findings intentionally summarized the coupling as “math-main-e383912 inventory path”. The gate incorrectly treated wording as machine-readable evidence.

## Fix

R2C1 now records and validates a dedicated `couplingEvidence` object containing:

- the full historical baseline commit;
- the exact historical inventory path;
- the exact corrected syllabus SHA-256;
- the historical validation-report path;
- the obsolete duplicate docs root.

Free-text findings remain explanatory only and no longer determine PASS/FAIL.

## Safety

No runtime, UI, content, package, learner state, canonical Roadmap executable or generated artifact is changed.
