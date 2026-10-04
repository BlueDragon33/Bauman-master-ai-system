# ALG03 GRADER CONTRACT

## Role
The Algorithms grader evaluates evidence against ALG02/ALG03 contracts. It does not own curriculum truth, execution security, learner-state persistence or mastery aggregation.

## Task contract
Declare task/version, competency/canonical entity IDs, assessment mode, allowed algorithm policy, input model, preconditions, functional properties, complexity/memory constraints, order/stability/mutation rules, required reasoning dimensions, public/hidden evidence policy, retry/reveal policy and deterministic/tie policy.

## Result dimensions
`representation, strategy, trace, invariant, correctness, complexity, implementation, testing, tradeoff, explanation` plus `functionalCorrectness, complexityCompliance, memoryCompliance, orderingStabilityCompliance`.

Dimension status: `PASS | PARTIAL | FAIL | UNRESOLVED | NOT_ASSESSED`. Error/remediation IDs may be emitted. The grader never writes mastery.

## Semantic validators
Use exact value only when unique by contract. Otherwise prefer predicate/property validators: valid index, sortedness, permutation, stability, reachable set, distance/path validity, invariant/trace validity and normalized complexity claim.

## Hidden boundary
Hidden inputs/expected/source stay provider-side. Learner/AI can receive aggregate outcomes, labels and remediation, not hidden material.

## Test-of-tests
Before acceptance, applicable known-correct fixtures pass; structurally different alternate correct fixtures pass when alternatives are allowed; applicable known-wrong fixtures fail/classify; edge fixtures exercise the declared risk matrix. A suite that accepts all or rejects all fails.

## Partial credit
Use separate evidence dimensions. Sample-output success cannot imply full correctness.

## Complexity limit
Do not pretend exact arbitrary-code complexity inference. If evidence is insufficient return `UNRESOLVED`. Timing cannot be sole asymptotic evidence.

## First attempt / retry
ALG03 returns evidence only. C4/global state owns immutable first-attempt history, retry append semantics and mastery.

## AI / provider failure
AI does not receive hidden tests or declare official score. On evaluator/provider failure, fail closed for official scoring and report infrastructure status separately from learner correctness.

## Security
ALG03 adds no host/browser eval or second Python runner. Implementation execution is an ALG04 capability concern.
