# Russian Engine Phase 5 — Durable Learning Loop

State: VALIDATING

## Goal

Close the learner loop without a backend:

interaction → local outbox → RU04 evidence → local derived metrics → resumable session → planner follow-up.

## RE26 — Browser evidence pipeline

Browser observations map to:
- one RU04 attempt candidate;
- one evidence candidate per competency.

All evidence remains non-authoritative.

## RE27 — Durable browser outbox

Storage is profile-scoped in localStorage.

The outbox:
- survives reload;
- recovers interrupted DELIVERING state;
- retries FAILED_RETRYABLE records;
- blocks raw voice/blob payloads;
- retains delivered history with a bound.

## RE28 — Learner metrics

Derived metrics include:
- independent semantic comprehension;
- support dependence;
- translation dependence;
- native-speed independent comprehension;
- transfer;
- response latency;
- repair success;
- pronunciation signal coverage;
- infrastructure failure rate.

No XP is used as ability evidence.

## RE29 — Browser session

Session state is resumable and records:
- exact content revision;
- evidence journal;
- pending outbox count;
- metrics snapshot;
- completion state.

Duplicate evidence IDs do not duplicate the session journal.

## RE30 — Internal beta

Opt-in URL:

`?ruEngine=beta-v1`

Backward compatible:

`?ruEngine=grounded-v1`

The beta uses the existing grounded experience but adds durable evidence delivery, reload recovery, metrics and planner follow-up.

## Privacy

No raw audio is stored by this pipeline.
No network telemetry is introduced.
No backend dependency is required.

## Rollout

Internal/explicit beta only.

No DEFAULT_ON.
No production claim until acceptance evidence passes.
