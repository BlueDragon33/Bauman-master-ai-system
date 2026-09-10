# Prerequisite Assurance · Pass 12 · P0 Technical Russian

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P0_BLUEPRINT_VALIDATED_CI_PASS`
Validated SHA: `d1b476caee8ec60c1ac576674f703bea0978ec53`
CI run: `34492498442`

## Goal

Convert the existing Russian subject from a broad learning repository into a course-aware technical-Russian prerequisite layer without duplicating the general Russian/STANKIN curriculum.

P0 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Audit finding

The Russian subject already has strong infrastructure: listening/speaking, dialogue, vocabulary, grammar, writing, tests and large deep-speaking/dialogue datasets. Its curriculum already contains useful lessons R05-R14 for technical prompt reading, lecture notes, classroom interaction, science vocabulary, exam instructions, Bauman course requirements, teamwork and technical problem explanation.

The missing layer was not another Russian course. It was a direct mapping from that existing content to official IU5 courses and graded-event language.

## P0 pack

Added `assets/data/prerequisite-packs/p00-technical-russian.json` with 12 nodes:

1. instruction verbs and prompt structure;
2. course/assessment/submission language;
3. lecture listening and definition-assumption-conclusion note taking;
4. mathematics/probability/model language;
5. multivariate/statistics/data language;
6. OOP/UML/software-engineering language;
7. database/query-optimization language;
8. research methodology and NIR language;
9. structured technical solution presentation;
10. oral Q&A, explanation, justification and comparison;
11. team/lab progress communication;
12. course-specific just-in-time glossary/oral pack.

## Reuse before rebuild

P0 reuses R05-R14 from the existing Russian knowledge index. The new pack does not overwrite those lessons and does not create a second general-Russian curriculum.

The course-specific layer contains six mini-glossaries for:

- d03 Analytical Models / Queueing;
- d04 Multivariate Data Analysis;
- d05 OOP Design;
- d06 Database Optimization;
- d15 Software Development Technologies;
- d02 Methodology + p02 NIR.

These glossary entries are learning support only. They are not represented as official course-syllabus claims.

## Official-course mapping

The pack maps P0 to d01, d02, d03, d04, d05, d06, d15, p02, p04 and g01. Official names and assessment codes remain sourced only from `official-curriculum-iu5-2026.json`.

The pack deliberately does not infer a course grading scheme merely from Russian labels such as `зачёт` or `экзамен`.

## Diagnostic

Global formula remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

P0 target = 90, D1 minimum = 85, critical misconceptions allowed = 0.

Pack contents:

- D0: 20 recall items;
- D1: 12 application tasks;
- D2: 10 Russian oral prompts;
- 13 critical misconceptions;
- 8 repair routes with explicit stop conditions;
- 14 instruction verbs;
- 12 reusable oral frames.

The D1 tasks require actual performance: reading technical prompts, extracting deliverables, taking lecture notes, presenting an M/M/1 solution, explaining multivariate data/PCA vocabulary, defending UML/OOP decisions, discussing query plans, presenting a research pitch, handling follow-up questions and giving a lab stand-up.

## STOP / continuity policy

P0 MASTERED does not mean 'stop Russian'. It means stop broad generic remediation. The learner continues real Russian through STANKIN and official coursework, while the Hub activates only the small course/event-specific glossary and oral pack needed next.

This prevents vocabulary-marathon behavior from displacing official classes or critical technical prerequisites.

## Validator and CI

Added `scripts/validate-p00-technical-russian.js` and wired it into the Academic 2026 workflow.

The validator checks:

- P0 registry target/topic integrity;
- existing Russian capabilities and R05-R14 identities;
- locked official identities for d01/d02/d03/d04/d05/d06/d15/p02/p04/g01;
- assessment-code integrity without invented grading rules;
- instruction-verb completeness;
- glossary mapping to valid official course IDs;
- 12-node acyclic route;
- D0/D1/D2 counts and substantive Russian prompts;
- misconception/repair-route integrity and measurable stop conditions;
- P0 scope and STANKIN non-replacement policy;
- independent weighted-score, D1-floor, misconception and JIT-glossary selection invariants.

CI run `34492498442` passed P0 and the entire Academic 2026 regression chain: curriculum, coverage audit, P9, P6, P4, P7, P8, P10, P11, J1, P0, JS syntax and index runtime references.

## Snapshot note

`prerequisite-content-coverage-2026.json` remains the Pass03 audit snapshot and still labels P0 as `deferred_language_audit`. Pass12 does not rewrite that historical snapshot. Pass13 integration must compute current implementation status from the validated packs rather than treating the old audit snapshot as live state.

## Runtime policy

Pass 12 does not write learner scores, mutate scheduler behavior, overwrite Russian lessons, create a new subject or merge into `main`.

## Next

Pass 13 is the final integration gate for phase 1: diagnostic state model, honest unassessed state, repair routing, STOP rules, course readiness, grade-risk-aware task priority, persistence/storage checks and browser/responsive/regression acceptance. No merge to `main` until those gates pass.
