# Bauman Foundation — Content, Asset & Provenance Registry — Step 5 Audit

## Scope

Step 5 adds a pure read-only access-policy engine for registry records. It does not introduce authentication, user accounts, storage, network calls, UI gating, or subject-runtime coupling.

## Access semantics

`access-policy.js` resolves the existing registry visibility values:

- `private`
- `course`
- `organization`
- `public`

Rules:

1. A registry record with no access record defaults to `private`.
2. Multiple access records for the same scope are resolved fail-closed: the most restrictive visibility wins.
3. Entitlement context is explicit; no hierarchy is inferred between course and organization membership.
4. Public records are readable without entitlement.
5. Private records require explicit private entitlement.
6. Evaluation and filtering are read-only and never mutate registry state.

## API

- `policiesForScope(registry, targetId)`
- `effectiveVisibility(registry, targetId)`
- `evaluateReadAccess(registry, targetId, context)`
- `filterReadable(registry, registryIds, context)`

The engine returns decisions only. It does not enforce browser routes, filesystem access, login state, or network authorization.

## Safety invariants

- unknown/missing targets fail closed;
- no policy means private;
- conflicting policies cannot widen access;
- access evaluation cannot rewrite registry records;
- existing L9 identity, L10 registry, checksum, integrity, and provenance semantics remain unchanged;
- no learner-visible version badge is introduced.

## Gate

Step 5 requires all prior L10 gates plus:

- access-policy runtime syntax PASS;
- public/course/organization/private decision cases PASS;
- fail-closed default PASS;
- conflicting-policy most-restrictive resolution PASS;
- read-only immutability PASS;
- missing-target and malformed-list negative tests PASS;
- Foundation Domain Model, Windows checkout, and Whole System Integration remain green.

Step 6 must not start until the expanded gate is green on GitHub Actions.
