# Russian Engine RE01 — Forensic Architecture Baseline

State: VALIDATING

Track: Russian Engine

Branch: `work/russian-engine-foundation-v1`

## Scope

This baseline inspects current Russian runtime ownership only far enough to design an isolated Engine contract.

No general Russian App runtime file is modified by RE01.

## Existing runtime facts

Current Russian entry is a plain browser application loaded from `subjects/russian/index.html`.

Important existing owners already materialized:

- `subjects/russian/assets/assessment-mastery.js`
  - window owner: `RussianAssessmentMastery`
  - owns assessment attempts, evidence store and mastery projection.
- `subjects/russian/assets/adaptive-planner.js`
  - window owner: `RussianAdaptivePlanner`
  - builds explainable next-task plans from assessment/learning/SRS sources.
- `subjects/russian/assets/learning-state.js`
  - window owner: `RussianLearningState`
  - owns resume/review queue/history projections.
- `subjects/russian/assets/speech-interaction-engine.js`
  - owners: `RussianAudioEngine`, `RussianSpeechRecognitionAdapter`, `RussianRecordingEngine`.
- `subjects/russian/assets/speaking-coach.js`
  - existing speaking workflow consumes speech runtime and correctly treats ASR as a noisy signal.
- `subjects/russian/assets/core.js`
  - remains a large compatibility/orchestration owner and must not be bulk rewritten.
- `subjects/russian/assets/russian-optional-data-loader.js`
  - already supports chunk fallback for large dialogue/deep-speaking corpora.

The RU01/RU02 evidence also confirms:
- R01–R26 identity is protected;
- 243 units / 729 micro-lessons remain target curriculum evidence;
- existing learner-state storage keys must remain compatible;
- speech, mastery, SRS and planner owners must not be duplicated.

## Architectural conclusion

Russian Engine must NOT replace these owners in one rewrite.

Instead it introduces a stable public semantic boundary:

`Russian App → RussianEngineFacade → versioned contracts → adapter ports → existing/new canonical owners`

RE01 creates only the contract boundary.

## Public contract families

### Experience
Describes a learning experience without encoding UI layout.

### Interaction
Captures the learner action and support/timing context.

### Evidence
Contains observable learning signals only.

It explicitly forbids Engine-side mastery/credential/stage/level grants.

### LearnerSnapshot
Presents a derived multi-dimensional learner projection.

## Mastery boundary

Russian Engine observation evidence is always non-authoritative.

Existing RU04/C4-compatible assessment/mastery owner remains authoritative for learning judgment.

A later adapter may convert accepted Engine observation evidence into RU04 evidence according to explicit policy.

That adapter is NOT introduced in RE01.

## Storage conclusion

Current runtime uses several localStorage-backed owners.

RE01 does not add another learner database.

Future Engine storage must be injected through ports and must preserve export/migration/idempotency requirements.

## Multi-user conclusion

Existing state is effectively local-profile oriented.

New Engine contracts include a profile identity at projection/request boundaries, but RE01 does not implement authentication or remote tenant storage.

This keeps the path open:

single local profile
→ multiple local profiles
→ optional sync/account adapter
→ managed multi-user platform when justified.

## Performance conclusion

Large Russian datasets already require deferred/chunk-aware loading.

Engine contracts therefore reference stable IDs/content revisions and do not require eager loading of all 100 levels or all media.

## APP_INTEGRATION_REQUIRED

None for RE01 contract foundation.

Future RE09 integration will need an explicit minimal app allowlist before loading the Engine facade into the existing browser runtime.

## RE01 evidence created

- `subjects/russian/engine/public/contracts.mjs`
- `subjects/russian/engine/public/facade.mjs`
- JSON schemas under `subjects/russian/engine/schemas/`
- `subjects/russian/scripts/test-re01-engine-contracts.mjs`
- `subjects/russian/docs/engine/RE01_ARCHITECTURE_CONTRACT.json`

## Exit requirement

RE01 may become PASS only after:
- contract test executes successfully;
- no app/runtime file outside Engine/test/docs scope changed;
- Engine evidence cannot claim mastery;
- facade works with injected ports and no mandatory network/backend.
