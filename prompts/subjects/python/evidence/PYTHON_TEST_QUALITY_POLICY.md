# PYTHON TEST QUALITY POLICY

A test is valid only when it traces to a documented task requirement or declared competency.

## Public tests
- explain observable behavior;
- aid learner debugging;
- cover representative normal cases;
- do not reveal the entire protected assessment set.

## Hidden tests
- target documented edge cases/generalization/robustness;
- avoid arbitrary trick behavior;
- never depend on protected implementation details when multiple valid implementations are allowed;
- do not leak answers in failure messages.

## Equivalence rules
- accept semantically equivalent implementations;
- ignore output order when the contract says order is irrelevant;
- use declared tolerance for approximate numeric behavior;
- control randomness;
- isolate state/fixtures;
- detect hard-coded sample answers where appropriate.

A green test suite is evidence for covered behavior, not proof of universal correctness.
