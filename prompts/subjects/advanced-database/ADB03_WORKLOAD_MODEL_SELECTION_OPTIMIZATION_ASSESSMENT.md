# ADB03 — WORKLOAD REASONING · MODEL SELECTION · OPTIMIZATION · ASSESSMENT

Mode:
`TRADEOFF-FIRST · MULTIPLE-VALID-SOLUTION-AWARE · BENCHMARK-SKEPTICAL`

# ENTRY
Requires ADB02.

# REASONING LOOP
Requirement
→ workload
→ access patterns
→ data shape
→ consistency/freshness
→ candidate models
→ index/partition strategy
→ query plan
→ benchmark
→ bottleneck
→ optimization
→ remeasure
→ trade-off.

# ASSESSMENT AREAS
- workload characterization;
- relational vs document/KV/graph/columnar/vector where in scope;
- index selection;
- composite index ordering;
- selectivity;
- partitioning;
- query-plan interpretation;
- estimate vs actual;
- statistics;
- benchmark design;
- optimization loop;
- denormalization;
- caching/materialization;
- ML data workloads;
- schema evolution;
- polyglot persistence.

# MULTIPLE VALID DESIGNS
Different stores/indexes/models may satisfy requirements.
Grade justification and trade-offs.

# ERROR TAXONOMY
WORKLOAD_MISREAD
MODEL_SELECTION_ERROR
INDEX_SELECTION_ERROR
SELECTIVITY_ERROR
COMPOSITE_INDEX_ORDER_ERROR
PARTITION_SKEW_ERROR
QUERY_PLAN_ERROR
CARDINALITY_ESTIMATE_ERROR
BENCHMARK_DESIGN_ERROR
BENCHMARK_OVERCLAIM
DENORMALIZATION_ERROR
CONSISTENCY_ERROR
SCHEMA_EVOLUTION_ERROR
ENGINE_ASSUMPTION_ERROR
ML_WORKLOAD_ERROR.

# HINT LADDER
H1 identify workload
H2 identify access pattern
H3 identify bottleneck
H4 inspect plan/statistics
H5 suggest candidate index/model
H6 suggest benchmark
H7 compare trade-offs
H8 full worked example if allowed.

# TEST-OF-TESTS
Known flawed recommendations must fail:
- index every filtered column;
- NoSQL is faster;
- wrong composite-index order;
- benchmark without context;
- sharding without rationale;
- document model with dangerous update duplication;
- graph DB for simple key lookup;
- vector DB without vector workload.

# DELIVERABLES
Create:
- `ADB_WORKLOAD_REASONING_CONTRACT.md`
- `ADB_MODEL_SELECTION_ASSESSMENT_CONTRACT.md`
- `ADB_INDEX_OPTIMIZATION_ASSESSMENT.md`
- `ADB_QUERY_PLAN_ASSESSMENT.md`
- `ADB_BENCHMARK_ASSESSMENT.md`
- `ADB_ERROR_TAXONOMY.json`
- `ADB_GOLDEN_VALID_ARCHITECTURES.json`
- `ADB_GOLDEN_BAD_RECOMMENDATIONS.json`
- `ADB04_INPUT_CONTRACT.md`

# PASS
PASS when assessment accepts multiple contextually valid designs and rejects technology-name/performance myths.

# FINAL PRINCIPLE
**OPTIMIZATION IS A MEASURED CHANGE AGAINST A WORKLOAD, NOT A LIST OF “BEST PRACTICES”.**
