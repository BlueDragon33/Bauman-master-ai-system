# MATH03 · FIRST ATTEMPT INTEGRITY REPORT

Status: IMPLEMENTING

## Baseline
MATH01 proved Lesson Flow persistence but Activity Studio exercise-result events were not a durable official attempt ledger. Existing lesson completion/self-report state must remain untouched.

## MATH03 design
Additive local store: `bauman_math_reasoning_evidence_v1`.

Each pilot attempt records immutable:
- attemptId / submissionId;
- problemId + source exercise + canonical lesson/chapter;
- response snapshot;
- evaluator revision and verdict;
- evidence tier/dimensions;
- mode/hint metadata;
- timestamp.

First attempt is derived as the earliest immutable attempt. Retry appends. There is no update API for a stored attempt.

## Idempotency / concurrency
- duplicate submissionId is ignored;
- Web Locks serialize writes when available;
- fallback performs append-by-ID and post-write verification;
- stale evaluator results append their own immutable event and cannot overwrite newer learner work.

## Authority
The ledger is learner evidence, not canonical academic truth and not a mastery store. It makes no backend/academic write.

Exit evidence will be updated after browser/static golden tests pass.
