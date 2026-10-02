# BD00 — BIG DATA PROCESSING MASTER ORCHESTRATOR

Mode:

`EVIDENCE-FIRST · WORKLOAD-FIRST · DISTRIBUTION-AWARE · FAILURE-AWARE · CONSTITUTION-ROUTED · TOKEN-EFFICIENT`

# PURPOSE

Coordinate BD01–BD06, owner routing, evidence requirements and selective revalidation.

# OWNERS

BD01 — current reality.
BD02 — canonical distributed-data ontology.
BD03 — distributed-data reasoning and assessment.
BD04 — runtime/batch/stream/observability/AI.
BD05 — learner UX/authoring/integration.
BD06 — acceptance/hardening/legacy/RC.

# NON-NEGOTIABLE INVARIANTS

- Workload and data scale/rate are explicit.
- Partitioning is explicit.
- Data and operator semantics are preserved across distribution.
- Shuffle/state boundaries are visible.
- Retry semantics are explicit.
- Idempotency is required where retries can duplicate side effects.
- Fault tolerance cannot silently change correctness.
- Event time and processing time are distinct where streaming is in scope.
- Delivery/processing guarantees must be evidenced, not advertised.
- Schema/data-contract revision is explicit.
- Runtime/framework/version is provenance, not academic truth.
- AI cannot fabricate benchmark, cluster or fault-recovery evidence.

# EVIDENCE HIERARCHY

canonical distributed-data contract
→ deterministic small-data reference
→ partition/operator property tests
→ controlled distributed run
→ failure/retry test
→ resource/performance evidence
→ observability
→ visualization.

# FINAL PRINCIPLE

**BIG DATA ENGINEERING IS CORRECT DISTRIBUTED DATA PROCESSING UNDER SCALE, FAILURE AND RESOURCE CONSTRAINTS.**
