# RE21 — LIVE RU04 OWNER BINDING

Canonical owners: RU04 + RU08 + C3 + C4

Mission: connect opt-in Russian Engine learner observations to the existing RussianAssessmentMastery owner through the already validated RE17 bridge, without creating another mastery store and without changing default learner behavior.

## Activation
Only active inside an explicit Russian Engine opt-in runtime.
Current allowed opt-in:
`?ruEngine=grounded-v1`

No background write when the feature flag is absent.

## Flow
grounded interaction
→ Engine observation
→ RE17 evidence bundle
→ existing `RussianAssessmentMastery.recordAssessmentAttempt`
→ existing `RussianAssessmentMastery.recordEvidence`.

## Failure policy
If the owner is absent or incompatible:
- preserve the learner experience;
- do not fabricate persistence;
- record integration diagnostics;
- do not mark learner failure.

If RU04 persistence throws:
- surface integration failure in Engine diagnostics;
- keep the interaction result;
- do not retry in a loop.

## Authority
All emitted evidence remains `authoritative=false`.
RE21 never invokes stage-gate writes.
RE21 never directly mutates mastery.

## Idempotency
An observation may only be applied once per stable evidence ID within the mounted Engine controller.
Duplicate application must be safe under RU04 owner idempotency.

## Exit
PASS when opt-in grounded interactions write non-authoritative attempts/evidence to the real RU04 owner, feature-off writes nothing, owner absence fails soft, duplicate apply is safe and no mastery/stage gate mutation is possible.
