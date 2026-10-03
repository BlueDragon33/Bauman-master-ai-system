# MATH02 · SCHEMA MIGRATION PLAN

Migration ID: `MATH02-CANONICAL-OWNER-001`  
Status: PREPARED / NOT ACTIVATED  
Validation: PASS on `e3a2588505504cc2c154e6ce2e95af1afbca4a90`  
Production mutation: NO

## From

Multiple editable sources currently carry overlapping hierarchy/count semantics:
- `curriculum.json`;
- `discipline_spine.json`;
- `chapter_spine.json`;
- runtime presentation JS hierarchy/routing metadata;
- manifests with historical/planned counts;
- content sidecars keyed by existing chapter/lesson IDs.

## To

One canonical owner:
`prompts/subjects/math/evidence/MATH_P2_CANONICAL_MODEL.json`

During MATH02 this is a contract/evidence owner, not yet a runtime replacement.

## Identity policy

1. Preserve all retained stage/chapter/lesson IDs.
2. Do not regenerate IDs from titles.
3. Add aliases only for explicit historical IDs.
4. Resolve aliases deterministically to one canonical ID.
5. Never rewrite learner-state keys silently.

## Compatibility projections

The migration must be able to generate or validate:
- roadmap hierarchy;
- E129/E186 compatible chapter/lesson maps;
- subject-manifest count projection;
- frame/index projections;
- legacy exports.

Presentation JavaScript becomes consumer-only.

## Count migration

Replace ambiguous count semantics with:
- actualRecordCount;
- plannedTargetCount;
- coverageCount;
- derivedIndexCount;
- legacyCompatibilityCount.

Stale manifest values may remain only when explicitly labeled legacy/planned.

## Validation

Before activation:
- no duplicate canonical IDs;
- every retained lesson resolves to one chapter;
- every retained chapter resolves to one stage/discipline;
- no orphan sidecar lesson/chapter references;
- prerequisite graph has no cycle/self-edge;
- every competency evidence requirement declares its evidence tier;
- self-report cannot satisfy mastery;
- theory-content record count is measured, not inferred.

## MATH02 validation evidence

- 56 retained chapter IDs;
- 86 retained audited lesson IDs;
- 2,024 sidecar references checked;
- 102 theory records measured;
- no orphan chapter/lesson reference detected by the MATH02 validator;
- Math Learning App Gate `37116036092` and Whole System Integration `37116036068` passed.

This validates the migration contract only. Activation remains deferred to a later explicit runtime migration phase.

## Rollback

Because MATH02 makes no production runtime mutation, rollback is deletion/revert of contract artifacts.

When runtime migration begins later:
- snapshot current JSON and learner-state key contracts;
- keep legacy projection reader active;
- activate canonical projection behind a reversible version flag;
- verify browser/offline journeys;
- restore prior projection and state adapter on failure.

## Revalidation triggers

MATH02 must be revalidated if any later change modifies:
- canonical ID rules;
- curriculum ordering semantics;
- theorem/formula/domain entity semantics;
- competency/evidence tiers;
- prerequisite edge semantics;
- alias resolution;
- count semantics.
