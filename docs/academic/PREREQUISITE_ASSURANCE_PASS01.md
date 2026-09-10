# Prerequisite Assurance · Pass 01

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `DATA_LOCK_AND_CI_GATE_PASS`

## Scope

This pass establishes an authoritative academic data layer before changing the Bauman Master Hub runtime.

The goal is to prevent the roadmap from mixing:

1. official IU5 2026 curriculum facts;
2. inferred competency prerequisites;
3. optional project/research tracks such as UGV/USV;
4. existing subject-library content.

No existing subject content, `assets/js/data.js`, Math runtime, PlanningBridge behavior, or `main` branch was modified in this pass.

## Official source lock

Source of truth:

`https://home.science.iu5.bmstu.ru/study-plans/iu5-master-program.pdf`

Locked program:

- Direction: `09.04.01 · Информатика и вычислительная техника`
- Program: `Искусственный интеллект в автоматизированных системах обработки информации и управления`
- Department: `ИУ5`
- Start year: `2026`
- Duration: `2 years`
- Total: `120 credits / 4320 hours`
- Disciplines: `80 credits`
- Practice: `31 credits`
- GIA/VKR: `9 credits`
- NIR: `21 credits / 756 hours / semesters 1–4`

Authoritative mirror:

`assets/data/official-curriculum-iu5-2026.json`

## Prerequisite assurance registry

Added:

`assets/data/prerequisite-registry-iu5-2026.json`

Core competency gates:

- P0 Technical Russian
- P1 Math/calculus core
- P2 Linear algebra
- P3 Probability/statistics
- P4 Discrete mathematics + algorithms/data structures
- P5 Python/OOP
- P6 Database fundamentals
- P7 Linux/OS/networks
- P8 Software engineering
- P9 OR/Markov/queueing/simulation
- P10 Scientific/Data Python
- P11 Research foundation
- P12 Classical ML foundation

Just-in-time bridge gates:

- J1 Information-system architecture
- J2 Data warehouse/OLAP/BI
- J3 HCI/ergonomics
- J4 Security fundamentals

These gates are explicitly marked as **competency prerequisites inferred for readiness**, not official Bauman administrative prerequisites.

## Mastery policy locked

Diagnostic layers:

- D0 Recall = 25%
- D1 Application = 50%
- D2 Explain/Oral = 25%

Mastery score:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

States:

- 0–59: REBUILD
- 60–79: REPAIR
- 80–89: BRIDGE
- 90–94: READY
- 95–100: MASTERED

READY also requires:

- D1 >= 85
- zero critical misconceptions
- every critical prerequisite gate for an official course to satisfy its own threshold

STOP rule:

A MASTERED gate leaves the active route unless a later official course opens a narrower sub-gate.

## Default de-prioritization

The following must not occupy the default critical path for 09.04.01/11 unless NIR/VKR requires them:

- PID/LQR
- robot dynamics
- Kalman/sensor fusion
- FPGA/HDL
- PLC/SCADA
- deep control theory
- LLM/RAG/Agents before the NIR direction is known

Existing content is not deleted; it will later move to optional/research extensions where appropriate.

## Validation gate

Added:

`scripts/validate-academic-2026.js`

and CI:

`.github/workflows/academic-2026-prerequisite-gate.yml`

The validator locks:

- 52 mandatory discipline credits;
- 28 participant-formed discipline credits including 6 elective credits;
- 80 total discipline credits;
- 31 practice credits;
- 9 GIA credits;
- 120 total credits;
- NIR 21 credits / 756 hours / semesters 1–4;
- unique official IDs;
- no broken prerequisite gate references;
- no broken official-course references;
- READY threshold 90;
- application threshold 85;
- zero critical misconceptions;
- no `cần xác minh` labels in the official mirror;
- no UGV/USV/PID/LQR/FPGA/PLC/SCADA assumptions in the official mirror.

GitHub Actions run `34448435590`: `SUCCESS`.

## Next pass

Pass 02 will add a read-only runtime layer to Bauman Master Hub:

1. official 2026 curriculum by semester;
2. prerequisite coverage/readiness matrix;
3. no fabricated scores — untested gates remain `Chưa chẩn đoán`;
4. no scheduler decision from prerequisites until diagnostics exist;
5. no merge to `main` before runtime and browser gates pass.
