# MATH03 INPUT CONTRACT

Status: READY · MATH02 PASS  
Subject: Mathematics

## Accepted MATH02 baseline

- Exact tested head: `e3a2588505504cc2c154e6ce2e95af1afbca4a90`
- Math Learning App Gate: `37116036092` · SUCCESS
- Whole System Integration Gate: `37116036068` · SUCCESS
- Repository reality: 56 chapter IDs · 86 lesson IDs · 2,024 checked sidecar references · 102 theory records
- Runtime migration: NOT ACTIVATED
- Production Math mutation in MATH02: NO

## Canonical inputs

MATH03 must consume:
- `MATH_ACADEMIC_BLUEPRINT.md`;
- `MATH_P2_CANONICAL_MODEL.json`;
- `MATH_SCHEMA_MIGRATION_PLAN.md`;
- retained current stage/chapter/lesson IDs;
- MATH01 evaluator/mastery findings.

## Authority boundary

MATH03 owns reasoning, worked-solution semantics, answer/equivalence categories, proof evidence, partial-credit rules and assessment evidence.

MATH03 must not:
- create a second store for definitions/theorems/formulas/assumptions;
- redefine canonical IDs;
- infer mastery from completion/self-report;
- make a CAS the unquestioned truth owner;
- rewrite learner history without migration.

## Required evaluator semantics

MATH03 must distinguish at least:
- exact symbolic equality;
- validated algebraic equivalence;
- numeric equality under explicit tolerance;
- set/interval equivalence;
- unit/dimension correctness where relevant;
- domain/assumption preservation;
- unsupported/indeterminate cases.

Unsupported equivalence must degrade honestly rather than exact-string pretending.

## Evidence tiers

Assessment outputs must map to:
`exposure | progress | performance | mastery-input`.

Only accepted performance evidence may feed the global mastery policy.

## Pilot requirement

Use a small representative slice that references canonical MATH02 IDs and includes:
- multi-step solution;
- at least one domain restriction;
- equivalent correct alternatives;
- one common misconception;
- remediation and recheck;
- deterministic expected evidence.

## Exit dependency

MATH03 may not PASS until it demonstrates that its evaluator/reasoning model consumes MATH02 canonical facts without duplicating them.
