# Phase 2 · Pass 14A — Semester 1 Official Course Learning Architecture

Status: `S1_COURSE_ARCHITECTURE_VALIDATED_CI_PASS`

Branch: `phase2/official-course-learning-architecture`

## Goal

Introduce a course-first orchestration layer on top of the completed Academic 2026 prerequisite system. The architecture must answer: which official semester-1 course is active, which critical prerequisite gate is blocking it, which competency block is relevant, and which official assessment code the learner is preparing for.

## Source boundary

Official identity, credits, hours, semester and assessment codes are mirrored only from `assets/data/official-curriculum-iu5-2026.json`.

Prerequisite dependencies are mirrored only from `assets/data/prerequisite-registry-iu5-2026.json` and remain competency prerequisites, not Bauman administrative prerequisites.

Competency blocks in `assets/data/course-learning-architecture-s1-2026.json` are planning inferences unless they explicitly carry a public IU5 learning source. They must not be presented as the official syllabus.

## Semester-1 route

The stable course set is:

- d01 — Иностранный язык
- d02 — Методология научного познания
- d03 — Аналитические модели автоматизированных систем обработки информации и управления
- d04 — Многомерный анализ данных в системах искусственного интеллекта
- d05 — Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления
- d06 — Оптимизация баз данных систем машинного обучения
- d15 — Технологии разработки программного обеспечения
- p02 — Научно-исследовательская работа

## Readiness policy

Course readiness uses `worst critical prerequisite gate wins`. Internal target remains 90, READY requires overall >=90, D1 >=85 and zero critical misconceptions. MASTERED requires overall >=95, D1 >=90 and zero critical misconceptions.

A course does not become READY from an average across strong and weak prerequisite gates.

## Scope guards

The default course route does not inject UGV/USV, robotics, PID/LQR, FPGA/HDL, PLC/SCADA, Kalman/sensor fusion or LLM/RAG/agents unless an official task or confirmed NIR/VKR direction requires them.

NIR remains `TOPIC_NEUTRAL` until supervisor or confirmed NIR/VKR direction activates a specialized track.

## Public IU5 evidence currently attached

- d03: `https://e-learning.bmstu.ru/iu5/course/view.php?id=48` supports queueing/analytical-model preparation but is not treated as the complete 2026 syllabus.
- p02: `https://e-learning.bmstu.ru/iu5/course/view.php?id=153` is public NIR guidance only; numerical requirements are not locked as universal 2026 master rules.

## Validation

Validator: `scripts/validate-course-learning-architecture-s1-2026.js`

CI workflow: `.github/workflows/academic-2026-phase2-course-architecture.yml`

Validated run: `34581091203`

Validated head before this documentation-only commit: `19211afcfae614f06da54e91de93de780d320f41`

Result: SUCCESS.

The validator checks exact official course identity/hours/credits/semester/assessment, exact prerequisite dependency mapping, unique competency-block IDs, evidence classification, default-route scope guards, NIR topic neutrality and preservation of the existing Academic 2026 registry invariants.
