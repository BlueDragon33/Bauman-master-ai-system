# L7-B7 · Reference Evidence and Spaced-review Hooks

Status: implementation gate. A local PASS is not a remote CI PASS.

## Purpose

B7 connects Russian, Math and preparatory Foundation to the existing L6-B5
Master-ready policy without importing learner state or declaring anybody
Master-ready. It creates a five-stage evidence-slot catalog and deterministic
spaced-review hook templates that a later learning-state runtime can use.

The five governed stages remain:

1. understand;
2. solve;
3. build/apply;
4. explain;
5. retain.

Every new slot starts `missing`, has no artifact/event reference and has no
mastery effect until an authorized L6-B5 verifier accepts real evidence.

## Catalog scope

| Subject | Lessons | Type policy | Retention windows |
|---|---:|---|---|
| Russian | 26 | language | 1, 3, 7, 14 days; 7 and 14 required |
| Math | 365 | mathematics | 1, 7, 21 days; 7 and 21 required |
| Foundation | 15 | Factory-resolved language/mathematics/programming | type-specific |

The resulting catalog has 406 lessons and 2,030 five-stage slots. It creates
1,250 review-hook **templates**, including 812 required-window templates. A
template has no due date until verified pre-retention evidence produces an
explicit `ready-for-retention` anchor.

## Source truth and missing evidence

- Russian B2 exposes four missing slots per lesson; `build-apply` is absent.
  B7 adds a missing `dialogue-turn` target but creates no dialogue attempt.
- Math B5 exposes all five target stages, but every event is still missing.
- Foundation B6 has one uncollected bridge target per lesson. Current template
  lessons, exercises and tests are not upgraded into policy evidence.
- No Personal Learning State record, artifact, score, verifier or retention
  attempt is imported in B7.

This keeps `RUSSIAN_BUILD_APPLY_TARGET_ABSENT_IN_B2`,
`FOUNDATION_SOURCE_EVIDENCE_UNQUALIFIED` and `NO_LEARNER_EVIDENCE_IMPORTED`
visible while closing the structural hook gap.

## Deterministic schedule materialization

The pure hook engine accepts explicit state as input and returns a candidate
schedule without writing it:

- missing pre-retention evaluation → `WAITING_FOR_VERIFIED_EVIDENCE`;
- failed/invalid minimum → `NEEDS_REPAIR`;
- four pre-retention stages pass but no anchor →
  `READY_FOR_RETENTION_ANCHOR`;
- explicit UTC anchor + explicit UTC `asOf` → scheduled/due hooks;
- a due attempt passes only with a varied prompt, no protected-answer reuse,
  intact source, sufficient normalized score and an authorized verifier;
- required retention windows passing yields only
  `RETENTION_COMPLETE_GATE_PENDING`;
- the full L6-B5 gate may yield `MASTER_READY_VERIFICATION_CANDIDATE`, never a
  Master-ready state write.

AI, self-check and peer review remain advisory. Page views, route opens,
scrolling, elapsed time and AI chat are never evidence. Attempts are append-only
and an early attempt cannot satisfy a delayed window.

## Runtime, offline and rollback boundary

The registry and engine are not loaded by Russian, Math, Foundation or Main.
They do not change subject routes, storage, schedule, Service Worker or offline
packs. Projection and scheduling work without network or AI.

Rollback removes the B7 registry, engine, report and CI gate while retaining
B2 Russian, B5 Math, B6 Foundation and all legacy runtimes unchanged.

## Gate

```sh
node --check assets/js/platform/universal-lesson/reference-subject-evidence-review-v1.js
node --check scripts/academic/l7-b7-reference-evidence-review-regression.cjs
node scripts/academic/l7-b7-reference-evidence-review-regression.cjs
git diff --exit-code -- docs/migration/L7_B7_REFERENCE_EVIDENCE_SPACED_REVIEW.generated.json
```

Full L7/L6 deterministic regression plus L6/L5 browser/offline regression is
still mandatory before the B7 checkpoint can be recorded as remotely verified.
