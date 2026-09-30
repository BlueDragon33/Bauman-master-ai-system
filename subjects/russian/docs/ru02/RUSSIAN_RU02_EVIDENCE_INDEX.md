# Russian RU02 Evidence Index

Baseline: `main@9bfd57210e6d5c4593fe5dc116f12f513f99f5f6`  
Module: **RU02 — Curriculum · Competency · Canonical Russian Model**  
State: **VALIDATING**

## Inputs

- RU01 current-reality baseline and `RU02_INPUT_CONTRACT.json`;
- P2 R01–R26 target curriculum: 6 stages, 26 macro identities, 243 units, 729 micro-lessons;
- P2 skill architecture;
- P2 current→target migration map;
- P3 25-entity schema constitution;
- P3 canonical owner topology/registry/content-graph contract/migration plan;
- current Russian data tree after P7–P11;
- current legacy `curriculum.json` and `lessons.json`.

## Drift found and resolved

1. P3 classified `curriculum.json#modules` as MacroModule authority, but current runtime `curriculum.modules` contains six stage bundles (`vn/prep/hk1/hk2/hk3/hk4`), while R01–R26 live in `lessons.json`.
2. P3 still marked ReadingText, TechnicalConcept, AcademicFunction, PerformanceTask and ProvenanceRecord as planned even though P7–P9 materialized those owners.
3. Competency had no materialized canonical owner.
4. P3 documents disagreed on ListeningItem ownership and had multiple MediaAsset owner signals.
5. Legacy `lessons.json` remains rich embedded presentation content with no competency/prerequisite/concept refs at the lesson root.

RU02 resolves these without rewriting learner state or switching runtime consumers.

## New structural authority

- `subjects/russian/data/canonical-model.json`
  - six stable stages;
  - R01–R26 preserved;
  - 243 stable Units;
  - 729 stable Micro-Lessons;
  - 13 independent competency dimensions;
  - 27 machine-readable prerequisite edges;
  - legacy lesson content explicitly compatibility-only / non-authoritative for linguistic truth.

- `subjects/russian/data/canonical-owner-registry.json`
  - one declared owner for all 25 entity families;
  - materialized vs planned-unmaterialized status;
  - state-owner separation;
  - Speaking / Dialogue / Deep Speaking preserved separately.

- `RUSSIAN_RU02_CONTENT_GRAPH.json`
  - canonical relation vocabulary and cross-module handoffs.

- `RUSSIAN_RU02_MIGRATION_MAP.json`
  - additive strangler migration;
  - no runtime consumer switch;
  - idempotent and rollback-safe;
  - no learner-state reset.

- `RUSSIAN_RU02_SCHEMA_REGISTRY.json`
  - retains P3 entity schema semantics;
  - resolves RU02 structural/owner authority.

- `RU03_RU04_INPUT_CONTRACT.json`
  - explicit truth/evidence boundaries for downstream work.

## Validation

Local/connector structural self-check before PR:
- 6 stages: PASS;
- 26 unique R01–R26: PASS;
- 243 unique Units: PASS;
- 729 unique Micro-Lessons: PASS;
- 13 unique Competencies: PASS;
- prerequisite DAG: PASS;
- all competencies taught: PASS;
- 25 unique entity-owner families: PASS;
- migration boundary: PASS;
- RU03/RU04 handoff: PASS.

Executable repository validator:
`subjects/russian/scripts/validate-ru02-canonical-model.mjs`.

CI/browser evidence will be appended after PR validation.

## Runtime effect

No Russian page/runtime script imports `canonical-model.json` in RU02. Existing routes, storage keys, mastery/SRS/speech behavior and package/offline behavior remain unchanged.

**Current evidence status: SUFFICIENT FOR PR VALIDATION.**
