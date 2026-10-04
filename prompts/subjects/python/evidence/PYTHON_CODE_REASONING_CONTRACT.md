# PYTHON CODE REASONING CONTRACT
## PYTHON03 canonical reasoning evidence

Status: VALIDATING
Runtime activation: NO

## Canonical chain

`PROBLEM → INPUT/STATE → DECOMPOSITION → PLAN → CODE → TRACE/EXECUTION → TEST → DEBUG → RESULT → EXPLANATION → TRANSFER`.

Evidence dimensions are independent:
- reading;
- tracing;
- predicting;
- constructing;
- decomposing;
- debugging;
- testing;
- explaining;
- refactoring;
- transfer.

A correct final output may prove only one dimension.

## Trace state

A trace may record the current expression/line, name bindings, relevant mutable object state, call-stack frame when appropriate, output/side effects and exception state. Explanations must remain compatible with Python name/reference semantics; fake memory-box explanations are not canonical.

## Construction contract

For nontrivial tasks:
1. identify requirements and behavior;
2. identify inputs/outputs/state and edge cases;
3. choose decomposition;
4. implement small coherent units;
5. exercise public/learner-authored tests;
6. diagnose failures;
7. fix root cause;
8. run regression checks;
9. explain design/limitations.

Pseudocode is optional support, not mandatory ceremony.

## Evidence boundary

PYTHON03 defines what evidence means. It does not execute untrusted code. Interpreter/sandbox/test-runner providers belong to PYTHON04. C4 remains the global mastery owner.
