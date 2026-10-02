# ADB04 — ENGINE LABS · QUERY PLAN · BENCHMARK · POST-RELATIONAL · AI

Mode:
`CONTROLLED-ENGINE · REPRODUCIBLE-WORKLOAD · RESOURCE-BOUNDED · AI-BOUNDED`

# ENTRY
Requires ADB02/ADB03.

# CAPABILITIES
Possible:
- `adb.engine.run`
- `adb.plan.explain`
- `adb.workload.generate`
- `adb.benchmark.run`
- `adb.index.experiment`
- `adb.partition.experiment`
- `adb.document.lab`
- `adb.kv.lab`
- `adb.graph.lab`
- `adb.vector.lab`
- `adb.migration.lab`
- `adb.ai.tutor`

Only evidence-supported capabilities.

# ENGINE REGISTRY
Each profile includes engine, version, config, dialect/API, data model, consistency notes and plan format.

# SANDBOX
No privileged production DB access.

# RESETABILITY
Labs start from deterministic fixtures.

# QUERY PLAN
Parse/render exact engine/version.

# INDEX/PARTITION EXPERIMENTS
Run before/after plan and metrics.

# BENCHMARK RUN
Record engine, config, dataset, scale, workload, cache state, repetitions and metrics.

# CROSS-ENGINE
Compare only with aligned workload/setup.

# POST-RELATIONAL LABS
Document/KV/graph/columnar/vector only if in actual scope.

# ML DB LAB
If in scope: feature/training data access patterns.

# MIGRATION LAB
Safe source/target fixture + validation + rollback.

# AI MODES
WORKLOAD_COACH
MODEL_SELECTION_COACH
INDEX_COACH
PLAN_COACH
BENCHMARK_COACH
POSTRELATIONAL_COACH
MIGRATION_COACH.

# AI GROUNDING
Canonical workload + actual engine profile + plan + benchmark + learner attempt.

# AI SAFETY
No universal performance claims.
No hidden fixtures.
No official grading.

# SECURITY
Block filesystem/network/admin escape, production credentials and unbounded workloads.

# RESOURCE LIMITS
Timeout, rows, memory, storage, benchmark duration.

# OFFLINE
Local/precomputed labs where feasible.

# DELIVERABLES
Create:
- `ADB_ENGINE_PROFILE_REGISTRY.json`
- `ADB_ADVANCED_SANDBOX_CONTRACT.md`
- `ADB_QUERY_PLAN_PROVIDER_CONTRACT.md`
- `ADB_WORKLOAD_GENERATOR_CONTRACT.md`
- `ADB_BENCHMARK_RUN_SCHEMA.json`
- `ADB_POSTRELATIONAL_LAB_CONTRACT.md`
- `ADB_ML_DATABASE_LAB_CONTRACT.md`
- `ADB_AI_TUTOR_CONTRACT.md`
- `ADB_SECURITY_RESOURCE_BOUNDARY.md`
- `ADB05_INPUT_CONTRACT.md`

# PASS
PASS when advanced DB labs are reproducible/contextual and never become universal academic authority.

# FINAL PRINCIPLE
**RUN THE WORKLOAD, RECORD THE CONTEXT, THEN INTERPRET THE RESULT.**
