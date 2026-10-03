# MATH04 INPUT CONTRACT

Status: READY · MATH03 PASS

## Accepted MATH03 baseline

- Exact runtime-tested head: `25cd32b94df21e5e0bbd3dc4aaae804f5d9478b6`
- Math Learning App Gate: `37120673436` · SUCCESS
- Whole System Integration Gate: `37120673379` · SUCCESS
- Development Fast CI: `37120673329` · SUCCESS
- Universal Constitution Compliance: `37120673709` · SUCCESS
- Production deployment: NO

## Locked MATH03 inputs

MATH04 may consume:
- `MATH_PROBLEM_CONTRACT.json`;
- `MATH_SOLUTION_STEP_SCHEMA.json`;
- `MATH_EQUIVALENCE_POLICY.md`;
- `MATH_PROOF_REASONING_POLICY.md`;
- `MATH_ASSESSMENT_EVIDENCE_POLICY.md`;
- `MATH_MASTERY_SPECIALIZATION.md`;
- `MATH_ADAPTIVE_PROBLEM_POLICY.md`;
- the additive reasoning evidence ledger;
- `math_reasoning_pilot_v1.json` golden cases.

## Authority boundary

MATH04 may provide symbolic, numerical, graphing, geometry, matrix/vector, simulation and optional code capabilities only as typed providers.

MATH04 must not:
- become a second mathematical-truth owner;
- silently widen/narrow MATH02 domains or assumptions;
- convert unsupported computation into false certainty;
- write official mastery;
- award official proof score without a validated authority path;
- rewrite MATH03 first-attempt evidence.

Provider results must expose provenance, exactness/approximation and explicit unavailable/error state.

## Required compatibility

MATH04 must preserve MATH03 verdict semantics:
`ACCEPTED | REJECTED | CONDITIONAL | INDETERMINATE`

A provider may enrich evaluation evidence, but unsupported capability must remain fail-honest.

## Revalidation triggers

Revalidate MATH03 if MATH04 changes:
- equivalence semantics;
- evaluator authority;
- domain/assumption behavior;
- official evidence tier meaning;
- attempt identity/idempotency.

Pure visualization/layout changes do not invalidate MATH03 reasoning semantics.
