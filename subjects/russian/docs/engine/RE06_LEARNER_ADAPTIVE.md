# Russian Engine RE06 — Learner Projection & Adaptive Recommendation

State: **PASS**

## Principle

RE06 does not create a second mastery writer, SRS writer or planner owner.

It builds pure derived projections from evidence.

Canonical RU04/C4 learning judgment remains unchanged.

## Learner projection

The projection is profile-scoped and derives, per competency:
- observation count;
- success/failure observations;
- independent successes;
- supported successes;
- average support level;
- response-time observations when present;
- evidence types;
- last observed timestamp.

These are descriptive signals, not official mastery.

## Support dependency

The projection tracks:
- evidence count;
- translation-level support usage;
- high-support observations;
- independent observations.

This allows the product to distinguish “can do independently” from “can do with heavy help”.

## Review candidates

Review candidates are derived from:
- observed learner failure;
- high support dependency.

Provider/infrastructure outage is explicitly excluded from review debt.

Thus:
`ASR unavailable != learner weakness`

## Adaptive recommendation

The pure recommender can return:
- diagnostic-probe;
- introduce;
- reinforce;
- remediate;
- review;
- transfer-probe;
- advance-probe.

It always returns:
`masteryMutation:false`

The recommendation tells the runtime what to try next.

It does not certify that a level or competency is mastered.

## Profile isolation

Evidence belonging to another explicit profile is ignored.

This is an architectural prerequisite for later multi-user scale.

## Files

- `subjects/russian/engine/learner/learner-projector.mjs`
- `subjects/russian/engine/learner/adaptive-recommender.mjs`
- `subjects/russian/engine/tests/test-re06-learner-adaptive.mjs`

## Validation

Executed against the branch implementation: **14/14 checks PASS**.

Verified:
- deterministic learner projection;
- explicit profile A/B isolation;
- provider outage creates no learner review debt;
- independent and supported observations stay separate;
- observed failure and high-support dependency produce different review reasons;
- adaptive recommendations are explainable;
- transfer milestone produces a transfer probe, not mastery;
- all recommendations keep `masteryMutation:false`.

## Exit

**RE06 PASS.**
