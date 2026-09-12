# Phase 2 · Pass 14A-R — Semester 1 Course Architecture Integrity Correction

Status: `S1_COURSE_ARCHITECTURE_INTEGRITY_STABLE`

Branch: `phase2/official-course-learning-architecture`

## Why Pass14A was reopened

The first Pass14A was structurally consistent, but semantic review found assumptions that were too strong for the available evidence. The correction pass was completed before any Phase2 readiness UI/runtime expansion.

## Corrections locked

1. `d01 — Иностранный язык` is no longer mapped to P0 Technical Russian. Public BMSTU L2 learning evidence identifies Foreign Language for IU as English and exposes a master's-programme category. Phase2 therefore uses a course-local English readiness placeholder with no invented CEFR threshold or exam format.
2. P0 remains Russian language-of-instruction / technical-Russian JIT support for technical courses, NIR, pedagogy and VKR. It does not replace d01.
3. Multi-semester items `d01`, `d15`, and `p02` keep whole-course totals but have semester-1 credits/hours and assessment timing set to unresolved. The Hub must not split or infer them.
4. Readiness is modeled on three independent axes: prerequisite readiness, course lifecycle and event readiness. A course can be active while prerequisite repair is still required.
5. Internal target 90 applies only to graded planning events. A pure `Зчт` carries no fabricated numeric 90 target.
6. The Pass13C risk engine no longer uses whole-course credits or undated assessment codes as current-semester priority weight for a multi-semester course.
7. A course with no registered global critical gate is `UNKNOWN`, not automatically `CLEAR`; d01 uses its course-local English readiness model.
8. The unverified secondary d01 library record was removed. Until another source is independently verified, d01 uses only the verified public L2 learning portal evidence.

## Source boundary

Official identity and whole-course credits/hours/semester membership/assessment codes come from `assets/data/official-curriculum-iu5-2026.json`.

Competency prerequisites come from `assets/data/prerequisite-registry-iu5-2026.json` and remain Hub planning prerequisites, not Bauman administrative prerequisites.

Course competency blocks are planning inferences unless explicitly backed by public BMSTU/IU5 learning evidence. They are never presented as the official syllabus.

## Semester-1 course set

- d01 — Иностранный язык
- d02 — Методология научного познания
- d03 — Аналитические модели автоматизированных систем обработки информации и управления
- d04 — Многомерный анализ данных в системах искусственного интеллекта
- d05 — Объектно-ориентированное проектирование автоматизированных систем обработки информации и управления
- d06 — Оптимизация баз данных систем машинного обучения
- d15 — Технологии разработки программного обеспечения
- p02 — Научно-исследовательская работа

## Public evidence retained

- d01: `https://e-learning.bmstu.ru/l/course/index.php?categoryid=3` — L2 public learning portal; supports English separation only. No CEFR level, exact assessment format or exact 2026 syllabus is inferred.
- d03: `https://e-learning.bmstu.ru/iu5/course/view.php?id=48` — supports queueing/analytical-model preparation, not a complete 2026 syllabus claim.
- p02: `https://e-learning.bmstu.ru/iu5/course/view.php?id=153` — public NIR guidance only; numerical requirements are not treated as universal 2026 master's rules.

## Validation gates

- Corrected Phase2 architecture validator: `scripts/validate-course-learning-architecture-s1-2026.js`
- Source-boundary validator: `scripts/validate-phase2-source-integrity.js`
- Corrected P0 validator: `scripts/validate-p00-technical-russian.js`
- Semester-safe risk validator: `scripts/validate-risk-engine-13c.js`
- Base Academic registry validator: `scripts/validate-academic-2026.js`

Phase2 workflow run `34662351499`: SUCCESS on head `10bcefc7cf7d2867de588487929fbd04a44eeb80`.

Full Academic regression run `34662154224`: SUCCESS on head `93a32a0957225f365e6b2f58239b61397fe7fb5f`, including Browser/E2E acceptance after the risk/runtime correction.

The later commits only tighten source evidence, the Phase2 CI gate and preserve the latest main preview-production-D1 guard; they do not introduce a new learning/runtime feature.

## Main synchronization

Latest `main` hardening commit `309530b3214a334f381e4dc80ec7638d62615f30` has been reconciled into this Phase2 branch. The branch is no longer behind `main` at the time of this audit.

## Decision

Pass14A-R is stable enough to serve as the semantic base for Pass14B. No Phase2 feature should bypass these invariants. `main` is not modified by this correction pass.
