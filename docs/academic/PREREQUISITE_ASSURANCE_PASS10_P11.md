# Prerequisite Assurance · Pass 10 · P11 Research Foundation

Date: 2026-09-10
Branch: `temp/bauman-master-hub-prereq-2026`
Status: `P11_BLUEPRINT_VALIDATED_CI_PASS`
Validated SHA: `cc9f1155cbacaf8f3c40c285903ec6f6822e30e4`
CI run: `34478766493`

## Goal

Build a topic-neutral research-readiness layer for the locked IU5 2026 curriculum, especially `d02 · Методология научного познания`, `p02 · Научно-исследовательская работа`, `d16 · НИР по обработке и анализу данных`, `p05 · Преддипломная практика`, and `g01 · Подготовка и защита ВКР`.

P11 is a competency prerequisite inferred by Bauman Master Hub. It is not an administrative prerequisite declared by Bauman.

## Audit finding

The existing Research app already has a reusable process: literature → question → baseline → experiment → artifact → report → defense. Its legacy top-level target and early lessons, however, force UGV/USV as the default thesis direction. The locked IU5 2026 curriculum does not impose that single domain, so the prerequisite route must remain topic-neutral.

Pass 10 does not rewrite the legacy Research vault. It reuses its valid research-method concepts while treating UGV/USV-specific material as examples/reference only.

## P11 pack

`assets/data/prerequisite-packs/p11-research-foundation.json` contains 12 nodes:

1. research problem, scope and feasibility;
2. literature search and source quality;
3. literature matrix, claim–evidence and citation traceability;
4. research question, hypothesis and operationalization;
5. baseline, metrics and evaluation protocol;
6. experiment design, controls, confounders and leakage;
7. reproducibility, research log and artifacts;
8. result analysis, uncertainty and limitations;
9. novelty, contribution, feasibility and risk;
10. NIR technical report and argument structure;
11. supervisor checkpoints and topic change control;
12. NIR → VKR → pre-defense/defense continuity.

## Reuse before rebuild

Concept-level reuse is locked to existing Research lessons including `r_p02_l1`, `r_p03_l1`, `r_p04_l1`, `r_s02_l1`, `r_m102_l1`, `r_m201_l1`, `r_m301_l1`, `r_m302_l1`, `r_m401_l1`, `r_m402_l1`, and `r_m403_l1`. No duplicate broad research-methodology course is created.

## Research-track neutralization

Before supervisor/formal topic confirmation:

- `state = TOPIC_NEUTRAL`
- `activeTrack = null`
- candidate tracks are comparison/reference only: LLM/RAG/Agents; ML/Data Systems; Neural/CV/NLP; Time Series/Decision Support; Logical/Mivar AI; Database/Performance/AI Systems; Autonomous Systems/UGV as optional.

Only supervisor/formal topic confirmation may promote one track to `ACTIVE_NIR`; all others become `REFERENCE`. The scheduler must not infer a thesis direction from legacy examples.

## Public IU5 NIR evidence

The public IU5 NIR page currently describes a report structure with title/task/contents/introduction/main/conclusion/references, supervisor assessment, relevance/novelty/methods, a week-17 deadline on that page, at least 10 pages for introduction+main+conclusion, and at least 20 literature sources. These details are stored as public learning/report evidence only and are explicitly **not** locked as universal 2026 master-cohort requirements unless confirmed for the actual cohort.

## Diagnostic

Global formula remains `M = 0.25*D0 + 0.50*D1 + 0.25*D2`.

P11 target = 88, D1 minimum = 85, critical misconceptions allowed = 0. The pack has D0=18, D1=12, D2=8, 12 critical misconceptions and 8 targeted repair routes. At MASTERED (`>=95`, D1 `>=90`, zero critical misconceptions), broad methodology study stops and time moves to real NIR/VKR artifacts.

## Scope and validation

The default route excludes forced UGV/USV or LLM/RAG topic selection, robotics-hardware procurement, FPGA/PLC/SCADA specialization, publication-count chasing, fabricated citations/novelty, and unrelated deep methodology detours.

`validate-p11-research-foundation.js` checks locked official-course identities, NIR 21 credits / 756 hours / semesters 1–4, existing reuse lesson identities, topic-neutral state, candidate-track policy, DAG integrity, diagnostic references, Russian oral prompts, misconceptions/repair routes, claim→source traceability, evaluation-set leakage, topic-lock logic, and evidence-label separation between the official curriculum and the public NIR page.

The first fully wired CI run correctly stopped because the scope validator treated negative teaching examples such as “do not fabricate citations” and “do not force UGV” as forbidden positive content. The validator was corrected to distinguish prohibited defaults from misconceptions that must be taught. The subsequent run `34478766493` passed P11 and the entire Academic 2026 regression chain.

## Runtime policy

Pass 10 does not write diagnostic scores, mutate the adaptive scheduler, overwrite Research lessons, auto-select a thesis track, create a new top-level subject, or merge into `main`.

## Next

Pass 11: `J1 · Information-System Architecture`, using a neutral ASOIU case: boundary → components → interfaces/data contracts → client/service/database flow → deployment → latency/throughput/bottleneck → availability/reliability → architecture documentation. Robot/controller cases remain optional examples only.
