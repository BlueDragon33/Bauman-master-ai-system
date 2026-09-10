# Prerequisite Assurance · Pass 03

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `CONTENT_COVERAGE_AUDITED_CI_PASS`

## Goal

Audit the existing subject-library content before creating new lessons.

This pass answers four questions for every prerequisite gate:

1. What content already exists and can be reused?
2. What exists but is too shallow or biased toward an optional project track?
3. What is only present as a curriculum/spine label but not as lesson-level content?
4. What is genuinely missing from the active prerequisite path?

No numeric coverage percentage is invented. Coverage status is qualitative and evidence-backed.

## Audit artifact

Added:

`assets/data/prerequisite-content-coverage-2026.json`

The audit covers all core gates `P0–P12` and JIT bridges `J1–J4`.

## Strong reuse — do not rebuild broadly

### P1 · Math/calculus core

Existing Math spine already includes functions, limits, derivatives, partial derivatives, gradient and integration basics.

Decision: build diagnostics and sub-topic routing, not a second calculus course.

### P2 · Linear algebra

Existing Math content contains vector/matrix material and actual stage-linked theory for eigenvalues, orthogonality, SVD and PCA prerequisites.

Decision: reuse the current Math vault; later map P2 diagnostic failures to existing chapters/lesson IDs.

### P3 · Probability/statistics

Existing Math content includes Bayes, common distributions including Poisson, covariance/correlation, estimation, confidence intervals, hypothesis testing and p-values.

Decision: reuse theory; build application-level diagnostics and targeted repair packs.

### P5 · Python/OOP

Verified existing Programming lessons include:

- `PR03` Python basics;
- `PR13` debugging/exceptions/logging;
- `PR14` pytest basics;
- `PR17` OOP class/interface/responsibility.

Decision: add executable diagnostic tasks before creating any new Python theory.

### P12 · Classical ML foundation

AI curriculum already follows baseline-first, data/model/metric, validation and error-analysis principles.

Decision: keep it as a rolling-ahead gate for semester 2; do not let it dominate pre-STANKIN study.

## Partial reuse — extend narrowly

### P4 · Discrete mathematics + algorithms/data structures

Verified:

- `PR02` algorithmic complexity;
- `PR11` array/stack/queue/dict/graph introduction.

Not yet proven at sufficient depth:

- linked list;
- trees and traversal;
- hash collision behavior;
- sorting families;
- binary search;
- recursion depth;
- BFS/DFS;
- graph-complexity reasoning.

Decision: create one compact DSA prerequisite cluster. No competitive-programming detour.

### P6 · Database fundamentals

Verified:

- `PR06` SQL basics + relational model;
- `PR15` JOIN/GROUP BY/basic index.

Not yet proven:

- relational algebra depth;
- normalization 1NF–3NF/BCNF;
- ACID and transactions;
- isolation/locking/deadlock;
- B-tree vs hash;
- query planner;
- EXPLAIN/EXPLAIN ANALYZE;
- physical DB design.

Decision: create a focused database-repair cluster before official course `d06`.

### P8 · Software engineering

Verified:

- `PR07` Git;
- `PR14` unit testing;
- `PR17` OOP responsibilities/interfaces;
- `PR19` Factory/Strategy/Adapter patterns.

Not yet proven:

- requirements engineering;
- UML use-case/class/sequence/component/deployment views;
- explicit SOLID competence;
- quality attributes;
- lifecycle models;
- integration/regression/system testing;
- configuration/release management.

Decision: extend the existing Programming module rather than create a new top-level app.

### P10 · Scientific/Data Python

Verified:

- `PR04` NumPy/vectorization;
- pandas/data-cleaning material exists in the Programming vault;
- notebook/reproducible-artifact infrastructure exists.

Still needs explicit readiness coverage for SciPy basics, scikit-learn Pipeline/ColumnTransformer, leakage prevention, reproducibility and schema validation.

### P11 · Research foundation

Research workflow is structurally strong but its current curriculum is hard-wired to UGV/USV.

Decision: preserve literature → question → baseline → experiment → report → defense, while replacing the default topic assumption with topic-neutral research methodology.

### J1 · Information-system architecture

Systems content contains boundary/interface/data-contract/failure-mode/reliability concepts, but is dominated by sensor/controller/feedback and UGV/USV examples.

Decision: rewrite the active J1 route around information-system/service architecture. UGV/USV becomes optional application content.

## Critical new content

### P9 · OR / Markov / Queueing / Simulation

This is the highest-priority academic gap.

Current Math spine mentions Markov and queueing, and actual probability content includes Poisson distribution. However the audited lesson vault does not establish lesson-level Markov or `M/M/1` readiness.

Required new cluster:

`random process → Poisson process → exponential service time → Markov chain → stationary behavior → M/M/1 → M/M/c → utilization/stability → Little's law → waiting/queue metrics → discrete-event simulation → reliability bridge`

This route directly supports official course `d03 · Аналитические модели АСОИУ` and later `d09 · Модели надёжности АСОИУ`.

### P7 · Linux / OS / Networks

No explicit Linux lesson was found in the audited Programming lesson vault and no dedicated prerequisite stage exists in its roadmap.

Required new compact cluster:

`shell/files/permissions → process/thread → memory/filesystem → SSH → TCP/IP → TCP/UDP → ports/sockets → HTTP → client/server → environment/package management`

This is support infrastructure for database, software engineering, post-relational DB, security, Big Data and research deployment. It must remain compact; no sysadmin detour.

## Deferred JIT content

`J2 Data Warehouse/OLAP/BI`, `J3 HCI/ergonomics`, and `J4 Security fundamentals` are genuine gaps but are not placed on the immediate HK1 critical path. They remain scheduled for rolling preparation before semester 3.

## Default critical-path change

Do not delete optional content, but remove these from automatic prerequisite priority unless an official course/NIR needs them:

- PID/LQR;
- robot dynamics;
- Kalman/sensor fusion;
- FPGA/HDL;
- PLC/SCADA;
- UGV/USV-specific examples where a neutral information-system example is sufficient.

## Validation

Added:

`scripts/validate-prerequisite-coverage-2026.js`

The gate verifies:

- every `P0–P12` and `J1–J4` gate is audited exactly once;
- every status is from the locked qualitative status set;
- every evidence path exists in the repository;
- every critical-path reference points to a known prerequisite gate;
- no fabricated numeric coverage percentages are stored.

Workflow `.github/workflows/academic-2026-prerequisite-gate.yml` runs this validator in addition to the official curriculum/prerequisite registry validator.

CI run `34449910347`: `SUCCESS` after correcting a validator false positive that matched the policy key `noFabricatedCoveragePercent`; no academic data had to be weakened to make the gate pass.

## Next pass

Pass 04 implements the first missing critical gate: `P9 · OR / Markov / Queueing / Simulation` as a narrow prerequisite package, with:

- dependency map;
- D0 recall diagnostic blueprint;
- D1 application problems;
- D2 explain/oral prompts;
- repair-route mapping;
- no runtime scheduler mutation yet;
- no duplication of the existing probability/statistics chapters;
- no optional control/robotics expansion.
