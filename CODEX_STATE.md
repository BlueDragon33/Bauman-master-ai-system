# CODEX_STATE

Current task: `THEORY_CORE_C01_L04_PASS_09_ASSESSMENT_AND_IMPLEMENTATION_CONTRACT`

Status: `PASS_09_CORE_APPROVED_AND_MANIFEST_REGISTERED`

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
- Completed: 9/14 passes
- Remaining: 5/14 passes
- Completed steps: 46/73
- Remaining steps: 27/73

## Core architecture
- Approved core: `subjects/math/data/theory_core/theory_core_c01_l04.json`.
- Core version: `CORE_C01_L04_V1_APPROVED`.
- Core status: `approved_against_gold_standard`.
- Core quality gate: `content_review_approved`.
- Completed core passes: 1–9.
- Manifest: `subjects/math/data/theory_core/theory_core_manifest.json`.
- Manifest version: `CORE_MANIFEST_V1_4`.
- L04 manifest status: `approved_against_gold_standard`.
- `subjects/math/data/theory_lecture_content.json` remains unchanged.
- No UI/runtime or presentation file was modified during passes 1–9.

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

Locked:
`linear combination → span → independence → basis → coordinates → uniqueness → change of basis → exact/approximate representation`.

# PASS 03 — PEDAGOGICAL SPINE
Status: PASS.

Locked central thesis, 10 measurable outcomes, 9 learning phases, misconception interception, retrieval and mastery narrative.

# PASS 04 — CORE ACADEMIC CONTENT
Status: PASS.

Created the complete academic draft with:
- 10 learning outcomes;
- 16 notation rules;
- 9 concepts;
- 9 mechanisms;
- 12 formula contracts;
- comparison logic;
- 12 assumption gates;
- bridges and downstream mapping.

# PASS 05 — INDEPENDENT MATHEMATICS REVIEW
Status: PASS.

Verified definitions, formula domains, logical equivalences, edge cases, counterexamples, near dependence and scope boundaries.

# PASS 06 — ENGINEERING-MODEL REVIEW
Status: PASS WITH BINDING CONSTRAINTS.

Locked schema, units, coefficient meanings, frame direction, timestamps, route construction, UGV/control/IMU boundaries, signal/data/AI compatibility and telemetry.

# PASS 07 — COMPLETE WORKED CASE
Status: PASS.

Verified UGV case:
- `t=(0.6,0.8)`, `n=(-0.8,0.6)`;
- `[v]_W=(5,1)^T m/s`;
- `[v]_R=(3.8,-3.4)^T m/s`;
- exact reconstruction and norm preservation;
- order, sign, mixed-frame, transform-direction, non-unit and stale-basis tests;
- near-dependence contrast.

# PASS 08 — MISCONCEPTIONS AND FAILURE MODES
Status: PASS.

Added:
- 20 reviewed misconceptions in four classes;
- 18 operational failure modes;
- symptoms, root causes, diagnostics, corrections and telemetry;
- a seven-stage diagnostic protocol.

# C01-L04 PASS 09 — ASSESSMENT AND IMPLEMENTATION CONTRACT

## Step 1 — Assessment blueprint and outcome mapping

Completed a three-phase assessment system:
- diagnostic: 4 unscored prerequisite checks;
- formative: 8 items worth 40 points;
- summative: 6 items worth 60 points.

All LO1–LO10 have at least two evidence points through the assessment map.

The blueprint requires:
- calculation;
- condition checking;
- reconstruction;
- interpretation;
- engineering metadata;
- numerical-sensitivity reasoning;
- representation design and transfer.

## Step 2 — Diagnostic, formative and summative mastery checks

Diagnostic checks cover:
- vector versus coordinate tuple;
- linear-combination units;
- basis classification;
- orthonormal shortcut conditions.

Formative checks cover:
- linear combination and contribution meaning;
- span membership and missing direction;
- redundant-family classification;
- existence versus uniqueness;
- nonstandard basis coordinates;
- frame mismatch;
- orthogonal versus orthonormal methods;
- near-dependence reasoning.

Summative checks cover:
- the verified UGV worked case;
- basis/spanning family/dictionary comparison;
- world/route/body representation contract;
- stale-transform and order-mismatch diagnosis;
- signal and embedding compatibility;
- task-specific representation design.

Ten reusable mastery checks are also present from recall through create.

## Step 3 — Scoring, critical failures and progression

Scoring:
- formative: 40 points;
- summative: 60 points;
- total pass threshold: 80/100;
- minimum summative performance: 75%;
- minimum evidence coverage for each learning outcome: 70%.

Critical-failure override blocks mastery for:
- coordinates without a named basis or target space;
- redundant family called a basis or nonunique coefficients called unique;
- dot shortcut used without orthonormality;
- coordinate result without reconstruction;
- cross-frame/time comparison without transformation;
- reversed transform direction;
- point/vector confusion;
- nonlinear dependence mislabeled linear;
- incompatible embedding comparison;
- invalid numeric arrays or silent broadcasting.

Partial-credit ceilings and targeted remediation rules are explicit.

## Step 4 — Implementation contract

Approved API:
`analyze_linear_representation(B, v, mode, metadata, atol, rtol, rank_tol, condition_warning)`.

Approved modes:
- `orthonormal`;
- `basis_exact`;
- `analyze_family`;
- `approximate`;
- `auto`.

Core behavior:
- no silent flattening or broadcasting;
- exact shape and finite-value validation;
- metadata validation before physical interpretation;
- scale-aware numerical-rank tolerance;
- Gram-matrix orthonormality check;
- exact solve only for square full-rank basis;
- least-squares/family analysis explicitly labeled non-basis or approximate when applicable;
- reconstruction and residual checks;
- uniqueness derived from rank and column count, not solver success;
- condition estimate and sensitivity warning;
- explicit statuses and telemetry.

Metadata contracts exist for:
- general vectors and bases;
- robotics and coordinate frames;
- signals;
- AI embeddings.

Tolerance policy:
- floating-point equality is never exact;
- rank tolerance scales with matrix dimensions and norm;
- reconstruction uses logged `atol` and `rtol`;
- orthonormality uses the same tolerance contract;
- condition threshold is a sensitivity warning, not a definition of exact dependence.

## Step 5 — Final core acceptance and manifest registration

Reference implementation was executed against:
1. standard basis;
2. route orthonormal basis;
3. general non-orthogonal basis;
4. redundant family;
5. near-dependent basis;
6. NaN rejection.

Verified results:
- standard coefficients `(5,1)`;
- route coefficients `(3.8,-3.4)`;
- general-basis coefficients `(1,2)`;
- redundant family reports `unique=false`;
- near-dependent basis reports a sensitivity warning;
- NaN input is rejected;
- approximate/family output is never labeled exact basis coordinates.

Core acceptance:
- version changed to `CORE_C01_L04_V1_APPROVED`;
- status changed to `approved_against_gold_standard`;
- `approvalBlockedUntilPass09=false`;
- `qualityGate.reviewStatus=content_review_approved`;
- `qualityGate.nextPass=PASS_10_REFERENCE_TABLE`;
- acceptance record lists passes 1–9 complete.

Manifest acceptance:
- manifest version changed to `CORE_MANIFEST_V1_4`;
- C01-L04 record added;
- L04 status set to `approved_against_gold_standard`.

## PASS 09 verdict
PASS. CORE CONTENT PHASE COMPLETE.

No browser smoke test is claimed because passes 1–9 are content and contract work only.

## Next task
PASS 10/14 — `Tham khảo thêm` reference table, consisting of 4 steps:
1. derive the reference-table information architecture from the approved core;
2. select compact entries for concepts, formulas, conditions, failure modes and engineering use;
3. write source-traceable reference content without duplicating the full lesson;
4. verify completeness, consistency and downstream mapping against the approved core.

PASS 10 must derive only from the approved core. It may not change core meaning or add new mathematics.

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
- C01-L04 pass 08 state: `42ce4713ee97783dd3cb277aba1ebf05bc14d404`
- C01-L04 pass 09 core approval: `ba57f4c302200d30506cd586892dfb0deb170f51`
- C01-L04 manifest registration: `4bdb2e580557e0f712bceba389b2ec4facf4aadb`

## Persistent handoff
- `HANDOFF_THEORY_CORE.md`
