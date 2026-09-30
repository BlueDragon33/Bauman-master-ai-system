# Russian P4 Mastery Ownership Matrix

Status: **P4 canonical ownership resolution**

| Capability | Canonical engine | Canonical state/store | Authorized writer | Readers / projections | Evidence source | Ownership |
|---|---|---|---|---|---|---|
| Assessment attempt history | `assessment-mastery.js` | `bauman_russian_assessment_mastery_v1.attempts` | assessment engine via `recordAssessmentAttempt` | core exam UI, analytics, dashboard | submitted item responses/evaluations | **ONE OWNER** |
| First-attempt index | `assessment-mastery.js` | `firstAttemptByAssessment`, `firstAttemptByItem` | assessment engine only | analytics/reporting | first submitted attempt | **ONE OWNER** |
| Official mastery evidence | `assessment-mastery.js` | `evidence`, `mastery` | `recordEvidence(authoritative=true)` only | dashboard/planner/P5 | validated retrieval/production/transfer/retention evidence | **ONE OWNER** |
| Stage-gate evidence/history | `assessment-mastery.js` | `stageGates` | canonical gate evaluator | core stage UI/planner | required competency evidence + attempt IDs | **ONE OWNER** |
| Legacy/live exam UI state | `core.js` | core `examProgress` / `examHistory` | core exam controller | presentation | compatibility projection | **NOT CANONICAL HISTORY** |
| Legacy 100-question / 80% quick-test | `core.js` | `testSession` | core controller | UI | recognition-heavy quiz | **GATE COMPONENT ONLY** |
| General cross-skill review queue | `learning-state.js` | `bauman_russian_learning_state_v1.reviewQueue` | learning-state review engine | Today/review UI | wrong/flagged/remediation events | **ONE OWNER IN SCOPE** |
| Vocabulary-card SRS schedule | `vocab-srs.js` | `bauman_russian_vocab_srs_v1` | vocab SRS engine | vocab/review UI | vocab recall signals | **ONE OWNER IN SCOPE** |
| Speaking practice signal | `speaking-coach.js` + core speech adapter | speaking-coach/core speech-result stores | speaking runtime | assessment engine may consume as signal | recording/transcript/self-confirmation | **SIGNAL, NOT MASTERY OWNER** |
| Handwriting evidence | dedicated handwriting runtime | handwriting state | handwriting engine | assessment may consume | actual trace/write/listen-write response | **SIGNAL SOURCE** |
| AI Mentor feedback | `ai-mentor-guard.js` | no official mastery store | AI guard only | UI | temporary coaching feedback | **NON-AUTHORITATIVE** |
| Presentation/dashboard | renderers | derived only | none for official mastery | learner UI | canonical state reads | **READ-ONLY AUTHORITY** |

## Ownership rules

1. `core.js` remains the current exam controller, but official immutable attempt history is written through `assessment-mastery.js`.
2. `examProgress` and `examHistory` are compatibility/live projections and are not allowed to overwrite canonical first attempts.
3. General review scheduling and vocabulary-card SRS remain separate scopes. A future unification may occur only through a migration with preserved due history.
4. Speaking/ASR/self-confirmation are evidence signals only. They cannot directly write official mastery.
5. Presentation and AI have no official mastery-write authority.
6. Any future new writer to `mastery`, `firstAttempt*` or `stageGates` is a P4 ownership violation unless this matrix is formally changed.
