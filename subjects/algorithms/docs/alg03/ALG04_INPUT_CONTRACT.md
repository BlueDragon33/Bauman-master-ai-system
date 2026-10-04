# ALG04 INPUT CONTRACT

ALG03 status required: **PASS**.

ALG04 consumes the ALG03 assessment model, reasoning/correctness/complexity contracts, error taxonomy, alternate-solution policy, grader contract, partial-credit rubric and golden correct/wrong/edge fixtures.

Locked semantics:
1. Sample output alone is insufficient.
2. Grading is contract/property based, not source-string based.
3. Functional correctness and complexity/memory/order compliance are separate.
4. Multiple valid outputs/traces/algorithms are accepted when permitted.
5. Error IDs route remediation to `alg.comp.*`.
6. Complexity grading cannot invent exact arbitrary-source inference.
7. Timing is supporting evidence only.
8. Hidden tests stay provider-side and outside AI context.
9. First-attempt/retry/mastery state stays C4/global ownership.
10. ALG04 providers consume ALG02/ALG03 truth and cannot override it.

ALG04 priorities: semantic trace provider; visualizers consuming trace rather than duplicating algorithm logic; data-structure operation visualization; safe reuse of accepted Python execution; property validators and controlled edge/adversarial generators; empirical benchmark provider; AI Algorithms Tutor constrained by canonical reasoning/error contracts.

Deferred-JIT topics need a canonical topic contract before official execution/assessment support.
