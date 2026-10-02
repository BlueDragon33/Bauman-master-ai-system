# BD05 — LEARNING EXPERIENCE · AUTHORING · PRODUCT INTEGRATION

Mode:

`SHARED-DESIGN-SYSTEM · DISTRIBUTION-VISIBLE · NO-CODE-FIRST · ACCESSIBLE`

# ENTRY

Requires BD02–BD04.

# PRIMARY SURFACES

Possible:
- workload/scale canvas;
- dataset inspector;
- schema/data-contract view;
- partition explorer;
- storage/data-format explorer;
- operator DAG;
- stage/task timeline;
- shuffle/skew explorer;
- distributed join workspace;
- batch pipeline lab;
- stream lab if in scope;
- checkpoint/failure lab;
- resource profiler;
- data-quality view;
- observability dashboard;
- AI tutor;
- project/report.

# WORKLOAD / SCALE CANVAS

Show:
data size,
growth/rate,
operation pattern,
latency/throughput requirement,
freshness,
downstream consumer.

# DATASET INSPECTOR

Show:
version,
schema,
partitioning,
distribution,
quality.

# PARTITION EXPLORER

Visual + table representation.

# DAG UX

Operators and shuffle/state boundaries visually distinct.

# STAGE/TASK TIMELINE

Highlight skew/retries/stragglers.

# JOIN WORKSPACE

Compare candidate strategies under same data/workload.

# STREAM UX

Only if scope:
show event time vs processing time and late-data policy explicitly.

# FAILURE LAB

Show:
failure,
retry,
recovery,
duplicate risk,
output semantics.

# RESOURCE UX

Metrics contextualized by runtime/profile.

# OBSERVABILITY UX

Connect:
data → job → stage → task → output.

# AI TUTOR UX

Advisory and run-evidence grounded.

# ERROR NOTEBOOK

Recurring:
partition,
skew,
shuffle,
join,
schema,
retry,
idempotency,
checkpoint,
stream semantics,
resource overclaim.

# RESPONSIVE

Mobile:
- structured DAG list;
- partition/task cards;
- focused metric panels;
- graph alternatives.

# ACCESSIBILITY

Graphs/timelines require:
- structured tables/lists;
- keyboard access;
- non-color indicators;
- semantic labels.

# AUTHORING

No-code authoring can create:
- workload case;
- partition task;
- DAG/shuffle task;
- join task;
- batch pipeline;
- stream scenario if supported;
- failure/retry case;
- schema-evolution task;
- data-quality task;
- performance diagnosis task.

# FRAMEWORK ABSTRACTION

Ordinary authoring references canonical capabilities.
Framework-specific labs use adapters, not duplicated course structure.

# MULTIPLE VALID DESIGNS

Rubrics evaluate correctness/scalability/evidence, not exact framework syntax.

# PREVIEW

`dataset → partition → DAG → run → failure/metrics → grader`

# VALIDATION

Before review:
- dataset/schema refs valid;
- no hidden production credentials;
- runtime bounded;
- expected outputs/properties valid;
- invalid fixtures fail.

# SUBJECT MANIFEST

Register through Subject Factory.

# SUBJECT PACK

Canonical content + safe datasets + pipeline specs + precomputed/reference evidence.

# OFFLINE

Theory/small local simulations/precomputed runs where supported.

# ANALYTICS

Track:
partition choice,
pipeline edit,
run,
failure diagnosis,
optimization,
hint,
submission.

Do not treat cluster/runtime usage volume as mastery.

# DELIVERABLES

Create:
- `BD_SUBJECT_MANIFEST.md`
- `BD_LEARNING_BLOCK_REGISTRY.json`
- `BD_WORKLOAD_PARTITION_UX_CONTRACT.md`
- `BD_DAG_SHUFFLE_UX_CONTRACT.md`
- `BD_BATCH_STREAM_LAB_UX_CONTRACT.md`
- `BD_FAILURE_OBSERVABILITY_UX_CONTRACT.md`
- `BD_AUTHORING_SCHEMA_CONTRACT.md`
- `BD_SAFE_DATASET_PIPELINE_PACK_CONTRACT.md`
- `BD_RESPONSIVE_ACCESSIBILITY_MATRIX.md`
- `BD_SUBJECT_PACK_CONTRACT.md`
- `BD06_INPUT_CONTRACT.md`

# PILOTS

A — balanced vs skewed partitioning  
B — shuffle-heavy aggregation  
C — distributed join strategy  
D — retry/idempotent sink  
E — schema evolution  
F — resource bottleneck diagnosis  
G — no-code authoring

# PASS

PASS when the learner can see distributed execution semantics and ordinary Big Data cases are authorable without app-code edits.

# FINAL PRINCIPLE

**DO NOT TURN BIG DATA LEARNING INTO A “RUN SPARK” BUTTON; MAKE PARTITIONING, SHUFFLE, FAILURE AND EVIDENCE VISIBLE.**
