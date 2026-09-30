# Russian RU02 Validation Rules

State: **VALIDATING**  
Baseline: `9bfd57210e6d5c4593fe5dc116f12f513f99f5f6`

## Structural acceptance

RU02 must fail closed when any of the following occurs:

- stage identity/order changes from `vn → prep → hk1 → hk2 → hk3 → hk4`;
- R01–R26 is missing, duplicated, reordered or renamed as identity;
- the 243 Unit / 729 Micro-Lesson structural target drifts without an explicit migration;
- a Unit/Micro-Lesson has a dangling parent;
- a Macro Module teaches no competency;
- a competency has an unknown prerequisite, is untaught, or the prerequisite graph has a cycle;
- a canonical entity family has no declared owner;
- a materialized owner path is absent;
- an owner path exists while the registry still claims it is unmaterialized;
- Speaking / Dialogue / Deep Speaking ownership collapses into one dataset;
- `speaking-link-index` becomes canonical rather than derived;
- legacy lesson presentation is promoted to linguistic truth;
- a RU02 migration changes learner state, silently resets state, or switches runtime consumers;
- RU03/RU04 handoff loses the no-fabrication or evidence-truth boundary.

## Backward compatibility

RU02 intentionally does **not** switch consumers. Existing:
- `curriculum.json`;
- `lessons.json`;
- R01–R26 deep links;
- learner state keys;
- P4 mastery state;
- P5 planner state;
- P6 speech runtime;
- offline/package runtime

remain unchanged.

The new canonical model is an additive strangler layer. Runtime migration belongs to later integration only after browser/regression proof.

## Schema and provenance boundary

RU02 owns structural semantics only. It may define IDs, competencies, prerequisites and owner paths. It must not invent:
- stress;
- morphology;
- case government;
- aspect pair;
- lexical senses;
- pronunciation correctness;
- source authority.

Those are RU03 concerns.

## Test command

`node subjects/russian/scripts/validate-ru02-canonical-model.mjs`

This validator runs inside the Russian Reference UI Gate together with the existing P2/P3/P4–P11 gates.
