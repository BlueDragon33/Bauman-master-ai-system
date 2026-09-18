# Bauman Foundation — Identity & Domain Model — Step 1 — Baseline Audit

## Scope

Audit the current `main` foundation before introducing any universal runtime migration.

## Existing contracts that must remain valid

- Russian learning state: `RUSSIAN_LEARNING_STATE_V1`
- Russian learning storage: `bauman_russian_learning_state_v1`
- Russian content contract: `RUSSIAN_CONTENT_CONTRACT_V1`
- Subject host bridge: `BAUMAN_SUBJECT_BRIDGE_V1`

## Findings

1. Existing contracts are useful and already encode truthful learning-state behavior, content truthfulness, and host progress exchange.
2. Identity is currently local to individual modules and routes. It is not yet safe to use those local identifiers as a cross-subject or research-wide identity layer.
3. Existing Russian state must not be renamed or destructively migrated. The universal domain layer therefore starts as an additive mapping layer.
4. Research/doctoral objects must share the same identity, provenance, evidence, artifact, and workflow foundation rather than being attached later as an unrelated database.
5. AI authority boundaries already established in Russian must become foundation policy: AI may assist but cannot silently modify canonical mastery or accept research claims.

## Step 1 decision

Introduce `BAUMAN_DOMAIN_CONTRACT_V1` before any runtime adapter or migration code.

No UI changes.
No legacy storage changes.
No Hub routing changes.
No subject behavior changes.
No merge to `main` until the full L9 gate is complete.

## Required proof before Step 2

- Domain contract parses as valid JSON.
- Required entity families and canonical identity rules are present.
- Additive compatibility is explicit.
- Existing Russian learning/content/host bridge contracts remain detectable.
- Destructive storage-reset policy is forbidden.
- CI validator reports `FOUNDATION_DOMAIN_MODEL_GATE=PASS`.
