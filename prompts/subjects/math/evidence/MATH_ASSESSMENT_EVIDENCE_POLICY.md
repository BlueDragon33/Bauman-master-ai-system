# MATH03 · ASSESSMENT & EVIDENCE POLICY

Status: ACTIVE

## Evidence tiers
`exposure → progress → performance → mastery-input`

- route open / content view = exposure;
- workflow completion / self-report = progress;
- deterministic or validated assessment result = performance;
- only accepted performance that satisfies the global C4 policy may become mastery-input.

MATH03 never writes canonical mastery.

## Modes
Diagnostic, guided practice, independent practice, retrieval/review, checkpoint, exam, transfer and project modes may use different hint/reveal rules.

## First attempt
Preserve response, timestamp, content/problem revision, mode, hint state and evaluator revision. Retry appends a new attempt. Never overwrite the first attempt.

## Partial credit
Criterion-based only. A criterion identifies what evidence was demonstrated (setup, concept, major valid steps, interpretation, verification). Opaque AI confidence is never official partial credit.

## Idempotency
One submission token produces at most one stored attempt. Double-click/replayed events with the same token are deduplicated.

## Concurrency
The additive evidence ledger never updates an old attempt in place. Browser Locks are used when available; fallback write verifies/merges by immutable attemptId.

## Mastery boundary
Self-report `understood`, lesson completion and hint usage are metadata/progress, not mastery.
