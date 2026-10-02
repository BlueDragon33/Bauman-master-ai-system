# DB SQL Grader Contract

## Core rule

**Grade what the query means, not whether it matches a reference SQL string.**

## Pipeline

1. Validate task and engine profile.
2. Reject unsafe/non-permitted operations before execution.
3. Execute only in an isolated learner database (DB04 capability).
4. Run assigned public/hidden discriminating fixtures.
5. Normalize columns, rows, multiplicity, order and NULL per task.
6. Compare semantic result to expected semantics.
7. Apply required/forbidden syntax only when explicitly pedagogical or safety-related.
8. Record taxonomy, remediation and immutable first-attempt evidence.

## Multiple valid SQL

Any candidate satisfying semantics and safety across required fixtures passes. Textual similarity is irrelevant.

## Static analysis

Static analysis may detect restrictions, unsafe DDL/DML or dialect mismatch, but does not replace semantic execution.

## Test-of-tests

Maintain:
- known correct alternatives that pass;
- known wrong queries that fail;
- at least one discriminating fixture per wrong query;
- explicit NULL, duplicate, ordering, outer-join and aggregate canaries.

## Hidden fixtures

Hidden payloads/official solutions are not learner content, AI-tutor context, or client API output. Only trusted grading/test execution may access them.
