# L23/B91 — Diagnostic Harness Acceptance

Status: `PENDING_GATE`

## Purpose

Validate the current Diagnostic harness without enabling production execution or persistence.

The B91 harness may evaluate only explicitly supplied, already-reviewed item-bank fixtures. It must not attach those fixtures to the canonical Diagnostic catalog.

## Required positive cases

- valid 20-item reviewed bank passes structural validation;
- active-session projection exposes prompt/options only, never answer keys, rationale or reviewer metadata;
- 100% overall + critical score -> `existing_competency_verified`;
- overall score below 80% -> `gap`;
- overall score >= 80% but critical score below 70% -> `critical_gap`;
- every result remains `masterReady: false` and `persistable: false`.

## Required negative cases

- unreviewed bank;
- target mismatch;
- wrong item count;
- missing critical items;
- difficulty-distribution mismatch;
- incomplete attempt;
- duplicate response;
- unknown option;
- tampered catalog fingerprint;
- missing required schema input.

All must fail closed.

## Production boundary

- canonical catalog verified item banks: 0;
- executable plans: 0;
- generated question items: 0;
- learner/mastery persistence: disabled;
- runtime activation: disabled.

B92 remains blocked until B91 and the complete regression gate are green.
