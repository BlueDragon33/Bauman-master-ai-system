# CODEX_STATE

Current task: `THEORY_C01_L06_FULL_VIEW_NORMALIZATION_PASS_12`

Status: `PASS_11_REFERENCE_ARTIFACT_COMPLETE`

Date: 2026-09-12
Branch: `main`

## Execution policy
- Prefer direct ChatGPT high-reasoning work with narrow GitHub reads and patches.
- Use Codex only when it materially improves a deep multi-file refactor, broad dependency analysis or unavailable complex automation.
- Never scan the full repository without a concrete need.

## Protected constraints
- Minimum 16 slides, with no maximum.
- Do not remove, merge or compress accepted slides merely to hit a count.
- Preserve one source slide to one runtime slide.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## Accepted prior lessons

### §1.4 · Cơ sở, span và tọa độ
- Academic workflow: `14/14` complete.
- Runtime workflow: `6/6` complete.
- Slides: `22/22`.
- Browser acceptance: `PASS`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_6_OF_6_BROWSER_ACCEPTED`.

### §1.5 · Không gian con và biểu diễn dữ liệu
- Academic workflow: `14/14` complete.
- Runtime workflow: `5/5` complete.
- Slides: `22/22`.
- Browser QA: `PASS_CURRENT_HEAD`.
- Final state: `ACADEMIC_14_OF_14_PASS_RUNTIME_5_OF_5_BROWSER_ACCEPTED`.
- Academic acceptance: `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json`.
- Runtime reports: `THEORY_C01_L05_RUNTIME_PASS15.json` through `PASS19.json`.

## §1.6 academic workflow

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Lesson title:
`§1.6 · Từ vector sang ma trận dữ liệu`

Progress:
- academic passes complete: `11/14`;
- academic passes remaining: `3/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- Status: `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files: `THEORY_C01_L06_BASELINE_AUDIT.md/.json`.
- Durable baseline: index `5/18`, `16` runtime slides.
- Runtime unchanged.

### Pass 2 · Learning contract
- Status: `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates `P1–P4`; outcomes `LO1–LO9`.
- Canonical convention: `X in R^(m x n)`, observations as rows, features as columns.
- Fixed case: `UGV_TELEMETRY_8X6`.
- Runtime unchanged.

### Pass 3 · Source map and terminology
- Status: `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Source anchors `S1–S12`; claims `C01–C24`; terminology `T01–T40`.
- Runtime unchanged.

### Pass 4 · Formula registry
- Status: `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs `F01–F18`.
- Core/API/preview/forbidden-shortcut classes locked.
- Runtime unchanged.

### Pass 5 · Engineering case
- Status: `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `THEORY_C01_L06_CASE_VALIDATION.json`.
- Version: `CASE_C01_L06_V1_LOCKED`.
- Shape `8 x 6`; IDs `UGV-W01–UGV-W08`; timestamps increase by 250 ms.
- Ordered features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- No scale vector, fault threshold, PCA result or physical mode count locked.
- Runtime unchanged.

### Pass 6 · Misconception map
- Status: `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions `M01–M18` cover orientation, 1D transpose, compatibility, metadata, centering/scaling, Gram/covariance, rank/PCA and diagnosis overclaims.
- Runtime unchanged.

### Pass 7 · Core content
- Status: `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Commit: `ec281b90883ca8edad77b688492c7bcf59525121`.
- Learning beats: `22`; embedded retrieval checks: `12`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`.
- Runtime files modified: `false`.

### Pass 8 · Worked examples and derivations
- Status: `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`.
- Artifact: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`.
- Version: `WORKED_EXAMPLES_C01_L06_V1_PASS08`.
- Commit: `f46521e74b71eb34304510c99713f1f1191ccc1a`.
- Worked examples: `15`.
- Coverage complete for `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`.
- Runtime files modified: `false`.

### Pass 9 · Deterministic computational lab
- Status: `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`.
- Artifact: `subjects/math/data/theory_lab/theory_lab_c01_l06.json`.
- Version: `LAB_C01_L06_V1_PASS09`.
- Commit: `302cafdf5519b59c64fbdb00889189f561807694`.
- Lab stages: `8`; broken-code audits: `6`.
- Deterministic NumPy assertions passed for shape, locked extractions, transpose, centering, Gram objects, variance and rank bound.
- Runtime files modified: `false`.

### Pass 10 · Retrieval, Professor Q&A and mastery
- Status: `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`.
- Artifact: `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`.
- Version: `ASSESSMENT_C01_L06_V1_PASS10`.
- Commit: `8fb6d3895e093b2e27224211f436eed1da481755`.
- Retrieval checks: `16`; professor questions: `10`; mastery gates: `5`.
- Minimum mastery: `80%`; every critical item mandatory.
- Coverage complete for `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`.
- Runtime files modified: `false`.

### Pass 11 · Reference artifact
- Status: `PASS_11_REFERENCE_ARTIFACT_COMPLETE`.
- Artifact: `subjects/math/data/theory_reference/theory_reference_c01_l06.json`.
- Version: `REFERENCE_C01_L06_V1_PASS11`.
- Commit: `fe387fb56f0863b25fe843144b31260e83f59fff`.
- Eight compact reference sections are present.
- Formula lookup: `F01–F18` (`18`).
- Terminology lookup: `T01–T40` (`40`).
- Troubleshooting coverage: `M01–M18`.
- Locked case schema, units, IDs, timestamps, mean and `X_raw[2,4]=0.08 rad/s` preserved.
- Raw/centred/scaled matrices, feature/observation Gram and covariance are kept distinct.
- No scale vector, numerical-rank tolerance, PCA result, retained dimension, threshold or fault label invented.
- Runtime files modified: `false`.

## Current task requirements

`THEORY_C01_L06_FULL_VIEW_NORMALIZATION_PASS_12`

Pass 12 must:
- create `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json` with schema `bauman_math_theory_full_view_v1` and version `FULL_VIEW_C01_L06_V1_PASS12`;
- create `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json` with schema `bauman_math_theory_normalization_v1` and version `NORMALIZATION_C01_L06_V1_PASS12`;
- build a complete reading flow from accepted Core, Reference, Worked Examples, Assessment and locked UGV case without adding new mathematics;
- keep content presentation-data-only and runtime-independent;
- normalize notation/display variants while preserving row-vs-column observation, math row/column vectors vs NumPy 1D arrays, raw/centred/scaled matrices, Gram-vs-covariance, centering-vs-scaling and algebraic-rank-bound vs numerical/physical interpretation;
- preserve all locked UGV values, schema, order, units, IDs and timestamps;
- preserve `F01–F18`, `C01–C24`, `M01–M18`, `T01–T40` traceability;
- keep formulas accompanied by meaning, conditions, shape and misuse warning;
- keep scale choice, numerical-rank tolerance, SVD/PCA result, retained dimension and physical diagnosis deferred;
- add no CSS, JavaScript, runtime wiring or Reader Pro changes;
- keep E235 unchanged and E236/E237/E238 disabled;
- finish with Pass 12 complete and advance only to slideshow/runtime-import preparation Pass 13.

## Historical maintenance lock
- `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD` remains accepted.
- Reader Pro extension-panel/fit and E242 richness maintenance remains untouched.
- E235 unchanged; E236/E237/E238 disabled.
