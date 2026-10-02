# ADB06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:
`WORKLOAD-REGRESSION · BENCHMARK-RED-TEAMED · ENGINE-AWARE · NO-KNOWN-BLOCKER`

# MISSION
Prove Advanced Database Systems is academically honest, engine-contextual, safe and release-ready.

# GATES
A canonical advanced DB truth
B reasoning/assessment
C engine/plan/benchmark
D post-relational/ML DB
E AI/UX/a11y/security
F legacy/RC.

# TEST MATRIX

## Workload
Validate dimensions/constraints.

## Index
Where supported:
- equality;
- range;
- low selectivity;
- composite order;
- covering;
- expression/partial;
- write-heavy downside.

## Query plan
- index used;
- index not used;
- stale statistics;
- cardinality misestimate;
- plan change by config/data.

## Partition
If scope:
pruning/no-pruning/skew/hot partition.

## Benchmark
Reject:
- one-shot timing;
- unmatched data scale;
- hidden cache differences;
- missing engine/config metadata;
- unfair cross-engine setup.

## Denormalization
Read gain vs write/integrity cost.

## Post-relational
Document/KV/graph/columnar/vector only if in scope.

## ML DB
Batch/offline vs online access and version consistency where in scope.

# MULTIPLE VALID ARCHITECTURES
Known alternative valid designs pass.

# BAD RECOMMENDATION LIBRARY
Known myths fail:
- index everything;
- NoSQL always faster;
- graph DB for everything;
- sharding first;
- denormalize all;
- vector DB for non-vector workload.

# SECURITY
No privileged production access.
Block admin/API escape.
Protect hidden fixtures.

# AI
Must ask workload context, interpret actual plan, avoid universal claims, not reveal hidden fixtures, not write mastery.

# RESPONSIVE/A11Y/OFFLINE/PERFORMANCE
Test actual supported matrix.

# LEGACY
Resolve duplicate engine registry, plan parser, benchmark runner, workload generator, data-model registry, old routes/flags.

# FOUNDATION OWNER GATE
No duplication of base SQL/transaction/index fundamentals.

# MIGRATION
If canonical IDs/schema change:
aliases, content migration, learner evidence, rollback.

# RC FREEZE
Freeze SHA, content snapshot, subject pack, engine profiles, benchmark fixtures, config, lockfile.

# PRODUCTION SMOKE PROFILE
1. open Advanced Database subject;
2. open one workload lesson;
3. run one safe plan/index lab;
4. verify engine/version/profile;
5. view benchmark with context;
6. open one post-relational comparison;
7. verify active subject pack;
8. verify sandbox isolation;
9. verify optional AI grounded/fallback;
10. offline cached lesson/precomputed experiment if supported.

# BLOCKERS
- universal false performance claims;
- benchmark missing critical context;
- learner lab reaches production DB;
- valid alternate architecture rejected systematically;
- plan visualizer lies;
- AI fabricates benchmark/plan;
- duplicate canonical owner;
- migration corrupts learner evidence.

# DELIVERABLES
Create:
- `ADB_ACCEPTANCE_MATRIX.md`
- `ADB_INDEX_PLAN_REGRESSION.json`
- `ADB_BENCHMARK_INTEGRITY_REPORT.md`
- `ADB_POSTRELATIONAL_ACCEPTANCE.md`
- `ADB_ML_DATABASE_ACCEPTANCE.md`
- `ADB_SECURITY_REPORT.md`
- `ADB_AI_ACCEPTANCE_REPORT.md`
- `ADB_ACCESSIBILITY_RESPONSIVE_REPORT.md`
- `ADB_OFFLINE_PERFORMANCE_REPORT.md`
- `ADB_LEGACY_CLOSURE_REPORT.md`
- `ADB_RC_MANIFEST.json`
- `ADB_PRODUCTION_SMOKE_PROFILE.md`
- `ADB06_EVIDENCE_INDEX.md`

# PASS
PASS only when workload context, model choice, plan evidence, benchmark evidence and trade-offs are consistent; sandbox/AI/UX gates pass; exact RC exists.

# FINAL PRINCIPLE
**THE RELEASE CANDIDATE MUST PROVE THAT PERFORMANCE CLAIMS SURVIVE CONTEXT, REPRODUCTION AND TRADE-OFF ANALYSIS.**
