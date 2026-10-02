# DB04 Query Plan Provider Contract

Capability: `db.plan.explain`

## Version binding

Every plan is bound to:
- engine family;
- exact/declared engine version;
- dialect/profile revision;
- fixture/data revision;
- statistics context if known;
- EXPLAIN vs ANALYZE mode.

## Pedagogical projection

Provider may map engine output to a pedagogical model:
- operator;
- access path;
- join strategy;
- estimated rows;
- cost;
- actual rows/time when ANALYZE is executed.

The pedagogical tree is not asserted to be the optimizer's literal internal representation.

## Estimate vs actual

Never merge estimated and actual fields.

Planner cost is relative/profile-specific, not universal milliseconds.

## Safety

ANALYZE is allowed only inside learner sandbox and under resource limits.

Parser failure must degrade to raw safe plan text/structured unsupported state, not invent operators.
