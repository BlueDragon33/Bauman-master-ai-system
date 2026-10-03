# MATH OFFLINE & MIGRATION ACCEPTANCE

Status: RC VALIDATION

Offline core promise:
- canonical lesson/formula content already packaged for the selected subject bundle;
- deterministic MATH03 evaluator/evidence behavior is local;
- MATH04 parser/numeric/graph-sampling/matrix/fixed-point providers are local;
- remote AI/CAS/geometry/vector may degrade to UNAVAILABLE without blocking core.

Migration invariants:
- keep subjectId `math`;
- preserve existing stage/chapter/lesson IDs and learner storage keys;
- retries append while first-attempt evidence remains immutable;
- no MATH06 migration rewrites historical attempts or mastery;
- legacy aliases may be retired only after direct + packaged regression.

The shared service-worker/package system owns actual install/update/sync behavior. Math RC provides no independent service-worker release path.
