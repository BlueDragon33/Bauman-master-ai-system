# Prerequisite Assurance · Pass 10 · P11 Research Foundation

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P11_PACK_IMPLEMENTED_GATE_PENDING`

## Goal

Build a topic-neutral research-readiness layer for the locked IU5 2026 curriculum, especially:

- `d02 · Методология научного познания` — semester 1;
- `p02 · Научно-исследовательская работа` — 21 credits / 756 hours, semesters 1–4;
- `d16 · НИР по обработке и анализу данных` — semester 3;
- `p05 · Преддипломная практика` — semester 4;
- `g01 · Подготовка и защита ВКР` — semester 4.

P11 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Audit finding

The existing Research app already contains a strong reusable process: literature → question → baseline → experiment → artifact → report → defense. However, its top-level target and early lessons force UGV/USV as the default thesis direction. That domain assumption is not present in the locked IU5 2026 curriculum and therefore must not control prerequisite scheduling.

Pass 10 does not rewrite the legacy Research vault. It introduces a neutral prerequisite layer that reuses research concepts while treating legacy UGV/USV examples as examples/reference only.

## New P11 pack

Added `assets/data/prerequisite-packs/p11-research-foundation.json` with 12 nodes:

1. Research problem, scope and feasibility.
2. Literature search and source quality.
3. Literature matrix, claim–evidence and citation traceability.
4. Research question, hypothesis and operationalization.
5. Baseline, metrics and evaluation protocol.
6. Experiment design, controls, confounders and leakage.
7. Reproducibility, research log and artifacts.
8. Result analysis, uncertainty and limitations.
9. Novelty, contribution, feasibility and risk.
10. NIR technical report and argument structure.
11. Supervisor checkpoints and topic change control.
12. NIR → VKR → pre-defense/defense continuity.

## Reuse before rebuild

Pass 10 reuses verified Research lessons at concept level:

- `r_p02_l1` literature search/management;
- `r_p03_l1` research question/hypothesis/metric;
- `r_p04_l1` preliminary topic memo/data/baseline/risk;
- `r_s02_l1` paper annotation in Russian;
- `r_m102_l1` NIR topic novelty/feasibility;
- `r_m201_l1` proposal/baseline;
- `r_m301_l1` experiment sprint;
- `r_m302_l1` NIR report/thesis chapter;
- `r_m401_l1`, `r_m402_l1`, `r_m403_l1` pre-diploma/VKR/defense evidence.

No duplicate broad research-methodology course is created.

## Research-track neutralization

Before supervisor/formal topic confirmation:

`state = TOPIC_NEUTRAL`

`activeTrack = null`

Candidate tracks are comparison/reference only:

- LLM / RAG / AI Agents;
- ML / Data Systems;
- Neural / CV / NLP;
- Time Series / Decision Support;
- Logical / Mivar AI;
- Database / Performance / AI Systems;
- Autonomous Systems / UGV as optional track.

Only supervisor/formal topic confirmation may promote one track to `ACTIVE_NIR`. All others become `REFERENCE`. The scheduler is not allowed to infer a thesis track from old UGV/USV examples.

## Public IU5 NIR evidence

The current public IU5 NIR page states that its report is due by the end of week 17 on that page, requires a supervisor grade/signature, uses title/task/contents/introduction/main/conclusion/references, requires at least 10 pages for introduction+main+conclusion, asks for relevance/novelty/methods, and at least 20 literature sources.

This page is retained only as public learning/report evidence. Those exact counts/deadlines are **not** hard-coded as a locked 2026 master cohort rule because the page does not prove that they are the exact requirements for every 2026 master cohort.

## Diagnostic design

Global mastery formula remains:

`M = 0.25*D0 + 0.50*D1 + 0.25*D2`

P11 registry target is 88. D1 application minimum is 85 and zero critical misconceptions are allowed. Broad methodology study stops at MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions); thereafter the learner works on real NIR/VKR artifacts instead of consuming more generic methodology content.

Pack contents:

- D0: 18 recall items;
- D1: 12 application tasks;
- D2: 8 bilingual VI/RU oral prompts;
- 12 critical misconceptions;
- 8 targeted repair routes.

D1 checks actual research competence: problem framing, source selection, claim-source traceability, measurable RQ/hypothesis, baseline/metric choice, fair experiment matrix, reproducibility package, non-cherry-picked result analysis, topic feasibility matrix, NIR outline, supervisor decision log and NIR→VKR evidence index.

## Scope guard

The default P11 path excludes forced UGV/USV or LLM/RAG topic selection, robotics hardware procurement, FPGA/PLC/SCADA specialization, publication-count chasing, fabricated citations/novelty and deep philosophy-of-science detours unrelated to course/NIR needs.

## Validator

Added `scripts/validate-p11-research-foundation.js`.

The validator checks:

- P11 registry target/topic integrity;
- exact locked identities for d02, p02, d16, p05 and g01;
- NIR remains 21 credits / 756 hours / semesters 1–4;
- actual existence/title identity of reused Research lessons;
- `TOPIC_NEUTRAL` and `activeTrack = null` before supervisor confirmation;
- seven diverse candidate tracks including autonomous systems only as optional;
- 12 unique ordered acyclic nodes;
- required research-method signals;
- D0/D1/D2 counts, references and Russian oral prompts;
- misconception and repair-route integrity;
- project/control-neutral active content;
- independent claim→source traceability, validation/test disjointness and topic-lock invariants;
- correct evidence labeling: official curriculum is locked, public NIR page is non-locked cohort evidence.

## Runtime policy

Pass 10 does not write diagnostic scores, mutate the adaptive scheduler, overwrite Research lessons, auto-select a thesis track, create a new top-level subject or merge into `main`.

## Next pass after CI

Pass 11 should implement `J1 · Information-System Architecture` around a neutral ASOIU information-system case: boundary → components → interfaces/data contracts → client/service/database flow → deployment → latency/throughput/bottleneck → availability/reliability → architecture documentation. Robot/controller cases remain optional examples only.
