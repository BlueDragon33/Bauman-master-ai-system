# Foundation 2.0 — L9 Universal Identity & Domain Model

## Status

L9 establishes a cross-subject foundation without changing existing subject data or UI runtimes. Existing Russian, Math, Foundation, AI, Programming, Research, Signal and Systems local IDs remain source-of-truth inside their current datasets until explicit adapters/migrations are introduced in later Foundation 2.0 rounds.

## Why L9 exists

Current subject datasets use useful local identifiers such as `R01`, `f_s01` and `f_s01_l1`. Those identifiers are valid inside their original subject, but are not globally safe because they do not encode entity type or namespace and may collide across domains.

L9 adds a canonical identity layer:

`bauman:<entityType>:<namespace>:<localId>`

Examples:

- `bauman:source:russian:lesson-001-ppt`
- `bauman:knowledge:russian:noun-gender`
- `bauman:competency:russian:classify-noun-gender`
- `bauman:task:russian:noun-gender-sort-001`
- `bauman:evidence:russian:noun-gender-sort-attempt-001`
- `bauman:artifact:research:note-001`
- `bauman:research:research:hypothesis-001`

Canonical identity is explicit. It is never generated from a display title, array index, random value or current timestamp.

## Seven V1 entity types

1. **source** — repository/external source and locator.
2. **knowledge** — concept, formula, definition, principle or method independent from presentation.
3. **competency** — durable capability statement.
4. **task** — requested action; does not own mastery.
5. **evidence** — immutable observation/result from a real action; does not set mastery.
6. **artifact** — durable output with lineage: note, code, report, dataset, figure, recording, submission, etc.
7. **research** — minimal future-ready research object for papers, claims, hypotheses, experiments, results, publications and dissertation chapters.

The research entity exists now only to reserve stable semantics. L9 does not implement the Research Operating System.

## Load-bearing invariants

### Identity

`id`, `entityType` and `namespace` are immutable. Renaming a title, moving a UI route or changing a lesson position cannot change canonical identity.

### Legacy compatibility

Legacy IDs are not rewritten in place. An explicit mapping links a legacy ID to a canonical ID. If legacy payload needs preservation, it can live under `extensions.legacy`.

### Knowledge vs presentation

A knowledge object identifies what is known. A future lesson renderer, simulation, drag/drop exercise, lecture view or AI tutor is only one presentation/application of that knowledge.

### Task, evidence and mastery separation

A task asks the learner/researcher to do something. Evidence records what actually happened. A future competency/mastery engine interprets evidence. `task` and `evidence` payloads are forbidden from directly writing `mastery`, `mastered` or `completionStatus`.

### Provenance

Provenance must point to a canonical `source` ID. Unknown provenance is left empty; the system must not invent a source.

### Artifact lineage

Artifacts keep canonical lineage links. This is required now so notes and assignments can later grow into reproducible research artifacts, publications and dissertation chapters without a second incompatible storage model.

### Extensions

New capabilities extend the model through `extensions` and adapters. Stable identity is not redesigned every time a new AI model, interaction type or external standard appears.

### Migration

Migration mode is **additive-pure**:

- input is never mutated;
- identity never changes;
- versions advance explicitly;
- existing top-level fields are not deleted;
- no random/time/title-derived canonical IDs;
- legacy payload may be preserved under `extensions.legacy`.

## Interoperability posture

The core is vendor-neutral. Future QTI, CASE, LTI, Open Badges and CLR support must be implemented as adapters instead of becoming dependencies of the core domain model.

## AI posture

AI may consume entities, explain, suggest, critique or draft. AI does not own canonical learner truth, mastery or research conclusions. Authoritative writes require an explicit policy outside this model.

## L9 boundary

L9 is intentionally non-visual. It must not modify:

- existing Russian L1–L8 runtime;
- Math runtime;
- Hub routing;
- Device Gate;
- existing subject content;
- existing legacy storage keys.

Only the new shared domain foundation, its validators/audit, its CI gate and this architecture note belong to L9.

## Exit criteria

L9 may be promoted only when:

- runtime validator passes;
- cross-subject ID audit passes;
- JavaScript syntax checks pass;
- L9 scope guard passes;
- existing whole-system integration CI remains green;
- PR remains additive and no legacy subject file is rewritten.

L10 must not start before these conditions are green.
