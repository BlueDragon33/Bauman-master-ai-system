# Russian P1 Engine Ownership Matrix

Base SHA: `0ed6a1739f8e5010d05f5dc71f4558cf238bb87c`

| Capability | Canonical engine candidate | Alternative/touching engine | Status |
|---|---|---|---|
| Lesson state | `learning-state.js` | `core.js` | UNCLEAR_OWNER |
| Progress | `learning-state.js` / `learning-flow.js` | `core.js`, Future UI reads | UNCLEAR_OWNER |
| Learning flow | `learning-flow.js` | `core.js` | MULTIPLE_TOUCH |
| SRS / vocab review | `vocab-srs.js` | `core.js` | CANDIDATE_ONE_OWNER |
| Speaking | `speaking-coach.js` | `core.js` | MULTIPLE_TOUCH |
| Speech recognition | `speaking-coach.js` candidate | browser/provider API | NEEDS_RUNTIME |
| Handwriting | dedicated handwriting runtime (separate files) | `core.js` integration | NEEDS_SECOND_SCAN |
| Assessment | `core.js` candidate | learning state/flow | UNCLEAR_OWNER |
| AI Mentor | `ai-mentor-guard.js` boundary | `core.js` entry UI | BOUNDED_CANDIDATE |
| Academic language | `academic-language.js` | `core.js` | CANDIDATE_ONE_OWNER |
| Planning integration | `planning-bridge.js` + `subject-adapter.js` | Hub/shared bridge | CONTRACT_SPLIT |

## Rule
No P2–P6 schema/engine rewrite may proceed while mastery/progress/assessment writer is `UNCLEAR_OWNER`. Runtime/state evidence from the P1 PR is required before the ownership flags can be closed.
