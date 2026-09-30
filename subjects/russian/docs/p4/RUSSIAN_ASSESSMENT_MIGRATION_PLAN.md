# Russian P4 Assessment Migration Plan

Migration ID family: `RU-P4-ASSESSMENT-*`

## Strategy

P4 uses an **additive canonical store** instead of destructively rewriting the broad legacy core state.

`legacy live state → canonical attempt/evidence write on new events → compatibility projection remains readable`.

This avoids inventing historical detail that the old summary format never stored.

## Existing state sources

- core subject storage: exam answers, paper results, `examHistory`, stage gate projection;
- `bauman_russian_learning_state_v1`: general review queue/history;
- `bauman_russian_vocab_srs_v1`: vocabulary SRS;
- `bauman_russian_speaking_coach_v1`: speaking practice signals.

## New canonical state

`bauman_russian_assessment_mastery_v1` owns:
- attempt history;
- first-attempt indexes;
- official evidence;
- mastery evidence projection;
- canonical stage-gate history;
- weakness/event structures.

## Historical data rule

Do **not** fabricate item-level first-attempt history from old summary-only `examHistory`.

Legacy summaries may be retained/imported as:
- `LEGACY_SUMMARY` provenance;
- non-item-level historical evidence;
- not falsely labeled as reconstructed first attempts.

## New-event migration

From P4 onward:
1. learner answers in the existing core UI;
2. submit generates/stabilizes an `attemptId`;
3. canonical owner receives full item responses/evaluations;
4. duplicate submission with same attempt ID is ignored;
5. compatibility summary is then written to core live state.

## Retry

Reset clears the current-paper projection and its current attempt pointer only. It does not delete canonical attempts. The next submission creates a new attempt ID.

## Corrupt/oversize state

- detect;
- preserve raw value;
- write recovery metadata separately;
- block automatic overwrite;
- require explicit recovery/replacement decision.

No silent reset.

## Idempotency tests

- same attempt ID twice → one canonical attempt;
- same stage-gate transaction twice → one history row;
- reload → no new attempt;
- rerender → no canonical write;
- migration/import repeated → no duplicate entity/attempt.

## Rollback

P4 runtime changes are additive.

Rollback:
1. remove `assessment-mastery.js` script integration;
2. revert core adapter calls/recovery guard changes if necessary;
3. keep all existing legacy state untouched;
4. do **not** delete the new canonical state; retain it for recovery/export unless the user explicitly resets it.

## Forward compatibility

P5 may consume P4 evidence/due/weakness signals but must not become mastery authority. P6 may supply speaking/listening evidence signals but must not bypass P4.
