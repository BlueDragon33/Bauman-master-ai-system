# BD03 — DISTRIBUTED DATA REASONING · PERFORMANCE · ASSESSMENT

Mode:

`CORRECTNESS-FIRST · SHUFFLE-AWARE · SKEW-AWARE · FAILURE-AWARE · MULTIPLE-VALID-DESIGN-AWARE`

# ENTRY

Requires BD02.

# REASONING LOOP

Workload
→ data size/rate/distribution
→ partition
→ format/storage
→ operators
→ DAG
→ shuffle/state
→ parallelism/resources
→ failure/retry/idempotency
→ output semantics
→ measurement
→ optimization
→ validation.

# ASSESSMENT DIMENSIONS

Grade separately:
- workload characterization;
- partitioning;
- operator correctness;
- distributed aggregation;
- join reasoning;
- shuffle;
- skew;
- batch/stream semantics;
- fault tolerance;
- retry/idempotency;
- schema/data quality;
- resource reasoning;
- observability;
- optimization;
- correctness evidence.

# SMALL-DATA REFERENCE

Where feasible:
compare distributed result against trusted small-data/reference semantics.

# PARTITION REASONING

Assess:
- key distribution;
- number of partitions;
- hot keys;
- partition size;
- ordering assumptions;
- downstream operator needs.

# MORE PARTITIONS MYTH

More partitions can add overhead.

# FEWER PARTITIONS MYTH

Too few partitions can underutilize parallelism or create large tasks.

# DATA SKEW

Known fixture:
one/few keys dominate data/work.

# SHUFFLE

Learner identifies which operations trigger redistribution.

# DISTRIBUTED AGGREGATION

Associativity/commutativity/ordering matter depending operation.

# LOCAL COMBINE

Optimization must preserve semantics.

# JOIN

Assess:
- input sizes;
- key distribution;
- join cardinality;
- shuffle/broadcast-like strategies if supported;
- output explosion.

# SORT / ORDER

Global ordering differs from partition-local ordering.

# BATCH

Retry/recompute must preserve output semantics.

# STREAM

Only if in scope:
event order,
event time,
processing time,
state,
window,
watermark,
late data.

# DELIVERY SEMANTICS

Do not accept exactly-once label without scope/sink evidence.

# RETRY

Known fixture:
task retry produces duplicate external side effect.

# IDEMPOTENCY

Learner designs idempotent key/write behavior where relevant.

# CHECKPOINT

Checkpoint recovery must match exact state/job revision.

# SCHEMA EVOLUTION

Assess compatibility and downstream effect.

# DATA QUALITY

Bad/malformed/missing records require explicit handling.

# SMALL FILES

If in scope:
many tiny files can create metadata/scheduling overhead.

# SERIALIZATION / FORMAT

If in scope:
columnar/row-oriented/compression trade-offs by workload.

# CACHING

Cache may help repeated reuse; may hurt memory/resource pressure.

# RESOURCE REASONING

CPU vs memory vs network vs disk bottleneck.

# PERFORMANCE CLAIM

Requires:
data,
workload,
runtime,
config,
resource profile,
measurement protocol.

# COST

Only if actual course includes cost.
Do not make cloud-price claims without evidence.

# MULTIPLE VALID DESIGNS

Different partition/operator/runtime choices may be valid.

# ERROR TAXONOMY

`WORKLOAD_MISCHARACTERIZATION`
`PARTITIONING_ERROR`
`PARTITION_SKEW`
`HOT_KEY`
`OPERATOR_SEMANTIC_ERROR`
`SHUFFLE_MISREAD`
`JOIN_EXPLOSION`
`ORDERING_ERROR`
`DISTRIBUTED_AGGREGATION_ERROR`
`SCHEMA_COMPATIBILITY_ERROR`
`DATA_QUALITY_ERROR`
`RETRY_DUPLICATION`
`IDEMPOTENCY_ERROR`
`CHECKPOINT_MISMATCH`
`EVENT_TIME_ERROR`
`WATERMARK_ERROR`
`LATE_DATA_ERROR`
`RESOURCE_BOTTLENECK_MISREAD`
`PERFORMANCE_OVERCLAIM`
`FRAMEWORK_ASSUMPTION_ERROR`

# PARTIAL CREDIT

Separate semantic correctness from performance optimization.

# HINT LADDER

H1 inspect workload/data distribution  
H2 inspect partitioning  
H3 inspect operator/DAG  
H4 identify shuffle/state  
H5 inspect skew/join  
H6 inspect failure/retry/idempotency  
H7 inspect resources/metrics  
H8 full worked design if allowed

# TEST-OF-TESTS

Known invalid designs must fail:
- repartition everything;
- cache everything;
- more nodes always faster;
- retry non-idempotent write blindly;
- global-order assumption from partition-local sort;
- “exactly once” with unprotected external side effect;
- skew ignored;
- benchmark on toy data used as universal performance proof.

# AI BOUNDARY

AI may coach design.
It cannot invent distributed-run metrics or cluster behavior.

# DELIVERABLES

Create:
- `BD_DISTRIBUTED_REASONING_CONTRACT.md`
- `BD_PARTITION_SHUFFLE_ASSESSMENT.md`
- `BD_JOIN_AGGREGATION_ASSESSMENT.md`
- `BD_BATCH_STREAM_SEMANTICS_ASSESSMENT.md`
- `BD_FAULT_IDEMPOTENCY_ASSESSMENT.md`
- `BD_RESOURCE_PERFORMANCE_ASSESSMENT.md`
- `BD_ERROR_TAXONOMY.json`
- `BD_GOLDEN_VALID_PIPELINES.json`
- `BD_GOLDEN_INVALID_PIPELINES.json`
- `BD04_INPUT_CONTRACT.md`

# PASS

PASS when grader rejects faster-but-wrong pipelines and accepts multiple semantically valid scalable designs.

# FINAL PRINCIPLE

**DISTRIBUTED PERFORMANCE OPTIMIZATION IS VALID ONLY AFTER DISTRIBUTED CORRECTNESS IS PROVEN.**
