# OOP DESIGN & SOFTWARE ENGINEERING PROMPT SYSTEM
## Bauman IU5 · 09.04.01/11 · Constitution-routed subject architecture + execution runbook

Bauman course alignment:

- **Объектно-ориентированное проектирование АСОИУ**
- **Технологии разработки программного обеспечения**

Repository:

`BlueDragon33/Bauman-master-ai-system`

Primary subject scope:

`subjects/oop-software-engineering/`

or the actual repository scope discovered by OOPSE01.

---

# 0. PURPOSE

This package defines the subject prompt architecture for Object-Oriented Design and Software Engineering in the Bauman IU5 program.

It reuses the global constitutions:

- C1 — Extensible Platform Architecture
- C2 — Future Professional UI/UX
- C3 — Professional QA + Auto-Fix
- C4 — Real Learning & Outcome System

This README is the single execution runbook.

No separate execution cheat sheet is required.

---

# 1. WHY THIS SUBJECT NOW

Prerequisite prompt systems already created:

- Russian / Academic Russian
- Mathematics
- Python
- Algorithms & Data Structures
- Database Systems & SQL
- Multivariate Data Analysis & Machine Learning
- Analytical Models of ASOIU

This subject connects implementation skills to disciplined software design and engineering.

It must not be reduced to:

- memorizing UML symbols;
- “OOP = classes and inheritance”;
- pattern-name memorization;
- framework tutorials;
- code that only works on one happy-path example;
- style rules disconnected from requirements and maintainability.

---

# 2. SUBJECT OWNERSHIP

OOPSE owns subject-specific:

- object-oriented analysis and design;
- domain modeling;
- responsibility allocation;
- abstraction;
- encapsulation;
- composition/inheritance decisions;
- interfaces/contracts;
- polymorphism;
- dependency direction;
- object collaboration;
- behavioral/state interaction models;
- architectural decomposition where in course scope;
- software requirements to design traceability;
- modularity/cohesion/coupling;
- design smells;
- refactoring reasoning;
- design-pattern use where supported;
- implementation structure;
- unit/integration testing concepts in software-engineering context;
- code review reasoning;
- version-control workflow concepts where supported;
- build/package/dependency practices where supported;
- CI/CD concepts where supported;
- documentation and maintainability;
- software-quality trade-offs;
- engineering evidence/project artifacts.

OOPSE does not automatically own:

- Python language syntax/runtime — Python subject;
- generic algorithms/data structures — Algorithms;
- database semantics — Database;
- lifecycle/process governance at full system/project level — Lifecycle & Systems Engineering;
- project-management economics/scheduling — Project Management;
- information security as a full domain — Security;
- generic production release infrastructure — shared release constitution.

---

# 3. ACTIVE MODULES

- `OOPSE_MASTER_PROMPT.md` — OOPSE00 orchestration
- `OOPSE01_FORENSIC_BASELINE.md`
- `OOPSE02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`
- `OOPSE03_DESIGN_REASONING_ASSESSMENT.md`
- `OOPSE04_TOOLING_REFACTORING_TESTING_AI.md`
- `OOPSE05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`
- `OOPSE06_ACCEPTANCE_HARDENING_RC_READINESS.md`
- `OOPSE_CONSTITUTION_ROUTER.json`
- `OOPSE_ARCHITECTURE_MAP.md`
- `STATUS.md`

---

# 4. EXECUTION COMMAND

Work/Codex may be instructed:

> Thực thi môn OOP Design & Software Engineering theo `OOP_SOFTWARE_ENGINEERING_PROMPT_SYSTEM/00_README.md`. Đọc STATUS, xác định module active, chỉ nạp điều khoản Hiến pháp do router chỉ định, tiếp tục từ evidence hiện tại, không re-audit toàn hệ nếu diff không yêu cầu, chỉ chuyển bước khi exit gate PASS.

---

# 5. EXECUTION ORDER

Run exactly:

`OOPSE00 context`

→ `OOPSE01 forensic baseline`

→ `OOPSE02 academic/canonical foundation`

→ `OOPSE03 design reasoning + assessment`

→ `OOPSE04 tooling/refactoring/testing/AI`

→ `OOPSE05 learner experience + authoring + integration`

→ `OOPSE06 acceptance + hardening + RC`

→ shared production release.

---

# 6. STARTING PROCEDURE FOR EVERY SESSION

1. Read this README.
2. Read `STATUS.md`.
3. Read only the active OOPSE module.
4. Read `OOPSE_CONSTITUTION_ROUTER.json`.
5. Load only routed constitution clauses.
6. Inspect current-main diff / affected files.
7. Continue from existing evidence.
8. Run targeted tests first.
9. Run required regression second.
10. Move to next module only after current exit gate PASS.

Token rule:

`README → STATUS → ACTIVE MODULE → ROUTER → DIFF → TESTS`

not:

`all prompts → all constitutions → whole repo`.

---

# 7. OOPSE00 — ORCHESTRATION CONTEXT

Read:

`OOPSE_MASTER_PROMPT.md`.

OOPSE00 defines:

- owners;
- subject boundaries;
- change classes;
- evidence hierarchy;
- revalidation;
- non-negotiable design/engineering invariants.

It is context, not a long standalone implementation phase.

---

# 8. STEP 1 — EXECUTE OOPSE01

Open:

`OOPSE01_FORENSIC_BASELINE.md`.

Goal:

**discover actual OOP/software-engineering content and implementation before redesigning anything.**

Audit:

- current OOP lessons;
- UML/modeling;
- architecture/design examples;
- code labs;
- testing;
- refactoring;
- design patterns;
- Git/CI/build tooling;
- code review;
- project artifacts;
- assessments;
- authoring;
- duplicate owners;
- legacy;
- unsafe code-execution paths;
- adjacent Python/lifecycle/project-management overlap.

OOPSE01 is audit-only.

### OOPSE01 exit gate

Move to OOPSE02 only when:

- actual course/repository scope is known;
- current modeling/code/testing/tooling paths are mapped;
- assessment owner is known;
- duplicate/legacy risks are classified;
- adjacent subject boundaries are explicit;
- OOPSE02 input contract exists.

---

# 9. STEP 2 — EXECUTE OOPSE02

Open:

`OOPSE02_ACADEMIC_BLUEPRINT_CANONICAL_MODEL.md`.

Goal:

**build one canonical software-design and engineering model.**

Canonical chain:

`Need / Requirement`

→ `Domain Concept`

→ `Responsibility`

→ `Object / Component`

→ `Interface / Contract`

→ `Collaboration`

→ `State / Behavior`

→ `Dependency`

→ `Architecture`

→ `Implementation`

→ `Test`

→ `Refactor`

→ `Quality Evidence`

→ `Change Impact`.

After PASS:

`OOPSE ACADEMIC FOUNDATION LOCKED`.

Later modules cannot silently redefine requirements, responsibilities, interfaces, dependencies, ownership, or design identity.

---

# 10. STEP 3 — EXECUTE OOPSE03

Open:

`OOPSE03_DESIGN_REASONING_ASSESSMENT.md`.

Goal:

**build the design-reasoning and grading brain.**

Learner workflow:

`Requirement`

→ `identify actors/domain`

→ `assign responsibilities`

→ `define interfaces/contracts`

→ `choose collaboration`

→ `choose composition/inheritance/dependency`

→ `model behavior/state`

→ `implement`

→ `test`

→ `review smells`

→ `refactor`

→ `justify trade-offs`.

Critical rule:

> Code that passes one test is not automatically a good object-oriented design.

OOPSE03 grades separately:

- requirement understanding;
- responsibility allocation;
- abstraction;
- contract/interface design;
- coupling/cohesion;
- collaboration;
- behavior/state;
- extensibility;
- testability;
- implementation correctness;
- refactoring quality;
- trade-off justification.

After PASS:

`OOPSE DESIGN REASONING & ASSESSMENT CONTRACT LOCKED`.

---

# 11. STEP 4 — EXECUTE OOPSE04

Open:

`OOPSE04_TOOLING_REFACTORING_TESTING_AI.md`.

Goal:

**provide capability-based code/model/testing/refactoring support without turning tools into design authority.**

Potential capabilities:

- Python/code runtime reuse;
- class/object model explorer;
- UML/model rendering;
- dependency graph;
- static analysis;
- lint/type/test provider;
- code coverage;
- mutation testing where appropriate;
- refactoring sandbox;
- Git diff/code-review view;
- build/dependency analyzer;
- AI Design/Code Review Tutor.

Rules:

- linter ≠ architecture authority;
- passing tests ≠ design quality;
- coverage ≠ correctness;
- pattern use ≠ good design automatically;
- AI ≠ official design authority;
- generated code must remain reviewable/testable.

---

# 12. STEP 5 — EXECUTE OOPSE05

Open:

`OOPSE05_LEARNING_EXPERIENCE_AUTHORING_INTEGRATION.md`.

Goal:

**turn OOP/software-engineering reasoning into a usable subject inside the shared platform.**

Subject-specific UI can include:

- requirement/design workspace;
- domain/class/object model;
- sequence/collaboration view;
- state model;
- code lab;
- test panel;
- dependency graph;
- diff/refactor view;
- code-review workspace;
- architecture decision record;
- error/smell notebook;
- project evidence/portfolio.

Reuse:

- global App Shell;
- shared Design System;
- Python runtime;
- generic mastery/evidence;
- generic authoring lifecycle;
- generic release infrastructure.

No second platform.

---

# 13. STEP 6 — EXECUTE OOPSE06

Open:

`OOPSE06_ACCEPTANCE_HARDENING_RC_READINESS.md`.

Goal:

**prove lessons, grader, code runtime, model views, test tooling, AI and authoring all agree on the same design/engineering truth.**

Must test:

- inheritance misuse;
- composition alternatives;
- LSP/contract violations where in scope;
- dependency inversion/coupling issues where in scope;
- God object;
- feature envy/data clumps/long method or other smells where supported;
- invalid pattern application;
- fake polymorphism;
- fragile tests;
- overmocking;
- untested error paths;
- refactoring behavior preservation;
- multiple valid designs;
- static-analysis false certainty;
- coverage misuse;
- generated-code reviewability;
- hidden-test leakage;
- AI overclaim;
- runtime security;
- legacy/duplicate owners;
- exact RC readiness.

Produces exact RC + production smoke profile.

---

# 14. STEP 7 — SHARED PRODUCTION RELEASE

After OOPSE06 PASS:

Do not create OOPSE07.

Use:

`../../constitution/C3_RELEASE_ANNEX_SHARED.md`

with the OOPSE06 production smoke profile.

---

# 15. FAILURE ROUTING

Wrong canonical design concept:

→ OOPSE02.

Wrong reasoning/grader:

→ OOPSE03.

Tooling/refactor/test/AI defect:

→ OOPSE04.

UX/authoring defect:

→ OOPSE05.

Regression/security/RC defect:

→ OOPSE06.

Generic Python/platform/lifecycle/project-management issue:

→ corresponding owner/global constitution.

---

# 16. REVALIDATION

OOPSE02 changes:

→ revalidate affected OOPSE03–OOPSE06.

OOPSE03 changes:

→ revalidate OOPSE04–OOPSE06.

OOPSE04 provider/protocol changes:

→ revalidate OOPSE05–OOPSE06.

OOPSE05 interaction changes:

→ revalidate OOPSE06 affected UX/a11y.

OOPSE06 detects semantic defect:

→ route upstream; do not patch canonical design truth in OOPSE06.

---

# 17. DEFINITION OF COMPLETE

Prompt architecture complete when OOPSE00–OOPSE06 exist.

Repository implementation complete only after:

`OOPSE01 PASS`

→ `OOPSE02 PASS`

→ `OOPSE03 PASS`

→ `OOPSE04 PASS`

→ `OOPSE05 PASS`

→ `OOPSE06 PASS`

→ shared production verification.

---

# 18. FINAL PRINCIPLE

**RESPONSIBILITY BEFORE CLASS.**
**CONTRACT BEFORE IMPLEMENTATION.**
**COMPOSITION BEFORE INHERITANCE BY DEFAULT, NOT BY DOGMA.**
**TEST BEHAVIOR, NOT PRIVATE IMPLEMENTATION ACCIDENTS.**
**REFACTOR WITHOUT CHANGING REQUIRED BEHAVIOR.**
**PATTERNS ARE TOOLS, NOT GOALS.**
**ONE CANONICAL DESIGN MODEL · MANY VIEWS AND TOOLS.**

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
