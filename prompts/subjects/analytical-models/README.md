# ANALYTICAL MODELS OF AUTOMATED INFORMATION PROCESSING & CONTROL SYSTEMS
## Bauman IU5 · 09.04.01/11 · Constitution-routed subject architecture + execution runbook

Russian course title:

**Аналитические модели автоматизированных систем обработки информации и управления**

Repository:

`BlueDragon33/Bauman-master-ai-system`

Primary subject scope:

`subjects/analytical-models/`

or the actual repository scope discovered by AM01.

---

# 0. PURPOSE

This package defines the subject prompt architecture for the Bauman IU5 course:

**Analytical Models of Automated Information Processing and Control Systems**

It reuses the global constitutions:

- C1 — Extensible Platform Architecture
- C2 — Future Professional UI/UX
- C3 — Professional QA + Auto-Fix
- C4 — Real Learning & Outcome System

and adds only analytical-modeling-specific owners.

This README is the single execution runbook.

No separate execution cheat sheet is required.

---

# 1. WHY THIS SUBJECT NOW

Prerequisite systems already created:

- Mathematics
- Python
- Algorithms & Data Structures
- Database Systems & SQL
- Multivariate Data Analysis & Machine Learning

This course should now connect those foundations into rigorous system modeling for automated information-processing/control systems.

The subject must not be reduced to:

- formula memorization;
- block diagrams with no semantics;
- numerical plots without model assumptions;
- “simulation = proof”;
- controller design unless the actual Bauman syllabus/repository evidence places it here.

---

# 2. SUBJECT OWNERSHIP

AM owns subject-specific:

- problem/system abstraction;
- system boundary;
- inputs/outputs;
- states;
- parameters;
- disturbances;
- observations;
- assumptions;
- analytical model classes;
- static/dynamic model formulation;
- deterministic/stochastic distinction;
- continuous/discrete distinction;
- linear/nonlinear distinction;
- state equations where in scope;
- transfer/input-output representations where in scope;
- differential/difference/algebraic model formulation where in scope;
- constraints;
- initial/boundary conditions;
- dimensional consistency;
- parameterization;
- analytical vs numerical solution boundary;
- model verification;
- model validation;
- calibration where in scope;
- sensitivity;
- uncertainty;
- model equivalence;
- model reduction/linearization only where supported by actual syllabus;
- system-model communication/documentation.

AM does not automatically own:

- generic linear algebra/calculus/differential equations — Mathematics;
- Python semantics/runtime — Python;
- generic algorithms — Algorithms;
- ML/data-driven model training — ML;
- reliability/failure models as a full domain — Reliability subject;
- time-series forecasting — Time Series subject;
- controller synthesis/control-law design — only if AM01 proves this course owns it;
- lifecycle/process management — Lifecycle & Systems Engineering.

---

# 3. ACTIVE MODULES

- `AM_MASTER_PROMPT.md` — AM00 orchestration
- `AM01_FORENSIC_BASELINE.md`
- `AM02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `AM03_MODEL_FORMULATION_REASONING_ASSESSMENT.md`
- `AM04_SOLVER_SIMULATION_VISUALIZATION_AI.md`
- `AM05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `AM06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `AM_CONSTITUTION_ROUTER.json`
- `AM_ARCHITECTURE_MAP.md`
- `STATUS.md`

---

# 4. EXECUTION COMMAND

Work/Codex may be instructed simply:

> Thực thi môn Analytical Models theo `ASOIU_ANALYTICAL_MODELS_PROMPT_SYSTEM/00_README.md`. Đọc STATUS, xác định module active, chỉ nạp điều khoản Hiến pháp do router chỉ định, tiếp tục từ evidence hiện tại, không re-audit toàn hệ nếu diff không yêu cầu, chỉ chuyển bước khi exit gate PASS.

---

# 5. EXECUTION ORDER

Run exactly:

`AM00 context`

→ `AM01 forensic baseline`

→ `AM02 academic/canonical foundation`

→ `AM03 model formulation + reasoning + assessment`

→ `AM04 solver/simulation/visualization/AI`

→ `AM05 learner experience + authoring + integration`

→ `AM06 acceptance + hardening + RC`

→ shared production release.

---

# 6. STARTING PROCEDURE FOR EVERY SESSION

1. Read this README.
2. Read `STATUS.md`.
3. Read only the active AM module.
4. Read `AM_CONSTITUTION_ROUTER.json`.
5. Load only routed constitution clauses.
6. Inspect current-main diff / affected files.
7. Continue from existing evidence.
8. Run targeted tests first.
9. Run required regression second.
10. Move to next module only when current exit gate PASSes.

Token rule:

`README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`

not:

`all prompts → all constitutions → entire repository`.

---

# 7. AM00 — ORCHESTRATION CONTEXT

Read:

`AM_MASTER_PROMPT.md`.

AM00 defines:

- owner map;
- subject boundaries;
- change classes;
- revalidation;
- evidence hierarchy;
- non-negotiable modeling invariants.

AM00 is a permanent context layer, not a separate long implementation phase.

---

# 8. STEP 1 — EXECUTE AM01

Open:

`AM01_FORENSIC_BASELINE.md`.

Goal:

**discover what “Analytical Models” actually means in the current Bauman/repository implementation before redesigning anything.**

Audit:

- current course content;
- mathematical model files;
- equations;
- diagrams;
- simulations;
- Python/Math integrations;
- state-space/input-output content;
- stochastic/queueing/Markov content if present;
- system-identification content if present;
- control-design content if present;
- assessments;
- visualizers;
- learner state;
- legacy;
- duplicate owners.

Important:

Potential topic families listed in later prompts are capability slots, not claims that they are definitely in the Bauman course.

AM01 evidence determines actual scope.

### AM01 exit gate

Move to AM02 only when:

- actual repository/course scope is known;
- existing model families are inventoried;
- current solver/simulation/visualization paths are mapped;
- adjacent-subject boundaries are mapped;
- assessment/runtime owners are known;
- duplicate/legacy risks are known;
- AM02 input contract exists.

---

# 9. STEP 2 — EXECUTE AM02

Open:

`AM02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`.

Goal:

**build one canonical system/model ontology.**

Canonical chain:

`Real/Target System`

→ `Purpose`

→ `Boundary`

→ `Variables`

→ `Inputs / Outputs / States`

→ `Parameters`

→ `Disturbances / Observations`

→ `Assumptions`

→ `Equations / Relations`

→ `Initial/Boundary Conditions`

→ `Model Class`

→ `Solution`

→ `Verification`

→ `Validation`

→ `Sensitivity / Uncertainty`

→ `Use`.

After PASS:

`ANALYTICAL MODELING FOUNDATION LOCKED`.

Later modules cannot silently redefine system variables, assumptions, equations, units or model identity.

---

# 10. STEP 3 — EXECUTE AM03

Open:

`AM03_MODEL_FORMULATION_REASONING_ASSESSMENT.md`.

Goal:

**build the reasoning and grading brain.**

Learner workflow:

`Problem statement`

→ `choose boundary`

→ `identify variables`

→ `state assumptions`

→ `choose model class`

→ `formulate equations`

→ `check dimensions/conditions`

→ `solve/analyze`

→ `verify mathematics`

→ `validate against scenario/data`

→ `analyze sensitivity`

→ `interpret limitations`.

Critical rule:

> A mathematically solved equation is not automatically a valid system model.

AM03 must grade separately:

- abstraction;
- assumptions;
- variables;
- equations;
- units;
- initial/boundary conditions;
- mathematical correctness;
- model validity;
- interpretation.

After PASS:

`ANALYTICAL MODEL REASONING & ASSESSMENT CONTRACT LOCKED`.

---

# 11. STEP 4 — EXECUTE AM04

Open:

`AM04_SOLVER_SIMULATION_VISUALIZATION_AI.md`.

Goal:

**provide capability-based analytical/numerical/simulation support without turning tools into truth owners.**

Potential capabilities:

- symbolic solution via Math provider;
- numerical solving via Python/NumPy/SciPy provider;
- ODE/difference-equation simulation where in scope;
- state trajectory plots;
- input/output response;
- parameter sweeps;
- sensitivity views;
- model comparison;
- block/system diagrams;
- stochastic/Monte-Carlo execution only if AM01/AM02 scope includes it;
- AI Modeling Tutor.

Rules:

- solver output ≠ model validity;
- simulation ≠ proof;
- visualization ≠ canonical model;
- AI ≠ official modeling authority;
- numerical method/time step must be visible when they affect results.

---

# 12. STEP 5 — EXECUTE AM05

Open:

`AM05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`.

Goal:

**turn the modeling system into a usable Bauman subject inside the shared platform.**

Subject-specific UI can include:

- model specification panel;
- equation editor;
- variable/parameter table;
- units;
- assumptions pane;
- initial/boundary conditions;
- system/block diagram;
- solver workspace;
- simulation controls;
- trajectory/response plots;
- sensitivity explorer;
- model comparison;
- validation evidence;
- error notebook;
- model-report authoring.

Reuse:

- global App Shell;
- shared Design System;
- Math formula capabilities;
- Python runtime;
- generic mastery/evidence;
- generic authoring lifecycle.

No second platform.

---

# 13. STEP 6 — EXECUTE AM06

Open:

`AM06_ACCEPTANCE_HARDENING_RC_READINESS.md`.

Goal:

**prove canonical model, reasoning, solver, visualizer, AI and learner experience all agree.**

Must test:

- unit/dimension inconsistency;
- missing assumptions;
- invalid initial conditions;
- state-dimension mismatch;
- equivalent representations;
- multiple valid model formulations;
- linear/nonlinear boundary;
- continuous/discrete mismatch;
- discretization/time-step artifacts if applicable;
- parameter sensitivity;
- model validation vs curve-fitting;
- unstable/divergent numerical run;
- hidden-answer leakage;
- solver/provider failure;
- AI overclaim;
- offline/performance;
- duplicate owner/legacy closure.

Produces:

- exact RC manifest;
- production smoke profile.

---

# 14. STEP 7 — SHARED PRODUCTION RELEASE

After AM06 PASS:

Do not create AM07.

Use:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

with AM06 production smoke profile.

Production deploy/verify/observe/rollback remains shared infrastructure.

---

# 15. FAILURE ROUTING

Wrong canonical variable/model semantics:

→ AM02.

Wrong formulation/grader:

→ AM03.

Solver/simulation/visualization/AI:

→ AM04.

UX/authoring:

→ AM05.

Regression/security/RC:

→ AM06.

Generic Math/Python/platform:

→ corresponding owner/global constitution.

---

# 16. REVALIDATION

AM02 changes:

→ revalidate affected AM03–AM06.

AM03 changes:

→ revalidate AM04–AM06.

AM04 protocol changes:

→ revalidate AM05–AM06.

AM05 interaction changes:

→ revalidate AM06 affected UX/a11y.

AM06 discovers semantic defect:

→ route upstream; do not patch truth in AM06.

---

# 17. DEFINITION OF COMPLETE

Prompt architecture complete when AM00–AM06 exist.

Repository implementation complete only after:

`AM01 PASS`

→ `AM02 PASS`

→ `AM03 PASS`

→ `AM04 PASS`

→ `AM05 PASS`

→ `AM06 PASS`

→ shared production verification.

---

# 18. FINAL PRINCIPLE

**MODEL THE SYSTEM BEFORE SOLVING THE EQUATION.**
**STATE ASSUMPTIONS BEFORE CLAIMING VALIDITY.**
**CHECK UNITS BEFORE TRUSTING NUMBERS.**
**VERIFY THE MATH; VALIDATE THE MODEL.**
**SIMULATION IS EVIDENCE, NOT AUTHORITY.**
**ONE CANONICAL MODEL · MANY SOLVERS AND VIEWS.**

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
