# PYTHON CODING ASSESSMENT CONTRACT
## Behavior-first · evidence-first · anti-string-match

Status: VALIDATING
Execution provider: PYTHON04

## Canonical result states

- `SYNTAX_FAILURE`
- `RUNTIME_FAILURE`
- `TEST_FAILURE`
- `PARTIAL_BEHAVIOR`
- `CORRECT_BEHAVIOR`
- `REPRODUCIBILITY_FAILURE`
- `INVALID_ASSESSMENT_EVIDENCE`.

A result record may also carry test-quality feedback, support used and official-evidence status.

## Attempt/evidence record

A future provider should emit an append-only record containing:
- assessment/task ID and competency IDs;
- attempt ID and attempt ordinal;
- submitted source/artifact reference;
- runtime/version context;
- public/hidden test summary without protected answers;
- result state;
- debugging/test/explanation evidence references;
- support level (`none/scaffold/hint/ai/post-submit`);
- timestamp and reproducibility metadata.

The first official attempt is immutable. Retry evidence appends; it never overwrites first-attempt history.

## Grading rules

Primary grading is based on documented behavior/contracts/tests/rubric evidence. Source-code string equality is forbidden as the primary grader. Equivalent valid implementations must be accepted when the task permits.

Public tests clarify the contract. Hidden tests probe documented edge cases/generalization and must never assert arbitrary undocumented behavior.

Final stdout alone does not prove robust implementation. The grader may require edge behavior, tests, reasoning/debug evidence and reproducibility according to the task contract.

## Special cases

- Float results: use declared/domain-appropriate tolerance.
- Unordered outputs: normalize/compare order-insensitively when order is not part of the contract.
- Randomness: seed/control or evaluate deterministic invariants; official scores must not be flaky.
- Performance: apply only when explicitly part of competency/contract.
- Style/type-check tools: advisory unless the task explicitly assesses that competency.
- Notebooks: restart from a known state and run in declared order before accepting reproducibility evidence.
- Anti-hardcode: hidden cases may reject sample-output printing that does not implement requirements.

## AI/support policy

Each official task declares `allowed | hint-only | prohibited | post-submit`. Support use changes evidence metadata, not runtime truth. AI cannot silently grant mastery or expose hidden tests/answers.
