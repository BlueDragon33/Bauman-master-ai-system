# ALG01 REPOSITORY MAP

Base SHA: `13f781a34c3de240e64c71d87c5a7497e34a9d3c`

## Current owners and paths

| Area | Path | Baseline role | ALG01 classification |
|---|---|---|---|
| Algorithms prompt authority | `prompts/subjects/algorithms/` | module prompts only | KEEP · governance |
| Learner-facing programming shell | `subjects/programming/` | current UI/data shell | KEEP · shared/legacy product |
| Direct algorithm bridge lessons | `subjects/programming/data/lessons.json` PR02/PR10/PR11 | shallow learner content | KEEP + MIGRATE REFERENCES |
| Programming exercises | `subjects/programming/data/exercises.json` | 3 exercises per lesson | KEEP as legacy bridge |
| Programming MCQ bank | `subjects/programming/data/tests.json` | 384 MCQ items | MIGRATE / deduplicate |
| Programming simulations | `subjects/programming/data/simulations.json` | generic simulation mapping | MIGRATE |
| “Algorithm Complexity Lab” | `subjects/programming/simulations/sim_algorithm_complexity_lab.html` | generic risk/reproducibility meter | RETIRE AS ALGORITHM AUTHORITY |
| P4 prerequisite blueprint | `assets/data/prerequisite-packs/p04-discrete-algorithms-data-structures.json` | structured prerequisite/diagnostic model | KEEP · major ALG02 input |
| P4 validator | `scripts/validate-p04-discrete-algorithms-data-structures.js` | deterministic pack integrity checks | KEEP |
| Math discipline spine | `subjects/math/data/discipline_spine.json` | adjacent logic/discrete/graph owner | KEEP · adjacent authority |
| Shared Python execution | Programming Code Lab + Cloudflare runtime | accepted CPython capability | REUSE CAPABILITY, NOT ALGORITHM OWNER |
| Generic Programming learner state | `subjects/programming/assets/core.js` | local review/exam/remediation/stage-gate state | KEEP, DO NOT PROMOTE TO C4 MASTERY |
| Programming AI Mentor | `subjects/programming/assets/core.js` | deterministic template helper | KEEP as legacy helper, non-authoritative |

## Route/runtime discovery

No baseline file exists at `subjects/algorithms/index.html`, `subjects/algorithms/subject-manifest.json` or equivalent learner runtime. Therefore the actual runtime scope is not `subjects/algorithms/` yet.

## Adjacent boundaries

### Python
Python owns language syntax/runtime semantics and the existing isolated CPython provider. Algorithms may later call this provider for implementation evidence but must not redefine it.

### Mathematics
Math already contains `discrete_graph_db_knowledge` with logic, relations, graphs, trees, paths, relational algebra and algorithmic-complexity context. ALG should reference these foundations rather than duplicate generic proof/discrete theory.

### Database
Current P4 material intentionally bridges hash/tree/relation concepts to database targets while warning against equating in-memory structures with database indexes. Database-specific index/storage/query semantics remain outside ALG ownership.

### AI/Mivar/Big Data
P4 is a prerequisite bridge only. Model-specific AI algorithms, Mivar semantics and distributed Big Data engine internals remain adjacent owners.
