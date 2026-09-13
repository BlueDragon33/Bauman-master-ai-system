# CODEX_STATE

Current task: `THEORY_C01_L06_ACADEMIC_ACCEPTANCE_PASS_14`

Status: `PASS_13_SLIDESHOW_RUNTIME_IMPORT_COMPLETE`

Date: 2026-09-13
Branch: `main`

## Execution policy
- Prefer direct high-reasoning work with narrow GitHub reads and patches.
- Do not scan the full repository without a concrete need.
- Academic acceptance must finish before any durable runtime merge.

## Protected constraints
- Minimum 16 slides, no maximum.
- Do not remove, merge or compress accepted learning beats merely to hit a slide count.
- Preserve one source slide to one runtime slide.
- Do not create a new slideshow engine.
- Keep E235 unchanged.
- Keep E236, E237 and E238 disabled.

## Accepted prior lessons
- §1.4: academic `14/14`, runtime `6/6`, browser accepted, `22/22` slides.
- §1.5: academic `14/14`, runtime `5/5`, browser accepted, `22/22` slides.

## §1.6 · Từ vector sang ma trận dữ liệu

Lesson ID:
`MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140`

Academic progress:
- complete: `13/14`;
- remaining: `1/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Baseline durable record index `5/18`, current runtime baseline `16` slides.

### Pass 2 · Learning contract
- `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- `LO1–LO9`; canonical `X in R^(m x n)`, observations as rows, features as columns.
- Fixed case: `UGV_TELEMETRY_8X6`.

### Pass 3 · Source map and terminology
- `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- Claims `C01–C24`; terminology `T01–T40`.

### Pass 4 · Formula registry
- `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- `F01–F18`; CORE/API_EQUIVALENT/PREVIEW/FORBIDDEN_SHORTCUT classes locked.

### Pass 5 · Engineering case
- `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case/version: `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED`.
- Shape `8 x 6`; rows are observations.
- Features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- IDs: `UGV-W01–UGV-W08`; timestamps locked at 250 ms intervals.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Locked extraction: `X_raw[2,4]=0.08 rad/s`, UGV-W03 yaw_rate.

### Pass 6 · Misconception map
- `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- `M01–M18` cover orientation, 1D transpose, compatibility, metadata, preprocessing, Gram/covariance, rank/PCA and diagnosis overclaims.

### Pass 7 · Core content
- `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Learning beats: `22`; embedded retrieval checks: `12`.

### Pass 8 · Worked examples and derivations
- `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`.
- Artifact: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`.
- Version: `WORKED_EXAMPLES_C01_L06_V1_PASS08`.
- Worked examples: `15`.

### Pass 9 · Deterministic computational lab
- `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`.
- Artifact: `subjects/math/data/theory_lab/theory_lab_c01_l06.json`.
- Version: `LAB_C01_L06_V1_PASS09`.
- Lab stages: `8`; broken-code audits: `6`.

### Pass 10 · Retrieval, Professor Q&A and mastery
- `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`.
- Artifact: `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`.
- Version: `ASSESSMENT_C01_L06_V1_PASS10`.
- Retrieval checks: `16`; professor questions: `10`; mastery gates: `5`; minimum mastery `80%`.

### Pass 11 · Reference artifact
- `PASS_11_REFERENCE_ARTIFACT_COMPLETE`.
- Artifact: `subjects/math/data/theory_reference/theory_reference_c01_l06.json`.
- Version: `REFERENCE_C01_L06_V1_PASS11`.
- Eight reference sections; `F01–F18`, `T01–T40`, `M01–M18` covered.

### Pass 12 · Full View + Normalization
- `PASS_12_FULL_VIEW_NORMALIZATION_COMPLETE`.
- Full View: `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`, version `FULL_VIEW_C01_L06_V1_PASS12`, `12` coherent reading sections.
- Normalization: `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`, version `NORMALIZATION_C01_L06_V1_PASS12`.
- Semantic conflicts: `0`; case-value conflicts: `0`.

### Pass 13 · Slideshow + runtime-import candidate
- Status: `PASS_13_SLIDESHOW_RUNTIME_IMPORT_COMPLETE`.
- Slideshow: `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json`.
- Slideshow version: `SLIDESHOW_C01_L06_V1_PASS13`.
- Import candidate: `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`.
- Import version: `C01_L06_E129_IMPORT_V1_22_SLIDES_CANDIDATE`.
- Source slides: `22` (`SL01–SL22`).
- Runtime-import slides: `22` (`MATH-VN-C01-L06-S01–S22`).
- Mapping: one source slide to exactly one runtime-import slide.
- Compression: `false`.
- Minimum slide policy: `16`; actual: `22`; no maximum.
- Traceability: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`, `T01–T40` preserved.
- Deferred boundaries preserved: no scale vector, numerical-rank tolerance/rank, SVD singular values, PCA components, retained dimension, anomaly threshold, physical mode count or fault diagnosis invented.
- `runtimeMergeAllowed: false`.
- `mergeBlockedUntil: PASS_14_ACADEMIC_ACCEPTANCE`.
- Durable runtime files modified: `false`.

## Current task requirements

`THEORY_C01_L06_ACADEMIC_ACCEPTANCE_PASS_14`

Pass 14 must:
- perform final academic cross-check across Pass 1–13 artifacts;
- create `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json`;
- use schema `bauman_math_academic_acceptance_v1` and version `ACADEMIC_ACCEPTANCE_C01_L06_V1`;
- confirm `14/14` academic passes only if every required artifact and trace is consistent;
- verify lesson ID/title consistency across package;
- verify `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`, `T01–T40` coverage;
- verify `CASE_C01_L06_V1_LOCKED` values/schema/order/units/IDs/timestamps are unchanged;
- verify source/runtime-import slide counts are `22/22`, IDs unique, one-to-one, compression `false`;
- verify deferred scale/rank/SVD/PCA/diagnosis results remain uninvented;
- approve or reject the import candidate without performing a durable runtime merge;
- keep E235 unchanged and E236/E237/E238 disabled;
- if PASS, advance to `THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`.

## Historical maintenance lock
- `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD` remains accepted.
- Reader Pro extension-panel/fit and E242 richness maintenance remain untouched.
- E235 unchanged; E236/E237/E238 disabled.
