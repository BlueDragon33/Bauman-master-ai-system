# CODEX_STATE

Current task: `THEORY_C01_L06_REFERENCE_ARTIFACT_PASS_11`

Status: `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`

Date: 2026-09-12
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it materially improves a deep multi-file refactor, broad dependency analysis or unavailable complex automation.
- If Codex is required, create one new session for one narrow task.
- Never continue an old Codex session.
- Do not scan the full repository without a concrete need.

## Protected constraints
- Minimum 16 slides, with no maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Preserve one source slide to one runtime slide.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## §1.4 accepted baseline
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140`.
- Academic workflow: `14/14` complete.
- Runtime workflow: `6/6` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.

## §1.5 accepted package
- Lesson ID: `MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140`.
- Academic passes: `14/14`.
- Runtime passes: `5/5`.
- Source/runtime slides: `22/22`, compression `false`.
- Browser QA: `PASS_CURRENT_HEAD`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`.
- E235 preserved; E236/E237/E238 disabled.

## §1.6 academic workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Lesson title:
`§1.6 · Từ vector sang ma trận dữ liệu`

Progress:
- academic passes complete: `10/14`;
- academic passes remaining: `4/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files: `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.md`, `subjects/math/THEORY_C01_L06_BASELINE_AUDIT.json`.
- Durable record: index `5` of `18`; runtime baseline has `16` slides.
- Runtime unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisites `P1–P4`; outcomes `LO1–LO9`.
- Canonical convention: `X in R^(m x n)`, observations as rows, features as columns.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Raw, centred and scaled matrices use distinct notation.
- Gram, covariance, rank, SVD and PCA remain assumption-gated or deferred.
- Runtime unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Source anchors `S1–S12`; claims `C01–C24`; terminology `T01–T40`.
- Ownership layers and legacy-slide disposition locked.
- Runtime unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs: `F01–F18`.
- Core: assembly, indexing/slicing, transpose conversion, linear score, mean and centering.
- API equivalents: F08/F09; F07 is the 1D-transpose forbidden shortcut.
- Gram, scaling, covariance, feature transform and rank are preview/assumption scoped.
- SVD and PCA remain deferred.
- Runtime unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`.
- Version: `CASE_C01_L06_V1_LOCKED`.
- Shape `8 x 6`, observations as rows; IDs `UGV-W01–UGV-W08`; timestamps increase by 250 ms.
- Ordered schema, units, version and checksum locked.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Four negative variants: swapped columns, stale unit, wrong orientation, schema-version mismatch.
- Scale vector, fault threshold, PCA result and physical mode count remain unlocked/prohibited.
- Runtime unchanged.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions: `M01–M18`.
- Orientation, 1D transpose, stacking, schema, units, slicing and preprocessing failures locked.
- Covariance, rank, PCA and fault-diagnosis overclaims blocked.
- Runtime unchanged.

### Pass 7 · Core content
- Status: `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Commit: `ec281b90883ca8edad77b688492c7bcf59525121`.
- Learning beats: `22`; embedded retrieval checks: `12`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` complete/reachable.
- Locked UGV values/metadata preserved; no scale/rank/SVD/PCA/diagnostic result invented.
- Runtime files modified: `false`.

### Pass 8 · Worked examples and derivations
- Status: `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`.
- Artifact: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`.
- Version: `WORKED_EXAMPLES_C01_L06_V1_PASS08`.
- Commit: `f46521e74b71eb34304510c99713f1f1191ccc1a`.
- Worked examples: `15`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` complete.
- Includes compatibility rejection, assembly, extraction/slicing, convention translation, NumPy 1D trap, Gram-vs-covariance, locked centering and downstream boundaries.
- No scale vector, numerical rank, PCA component, retained dimension or fault conclusion fabricated.
- Runtime files modified: `false`.

### Pass 9 · Deterministic computational lab
- Status: `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`.
- Artifact: `subjects/math/data/theory_lab/theory_lab_c01_l06.json`.
- Version: `LAB_C01_L06_V1_PASS09`.
- Commit: `302cafdf5519b59c64fbdb00889189f561807694`.
- Lab stages: `8`; broken-code audits: `6`.
- Canonical NumPy code is deterministic, network-free and file-input-free.
- Assertions cover shape, extraction, transpose, 1D transpose behavior, locked mean/centering, zero-mean invariant, Gram shapes and rank upper bound `6`.
- Runtime files modified: `false`.

### Pass 10 · Retrieval, Professor Q&A and mastery gates
- Status: `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`.
- Artifact: `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`.
- Version: `ASSESSMENT_C01_L06_V1_PASS10`.
- Commit: `8fb6d3895e093b2e27224211f436eed1da481755`.
- Retrieval checks: `16`; professor questions: `10`; mastery gates: `5`.
- Minimum mastery: `80%`; all critical items are mandatory.
- Answers are initially hidden and require evidence before reveal.
- Critical coverage includes equal-shape semantic mismatch, locked extraction, NumPy 1D transpose, centering, Gram-vs-covariance, preprocessing reuse, rank boundary, PCA boundary and diagnosis overclaim.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18` complete.
- Locked case values preserved; no scale vector, numerical-rank tolerance, PCA result, retained dimension, threshold or fault label invented.
- Runtime files modified: `false`.

## Current task requirements

`THEORY_C01_L06_REFERENCE_ARTIFACT_PASS_11`

Pass 11 must:
- create `subjects/math/data/theory_reference/theory_reference_c01_l06.json`;
- use schema `bauman_math_theory_reference_v1` and version `REFERENCE_C01_L06_V1_PASS11`;
- be a compact lesson-scoped lookup artifact derived only from accepted Pass 1–10 contracts;
- add no new mathematics, numerical policy, scale vector, rank tolerance, PCA result, threshold or fault label;
- provide quick lookup for canonical matrix contract/orientation, notation, `F01–F18`, extraction/slicing + metadata, NumPy/API conventions, preprocessing/centering boundaries, locked UGV case, `M01–M18`, trilingual terminology and interpretation limits;
- preserve `CASE_C01_L06_V1_LOCKED` values, feature order, units, IDs and timestamps exactly;
- distinguish raw/centred/scaled matrices and Gram/covariance objects explicitly;
- include allowed/prohibited engineering claims;
- modify no runtime file;
- finish with `PASS_11_REFERENCE_ARTIFACT_COMPLETE` and advance to `THEORY_C01_L06_FULL_VIEW_NORMALIZATION_PASS_12`.

## Maintenance patch · E215 Reader Pro extension panel and fit rules
Historical accepted maintenance state:
- status: `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD`;
- Reader Pro panel is `Nội dung mở rộng`, de-duplicates lower-card summaries and preserves internal scrolling/responsive visibility;
- relation-operator sanitization and E242 semantic diagrams remain accepted;
- Chromium smoke passed at `1280 x 720` and `900 x 720`;
- console/page/local HTTP errors: `0`;
- E235 remained unchanged and E236/E237/E238 remained disabled.
