# Prerequisite Assurance · Pass 04 · P9

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P9_BLUEPRINT_VALIDATED_CI_PASS`

## Scope

Implement the first high-priority missing prerequisite package:

`P9 · OR / Markov / Queueing / Simulation`

This package is a competency-readiness layer inferred from the official IU5 2026 curriculum and public IU5 Analytical Models materials. It is **not** an official administrative prerequisite declared by Bauman.

## Why P9 is first

P9 directly prepares for:

- `d03 · Аналитические модели автоматизированных систем обработки информации и управления` in semester 1;
- `d09 · Модели надёжности АСОИУ` in semester 2.

The existing Math vault already contains basic probability and Poisson-distribution material, but the Pass 03 audit found no actual lesson-level Markov or M/M/1 content. Therefore Pass 04 reuses P3 probability instead of duplicating it and fills only the missing stochastic/queueing bridge.

## Added package

`assets/data/prerequisite-packs/p09-markov-queueing-simulation.json`

The package contains 11 nodes:

1. operations-research modeling language;
2. stochastic process, rate and state;
3. Poisson process and exponential distribution;
4. Markov chains and transition matrices;
5. stationary behavior and birth-death bridge;
6. queue model and Kendall notation;
7. M/M/1;
8. M/M/c and Erlang C;
9. queueing networks / finite capacity / feedback / priority bridge;
10. discrete-event simulation;
11. reliability bridge.

## Canonical formulas locked

The package locks the minimum formulas required for readiness, including:

- Poisson process count probability;
- exponential survival/mean and memoryless property;
- Markov state propagation and stationary distribution;
- M/M/1 utilization, stationary probabilities, L, Lq, W, Wq;
- Little's law;
- M/M/c utilization;
- Erlang-C P0/P(wait), Lq, Wq, W and L.

The CI validator independently recalculates canonical M/M/1 and M/M/2 examples, so formula drift cannot silently pass.

## Diagnostic blueprint

D0 Recall:

- 16 items;
- 25-minute recommended diagnostic window;
- focuses on concepts, notation, stability and metric meaning.

D1 Application:

- 12 problems;
- 70-minute recommended diagnostic window;
- includes Poisson count, exponential service-time conversion, Markov transition/stationary calculations, M/M/1, M/M/2 Erlang C, queue-network mapping and simulation design.

D2 Explain/Oral:

- 8 bilingual VI/RU prompts;
- 25-minute recommended diagnostic window;
- requires explanation rather than formula recall.

Mastery remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

P9 READY requires:

- total >= 90;
- D1 >= 85;
- zero critical misconceptions.

## Misconception intercepts

Nine critical misconceptions are explicitly blocked, including:

- confusing Poisson distribution with Poisson process;
- confusing rates with mean times;
- interpreting stationary distribution as a system that no longer changes state;
- applying M/M/1 steady-state formulas when lambda >= mu;
- confusing L with Lq and W with Wq;
- using lambda/mu instead of lambda/(c*mu) for M/M/c;
- applying Little's law with an inconsistent arrival population/rate;
- trusting one short simulation run;
- confusing service rate with failure rate.

Any critical misconception prevents READY regardless of the weighted score.

## Repair routing

Seven repair routes are included. A diagnostic failure does not restart the whole Math curriculum. It routes only to the affected node cluster and reuses P3 probability when appropriate.

Examples:

- weak Poisson/exponential -> reuse P3 + P9-N02/N03;
- weak Markov -> P9-N04/N05;
- weak M/M/1 -> P9-N06/N07;
- weak M/M/c -> P9-N08;
- weak simulation -> P9-N10.

## Scope guard

The active P9 learning content is checked to remain free of:

- PID/LQR;
- Kalman/sensor fusion;
- robot dynamics;
- FPGA;
- PLC/SCADA.

These are not deleted from the repository; they simply cannot enter the default P9 prerequisite route.

## Validation

Added:

`scripts/validate-p09-markov-queueing.js`

CI workflow:

`.github/workflows/academic-2026-prerequisite-gate.yml`

Run `34450309949`: `SUCCESS`.

Passed steps:

- official IU5 2026 curriculum/prerequisite registry validation;
- prerequisite content coverage audit validation;
- P9 Markov/Queueing/Simulation package validation;
- canonical M/M/1 and M/M/2 numeric invariants;
- Academic 2026 runtime JavaScript syntax;
- index runtime reference checks.

## Runtime policy

Pass 04 does not:

- write fake diagnostic scores;
- change the scheduler;
- overwrite accepted Math lessons;
- merge to `main`;
- claim P9 is an official Bauman administrative prerequisite.

## Next pass

Pass 05 should build `P6 · Database Fundamentals` as the next high-risk repair package before official course `d06 · Оптимизация баз данных систем машинного обучения`.

Priority scope:

`relational algebra → normalization → SQL depth → ACID → transactions → isolation/locking/deadlock → indexes → B-tree/hash → query planner → EXPLAIN/EXPLAIN ANALYZE → physical design`

Existing `PR06` and `PR15` must be reused rather than duplicated.
