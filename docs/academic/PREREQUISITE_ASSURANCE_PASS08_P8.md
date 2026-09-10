# Prerequisite Assurance · Pass 08 · P8 Software Engineering

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P8_BLUEPRINT_VALIDATED_CI_PASS`
CI run: `34455096221`
Head SHA validated: `f032ed0cdd3be59d4fcfb1d5414f80b4330fd1fb`

## Goal

Build a compact software-engineering readiness layer for the official IU5 2026 courses:

- `d05 · Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления` — semester 1, 6 credits / 216 hours, exam + differentiated credit;
- `d15 · Технологии разработки программного обеспечения` — semesters 1–2, 6 credits / 216 hours, exam + differentiated credit.

P8 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Reuse before rebuild

Pass 08 reuses existing Programming content:

- PR07 Git/GitHub basics;
- PR14 pytest unit testing;
- PR17 OOP class/interface/responsibility;
- PR18 package/module architecture;
- PR19 Strategy/Adapter/Factory;
- PR22 requirement/issue/milestone workflow;
- PR23 integration/data testing;
- PR24 lightweight CI.

PR17 and PR19 contain project-specific UGV examples in the old vault. They are reused only at the concept level; the prerequisite route uses neutral information-system examples. No project-specific architecture is allowed to become a P8 requirement.

## New P8 pack

Added `assets/data/prerequisite-packs/p08-software-engineering.json` with 11 nodes:

1. System boundary, stakeholders and problem framing.
2. Functional/non-functional requirements, acceptance criteria and traceability.
3. Minimal sufficient UML: use-case, class, sequence, component and deployment views.
4. OOP responsibility and SOLID.
5. Strategy, Adapter and Factory without pattern overuse.
6. Software architecture, modules, interfaces and data contracts.
7. Quality attributes and architecture trade-offs.
8. Software lifecycle and change management.
9. Git/review/configuration/release workflow.
10. Unit/integration/system/acceptance/regression testing.
11. End-to-end mini-project bridge into d05/d15.

Downstream mapping is preserved for d14 IS project management, d19 lifecycle and p01 project-technological practice, but those later subjects do not expand the active semester-1 route.

## Diagnostic design

Global formula remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

P8 registry target is 88. D1 application minimum remains 85 and zero critical misconceptions are allowed. Broad P8 study stops at MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions).

The pack contains:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 10 critical misconceptions;
- 8 targeted repair routes.

D1 emphasizes actual design competence: turning vague requirements into testable requirements, selecting UML views, refactoring a god class, applying SOLID/patterns only when justified, defining interfaces/data contracts, explaining quality trade-offs, impact analysis after requirement changes, Git/review/release workflow, test-level classification and a traceability-backed mini dossier for oral defense.

## Scope guard

The active P8 route excludes enterprise framework specialization, deep microservices, Kubernetes, service mesh, cloud architecture certification, advanced DevOps platform engineering and competitive programming. It also excludes UGV/USV/control/hardware-specific architecture from the prerequisite path.

## Validator and CI

Added `scripts/validate-p08-software-engineering.js` and wired it into the Academic 2026 workflow.

The validator checks:

- exact P8 mastery policy and non-administrative status;
- exact d05/d15 identities, credits, hours, semesters and assessments;
- downstream d14/d19 and p01 identities;
- actual existence and identity of all eight reused Programming lessons;
- concept-only neutralization policy for PR17/PR19;
- 11 unique, ordered, acyclic nodes;
- required requirements/UML/SOLID/pattern/architecture/quality/lifecycle/release/testing signals;
- D0/D1/D2 counts, references and Russian prompts;
- misconception and repair-route integrity;
- scope guards against platform/project/control detours;
- independent requirement-to-test traceability sanity checks;
- independent semantic-version ordering sanity checks.

CI run `34455096221` completed successfully. Every step passed, including official curriculum validation, prerequisite coverage validation, P9/P6/P4/P7 regression validators, `Validate P8 Software Engineering pack`, runtime JavaScript syntax and runtime reference checks.

## Runtime policy

Pass 08 still does not write diagnostic scores, mutate the adaptive scheduler, overwrite Programming lessons, create a new top-level subject or merge into `main`.

## Next pass

Pass 09 should implement `P10 · Scientific/Data Python` by reusing PR04/PR05/PR08/PR12/PR25/PR26 and filling only missing readiness nodes: SciPy essentials, vectorization/numerical shape discipline, train/validation leakage prevention, sklearn Pipeline/ColumnTransformer, reproducible preprocessing and dataset/schema validation.
