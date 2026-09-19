# Bauman Foundation — Identity & Domain Model — Step 2 — Canonical Identity Runtime + Legacy Mapping Registry

## Goal

Introduce deterministic canonical identity without changing the currently authoritative Russian/Hub runtime state.

## Decision

Use an **identity overlay** rather than rewriting legacy storage or IDs.

The overlay is additive metadata. Existing stores remain authoritative until a later persistence/migration step proves safe.

## Current legacy identity sources covered

- Russian core state: `bauman_russian_survival_master_v11_clean_skeleton`
- Russian learning state: `RUSSIAN_LEARNING_STATE_V1` / `bauman_russian_learning_state_v1`
- Russian learning flow: `RUSSIAN_LEARNING_FLOW_V1` / `bauman_russian_learning_flow_v1`
- Russian vocabulary SRS: `RUSSIAN_VOCAB_SRS_V1` / `bauman_russian_vocab_srs_v1`
- Russian academic language: `RUSSIAN_ACADEMIC_LANGUAGE_V1` / `bauman_russian_academic_language_v1`
- Subject host bridge: `BAUMAN_SUBJECT_BRIDGE_V1`

## Canonical mapping rule

Canonical IDs follow the foundation pattern:

`bd:<kind>:<namespace>:<localId>`

Legacy IDs are preserved verbatim inside mapping metadata. Their canonical local ID is scope-qualified before encoding so identical legacy strings from separate systems/scopes cannot collide.

Examples:

- learning-state item `vocab:12` → deterministic `bd:task:russian-learning:<encoded item/vocab:12>`
- vocab SRS card `vocab:12` → deterministic `bd:knowledge:russian-vocab:<encoded card/vocab:12>`

The two objects intentionally do not collapse into one ID merely because their old strings match. A later explicit semantic alias may link them after provenance and meaning are proven.

## Safety properties

1. `canonical-identity-runtime.js` is pure and storage-neutral.
2. It does not use `localStorage`, `sessionStorage`, DOM APIs, or `window` APIs.
3. It never mutates a supplied legacy record.
4. Mapping is deterministic.
5. `ensureMapping()` is idempotent: repeated application preserves the same canonical ID and original mapping timestamp.
6. Unknown overlay fields/extensions survive normalization and repeated mapping.
7. A conflicting pre-existing mapping fails closed instead of silently changing identity.
8. Current legacy schemas/storage keys are validated directly against runtime source files.

## Non-goals in Step 2

- No storage persistence for the overlay yet.
- No rewrite of Russian state.
- No UI integration.
- No route migration.
- No mastery/review/SRS transformation.
- No semantic merging of objects from different legacy modules.

These are intentionally deferred until the identity layer itself is proven stable.

## Gate

Step 2 passes only when `FOUNDATION_IDENTITY_RUNTIME_GATE=PASS` together with all previous Foundation/Lesson gates.
