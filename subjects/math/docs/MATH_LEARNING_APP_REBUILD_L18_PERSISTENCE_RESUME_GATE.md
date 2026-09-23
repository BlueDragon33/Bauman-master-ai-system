# Math Learning Application Rebuild — LƯỢT 18 Persistence + Resume Learning Gate

## Result
**PASS — STATIC STATE-OWNERSHIP GATE**

## Canonical state
The existing local key `bauman_math_learning_flow_v1` remains the single learner-progress owner.
It is upgraded in place with schema version 2 instead of creating another storage engine.

`schemas/learner-state.schema.json` documents the contract.

## Persisted data
- current lesson pointer
- current step pointer
- per-lesson visited steps
- Lesson Check evidence
- lesson completion timestamp
- deterministic exercise/question results when source-backed grading is available
- last lesson activity time

## Derived, not duplicated
- chapter progress is derived from lesson snapshots;
- mastery is derived from Lesson Check evidence;
- review queue is derived from Lesson Check items marked `review`.

This avoids duplicate progress/mastery/review engines.

## Resume behavior
- Home can resolve the saved lesson before the Reader DOM has mounted.
- The canonical `Học` route first attempts to resume the saved lesson.
- Resume reuses the existing E129 route/state/render path.
- The saved step is activated after the Reader is rebuilt.
- If no valid saved lesson exists, the normal Reader route remains the fallback.

## Exercise persistence
`bauman:math:exercise-result` events are stored under the owning lesson in the same learner-state key.
A failed storage write does not fabricate a saved result.

## Gate
- one learner-state key: PASS
- schema version/migration compatibility: PASS
- current lesson pointer: PASS
- current step pointer: PASS
- completion persisted: PASS
- question result path: PASS
- review queue derived from persisted evidence: PASS
- mastery derived from persisted evidence: PASS
- Home resume-aware: PASS
- Learn route resume-aware: PASS
- duplicate mastery key writes in Lesson Player: 0

Full reopen/browser journey verification remains part of L22 and the CI/release gate.
