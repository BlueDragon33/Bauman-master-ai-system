# Russian Engine RE17 — RU04 Evidence Bridge

State: VALIDATING

## Purpose

Map Engine observations into the current RussianAssessmentMastery owner without creating a second mastery store.

## Existing owner compatibility

The bridge targets the existing APIs:
- recordAssessmentAttempt;
- recordEvidence.

It does not call recordStageGate and cannot grant mastery.

## Mapping

One Engine observation becomes:
- one RU04 attempt candidate;
- one non-authoritative evidence candidate per competency ID.

Evidence IDs are deterministic from:
Engine evidence ID + competency ID.

Repeated application is therefore idempotent under the current owner.

## Attempt integrity

assessmentId is stable per Engine experience.

The existing RU04 owner preserves the first attempt for that assessment.

Retry uses a new attemptId and carries rootAttemptId metadata in the bridge evaluation payload.

It does not overwrite the first attempt.

## Mode separation

practice / assessment remains explicit in the attempt candidate and evidence result.

## Infrastructure failure

Provider/infrastructure failure becomes:
infrastructure-observation

with learnerImpact=false.

It is never translated into learner failure.

## Exit gate

PASS when mapping is idempotent, first attempt remains immutable, retry appends, mode is explicit, infrastructure failure does not hurt learner judgment, and all bridge evidence remains authoritative=false.
