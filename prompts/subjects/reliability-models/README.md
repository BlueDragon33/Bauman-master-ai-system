# RELIABILITY MODELS OF ASOIU PROMPT SYSTEM
## Bauman IU5 · Модели надёжности АСОИУ
## Constitution-routed subject architecture + execution runbook

Repository:

`BlueDragon33/Bauman-master-ai-system`

Primary subject scope:

`subjects/reliability-models/`

or the actual repository scope discovered by REL01.

---

# 0. PURPOSE

This package defines the subject architecture for the Bauman IU5 course:

**Модели надёжности АСОИУ — Reliability Models of Automated Information Processing and Control Systems**

It reuses the shared constitutions:

- C1 — Extensible Platform Architecture
- C2 — Future Professional UI/UX
- C3 — Professional QA + Auto-Fix
- C4 — Real Learning & Outcome System

This README is the single execution runbook.

No separate execution cheat sheet is required.

---

# 1. FOUNDATION DEPENDENCIES

Reuse:

- Mathematics
- Probability/Statistics portions of Mathematics
- Analytical Models of ASOIU
- Python
- Algorithms & Data Structures where graph/state algorithms are useful
- ML/Data Analysis only where statistical estimation/data analysis is relevant

Do not duplicate these foundations.

---

# 2. SUBJECT OWNERSHIP

REL owns subject-specific:

- reliability terminology and measures;
- failure / repair / restoration events;
- reliability function and failure-time reasoning where supported;
- failure intensity / hazard-rate reasoning where supported;
- MTTF / MTBF / MTTR and related measures where supported;
- maintainability and availability where supported;
- series / parallel / redundant structures;
- k-out-of-n systems where supported;
- reliability block diagrams;
- fault trees / minimal cut sets where supported;
- state / Markov reliability models where supported;
- repairable vs non-repairable system models;
- redundancy strategies;
- failure distributions used in reliability;
- parameter estimation from reliability data where supported;
- censored-life data where supported;
- reliability testing / confidence / uncertainty where supported;
- Monte Carlo reliability estimation where supported;
- sensitivity / criticality;
- dependent/common-cause failure only where actual syllabus supports;
- system reliability trade-offs for ASOIU;
- reliability evidence and reliability claims.

REL does not automatically own:

- generic probability/statistics — Mathematics;
- generic ODE/Markov mathematics — Mathematics / Analytical Models;
- generic system modeling — Analytical Models;
- generic software testing — OOPSE;
- cybersecurity fault/threat models — Information Security;
- generic production observability/SRE — platform engineering;
- lifecycle/process management — Lifecycle & Systems Engineering.

---

# 3. ACTIVE MODULES

- `REL_MASTER_PROMPT.md` — REL00 orchestration
- `REL01_FORENSIC_BASELINE.md`
- `REL02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `REL03_RELIABILITY_REASONING_ASSESSMENT.md`
- `REL04_CALCULATION_SIMULATION_VISUALIZATION_AI.md`
- `REL05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `REL06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `REL_CONSTITUTION_ROUTER.json`
- `REL_ARCHITECTURE_MAP.md`
- `STATUS.md`

---

# 4. EXECUTION COMMAND

Work/Codex may be instructed:

> Thực thi môn Reliability Models theo `RELIABILITY_MODELS_PROMPT_SYSTEM/00_README.md`. Đọc STATUS, xác định module active, chỉ nạp điều khoản Hiến pháp do router chỉ định, tiếp tục từ evidence hiện tại, không re-audit toàn hệ nếu diff không yêu cầu, chỉ chuyển bước khi exit gate PASS.

---

# 5. EXECUTION ORDER

`REL00 context`

→ `REL01 forensic baseline`

→ `REL02 academic/canonical foundation`

→ `REL03 reliability reasoning + assessment`

→ `REL04 calculation/simulation/visualization/AI`

→ `REL05 learning experience + authoring + integration`

→ `REL06 acceptance + hardening + RC`

→ shared production release.

---

# 6. STARTING PROCEDURE FOR EVERY SESSION

1. Read this README.
2. Read `STATUS.md`.
3. Read only the active REL module.
4. Read `REL_CONSTITUTION_ROUTER.json`.
5. Load only routed constitution clauses.
6. Inspect current-main diff / affected files.
7. Continue from existing evidence.
8. Run targeted tests first.
9. Run required regression second.
10. Move forward only after current exit gate PASS.

Token rule:

`README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`

not:

`all prompts → all constitutions → entire repository`.

---

# 7. STEP 1 — REL01

Open:

`REL01_FORENSIC_BASELINE.md`.

Goal:

**discover what reliability content actually exists before redesign.**

Audit:

- current reliability lessons;
- formulas;
- probability distributions;
- repairability/availability;
- redundancy;
- RBD;
- fault trees;
- state/Markov models;
- simulation;
- reliability data;
- estimators;
- visualizers;
- assessments;
- AI;
- legacy;
- duplicate owners;
- overlap with Analytical Models / Math / OOPSE.

Important:

The audit list contains possible topic families, not claims that every topic is in the exact Bauman syllabus.

### REL01 exit gate

Move to REL02 only when:

- actual course/repository scope is known;
- model families are inventoried;
- formulas/measures/assumptions are mapped;
- solver/simulation ownership is known;
- assessment ownership is known;
- adjacent-subject overlap is mapped;
- duplicate/legacy risks are known;
- REL02 input contract exists.

---

# 8. STEP 2 — REL02

Open:

`REL02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`.

Goal:

**build one canonical reliability ontology.**

Canonical chain:

`System`

→ `Mission / required function`

→ `Component / element`

→ `Failure mode / event`

→ `Failure-time / repair-time model`

→ `Assumptions`

→ `Reliability structure`

→ `Reliability measure`

→ `Parameter set`

→ `Calculation / model`

→ `Verification`

→ `Validation against data/evidence`

→ `Sensitivity / criticality`

→ `Reliability claim`.

After PASS:

`RELIABILITY ACADEMIC FOUNDATION LOCKED`.

---

# 9. STEP 3 — REL03

Open:

`REL03_RELIABILITY_REASONING_ASSESSMENT.md`.

Goal:

**build the reasoning and grading brain.**

Learner workflow:

`mission / requirement`

→ `define system boundary`

→ `identify failure event`

→ `select reliability model`

→ `state assumptions`

→ `derive/calculate measure`

→ `check units/probabilities`

→ `validate against structure/data`

→ `analyze redundancy/repair/sensitivity`

→ `interpret reliability claim`.

Critical rule:

> A correct numeric result is not enough if the failure event, assumptions, repair model or independence assumptions are wrong.

After PASS:

`RELIABILITY REASONING & ASSESSMENT CONTRACT LOCKED`.

---

# 10. STEP 4 — REL04

Open:

`REL04_CALCULATION_SIMULATION_VISUALIZATION_AI.md`.

Goal:

**provide calculation/simulation/visualization capabilities without making tools the reliability authority.**

Potential capabilities:

- symbolic reliability calculations via Math provider;
- numerical probability/reliability calculations;
- life-distribution evaluation;
- RBD calculation;
- fault-tree evaluation;
- Markov/state simulation;
- Monte Carlo;
- repair/availability simulation;
- parameter estimation;
- sensitivity/criticality;
- reliability curves;
- failure-rate plots;
- AI Reliability Tutor.

Rules:

- plot ≠ reliability proof;
- exponential model ≠ universal;
- independence must not be silently assumed;
- MTBF ≠ guaranteed lifetime;
- availability ≠ reliability;
- AI cannot invent failure data.

---

# 11. STEP 5 — REL05

Open:

`REL05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`.

Goal:

**turn reliability reasoning into usable learning surfaces.**

Possible UI:

- reliability concept lesson;
- failure-event/specification workspace;
- component/system structure;
- RBD;
- fault tree;
- state/Markov diagram;
- distribution/parameter panel;
- calculation workspace;
- reliability/availability curves;
- Monte Carlo/sensitivity panel;
- evidence/report;
- AI tutor;
- error notebook.

Reuse:

- shared App Shell;
- Math formula/plot capabilities;
- Python runtime;
- Analytical Models concepts;
- global authoring;
- global mastery/evidence.

---

# 12. STEP 6 — REL06

Open:

`REL06_ACCEPTANCE_HARDENING_RC_READINESS.md`.

Must test at least:

- probability out of [0,1];
- R(t) monotonicity assumptions where applicable;
- R(0) expectations for supported model;
- series/parallel edge cases;
- duplicate failure paths;
- independence assumption errors;
- repairable vs non-repairable confusion;
- reliability vs availability confusion;
- MTTF/MTBF/MTTR confusion;
- wrong failure distribution;
- unit mismatch;
- Markov transition normalization;
- fault-tree logic;
- k-out-of-n combinatorics if in scope;
- Monte Carlo reproducibility;
- censored-data handling if in scope;
- sensitivity/criticality correctness;
- AI overclaim;
- hidden-test leakage;
- runtime safety;
- legacy/duplicate owner closure;
- exact RC readiness.

---

# 13. STEP 7 — SHARED PRODUCTION RELEASE

After REL06 PASS:

Do not create REL07.

Use:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

with REL06 production smoke profile.

---

# 14. FAILURE ROUTING

Wrong canonical reliability concept:

→ REL02.

Wrong reasoning/grader:

→ REL03.

Calculation/simulation/visualization/AI:

→ REL04.

UX/authoring:

→ REL05.

Regression/security/RC:

→ REL06.

Generic math/system-model defect:

→ Mathematics / Analytical Models owner.

---

# 15. REVALIDATION

REL02 change:

→ revalidate affected REL03–REL06.

REL03 change:

→ revalidate REL04–REL06.

REL04 protocol change:

→ revalidate REL05–REL06.

REL05 interaction change:

→ revalidate REL06 affected UX/a11y.

REL06 semantic defect:

→ route upstream.

---

# 16. DEFINITION OF COMPLETE

Prompt architecture complete when REL00–REL06 exist.

Repository implementation complete only after:

`REL01 PASS`

→ `REL02 PASS`

→ `REL03 PASS`

→ `REL04 PASS`

→ `REL05 PASS`

→ `REL06 PASS`

→ shared production verification.

---

# 17. FINAL PRINCIPLE

**DEFINE FAILURE BEFORE CALCULATING RELIABILITY.**
**STATE ASSUMPTIONS BEFORE MULTIPLYING PROBABILITIES.**
**RELIABILITY ≠ AVAILABILITY.**
**MTBF ≠ GUARANTEED LIFETIME.**
**REDUNDANCY HAS DEPENDENCY AND REPAIR ASSUMPTIONS.**
**ONE CANONICAL RELIABILITY MODEL · MANY CALCULATORS AND VIEWS.**

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
