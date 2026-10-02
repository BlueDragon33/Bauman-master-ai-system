# BD04 — RUNTIME · BATCH · STREAM · FAILURE · OBSERVABILITY · AI

Mode:

`SAFE-DISTRIBUTED-LAB · FRAMEWORK-PROFILED · RESOURCE-BOUNDED · REPRODUCIBLE · AI-BOUNDED`

# ENTRY

Requires BD02/BD03.

# CAPABILITIES

Possible:
- `bd.dataset.inspect`
- `bd.partition.visualize`
- `bd.job.plan`
- `bd.batch.run`
- `bd.stream.simulate`
- `bd.join.experiment`
- `bd.skew.simulate`
- `bd.failure.inject`
- `bd.checkpoint.restore`
- `bd.schema.validate`
- `bd.quality.validate`
- `bd.resource.profile`
- `bd.observability.inspect`
- `bd.ai.tutor`

Only implement evidence-supported capabilities.

# RUNTIME PROFILE

Record:
framework,
version,
execution mode,
worker/executor profile,
parallelism,
memory/CPU limits,
serialization/config.

# SAFE DISTRIBUTED LAB

Prefer:
- local cluster;
- disposable sandbox;
- bounded synthetic/small public datasets;
- simulated failures.

Do not provide unrestricted expensive cloud/cluster execution.

# DATASET INSPECTOR

Show:
schema,
size,
partition count,
key distribution,
sample,
version/provenance.

# PARTITION VISUALIZER

Show:
partition sizes,
key distribution,
skew,
empty partitions.

# JOB PLAN

Display:
operators,
dependencies,
stage boundaries,
shuffle edges,
stateful operators.

# BATCH RUN

Bind:
input dataset versions,
schema,
job config,
runtime profile,
output identity.

# STREAM SIMULATOR

Only if scope:
event arrival,
event time,
processing time,
ordering,
late event,
window,
watermark,
state.

# JOIN EXPERIMENT

Compare alternative safe strategies under controlled data.

# SKEW SIMULATOR

Inject controlled heavy keys.
Observe task-duration/resource imbalance.

# FAILURE INJECTION

Safe simulated:
task failure,
worker loss,
retry,
checkpoint restore.

# SIDE EFFECT SAFETY

External sinks are mocked/local unless explicitly authorized.
Retry tests must not create real duplicate actions.

# CHECKPOINT RESTORE

Verify:
job/schema/state compatibility,
checkpoint identity,
output correctness.

# SCHEMA VALIDATION

Check contract/version compatibility.

# DATA QUALITY VALIDATION

Run explicit rules and handling path.

# RESOURCE PROFILE

Capture:
time,
CPU,
memory,
spill,
shuffle bytes,
records,
throughput/latency if available.

# OBSERVABILITY VIEW

Timeline:
job → stages → tasks → retries → output.

# STALE RUN

Old results cannot masquerade as current after:
data,
schema,
job,
runtime,
resource profile
changes.

# AI TUTOR MODES

`WORKLOAD_COACH`
`PARTITION_COACH`
`DAG_COACH`
`SHUFFLE_COACH`
`JOIN_COACH`
`STREAM_COACH`
`FAULT_TOLERANCE_COACH`
`RESOURCE_COACH`
`OBSERVABILITY_COACH`

# AI GROUNDING

Canonical pipeline + actual run evidence + learner attempt.

# AI EVIDENCE SAFETY

No fabricated:
runtime,
throughput,
shuffle,
memory,
fault recovery,
exactly-once behavior.

# SECURITY

No production credentials.
Datasets safe/authorized.
Network/resource bounds enforced.

# OFFLINE

Precomputed/local small-data distributed simulations where practical.

# DELIVERABLES

Create:
- `BD_RUNTIME_PROFILE_REGISTRY.json`
- `BD_DISTRIBUTED_LAB_CONTRACT.md`
- `BD_JOB_PLAN_SCHEMA.json`
- `BD_BATCH_RUNTIME_CONTRACT.md`
- `BD_STREAM_SIMULATOR_CONTRACT.md`
- `BD_FAILURE_RETRY_CHECKPOINT_CONTRACT.md`
- `BD_RESOURCE_OBSERVABILITY_CONTRACT.md`
- `BD_AI_TUTOR_CONTRACT.md`
- `BD_SECURITY_RESOURCE_BOUNDARY.md`
- `BD05_INPUT_CONTRACT.md`

# GOLDEN FIXTURES

At minimum:
- balanced partitions;
- severe skew;
- shuffle-heavy join;
- retry duplicate-side-effect case;
- checkpoint mismatch;
- schema evolution;
- resource bottleneck;
- event-time/late-event fixture only if stream scope exists.

# PASS

PASS when distributed labs are bounded, reproducible, evidence-backed and cannot claim unsupported semantics.

# FINAL PRINCIPLE

**THE LAB MUST SHOW WHAT THE DISTRIBUTED ENGINE DID, INCLUDING FAILURES AND SHUFFLES, NOT JUST THE FINAL ROW COUNT.**
