# Russian Engine RE03 — Data-Driven 100-Level Catalog

State: VALIDATING

## Result

RL001–RL100 are now represented as data, not source-code branches.

The catalog consumes the existing RU02 competency identities:
- COMP-RU-PHON
- COMP-RU-LISTEN
- COMP-RU-VOC-REC
- COMP-RU-GRAM-REC
- COMP-RU-VOC-PROD
- COMP-RU-GRAM-PROD
- COMP-RU-SPEAK
- COMP-RU-READ
- COMP-RU-WRITE
- COMP-RU-INTERACT
- COMP-RU-ACADEMIC
- COMP-RU-TECH
- COMP-RU-RESEARCH

## Important semantics

A level is a learner-facing/progression view.

It is NOT canonical mastery truth.

Every level routes promotion authority to RU04/C4.

No level accepts click/time-only completion.

Every tenth level adds:
- delayed retention evidence;
- unseen transfer evidence.

## Diagnostic skip

Every level record allows diagnostic skip in principle.

This means an advanced learner is not forced through 99 trivial levels if evidence shows higher capability.

The actual placement/mastery policy remains future RU04/RE06 work.

## CEFR safety

All 100 records explicitly contain:
- `cefr: null`;
- `certified: false`.

No unsupported official CEFR equivalence is claimed.

## Difficulty model

The catalog uses data fields for:
- speech target;
- response openness;
- support ceiling;
- semantic complexity;
- transfer requirement.

No `if level === 1 ... level === 100` implementation exists.

## Files

- `subjects/russian/engine/content/levels/levels.v1.json`
- `subjects/russian/engine/schemas/level-catalog.schema.json`
- `subjects/russian/engine/progression/level-catalog.mjs`
- `subjects/russian/engine/tests/test-re03-level-catalog.mjs`

## Exit

RE03 PASS requires the catalog validator to prove:
- exactly 100 ordered unique IDs;
- 10 bands × 10 levels;
- all competency refs exist in RU02;
- 10 transfer/retention milestones;
- RU04/C4 promotion authority;
- no official CEFR claim;
- data-driven lookup/next/band/competency queries.
