# BD01 — FORENSIC BASELINE
## Audit current Big Data reality before redesign

Mode:

`AUDIT-ONLY · NO-REDESIGN · REPOSITORY-TRUTH-FIRST`

# MISSION

Map actual Big Data content, datasets, runtimes, frameworks, processing semantics, assessments and ownership.

# 1. DISCOVERY

Search for:
- big data;
- distributed processing;
- batch;
- stream;
- ETL / ELT;
- partition;
- shard;
- distributed file;
- data lake;
- data warehouse;
- data format;
- Parquet/ORC/Avro or actual equivalents;
- Hadoop/Spark/Flink/Kafka/Beam/Hive/Trino or actual frameworks;
- DAG;
- stage/task;
- shuffle;
- skew;
- checkpoint;
- lineage;
- retry;
- idempotency;
- watermark/window;
- event time;
- cluster;
- executor/worker;
- data quality;
- observability.

Do not assume any listed technology is in scope.

# 2. DATASET / SCALE INVENTORY

Record:
- dataset identity;
- source;
- volume;
- row/event count;
- size;
- growth/rate;
- schema;
- key distribution;
- partitioning;
- temporal characteristics;
- version/provenance.

# 3. WORKLOAD INVENTORY

Classify actual:
- batch transform;
- aggregation;
- join;
- ETL;
- analytical query;
- stream;
- ML preparation;
- ingestion;
- export.

# 4. FRAMEWORK / RUNTIME AUDIT

For each runtime:
- framework;
- version;
- local/distributed mode;
- deployment profile;
- config;
- resource limits.

# 5. STORAGE AUDIT

Map actual:
- distributed files;
- object/file abstraction;
- database;
- lake/lakehouse;
- warehouse;
- stream log/broker;
- local fixtures.

# 6. DATA FORMAT AUDIT

Record actual file/message/table formats.

# 7. PARTITION AUDIT

Map:
- partition key;
- count;
- size distribution;
- ordering assumptions;
- skew;
- hot keys.

# 8. DAG / OPERATOR AUDIT

Find:
map/filter/project,
group,
aggregate,
join,
sort,
window,
repartition,
coalesce,
union,
other actual operators.

# 9. SHUFFLE AUDIT

Identify expensive network redistribution boundaries.

# 10. JOIN AUDIT

Record:
- join type;
- key cardinality;
- skew;
- broadcast/small-side strategies only if actual framework supports.

# 11. BATCH AUDIT

Map job lifecycle and deterministic reference semantics.

# 12. STREAM AUDIT

Only if actual scope:
event source,
event time,
processing time,
offset,
window,
watermark,
state,
late data,
delivery semantics.

# 13. FAULT-TOLERANCE AUDIT

Find:
retry,
recompute,
checkpoint,
lineage,
task failure,
worker failure,
partial output behavior.

# 14. IDEMPOTENCY AUDIT

Find side effects:
database writes,
file writes,
notifications,
external service calls.

Check duplicate behavior under retries.

# 15. SCHEMA / CONTRACT AUDIT

Find:
schema registry,
schema evolution,
backward/forward compatibility,
invalid records.

# 16. DATA QUALITY AUDIT

Find:
completeness,
uniqueness,
validity,
freshness,
referential constraints,
business rules.

# 17. PERFORMANCE AUDIT

Record:
runtime,
throughput,
latency,
CPU,
memory,
disk,
network/shuffle,
spill,
task skew,
parallelism.

# 18. OBSERVABILITY AUDIT

Find:
job status,
stage/task metrics,
logs,
traces,
data-quality metrics,
failure reason,
retry count.

# 19. ML / TS INTEGRATION AUDIT

Map Big Data outputs consumed by ML/Time Series without duplicating those models.

# 20. SECURITY AUDIT

Map:
access,
sensitive fields,
secrets,
isolation,
safe datasets,
resource abuse.

# 21. ASSESSMENT AUDIT

Classify:
partition reasoning,
DAG reasoning,
join/shuffle,
batch/stream semantics,
fault tolerance,
resource tuning,
data quality,
pipeline design.

# 22. GRADER AUDIT

Check exact-framework/code bias.
Multiple valid pipelines may exist.

# 23. AUTHORING AUDIT

Find how instructors create datasets, pipeline tasks, failure scenarios and expected properties.

# 24. DUPLICATE OWNER AUDIT

Find duplicate:
runtime adapters,
job registry,
dataset registry,
schema registry,
quality engine,
observability engine,
benchmark runner.

# 25. LEGACY

KEEP / MIGRATE / RETIRE / UNKNOWN.

# 26. RISK REGISTER

At minimum:
- skew;
- data loss;
- duplicate output;
- non-idempotent retry;
- stale checkpoint;
- schema break;
- framework lock-in;
- hidden resource explosion;
- false performance claim;
- duplicate owner.

# DELIVERABLES

Create:
- `BD01_EXECUTIVE_SUMMARY.md`
- `BD01_REPOSITORY_MAP.md`
- `BD01_DATASET_SCALE_INVENTORY.json`
- `BD01_WORKLOAD_RUNTIME_INVENTORY.json`
- `BD01_PARTITION_DAG_SHUFFLE_AUDIT.md`
- `BD01_BATCH_STREAM_FAULT_AUDIT.md`
- `BD01_SCHEMA_DATA_QUALITY_AUDIT.md`
- `BD01_PERFORMANCE_OBSERVABILITY_AUDIT.md`
- `BD01_ADJACENT_SUBJECT_MAP.md`
- `BD01_DUPLICATE_OWNER_MAP.md`
- `BD01_RISK_REGISTER.json`
- `BD02_INPUT_CONTRACT.md`

# PASS

PASS only when actual Big Data scope, frameworks, data scale, processing semantics, failure behavior and ownership are evidenced.

# FINAL PRINCIPLE

**AUDIT THE DISTRIBUTED EXECUTION AND FAILURE SEMANTICS, NOT JUST THE FRAMEWORK NAMES.**
