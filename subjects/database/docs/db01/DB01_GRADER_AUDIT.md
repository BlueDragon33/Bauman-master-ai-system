# DB01 Grader Audit

Baseline SHA: `066ef7ce03be4e30f01fd69ae66a1cd859711226`

## Current paths

### Programming exercises

`PR06` and `PR15` exercises use generic rubrics:

- input/output clarity;
- workflow/code;
- test/log;
- README/artifact;
- application linkage.

They do not prove SQL semantic equivalence.

### P6 validator

`scripts/validate-p06-database-fundamentals.js` validates:

- P6 pack schema and scope;
- official curriculum links;
- PR06/PR15 reuse;
- node dependency graph;
- diagnostic counts and IDs;
- misconception/repair-route integrity;
- conceptual normalization/deadlock/selectivity invariants.

It does **not** execute learner SQL against discriminating fixtures.

### Shared Programming review/exam

`subjects/programming/assets/core.js` and `subject-adapter.js` provide generic test/review/exam/remediation state.

No DB-specific semantic query grader was located.

## Risks

- A generic rubric can accept syntactically or semantically wrong SQL if the artifact looks complete.
- A future result-only grader could accept wrong SQL on a single non-discriminating dataset.
- ORDER BY, NULL, bag semantics, duplicate cardinality, constraints and alternate-valid SQL are not currently protected by a DB-specific grader.

## DB03 handoff requirements

DB03 must own a semantic SQL assessment contract that:

- accepts multiple valid queries;
- rejects known wrong queries;
- uses discriminating fixtures;
- treats order only when semantically required;
- checks NULL/bag/duplicate/join/aggregate behavior;
- separates query text from query meaning;
- protects hidden fixtures;
- does not make the AI tutor the official grader.
