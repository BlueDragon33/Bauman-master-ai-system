# Russian P3 Migration Plan

Phase: **P3 — Content Schema Constitution**

## Purpose

Move from the current mixed legacy/runtime shapes toward the P3 canonical entity model without changing stable learner-referenced identity, fabricating linguistic facts, or silently resetting learner state.

Migration principle:

`read old → validate → map aliases → write target → validate target → switch consumer → retain rollback`.

Every migration must be idempotent.

## Migration IDs

| Migration | Scope | From | To | P3 action |
|---|---|---|---|---|
| RU-P3-M01 | curriculum identity | current R01–R26 stage/module grouping | Stage/MacroModule + stable Unit/MicroLesson IDs | design + validator only |
| RU-P3-M02 | lesson structure | current lesson objects | Unit/MicroLesson reference model | design + validator only |
| RU-P3-M03 | vocabulary | current 8,000-card shape | LexicalEntry/PhraseCollocation model | schema mapping only; no fabricated enrichment |
| RU-P3-M04 | grammar | current grammar + grammar-path | GrammarConcept + derived learning path | schema/owner mapping only |
| RU-P3-M05 | assessment | tests/exercises | AssessmentItem + Exercise | ownership mapping; scoring/state deferred to P4 |
| RU-P3-M06 | speaking | speaking/dialogue/deep/link-index | SpeakingItem/DialogueScenario/DeepSpeakingTask + derived links | ownership preservation |
| RU-P3-M07 | indexes | knowledge-index + speaking-link-index | regenerable derived outputs | build-contract definition only |
| RU-P3-M08 | provenance | mixed source metadata | ProvenanceRecord references | planned owner; no invented source authority |

## Stable identity

1. Existing R01–R26 IDs remain stable.
2. P2 unit identities `Rxx-Uxx` and micro-lesson identities `Rxx-Uxx-Mxx` become the target stable identity convention.
3. Existing learner-state keys are not renamed in P3.
4. Display-title changes never change IDs.
5. Legacy aliases must be retained whenever a runtime consumer still resolves the legacy identifier.

## Vocabulary migration

Current `vocab.json` has 8,000 records with fields such as `id`, `front`, `phrase_ru`, `pronunciation`, `stage`, `ru`, `vi`, `meaning`, `example`.

P3 mapping may identify:
- canonical orthography from existing Russian source fields;
- current ID/source ID;
- existing meanings/examples/tags/stage;
- explicitly marked stress only when present.

P3 must **not** infer or invent:
- stress;
- morphology;
- POS;
- gender;
- aspect pair;
- government;
- frequency;
- provenance status.

Those fields remain unknown until authoritative/curated validation.

The existing `content-contract.js` rule that explicit source stress is canonical and Latin transliteration is not stress authority is preserved.

## Grammar migration

`grammar.json` remains the canonical current grammar owner. `grammar-path.json` is treated as guidance/derived sequencing where possible.

P3 target requires:
- FORM and FUNCTION separation;
- structured government;
- concept IDs;
- prerequisite links;
- examples/provenance.

No grammar fact is duplicated merely to fit a lesson.

## Speaking migration

Preserve the existing owner split:
- `speaking.json` — basic speaking/listening;
- `dialogue-bauman-az.json` — contextual dialogue;
- `deep-speaking-bauman.json` — advanced productive speaking;
- `speaking-link-index.json` — derived bridge/index.

Do not collapse these datasets.

## Assessment migration boundary

`tests.json` remains current assessment content owner and `exercises.json` practice owner.

P3 only establishes content/schema ownership. First-attempt history, scoring authority, mastery, pass policy and persistence are P4 responsibilities.

## Derived index migration

Derived outputs must be reproducible from canonical IDs:
- knowledge index;
- speaking link index;
- search indexes;
- route manifests;
- dashboard aggregations.

A derived file may be checked into the package for performance/offline use, but checked-in status does not make it a fact owner.

## Planned canonical datasets

P3 resolves unique future owners for entity types that do not yet have a verified dataset, including competencies, linguistic functions, phonetics, phrases/collocations, reading, technical concepts, academic functions, performance tasks, error patterns, remediation paths and provenance.

These files are **planned owner paths**, not permission to create empty or fabricated linguistic content.

## Validation

Before any later runtime migration:
1. source record count/IDs captured;
2. aliases generated;
3. target IDs unique;
4. required references resolve;
5. no requires-cycle;
6. no dangling content graph edge;
7. non-diagnostic assessment maps to taught objectives;
8. no lesson lacks competency in migrated target;
9. migration run twice produces the same output;
10. rollback restores the previous source package without learner-state reset.

## Rollback

Until a specific migration is validated and promoted:
- existing runtime source remains authoritative;
- P3 design files are additive;
- rollback is deletion/revert of P3 design and validator artifacts.

Later migration PRs must retain the previous source or a deterministic reverse/alias route until acceptance proves compatibility.

## Production effect

None. P3 does not publish production.
