# Bauman Universal Domain Model — Foundation V1

This directory defines the long-lived domain foundation shared by learning, assessment, subject apps, AI capabilities, research workflows, and future doctoral tooling.

## Non-negotiable invariants

1. The foundation is additive. Existing subject storage, IDs, and contracts remain valid until an explicit migration proves safe.
2. Canonical IDs are stable and are never derived from display labels.
3. Knowledge is independent from presentation. The same knowledge object may be used by Russian, Math, Control, AI, research, or future renderers.
4. Tasks produce evidence. Evidence may support competency decisions but must not silently mutate mastery.
5. Artifacts retain lineage. Notes, code, reports, figures, datasets, papers, and dissertation material must remain traceable to the task/source/workflow that produced them.
6. Research is not a separate future database. Research objects extend the same identity, provenance, evidence, artifact, and workflow model.
7. AI is capability-based and model-agnostic. AI may explain, suggest, critique, draft, or simulate within policy; it cannot autonomously confirm mastery, accept research claims, publish work, or approve dissertation milestones.
8. Extensions must be namespaced and unknown extensions must survive round-trips.
9. Migrations must be versioned, idempotent, additive, and must never call destructive global storage resets.
10. New future technology should enter through adapters/providers/renderers before any core schema change is considered.

## Canonical identity

Pattern:

`bd:<kind>:<namespace>:<localId>`

Examples:

- `bd:knowledge:russian:gender-noun`
- `bd:competency:control:model-transfer-function`
- `bd:task:russian:lesson-01-gender-sort-01`
- `bd:evidence:russian:01JXYZ...`
- `bd:research:control:experiment-mpc-001`

The canonical ID is not a title and must not encode mutable UI wording.

## Core entity families

- `source` — original material and provenance.
- `knowledge` — concept independent from UI.
- `competency` — observable capability.
- `task` — learning/assessment/lab/research action.
- `evidence` — append-only observation.
- `artifact` — produced output with lineage.
- `workflow` — versioned process.
- `research` — research question, claim, hypothesis, experiment, result, publication, dissertation object.

## Relationship to existing Russian contracts

The Russian contracts remain authoritative for their current runtime scope:

- `RUSSIAN_LEARNING_STATE_V1`
- `RUSSIAN_CONTENT_CONTRACT_V1`
- `BAUMAN_SUBJECT_BRIDGE_V1`

Foundation V1 does not rename or rewrite those stores. Later L9 migration work will map legacy objects to canonical IDs through adapters while preserving the legacy key/value representation until migration gates prove safe.

## Gate philosophy

No later foundation layer may depend on display strings, implicit array positions, DOM IDs, or mutable filenames as permanent identity. A L9 gate must fail if a proposed migration destroys legacy state, changes canonical IDs after publication, or lets AI mutate protected canonical decisions.
