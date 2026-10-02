# ADB01 — FORENSIC BASELINE

Mode:
`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION
Map actual advanced-database content, engines, workloads, optimizers, post-relational models and assessments.

# DISCOVERY
Search for:
- DB optimization;
- ML database workloads;
- feature/data pipelines;
- post-relational DB;
- NoSQL;
- document stores;
- key-value;
- graph DB;
- columnar stores;
- vector DB/embedding search if present;
- indexing;
- query planning;
- partitioning/sharding;
- caching/materialization;
- benchmarks;
- migration/interoperability;
- AI tutor.

# FOUNDATION OVERLAP
Identify content already owned by base Database subject:
SQL, relational algebra, normalization, transactions, base indexing, base query plans.
Do not duplicate.

# WORKLOAD INVENTORY
Record evidence-supported:
- read/write profile;
- analytical/transactional behavior;
- ML feature/training retrieval;
- batch/stream-like workloads if present;
- graph/document/KV/vector access.

# ENGINE INVENTORY
Record engines/providers and versions.

# DATA MODEL INVENTORY
Classify actual:
relational/document/KV/graph/wide-column/columnar/object-post-relational/vector.

# INDEX AUDIT
Inspect advanced index types actually present.

# PARTITION/SHARD AUDIT
If present:
partition key, pruning, skew, rebalancing, hotspot.

# QUERY PLAN AUDIT
Record plan format, estimates, actual, statistics, join strategies, scans.

# BENCHMARK AUDIT
Record:
dataset, workload, cache state, hardware/runtime, engine config, repetitions, metric.

Flag misleading claims.

# ML-DATABASE AUDIT
Look for:
feature storage, training-data retrieval, embeddings, dataset versioning, serving interaction.

# POST-RELATIONAL AUDIT
Map actual nested/JSON/object/document/graph/KV/flexible-schema/polyglot concepts.

# CONSISTENCY AUDIT
If relevant, record actual semantics; avoid slogan-only CAP teaching.

# ASSESSMENT AUDIT
Find engine selection, workload design, plan interpretation, index selection, benchmark diagnosis, model comparison, migration tasks.

# GRADER AUDIT
Check hard-coding of one engine/plan/index/data model.

# SECURITY AUDIT
Learner isolation, credentials, admin APIs, remote clusters.

# DUPLICATE OWNER AUDIT
Find duplicate:
plan parser, benchmark runner, engine registry, workload generator, data-model registry.

# LEGACY
KEEP / MIGRATE / RETIRE / UNKNOWN.

# DELIVERABLES
Create:
- `ADB01_EXECUTIVE_SUMMARY.md`
- `ADB01_REPOSITORY_MAP.md`
- `ADB01_WORKLOAD_INVENTORY.json`
- `ADB01_ENGINE_DATA_MODEL_INVENTORY.json`
- `ADB01_INDEX_PLAN_BENCHMARK_AUDIT.md`
- `ADB01_POSTRELATIONAL_SCOPE_AUDIT.md`
- `ADB01_ML_DATABASE_SCOPE_AUDIT.md`
- `ADB01_DUPLICATE_OWNER_MAP.md`
- `ADB01_RISK_REGISTER.json`
- `ADB02_INPUT_CONTRACT.md`

# PASS
PASS only when actual advanced scope is known and duplication with base Database is resolved.

# FINAL PRINCIPLE
**DO NOT BUILD AN “ADVANCED” COURSE BY RANDOMLY ADDING DATABASE BUZZWORDS.**
