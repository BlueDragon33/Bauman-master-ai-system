# BIG DATA PROCESSING TECHNOLOGIES PROMPT SYSTEM
## Bauman IU5 · Технологии обработки больших данных
## Constitution-routed subject architecture + canonical execution runbook

Repository:

`BlueDragon33/Bauman-master-ai-system`

Primary subject scope:

`subjects/big-data/`

or the actual repository scope discovered by BD01.

---

# 0. PURPOSE

This package defines the subject architecture for the Bauman IU5 elective course:

**Технологии обработки больших данных — Big Data Processing Technologies**

It is the selected branch replacing the alternative Multimedia Systems elective for the current roadmap.

It reuses the shared constitutions:

- C1 — Extensible Platform Architecture
- C2 — Future Professional UI/UX
- C3 — Professional QA + Auto-Fix
- C4 — Real Learning & Outcome System

**This README is the single execution runbook.**

No separate execution cheat sheet is required.

The central subject chain is:

`Data Source`
→ `Ingestion`
→ `Schema / Data Contract`
→ `Partition`
→ `Distributed Storage`
→ `Batch / Stream Processing`
→ `Operator / DAG`
→ `Shuffle / State`
→ `Fault Tolerance`
→ `Output / Sink`
→ `Downstream Analytics / ML`
→ `Performance`
→ `Observability`
→ `Evidence`.

---

# 1. FOUNDATION DEPENDENCIES

Reuse:

- Database Systems & SQL
- Advanced Database Systems
- Algorithms & Data Structures
- Python
- Multivariate Data Analysis & Machine Learning
- Time Series Analysis where temporal/event streams overlap
- Neural Network Systems only as a downstream consumer
- Lifecycle & Systems Engineering
- Information Security
- Research Methodology

Do not duplicate foundational SQL, data modeling, generic algorithms, generic ML training, generic forecasting, or security truth.

---

# 2. SUBJECT OWNERSHIP

BD owns subject-specific:

- characteristics of large-scale data processing;
- workload/scale reasoning;
- distributed data-processing abstractions;
- partitioning for distributed processing;
- data locality where relevant;
- distributed execution plans / DAGs;
- stages/tasks/operators;
- map/filter/reduce/join/group/aggregate at distributed scale;
- shuffle reasoning;
- distributed joins and skew;
- batch-processing pipelines;
- stream/event-processing concepts only if actual scope supports;
- event time / processing time only if actual scope supports;
- windows/watermarks/late events only if actual scope supports;
- stateful stream processing only if actual scope supports;
- offsets/checkpoints only if actual scope supports;
- retry/idempotency semantics;
- delivery/processing guarantees only if actual scope supports;
- fault tolerance;
- lineage/recomputation;
- checkpoint/recovery;
- cluster/resource reasoning;
- parallelism / partition count;
- memory/disk/network trade-offs;
- serialization/data format trade-offs where supported;
- distributed file/data-lake concepts where supported;
- schema evolution/data contracts at pipeline scale;
- ingestion and ETL/ELT at scale;
- data quality at scale;
- small-files / partition explosion / data-skew problems;
- distributed query/processing optimization;
- observability for distributed data jobs;
- pipeline reproducibility;
- downstream ML/analytics integration;
- cost/performance reasoning only to actual course depth.

BD does not automatically own:

- relational SQL semantics — Database Systems;
- database-internal query optimization — Advanced Database;
- generic B-tree/hash/graph algorithms — Algorithms;
- generic distributed-systems theory — only what BD01 proves necessary;
- generic ML training/evaluation — ML;
- generic time-series forecasting — Time Series;
- generic neural training — Neural Networks;
- cloud billing/platform administration — infrastructure owner;
- cybersecurity — Information Security;
- generic project management — Project Management;
- multimedia processing — deferred elective alternative.

---

# 3. TECHNOLOGY-NEUTRAL RULE

The canonical subject model MUST remain technology-neutral.

Frameworks such as Hadoop, Spark, Flink, Kafka, Beam, Hive, Trino, ClickHouse, Iceberg, Delta, Hudi or cloud-native services may be supported **only if BD01 evidence proves they belong to the repository/course scope**.

Do not make any vendor/framework the academic truth.

---

# 4. ACTIVE MODULES

- `BD_MASTER_PROMPT.md` — BD00 orchestration
- `BD01_FORENSIC_BASELINE.md`
- `BD02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `BD03_DISTRIBUTED_DATA_REASONING_ASSESSMENT.md`
- `BD04_RUNTIME_BATCH_STREAM_OBSERVABILITY_AI.md`
- `BD05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `BD06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `BD_CONSTITUTION_ROUTER.json`
- `BD_ARCHITECTURE_MAP.md`
- `STATUS.md`
- `MANIFEST.json`

---

# 5. EXECUTION COMMAND

Work/Codex instruction:

> Thực thi môn Big Data Processing Technologies theo `BIG_DATA_PROCESSING_PROMPT_SYSTEM/00_README.md`. Đọc `STATUS.md`, xác định module active, chỉ nạp điều khoản Hiến pháp do `BD_CONSTITUTION_ROUTER.json` route tới. Tiếp tục từ evidence hiện tại; không re-audit toàn hệ nếu diff không yêu cầu. Không canonicalize framework/công nghệ chưa được BD01 evidence xác nhận. Chỉ chuyển module khi exit gate PASS.

---

# 6. EXECUTION ORDER

`BD00 context`

→ `BD01 forensic baseline`

→ `BD02 academic/canonical foundation`

→ `BD03 distributed-data reasoning + assessment`

→ `BD04 runtime/batch/stream/observability/AI`

→ `BD05 learning experience + authoring + integration`

→ `BD06 acceptance + hardening + RC`

→ shared production release.

---

# 7. STARTING PROCEDURE FOR EVERY SESSION

1. Read this README.
2. Read `STATUS.md`.
3. Read only the active BD module.
4. Read `BD_CONSTITUTION_ROUTER.json`.
5. Load only routed constitution clauses.
6. Inspect current-main diff / affected files.
7. Continue from existing evidence.
8. Run targeted tests first.
9. Run required regression second.
10. Move forward only after current exit gate PASS.

Token rule:

`README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`

not:

`all prompts → all constitutions → whole repository`.

---

# 8. STEP 1 — BD01

Open:

`BD01_FORENSIC_BASELINE.md`.

Goal:

**discover actual Big Data course/repository scope before redesign.**

Audit:

- exact course terminology;
- current Big Data lessons;
- datasets/data scale;
- ingestion;
- storage;
- partitioning;
- distributed processing;
- batch/stream;
- DAG/jobs/stages/tasks;
- joins/shuffles;
- skew;
- caching/persistence;
- checkpoints;
- fault tolerance;
- schema/data formats;
- cluster/runtime/frameworks;
- resource/performance metrics;
- ETL/data pipelines;
- data quality;
- observability;
- downstream ML/analytics;
- assessment;
- authoring;
- duplicate owners;
- legacy.

Important:

Topic families listed later are capability slots, not claims that every one belongs to the exact Bauman syllabus.

### BD01 exit gate

Move to BD02 only when:

- actual course/repository scope is known;
- framework/runtime inventory is evidenced;
- batch/stream scope is known;
- storage/partition/processing ownership is known;
- performance/observability paths are mapped;
- adjacent-subject overlap is mapped;
- duplicate/legacy risks are known;
- BD02 input contract exists.

---

# 9. STEP 2 — BD02

Open:

`BD02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`.

Goal:

**build one canonical distributed-data-processing ontology.**

Canonical chain:

`DataSource`
→ `Dataset / EventStream`
→ `Schema / DataContract`
→ `Partitioning`
→ `Storage`
→ `ProcessingJob`
→ `OperatorDAG`
→ `Stage / Task`
→ `Shuffle / State`
→ `Checkpoint / Lineage`
→ `Sink`
→ `Performance / Resource Profile`
→ `Observability`
→ `PipelineEvidence`.

After PASS:

`BIG DATA ACADEMIC FOUNDATION LOCKED`.

---

# 10. STEP 3 — BD03

Open:

`BD03_DISTRIBUTED_DATA_REASONING_ASSESSMENT.md`.

Goal:

**build distributed-data reasoning and grading.**

Learner workflow:

`Workload`

→ `data size/rate`

→ `partition strategy`

→ `storage/data format`

→ `processing pattern`

→ `operator DAG`

→ `identify shuffle/state`

→ `analyze skew/locality`

→ `choose parallelism/resources`

→ `define failure/retry semantics`

→ `measure`

→ `optimize`

→ `validate correctness`.

Critical rule:

> A job that runs faster is not automatically better if it changes semantics, loses records, duplicates records, breaks ordering assumptions, or only works for one skew-free dataset.

After PASS:

`BIG DATA REASONING & ASSESSMENT CONTRACT LOCKED`.

---

# 11. STEP 4 — BD04

Open:

`BD04_RUNTIME_BATCH_STREAM_OBSERVABILITY_AI.md`.

Goal:

**provide a safe, evidence-based distributed-data lab without building an uncontrolled real cluster.**

Potential capabilities:

- local/disposable distributed runtime adapter;
- partition visualizer;
- DAG/job planner;
- batch pipeline runner;
- safe stream simulator if in scope;
- shuffle/skew visualizer;
- distributed join lab;
- resource/parallelism experiment;
- checkpoint/retry simulator;
- data-format comparator;
- schema-evolution validator;
- data-quality checker;
- job observability timeline;
- downstream ML data export;
- AI Big Data Tutor.

Rules:

- framework output ≠ academic truth;
- exactly-once must not be claimed unless semantics/evidence support it;
- retries can duplicate side effects unless idempotency is handled;
- event time ≠ processing time;
- checkpoint ≠ backup automatically;
- more partitions ≠ always faster;
- cache ≠ always better;
- AI cannot fabricate job metrics or cluster behavior.

---

# 12. STEP 5 — BD05

Open:

`BD05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`.

Goal:

**turn distributed-data reasoning into practical learning workflows.**

Possible UI:

- workload/scale canvas;
- dataset/stream inspector;
- partition explorer;
- storage/data-format explorer;
- DAG/job view;
- stage/task timeline;
- shuffle/skew panel;
- distributed join workspace;
- resource/parallelism experiment;
- batch/stream mode workspace;
- checkpoint/failure-recovery lab;
- data-quality/schema-evolution panel;
- observability dashboard;
- AI tutor;
- Big Data project/report.

Reuse:

- shared App Shell;
- Python runtime where appropriate;
- Database/Advanced DB artifacts;
- ML/TS downstream consumers;
- Security/Lifecycle requirements;
- shared authoring/mastery/evidence.

---

# 13. STEP 6 — BD06

Open:

`BD06_ACCEPTANCE_HARDENING_RC_READINESS.md`.

Must test at least:

- bad partition strategy;
- extreme data skew;
- empty partition;
- too many partitions;
- too few partitions;
- hot key;
- shuffle-heavy plan;
- join explosion;
- key duplication;
- schema mismatch;
- schema evolution;
- corrupt/malformed records;
- small-files pathology where in scope;
- out-of-memory/resource exhaustion;
- task retry;
- duplicate side effect;
- non-idempotent sink;
- checkpoint mismatch;
- stale lineage;
- batch/stream semantic mismatch;
- event-time/processing-time confusion where in scope;
- late/out-of-order event where in scope;
- watermark/window errors where in scope;
- hidden data loss;
- wrong aggregation due to partition/local combine assumption;
- framework/version mismatch;
- AI fabricated performance results;
- exact RC readiness.

---

# 14. SHARED PRODUCTION RELEASE

After BD06 PASS:

Do not create BD07.

Use:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

with BD06 production smoke profile.

---

# 15. FAILURE ROUTING

Wrong canonical distributed-data concept:

→ BD02.

Wrong distributed reasoning/grader:

→ BD03.

Runtime/batch/stream/observability/AI:

→ BD04.

UX/authoring:

→ BD05.

Regression/security/RC:

→ BD06.

Generic Database/Algorithms/ML/TS/Security/Lifecycle defect:

→ corresponding owner.

---

# 16. REVALIDATION

BD02 change:

→ revalidate affected BD03–BD06.

BD03 change:

→ revalidate BD04–BD06.

BD04 runtime/protocol change:

→ revalidate BD05–BD06.

BD05 interaction change:

→ revalidate BD06 affected UX/a11y.

BD06 semantic defect:

→ route upstream.

---

# 17. DEFINITION OF COMPLETE

Prompt architecture complete when BD00–BD06 exist.

Repository implementation complete only after:

`BD01 PASS`

→ `BD02 PASS`

→ `BD03 PASS`

→ `BD04 PASS`

→ `BD05 PASS`

→ `BD06 PASS`

→ shared production verification.

---

# 18. FINAL PRINCIPLES

**WORKLOAD BEFORE FRAMEWORK.**

**PARTITION BEFORE PARALLELISM CLAIM.**

**SHUFFLE BEFORE PERFORMANCE CLAIM.**

**CORRECTNESS BEFORE THROUGHPUT.**

**IDEMPOTENCY BEFORE RETRY.**

**EVENT TIME ≠ PROCESSING TIME.**

**CHECKPOINT ≠ BACKUP.**

**MORE NODES/PARTITIONS ≠ AUTOMATICALLY FASTER.**

**FRAMEWORK ≠ THEORY.**

**ONE CANONICAL BIG-DATA MODEL · MANY EXECUTION ENGINES.**

---

# NORMAL CHAT / WORK / CODEX ENTRY

This prompt system is channel-neutral. It may be used from an ordinary ChatGPT chat, ChatGPT Work, or Codex.

For a new ordinary chat, read only:

1. `prompts/CONSTITUTION.md`;
2. exact C1–C4 clauses routed by this subject's Constitution Router;
3. this `README.md`;
4. the subject Master Prompt;
5. `PROJECT_STATE.json`;
6. the active module prompt;
7. current repository diff/evidence only when repository work is requested.

Chat history is context, not project authority. Repository state is the durable handoff.

If the task is discussion/planning only, do not pretend repository changes were executed. If repository modification is explicitly requested and GitHub access is available, use the same state/evidence rules.
