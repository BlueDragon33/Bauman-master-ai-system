# BD06 — ACCEPTANCE · HARDENING · LEGACY CLOSURE · RC READINESS

Mode:

`DISTRIBUTED-CORRECTNESS-REGRESSION · FAILURE-RED-TEAMED · PERFORMANCE-SKEPTICAL · NO-KNOWN-BLOCKER`

# MISSION

Prove Big Data Processing is semantically correct, failure-safe, resource-bounded, observable, accessible and exact-RC ready.

# GATES

A canonical Big Data truth  
B reasoning/assessment  
C runtime/failure/recovery  
D observability/AI  
E UX/a11y/offline/security/performance  
F legacy/RC

# PARTITION MATRIX

Test:
- balanced;
- skewed;
- hot key;
- empty partition;
- excessive partition count;
- insufficient partitions;
- incompatible partition assumption.

# OPERATOR / AGGREGATION MATRIX

Test:
- associative/commutative safe aggregation;
- order-sensitive aggregation;
- partition-local vs global semantics;
- incorrect local combine.

# SHUFFLE MATRIX

Known shuffle/no-shuffle plans.
Visual and runtime evidence agree.

# JOIN MATRIX

Test:
- small×large;
- large×large;
- skewed key;
- duplicate keys;
- many-to-many explosion;
- missing keys;
- null/missing semantics according actual data model.

# SCHEMA MATRIX

Test:
- compatible revision;
- incompatible field type;
- required-field removal;
- unknown field;
- malformed record.

# DATA QUALITY

Test:
- missing;
- duplicate;
- invalid range;
- corrupt row/event;
- stale data where relevant.

# FAILURE / RETRY

Test:
- task failure;
- repeated retry;
- partial output;
- duplicate side effect;
- idempotent sink;
- failed worker simulation.

# CHECKPOINT / LINEAGE

Test:
- correct restore;
- stale checkpoint;
- incompatible job/schema;
- missing state.

# STREAMING

Only if scope:
- event vs processing time;
- late event;
- out-of-order event;
- window boundary;
- watermark;
- duplicate event;
- state recovery;
- sink semantics.

# DELIVERY SEMANTICS

Exactly-once-like claims require end-to-end scope evidence.
No marketing labels.

# RESOURCE MATRIX

Test:
- memory pressure;
- spill;
- CPU-bound;
- shuffle/network-heavy;
- straggler;
- bounded cancellation.

# PERFORMANCE INTEGRITY

Reject:
- toy benchmark → universal claim;
- different datasets/configs compared as if equal;
- warm/cold/cache differences hidden;
- different cluster sizes with no disclosure.

# OBSERVABILITY

Metrics/job/stage/task/retry/output identities match actual run.

# AI

AI must:
- not fabricate performance;
- not fabricate fault recovery;
- not claim exactly-once without evidence;
- not hide skew;
- not expose hidden data;
- not write official mastery.

# SECURITY

No production credentials.
No unbounded cloud/cluster access.
Safe datasets only.
Resource quotas enforced.

# OFFLINE

Small local/precomputed cases verified.

# ACCESSIBILITY

DAGs/timelines/partition views have structured alternatives.

# AUTHORING ACCEPTANCE

Author creates:
- partition task;
- DAG task;
- join task;
- failure task;
- schema task;
- performance task

without app-code edits.

# LEGACY CLOSURE

Resolve duplicate:
- runtime adapter;
- dataset registry;
- schema registry;
- pipeline registry;
- benchmark runner;
- observability provider;
- old routes/flags.

# FOUNDATION OWNER GATE

No duplicate Database/Advanced DB/ML/TS/Security/Lifecycle truth.

# MIGRATION

If canonical IDs/schema change:
aliases,
dataset migration,
pipeline migration,
run-history migration,
learner evidence preservation,
rollback.

# RC FREEZE

Freeze:
SHA,
content snapshot,
subject pack,
dataset versions,
schema revisions,
runtime/framework profile,
golden fixtures,
config,
lockfile.

# PRODUCTION SMOKE PROFILE

1. open Big Data subject;
2. inspect one dataset/workload;
3. inspect partition distribution;
4. run one bounded batch pipeline;
5. inspect DAG/shuffle/task evidence;
6. run one safe failure/retry case;
7. verify schema/data-quality state;
8. verify active runtime/subject pack revision;
9. verify optional AI grounded/fallback;
10. offline/precomputed case if supported.

# BLOCKERS

- distributed result differs from canonical semantics without explanation;
- hidden data loss;
- retry duplicates side effects incorrectly;
- unsupported exactly-once claim;
- stale checkpoint shown as valid;
- severe skew silently ignored in grader;
- AI fabricates cluster/job evidence;
- unsafe/unbounded runtime;
- duplicate canonical Big Data owner;
- migration corrupts learner evidence.

# DELIVERABLES

Create:
- `BD_ACCEPTANCE_MATRIX.md`
- `BD_PARTITION_SHUFFLE_REGRESSION.json`
- `BD_JOIN_AGGREGATION_ACCEPTANCE.md`
- `BD_BATCH_STREAM_SEMANTICS_ACCEPTANCE.md`
- `BD_FAILURE_RETRY_CHECKPOINT_REPORT.md`
- `BD_SCHEMA_DATA_QUALITY_REPORT.md`
- `BD_RESOURCE_PERFORMANCE_INTEGRITY_REPORT.md`
- `BD_AI_ACCEPTANCE_REPORT.md`
- `BD_SECURITY_RESOURCE_REPORT.md`
- `BD_ACCESSIBILITY_RESPONSIVE_REPORT.md`
- `BD_OFFLINE_PERFORMANCE_REPORT.md`
- `BD_LEGACY_CLOSURE_REPORT.md`
- `BD_RC_MANIFEST.json`
- `BD_PRODUCTION_SMOKE_PROFILE.md`
- `BD06_EVIDENCE_INDEX.md`

# PASS

PASS only when distributed semantics, partitioning, failures, recovery, schema, resources, observability and AI evidence agree; exact RC exists.

# FINAL PRINCIPLE

**THE RELEASE CANDIDATE MUST PROVE THAT SCALE AND FAILURE DO NOT CHANGE THE INTENDED DATA SEMANTICS.**
