# Russian P4 First-Attempt Integrity Report

## Baseline problem

Before P4:
- live exam answers/results were stored inside the broad core state;
- reset could remove current answers/paper result;
- `examHistory` stored summary rows but not a canonical immutable item-by-item first-attempt record;
- no dedicated attempt transaction identity existed;
- malformed/oversize core localStorage could fall back, and oversize data was deleted;
- manual speaking confirmation stored `score:100`, creating fake numeric precision.

## P4 correction

### Canonical attempt store
`assets/assessment-mastery.js` now owns immutable attempt records in:

`bauman_russian_assessment_mastery_v1`.

Each attempt includes:
- `attemptId`;
- `assessmentId`;
- content revision;
- mode;
- timestamp;
- item responses/evaluations;
- overall evaluation;
- first-attempt flag.

### Idempotency
Submitting the same `attemptId` twice returns the existing attempt and does not overwrite it.

### Retry
Resetting a live paper removes only the live paper projection/attempt pointer. The canonical prior attempt remains. A new retry gets a new `attemptId`.

### Legacy compatibility
`core.js` continues to maintain `examProgress` and `examHistory` for current UI behavior, but they are no longer the canonical first-attempt authority.

### State recovery
Malformed/oversize core state is preserved rather than deleted. Recovery metadata is separated and normal writes are blocked until an explicit recovery decision.

### Speaking truth
Manual “I spoke it well” confirmation no longer writes `score:100`. It stores a self-confirmation signal with `score:null`.

ASR numerical similarity is labeled transcript match, not pronunciation score.

## Required runtime proof before P4 PASS

- duplicate attempt ID is idempotent;
- retry is a separate attempt;
- first attempt remains unchanged;
- presentation rerender does not write canonical assessment/mastery state;
- non-authoritative evidence does not update mastery;
- malformed/oversize state is preserved;
- source/package behavior matches.
