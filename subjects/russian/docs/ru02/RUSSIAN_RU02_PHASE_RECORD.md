# Russian RU02 Phase Record

State: **PASS**  
Baseline: `main@9bfd57210e6d5c4593fe5dc116f12f513f99f5f6`  
Mode: RU00 → RU01(PASS) → RU02.

## What RU02 consolidated

RU02 replaces the old P2/P3 execution split with one owner boundary while preserving their validated evidence. It keeps R01–R26 stable, reuses the 243-unit / 729-micro-lesson target curriculum, preserves current Russian datasets and reconciles the P3 owner plan with later files that now exist on current main (`reading.json`, `technical-concepts.json`, `academic-functions.json`, `performance-tasks.json`, `provenance.json`).

## Gap fixed in this RU02 pass

The old P2 target curriculum had no machine-readable unit prerequisite fields. RU02 therefore adds an explicit acyclic structural prerequisite model:

- a stable R01 → … → R26 macro progression;
- a 13-node Russian competency graph with explicit `requires` edges;
- stage-to-competency targets without equating academic progression with mastery.

This is architecture/design authority only. It does **not** fabricate linguistic facts, rewrite learner state, replace mastery/SRS/audio engines, or apply destructive runtime schema migration.

## Canonical semantics

The authoritative RU02 structure is split into:

- `RUSSIAN_RU02_CURRICULUM_CANONICAL_MODEL.json` — competency/prerequisite structure and protected invariants;
- `RUSSIAN_RU02_CANONICAL_OWNER_REGISTRY.json` — one target owner per canonical entity family;
- existing P2 target curriculum/skill architecture — detailed R01–R26, unit and micro-lesson design evidence;
- existing P3 schema/content graph contracts — entity-shape and relation semantics;
- `RU03_RU04_INPUT_CONTRACT.json` — downstream ownership boundary.

Planned owner files may remain absent until verified content exists. RU02 explicitly forbids filling them with invented Russian facts merely to satisfy a schema.

## Validation requirements

RU02 PASS requires:

1. R01–R26 preserved exactly;
2. 26 modules / 243 units / 729 micro-lessons remain present in P2 design authority;
3. canonical entity owner paths are unique per entity type;
4. competency and macro prerequisite graphs are acyclic and non-dangling;
5. existing P2/P3 validators remain green;
6. no runtime/state migration is introduced by RU02.

## Exit

RU02 now gives RU03/RU04 a stable structure without asking them to rediscover curriculum semantics.

**RU02 STATE: PASS — subject architecture/design authority; runtime migrations remain downstream and compatibility-gated.**
