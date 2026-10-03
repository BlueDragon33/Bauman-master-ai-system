# MATH02 INPUT CONTRACT
## Evidence-based handoff from MATH01

Status: READY AFTER MATH01 PASS  
Subject: Mathematics  
Authority: `prompts/subjects/math/MATH_MASTER_PROMPT.md` + C1/C3/C4 routed clauses  
Production mutation authorized: **NO**

## 1. Inputs MATH02 must consume

Canonical MATH01 evidence:
- `prompts/subjects/math/evidence/MATH_P1_EXECUTIVE_SUMMARY.md`
- `prompts/subjects/math/evidence/MATH_P1_BASELINE.json`
- `prompts/subjects/math/evidence/MATH_P1_EVIDENCE_INDEX.md`

Current structural sources:
- `subjects/math/data/curriculum.json`
- `subjects/math/data/discipline_spine.json`
- `subjects/math/data/chapter_spine.json`
- `subjects/math/data/content_vault_manifest.json`
- `subjects/math/data/*_frame.json`
- `subjects/math/data/*_content.json`

Current runtime compatibility owners that must not be broken during canonicalization:
- E129 theory shell;
- E240 durable theory-content bridge;
- E186 learner lesson route;
- current Math Navigation;
- Math Learning Flow learner-state owner;
- current browser/offline gates.

## 2. Facts MATH02 must treat as current reality

1. The curriculum skeleton currently exposes 10 stages, 56 chapter-spine entries and 12 disciplines.
2. The audited split-content sidecars share 86 current lesson IDs across 17 chapter IDs.
3. Current metadata manifests contain historical/planned counts that do not match live sidecar counts; planned counts are not content truth.
4. Theory runtime may read from `window.DB`, an E129 local overlay, or durable JSON through E240. Repository canonicalization must distinguish durable truth from a user-local overlay.
5. Presentation JavaScript contains hard-coded academic hierarchy/routing metadata in addition to JSON spines. Presentation code must not become the future curriculum truth owner.
6. Current answer grading is narrow and deterministic; no general symbolic-equivalence/CAS owner is proven.
7. Current Activity Mastery is a UI projection over self-report/completion and is not authoritative mastery evidence.
8. Existing stable lesson/chapter IDs are already referenced by tests, sidecars and runtime bridges and must be migrated deliberately, not regenerated casually.

## 3. MATH02 owned decisions

MATH02 must define one canonical Math domain model for:

- stage;
- discipline;
- chapter;
- module/unit where genuinely required;
- lesson;
- concept;
- definition;
- theorem/proposition/lemma;
- notation;
- formula;
- assumption/domain;
- worked example;
- exercise/problem;
- competency;
- learning outcome;
- prerequisite;
- misconception/remediation relation;
- evidence requirement;
- source/provenance metadata.

For each entity define:
- stable ID rule;
- canonical owner/file or registry;
- version/migration rule;
- references/foreign keys;
- required vs optional fields;
- learner-visible vs internal metadata;
- compatibility projection for legacy/current runtime consumers.

## 4. Curriculum ownership requirement

MATH02 must select exactly one curriculum truth owner.

The accepted model must make these derived projections, not competing authorities:
- roadmap UI;
- E129/E186 hierarchy;
- subject manifest counts;
- frame files;
- indexes/search maps;
- legacy export files.

Do not keep independent editable copies of stage/chapter/lesson ordering in JavaScript and JSON.

## 5. Mathematical truth ownership requirement

Define one-owner rules for:
- definitions;
- notation;
- theorem statements;
- assumptions/domain;
- formula identity and canonical representation;
- units/dimensions where relevant;
- exact-answer semantics;
- numerical tolerance semantics;
- graph/function definition.

MATH02 must provide the canonical entities and invariants. MATH03 may own evaluator/reasoning behavior, but must not invent a second mathematical fact store.

## 6. Competency graph requirement under C4

Build a competency graph where:
- prerequisite is explicit;
- competency is not inferred from page visit or self-report alone;
- evidence requirements are explicit;
- exposure, progress, performance and mastery remain distinct;
- mastery can only be projected from accepted evidence;
- review/remediation links point back to competencies/concepts, not arbitrary UI labels.

The current Lesson Check self-report may remain useful as reflection/progress input, but it must not by itself satisfy canonical mastery.

## 7. Migration/backward-compatibility contract

MATH02 must preserve current learner/runtime behavior while canonicalizing.

Required:
1. map every retained current stage/discipline/chapter/lesson ID to the canonical model;
2. keep E240/E186-compatible projections until replacement acceptance passes;
3. define aliases only where necessary and make alias resolution deterministic;
4. do not silently rewrite learner-state keys;
5. do not discard current sidecar records because a new schema exists;
6. provide migration/rollback for any identity/schema change;
7. add validators that fail on orphan lesson/chapter/competency references.

No mass content generation in MATH02.

## 8. Metadata reconciliation

Separate:
- actual record counts;
- planned target counts;
- coverage counts;
- derived/index counts;
- legacy compatibility counts.

`data/content-manifest.json` and `subject-manifest.json` must not continue presenting stale/historical numbers as current truth after MATH02 migration.

The large theory file record count that MATH01 could not retrieve through the connector must be measured by an executable validator before any total-coverage claim.

## 9. Explicit non-goals

MATH02 does **not**:
- build a CAS;
- decide free-form algebraic equivalence;
- build proof grading;
- redesign the learner UI;
- implement AI tutor authority;
- declare mastery from self-report;
- expand hundreds of exercises just to fill a schema;
- deploy production.

Those belong to later owners after the canonical model is stable.

## 10. MATH02 acceptance gate

MATH02 may PASS only when:

1. one canonical curriculum/entity owner exists;
2. current IDs have an explicit migration/compatibility map;
3. stage → discipline/chapter → lesson ordering is deterministic;
4. prerequisite and competency graph schemas are explicit;
5. mathematical truth entities carry assumptions/domain/provenance where applicable;
6. stale manifest/planned-count ambiguity is removed or clearly separated;
7. all current audited sidecars can be validated against the canonical model without orphan references;
8. no UI/runtime layer becomes a second curriculum truth writer;
9. C4 evidence semantics distinguish exposure/progress/performance/mastery;
10. downstream MATH03/MATH04/MATH05 receive stable contracts.

If any owner remains ambiguous, MATH02 stays VALIDATING rather than creating another compatibility layer.
