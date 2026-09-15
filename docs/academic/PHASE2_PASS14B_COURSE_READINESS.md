# Phase 2 · Pass 14B — Course Readiness Runtime

Status: `COURSE_READINESS_RUNTIME_VALIDATED_BROWSER_PASS`

Branch: `phase2/official-course-learning-architecture`

## Scope

Pass14B turns the corrected Semester-1 architecture into a read-only course-readiness layer for:

- d01 — Иностранный язык
- d02 — Методология научного познания
- d03 — Аналитические модели автоматизированных систем обработки информации и управления
- d04 — Многомерный анализ данных в системах искусственного интеллекта
- d05 — Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления
- d06 — Оптимизация баз данных систем машинного обучения
- d15 — Технологии разработки программного обеспечения
- p02 — Научно-исследовательская работа

The runtime keeps three independent axes: prerequisite readiness, course lifecycle and assessment-event readiness. It does not infer course completion and it does not mutate the scheduler.

## Integrity fixes discovered by Browser/E2E

1. Dynamically injected Phase2 JavaScript originally waited only for `DOMContentLoaded`; when injected after the event had already fired, it never initialized. The bootstrap is now `document.readyState` safe.
2. Phase1 `courseDependencies` rows are keyed by `courseId`, not `id`. Generic `byId()` therefore made courses such as d04 appear to have no critical prerequisites even when P2/P3/P10 existed. Runtime now resolves dependencies with `find(x => x.courseId === courseId)`, and regression validators lock d04 → P2/P3/P10 and d05 → P4/P5/P8.

## Preserved semantic boundaries

- d01 uses course-local English readiness; P0 Russian is not its prerequisite gate.
- No registered global critical gate never means automatic `COURSE_READY`.
- d01/d15/p02 keep unresolved semester-specific allocation where the locked curriculum does not publish a split.
- Pure `Зчт` is not assigned a fabricated numeric target.
- No UGV/USV/robotics/control topic is injected into the default route.

## Validation evidence

Pass14B browser-stable run before Pass14C extension:

- Workflow run: `34663263894`
- Head: `664566f4a0027a09ce0b9ec43e8af75239c97f7a`
- Static architecture/registry/runtime validation: SUCCESS
- Browser course-readiness acceptance: SUCCESS

Pass14B regression was rerun after adding the Pass14C event bridge:

- Workflow run: `34664545817`
- Head: `255aaa6684ffd266282f28b5eb50228612d14c42`
- `Run Pass14B browser regression`: SUCCESS
- Phase2 static validators and syntax checks: SUCCESS

At closure, the Phase2 branch compared with `main` as `ahead`, `behind_by: 0`; `main` remains unmodified by this pass.
