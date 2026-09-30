# Russian P1 Storage State Map

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

## Static storage-key candidates
- `bauman_russian_v11_clean_skeleton`
- `RUSSIAN_STAGE_TRANSITION_V1`
- `BAUMAN_SUBJECT_STAGE_TRANSITION`
- `russian:stage-transition`
- `BAUMAN_SUBJECT_SCHEDULE_REQUEST`
- `russian-line`
- `russian_handwriting.png`
- `russian_route_plan_v12_15.json`
- `russian_db_v12_10.json`
- `BAUMAN_ASSIGN_TASK`
- `BAUMAN_PLANNING_MISSION`
- `BAUMAN_TODAY_TASK`
- `BAUMAN_MAIN_TODAY`
- `BAUMAN_TODAY_GOAL`
- `BAUMAN_SCHEDULE_TODAY`
- `BAUMAN_SUBJECT_READY`
- `BAUMAN_SUBJECT_DATA_SOURCES_READY`
- `BAUMAN_SUBJECT_REQUEST_TODAY`
- `BAUMAN_SUBJECT_CAPABILITY_ROUTE_APPLIED`
- `RUSSIAN_CAPABILITY_ROUTE_RECEIPT_V1`
- `BAUMAN_REQUEST_SUBJECT_MANIFEST`
- `BAUMAN_PING`
- `BAUMAN_SUBJECT_MANIFEST`
- `BAUMAN_PONG`
- `russian:mini-check`
- `bauman_russian_learning_state_v1`
- `bauman_russian_survival_master_v11_clean_skeleton`
- `RUSSIAN_LEARNING_STATE_V2`
- `RUSSIAN_LEARNING_STATE_V1`
- `russian:learning-state`
- `bauman:host-task`
- `bauman_russian_learning_flow_v1`
- `RUSSIAN_LEARNING_FLOW_V2`
- `RUSSIAN_LEARNING_FLOW_V1`
- `bauman_russian_vocab_srs_v1`
- `RUSSIAN_VOCAB_SRS_V1`
- `russian:vocab-srs`
- `bauman_russian_speaking_coach_v1`
- `RUSSIAN_SPEAKING_COACH_V2`
- `RUSSIAN_SPEAKING_COACH_V1`
- `russianGlobalSearch`
- `russianSearchHints`
- `russianLearningNav`
- `RUSSIAN_FUTURE_REFERENCE_UI_V1`
- `RUSSIAN_LIVE_REVIEW_OVERLAY_V1`
- `RUSSIAN_CAPABILITY_FOCUS_V1`
- `BAUMAN_SUBJECT_WARNING`
- `BAUMAN_SUBJECT_PROGRESS`
- `bauman_universal_core_v1_russian`
- `bauman_subject_core_v5_russian`
- `RUSSIAN_PACK_SELF_CONTAINED_V1_FINAL`
- `BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS`
- `russian-adapter-russianpack-r4-final-main-qa`
- `RUSSIAN_AI_MENTOR_CONTEXT_V1`
- `bauman_russian_academic_language_v1`
- `RUSSIAN_ACADEMIC_LANGUAGE_V1`

## Storage API references
| File | localStorage | sessionStorage | IndexedDB | Mastery refs | Progress refs | Review refs |
|---|---:|---:|---:|---:|---:|---:|
| `assets/core.js` | 10 | 0 | 0 | 2 | 141 | 489 |
| `assets/learning-state.js` | 3 | 0 | 0 | 0 | 9 | 120 |
| `assets/learning-flow.js` | 3 | 0 | 0 | 0 | 2 | 37 |
| `assets/vocab-srs.js` | 8 | 9 | 0 | 0 | 0 | 19 |
| `assets/speaking-coach.js` | 4 | 4 | 0 | 2 | 0 | 10 |
| `assets/russian-future-ui.js` | 2 | 0 | 0 | 0 | 26 | 45 |
| `assets/planning-bridge.js` | 0 | 0 | 0 | 2 | 7 | 77 |
| `assets/subject-adapter.js` | 0 | 0 | 0 | 0 | 2 | 12 |
| `assets/ai-mentor-guard.js` | 1 | 0 | 0 | 2 | 0 | 9 |
| `assets/academic-language.js` | 3 | 0 | 0 | 2 | 0 | 19 |

## Current conclusion
- Static counts alone do not prove canonical state ownership.
- The P1 browser probe captures actual local/session storage keys, IndexedDB database names, Cache Storage names and presentation-only rerender writes.
- Any `open/render → mastery/progress write` found by runtime evidence is a CRITICAL finding.
- No state migration or reset is allowed in P1.
