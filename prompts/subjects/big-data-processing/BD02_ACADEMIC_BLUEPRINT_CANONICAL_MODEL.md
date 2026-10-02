# BD02 — ACADEMIC BLUEPRINT & CANONICAL BIG-DATA MODEL

Mode:

`WORKLOAD-FIRST · DISTRIBUTION-EXPLICIT · FAILURE-EXPLICIT · FRAMEWORK-NEUTRAL · CANONICAL-OWNER`

# ENTRY

Requires BD01.

# MISSION

Define one canonical distributed-data model consumed by lessons, runtimes, graders, visualizers, AI and authoring.

# OUTCOMES

Learner can:
- characterize data/workload scale;
- choose partition strategy;
- reason about distributed operators;
- identify shuffle;
- design batch pipeline;
- reason about streaming if in scope;
- choose data formats/storage abstractions;
- handle failure/retry;
- reason about idempotency;
- diagnose skew/resource bottlenecks;
- validate correctness;
- interpret observability;
- communicate performance/correctness trade-offs.

# CANONICAL ENTITIES

`DataSource`
`Dataset`
`DataRecord`
`EventStream`
`Schema`
`DataContract`
`DataFormat`
`Partition`
`PartitioningStrategy`
`StorageProfile`
`ProcessingJob`
`ProcessingMode`
`Operator`
`OperatorDAG`
`Stage`
`Task`
`Worker`
`ClusterProfile`
`Parallelism`
`Shuffle`
`JoinPlan`
`StateStore`
`Checkpoint`
`Offset`
`Window`
`Watermark`
`RetryPolicy`
`DeliverySemantics`
`IdempotencyContract`
`Lineage`
`Sink`
`DataQualityRule`
`ResourceProfile`
`JobMetric`
`FailureEvent`
`RecoveryAction`
`PipelineRun`
`Misconception`
`Remediation`

Only activate entities supported by actual scope.

# DATA SOURCE

Identity, provenance, access mode, schema/version, freshness.

# DATASET

Versioned logical data collection.

# EVENT STREAM

Only if actual scope:
ordered-by-source event sequence with event identity/timestamps.

# SCHEMA / DATA CONTRACT

Field semantics, types, nullable/required, compatibility rules, revision.

# DATA FORMAT

Physical encoding/file/message format.
Not the same as logical schema.

# PARTITION

Subset assigned for parallel/distributed processing.

# PARTITIONING STRATEGY

Possible:
hash,
range,
key-based,
round-robin,
time-based,
custom,
framework-specific.

Only actual supported strategies.

# PARTITION QUALITY

Consider:
balance,
locality,
key distribution,
future operators,
file count,
parallelism.

# PROCESSING MODE

Batch, stream, micro-batch or actual course modes.

# OPERATOR

Pure or stateful transformation semantics.

# OPERATOR DAG

Logical/physical execution dependency graph.
Framework DAG is a view of canonical processing semantics.

# STAGE / TASK

Runtime-specific execution decomposition with provenance.

# SHUFFLE

Data redistribution boundary across partitions/workers.

# JOIN PLAN

Inputs, keys, cardinality/skew assumptions, redistribution strategy.

# STATE

Only where processing requires retained cross-record/event state.

# CHECKPOINT

Recovery snapshot/state marker.
Not automatically equivalent to durable backup.

# OFFSET

Only if stream/log scope supports.

# WINDOW

Only if stream/time aggregation scope supports.

# WATERMARK

Only if event-time scope supports.
Represents progress/late-data policy according actual runtime semantics.

# EVENT TIME / PROCESSING TIME

Distinct first-class semantics where streaming is in scope.

# DELIVERY / PROCESSING SEMANTICS

At-most-once / at-least-once / exactly-once-like semantics only if actual course/runtime supports.

Never claim exactly-once without defining scope and sink semantics.

# IDEMPOTENCY CONTRACT

How repeated processing/writes avoid incorrect duplication.

# LINEAGE

Derivation dependency supporting trace/recomputation where applicable.

# RETRY POLICY

Failure class, scope, max attempts/backoff if in scope, idempotency implications.

# SINK

Output semantics:
append,
overwrite,
upsert,
transactional/idempotent as actual system supports.

# DATA QUALITY

Rule + scope + severity + handling + evidence.

# RESOURCE PROFILE

CPU, memory, disk, network, parallelism or actual available metrics.

# PIPELINE RUN

Immutable evidence:
input versions,
schema,
job config,
runtime/framework profile,
output identity,
metrics,
failure/retry history.

# PERFORMANCE CLAIM

Bind to exact data/workload/runtime/resource profile.

# DB BOUNDARY

Database owns logical query/database semantics.
BD owns distributed processing of data at scale.

# ML BOUNDARY

ML owns model training/evaluation.
BD owns scalable preparation/processing pipelines.

# TS BOUNDARY

Time Series owns forecasting/temporal validation.
BD owns event/data processing semantics at scale.

# DELIVERABLES

Create:
- `BD_ACADEMIC_BLUEPRINT.md`
- `BD_COMPETENCY_GRAPH.json`
- `BD_PREREQUISITE_GRAPH.json`
- `BD_CANONICAL_ENTITY_SCHEMA.json`
- `BD_DATASET_SCHEMA_CONTRACT.md`
- `BD_PARTITIONING_CONTRACT.md`
- `BD_OPERATOR_DAG_SHUFFLE_CONTRACT.md`
- `BD_BATCH_PROCESSING_CONTRACT.md`
- `BD_STREAM_PROCESSING_CONTRACT.md`
- `BD_FAULT_RETRY_IDEMPOTENCY_CONTRACT.md`
- `BD_RESOURCE_OBSERVABILITY_CONTRACT.md`
- `BD03_INPUT_CONTRACT.md`

# PASS

PASS when one canonical model describes the actual Big Data course independent of framework code.

# FINAL PRINCIPLE

**DISTRIBUTION CHANGES EXECUTION; IT MUST NOT SILENTLY CHANGE DATA SEMANTICS.**
