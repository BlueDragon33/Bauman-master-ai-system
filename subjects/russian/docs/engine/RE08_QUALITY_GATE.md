# Russian Engine RE08 — Quality Gate

State: VALIDATING

## Purpose

Create an Engine-specific quality gate before any RE09 app integration.

This gate supplements, not replaces, shared C3 QA/release authority.

## Current checks

### Scale
- exactly 100 data-driven levels;
- exactly 10 bands;
- RU04/C4 promotion authority;
- no official certification claim;
- no manual RLxxx branching in Engine source.

### Knowledge integrity
- reference graph schema valid;
- canonical refs remain references;
- canonical Russian text is not duplicated into graph ref nodes.

### Commercial/privacy defaults
- no mandatory managed backend;
- no mandatory payment provider;
- raw voice default is DO_NOT_COLLECT;
- subscription change cannot delete learning evidence.

### Failure matrix
Required cases include:
- invalid contract;
- missing ref;
- provider audio/ASR unavailable;
- microphone denied;
- recording error;
- profile isolation;
- sync conflict;
- duplicate journal write;
- translation leakage;
- mastery mutation attempts;
- offline/no-AI path.

### Security scan
Engine runtime source rejects simple forbidden patterns:
- arbitrary `eval(`;
- `new Function(`;
- direct `document.cookie`;
- destructive `localStorage.clear(`.

This is a guardrail, not a complete security audit.

### Performance architecture
The gate checks for suspicious eager imports of very large Russian corpora.

The Engine should continue using refs, lazy pools and injected providers.

## Negative tests

RE08 must prove the gate actually fails when:
- privacy default is changed to raw voice collection;
- arbitrary eval appears in Engine source.

A gate that cannot fail is not evidence.

## Files

- `subjects/russian/engine/quality/failure-matrix.v1.json`
- `subjects/russian/engine/quality/engine-quality-gate.mjs`
- `subjects/russian/engine/tests/test-re08-quality-gate.mjs`

## Exit

RE08 PASS requires:
- positive Engine quality gate PASS;
- privacy negative test FAILS as expected;
- security negative test FAILS as expected;
- no general Russian App integration;
- shared repository CI remains green on exact Engine HEAD before RE09.
