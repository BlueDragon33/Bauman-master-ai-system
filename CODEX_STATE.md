# CODEX_STATE

Current task: `THEORY_CORE_C01_L04_PASS_08_MISCONCEPTIONS_AND_FAILURE_MODES`

Status: `PASS_08_DIAGNOSTIC_SYSTEM_VERIFIED`

Date: 2026-07-08
Branch: `main`

## Mandatory development order
1. Core content
2. `Tham khảo thêm` reference table
3. Slideshow
4. `Xem đầy đủ`
5. Final formula and layout normalization
6. Final integration and acceptance

Do not skip ahead.

## Per-lesson workflow
Each complete lesson passes through 14 passes and 73 controlled steps.

Core-content passes:
1. Scope lock — 4 steps
2. Bauman academic map — 5 steps
3. Pedagogical spine — 5 steps
4. Core academic content — 6 steps
5. Independent mathematics review — 5 steps
6. Engineering-model review — 5 steps
7. Complete worked case — 6 steps
8. Misconceptions and failure modes — 5 steps
9. Assessment and implementation contract — 5 steps

Presentation and integration passes:
10. `Tham khảo thêm` reference table — 4 steps
11. Slideshow — 6 steps
12. `Xem đầy đủ` — 5 steps
13. Formula and layout normalization — 5 steps
14. Final integration and acceptance — 7 steps

## Progress for §1.4
- Completed: 8/14 passes
- Remaining: 6/14 passes
- Completed steps: 41/73
- Remaining steps: 32/73

## Core architecture
- Current core draft: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Draft version: `CORE_C01_L04_V1_DRAFT`.
- Draft status remains `math_review_required`.
- Worked case status: `verified_pass_07`.
- Misconception system status: `verified_pass_08`.
- Failure-mode atlas status: `verified_pass_08`.
- Draft remains unapproved until PASS 09 is complete.
- `subjects/math/data/theory_lecture_content.json` remains unchanged during the core phase.
- C01-L04 is not registered in the manifest until passes 1–9 are complete.
- No UI/runtime or presentation file is modified during passes 1–9.

## Lesson identity
- Lesson: `§1.4 · Cơ sở, span và tọa độ`.
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Position: after §1.3 and before §1.5.
- Structural gold standard: `subjects/math/data/theory_core/theory_core_c01_l01.json`.

# PASS 01 — SCOPE LOCK
Status: PASS.

Locked prerequisites, required concepts, deferred matrix/spectral topics and the distinction between linear and nonlinear dependence.

# PASS 02 — BAUMAN ACADEMIC MAP
Status: PASS.

Locked the chain:
`linear combination → span → independence → basis → coordinates → uniqueness → change of basis → exact/approximate representation`.

# PASS 03 — PEDAGOGICAL SPINE
Status: PASS.

Locked:
- central thesis;
- 10 measurable outcomes;
- 9 learning phases;
- misconception-interception sequence;
- mastery narrative and retrieval plan.

# PASS 04 — CORE ACADEMIC CONTENT
Status: PASS FOR DRAFT CREATION.

Core draft contains:
- 10 learning outcomes;
- 16 notation rules;
- 9 core concepts;
- 9 mechanisms;
- 12 formula contracts;
- comparison logic;
- 12 assumption gates;
- bridges and downstream mapping.

# PASS 05 — INDEPENDENT MATHEMATICS REVIEW
Status: PASS.

Verified definitions, implications, formula domains, zero/redundant/non-orthogonal/near-dependent cases and the vector-versus-affine-point boundary.

# PASS 06 — ENGINEERING-MODEL REVIEW
Status: PASS WITH BINDING CONSTRAINTS.

Locked schema, units, frame direction, timestamps, route-frame construction, UGV/control/IMU boundaries, signal/data/AI compatibility, operational failures and required telemetry.

# PASS 07 — COMPLETE WORKED CASE
Status: PASS.

Verified UGV case:
- `t=(0.6,0.8)`, `n=(-0.8,0.6)`;
- `[v]_W=(5,1)^T m/s`;
- `[v]_R=(3.8,-3.4)^T m/s`;
- exact reconstruction and residual zero;
- norm preservation;
- order and normal-convention tests;
- mixed-frame, reversed-transform, non-unit and stale-basis failures;
- near-dependence contrast.

# C01-L04 PASS 08 — MISCONCEPTIONS AND FAILURE MODES

## Step 1 — Classification and expansion

The provisional misconception list was replaced with 20 reviewed misconceptions in four classes:
1. `object_vs_representation`;
2. `span_basis_uniqueness`;
3. `method_and_numerics`;
4. `engineering_and_ai_contracts`.

Each misconception includes:
- severity;
- incorrect belief;
- mathematical or modeling explanation;
- counterexample;
- observable symptom;
- root cause;
- diagnostic questions;
- corrective action;
- links to the relevant core content.

Critical themes covered:
- coordinate tuple versus vector;
- equal tuples under different bases;
- basis order;
- basis validity and target space;
- span membership versus uniqueness;
- redundant families;
- zero vector in a basis;
- dot-product misuse;
- orthogonal versus orthonormal;
- near dependence and coefficient instability;
- residual versus physical truth;
- route versus body frame;
- vector versus affine point;
- normal-sign convention;
- raw IMU specific force;
- nonlinear feature dependence;
- feature/dictionary versus basis;
- embedding-space compatibility;
- shape/units versus full representation compatibility.

## Step 2 — Counterexamples and repairs

Counterexamples are bound to exact calculations or explicit contracts:
- `[1,0]^T` under swapped bases;
- redundant family `e_1,e_2,e_1+e_2`;
- non-orthogonal basis with true coordinates `(1,2)` versus raw dots `(3,5)`;
- non-unit orthogonal directions producing incorrect `(19,-17)` coefficients;
- near-dependent basis producing `(-995,1000)`;
- left/right normal sign flip;
- world/route arrays with equal shape and units but different meanings;
- same-dimension embeddings from incompatible pipelines.

Repairs require the learner or implementation to:
- name the target space and ordered basis;
- validate spanning, independence and orthonormality separately;
- reconstruct the vector;
- inspect metadata and compatibility;
- test sensitivity where necessary.

## Step 3 — Engineering failure-mode atlas

A verified atlas of 18 operational failures was added:
1. swapped basis-column order;
2. reversed transform direction;
3. stale or unmatched timestamps;
4. changed normal convention;
5. non-unit direction used with dot shortcut;
6. zero/undefined route tangent;
7. body frame confused with route frame;
8. point treated as free vector;
9. mixed units/scaling;
10. dot shortcut on non-orthogonal basis;
11. near-dependent basis;
12. residual interpreted before contract validation;
13. raw IMU specific force mislabeled;
14. signal basis reused under a changed sampling contract;
15. nonlinear feature called linearly dependent;
16. dictionary coefficients labeled unique;
17. embeddings compared across incompatible pipelines;
18. NaN, infinity or silent broadcasting accepted.

Every failure includes:
- observable symptom;
- root cause;
- diagnostic test;
- corrective action;
- required telemetry fields.

## Step 4 — Diagnostic protocol

The locked triage order is:
1. exact shape and finite values;
2. schema, units, frame and timestamp;
3. basis order and transform direction;
4. spanning, independence and orthonormality;
5. reconstruction and invariants;
6. numerical sensitivity;
7. domain-specific physical or AI semantics.

The learner must not use solver success, equal shape or small residual as sufficient evidence.

## Step 5 — Coverage verification

Coverage is complete against:
- all 10 misconception targets from PASS 03;
- mathematical edge cases from PASS 05;
- 18 engineering failures from PASS 06;
- all worked-case failures from PASS 07.

Core verification after patch:
- JSON opens and closes correctly;
- lesson ID, draft status and content contract are preserved;
- 10 learning outcomes, 16 notation rules, 9 concepts, 9 mechanisms and 12 formulas remain present;
- worked case remains `verified_pass_07`;
- `commonMisconceptions.status = verified_pass_08`;
- `failureModeAtlas.status = verified_pass_08`;
- 20 misconceptions and 18 failure modes are present;
- mastery checks and implementation contract remain provisional for PASS 09;
- `qualityGate.nextPass = PASS_09_ASSESSMENT_AND_IMPLEMENTATION_CONTRACT`;
- no manifest, lecture-content, UI or runtime file was changed;
- no browser smoke test is claimed because this is a content-only diagnostic pass.

## PASS 08 verdict
PASS.

## Next task
PASS 09/14 — Assessment and implementation contract, consisting of 5 steps:
1. build the complete assessment blueprint and map it to all learning outcomes;
2. write diagnostic, formative and summative mastery checks with answer evidence;
3. define scoring, critical-failure and progression rules;
4. finalize implementation capabilities, telemetry, tolerance and solver-mode contracts;
5. perform final core acceptance, change status from draft to approved if all gates pass, then register C01-L04 in the core manifest.

PASS 09 is the final core-content pass. It may approve the core and update the manifest only after all acceptance gates are verified.

## Relevant commits
- C01-L04 pass 01 scope lock: `5e88b37255f10af7dfbd4ec604598811d8b17409`
- C01-L04 pass 02 academic map: `156aba3b67d58d93ea127fca011b9f905fc7d3e1`
- C01-L04 pass 03 pedagogical spine: `a1a3a3a82014be9bde16c426e4fd4b45fec776c0`
- C01-L04 core draft: `6952d0904c073ea8ffb6376a0422784b38ce0881`
- C01-L04 pass 04 state: `52f9783ce20804e8beac5d7a00dfe6cf1bfd4da9`
- C01-L04 pass 05 mathematics review: `b96273479921523d71d365da5b68547ede356059`
- C01-L04 pass 06 engineering review: `7069861896b06ada6675a7892100b20235917f3f`
- C01-L04 pass 07 worked case: `61b726d486b2bc5060b8422351eb8239c8e02eb3`
- C01-L04 pass 07 state: `d521433f544443554d125ca50cca7b91cfde79fa`
- C01-L04 pass 08 diagnostics: `810c393d8263135f4c9e342b6bde91ff21008ac5`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
