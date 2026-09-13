# CODEX_STATE

Current task: `THEORY_C01_L06_SLIDESHOW_RUNTIME_IMPORT_PASS_13`

Status: `PASS_12_FULL_VIEW_NORMALIZATION_COMPLETE`

Date: 2026-09-13
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
- academic passes complete: `12/14`;
- academic passes remaining: `2/14`;
- runtime integration: not started;
- durable runtime content: unchanged baseline;
- browser QA: not applicable before runtime integration.

### Pass 1 · Baseline audit
- `PASS_01_BASELINE_AUDIT_COMPLETE`.
- Files: `THEORY_C01_L06_BASELINE_AUDIT.md/.json`.
- Durable baseline: index `5/18`, `16` runtime slides.

### Pass 2 · Learning contract
- `PASS_02_LEARNING_CONTRACT_COMPLETE`.
- File: `THEORY_C01_L06_LEARNING_CONTRACT.md`.
- Prerequisite gates `P1–P4`; outcomes `LO1–LO9`; canonical row-observation convention locked.

### Pass 3 · Source map and terminology
- `PASS_03_SOURCE_MAP_TERMINOLOGY_COMPLETE`.
- File: `THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`.
- Source anchors `S1–S12`; claims `C01–C24`; terminology `T01–T40`.

### Pass 4 · Formula registry
- `PASS_04_FORMULA_REGISTRY_COMPLETE`.
- File: `THEORY_C01_L06_FORMULA_REGISTRY.md`.
- Formula IDs `F01–F18`; CORE/API/PREVIEW/FORBIDDEN_SHORTCUT classes locked.

### Pass 5 · Engineering case
- `PASS_05_ENGINEERING_CASE_VERIFIED`.
- Case: `subjects/math/data/theory_case/theory_case_c01_l06.json`.
- Validation: `THEORY_C01_L06_CASE_VALIDATION.json`.
- Version: `CASE_C01_L06_V1_LOCKED`; case: `UGV_TELEMETRY_8X6`.
- Shape `8 x 6`; observations as rows.
- Ordered features: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`.
- Units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`.
- IDs `UGV-W01–UGV-W08`; timestamps 250 ms apart.
- Mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`.
- Scale vector, numerical-rank tolerance, PCA result, retained dimension and physical diagnosis remain unlocked/prohibited.

### Pass 6 · Misconception map
- `PASS_06_MISCONCEPTION_MAP_COMPLETE`.
- File: `THEORY_C01_L06_MISCONCEPTION_MAP.md`.
- Misconceptions `M01–M18` cover orientation, 1D transpose, semantic compatibility, metadata, centering/scaling, Gram/covariance, rank/PCA and diagnosis overclaims.

### Pass 7 · Core content
- `PASS_07_CORE_CONTENT_COMPLETE`.
- Artifact: `subjects/math/data/theory_core/theory_core_c01_l06.json`.
- Version: `CORE_C01_L06_V1_PASS07_ARCHITECTURE`.
- Commit: `ec281b90883ca8edad77b688492c7bcf59525121`.
- Learning beats: `22`; embedded retrieval checks: `12`.
- Coverage: `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`.

### Pass 8 · Worked examples and derivations
- `PASS_08_WORKED_EXAMPLES_DERIVATIONS_COMPLETE`.
- Artifact: `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`.
- Version: `WORKED_EXAMPLES_C01_L06_V1_PASS08`.
- Commit: `f46521e74b71eb34304510c99713f1f1191ccc1a`.
- Worked examples: `15`; complete coverage of locked academic IDs.

### Pass 9 · Deterministic computational lab
- `PASS_09_DETERMINISTIC_COMPUTATIONAL_LAB_COMPLETE`.
- Artifact: `subjects/math/data/theory_lab/theory_lab_c01_l06.json`.
- Version: `LAB_C01_L06_V1_PASS09`.
- Commit: `302cafdf5519b59c64fbdb00889189f561807694`.
- Lab stages: `8`; broken-code audits: `6`; deterministic assertions passed.

### Pass 10 · Retrieval, Professor Q&A and mastery
- `PASS_10_RETRIEVAL_PROFESSOR_QA_COMPLETE`.
- Artifact: `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`.
- Version: `ASSESSMENT_C01_L06_V1_PASS10`.
- Commit: `8fb6d3895e093b2e27224211f436eed1da481755`.
- Retrieval checks: `16`; professor questions: `10`; mastery gates: `5`; minimum mastery `80%`; critical items mandatory.

### Pass 11 · Reference artifact
- `PASS_11_REFERENCE_ARTIFACT_COMPLETE`.
- Artifact: `subjects/math/data/theory_reference/theory_reference_c01_l06.json`.
- Version: `REFERENCE_C01_L06_V1_PASS11`.
- Commit: `fe387fb56f0863b25fe843144b31260e83f59fff`.
- Eight reference sections; F01–F18; T01–T40; M01–M18 troubleshooting.

### Pass 12 · Full View + Normalization
- Status: `PASS_12_FULL_VIEW_NORMALIZATION_COMPLETE`.
- Full View: `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`.
- Full View version: `FULL_VIEW_C01_L06_V1_PASS12`.
- Full View commit: `f59ab7fc2aebd1febfbc68ce7d40b0e47e7c58a9`.
- Reading sections: `12`; formula teaching cards: `F01–F18`.
- Complete reading flow covers contract, compatibility, assembly, extraction/slicing, convention translation, NumPy 1D `.T`, linear score, Gram objects, mean/centering, scaling/leakage, covariance/rank/PCA boundaries and locked UGV close.
- Full View can expand to at least `16` slides without compression.
- Normalization: `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`.
- Normalization version: `NORMALIZATION_C01_L06_V1_PASS12`.
- Normalization commit: `76946886ee7f193b694a2dfd3198ee3019c0b00f`.
- Semantic conflicts: `0`; case-value conflicts: `0`; formula/claim/misconception/terminology conflicts: `0`.
- Canonical overlay preserves row-vs-column convention, math vector vs NumPy 1D, raw/centred/scaled matrices, Gram-vs-covariance, preprocessing distinctions and rank-scope distinctions.
- Traceability preserved for `LO1–LO9`, `C01–C24`, `F01–F18`, `M01–M18`, `T01–T40`.
- Locked UGV feature order, units, IDs, timestamps, mean and `X_raw[2,4]=0.08 rad/s` preserved.
- No scale vector, numerical-rank tolerance, PCA result, retained dimension, threshold or fault label invented.
- Runtime files modified: `false`.

## Current task requirements

`THEORY_C01_L06_SLIDESHOW_RUNTIME_IMPORT_PASS_13`

Pass 13 must:
- create `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json` using schema `bauman_math_theory_slideshow_v1` and version `SLIDESHOW_C01_L06_V1_PASS13`;
- create a candidate import package at `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json` for target `theory_lecture_content`, mode `merge`;
- derive slides only from accepted Core, Reference, Full View, Normalization, Worked Examples, Assessment and `CASE_C01_L06_V1_LOCKED`;
- use at least `16` source slides, with no maximum and no compression; use more slides when needed to preserve learning beats;
- preserve one source slide to one runtime-import slide;
- give each slide a clear learning beat, core message, source trace and, where relevant, formula meaning/conditions, semantic diagram specification, misconception intercept or retrieval check;
- cover canonical data contract, compatibility gate, row-observation assembly, indexing/slicing with metadata, transpose/convention translation, NumPy 1D `.T`, Xw feature-order interface, feature/observation Gram distinction, mean/centering, scaling/leakage boundary, covariance assumptions, rank/SVD/PCA/diagnosis boundaries and the locked UGV case;
- preserve `F01–F18`, `C01–C24`, `M01–M18`, `T01–T40` traceability;
- preserve all locked UGV values, order, units, IDs and timestamps;
- keep scale vector, numerical-rank tolerance, PCA result, retained dimension and diagnosis deferred;
- produce import-safe text/formula/QA blocks only; semantic diagram specs remain source metadata and must not require a new slideshow engine;
- set `runtimeMergeAllowed: false` and block merge until Pass 14 academic acceptance;
- do not edit durable `theory_lecture_content`, `index.html`, readers, manifest, CSS, JS or E235;
- keep E236/E237/E238 disabled;
- finish with `PASS_13_SLIDESHOW_RUNTIME_IMPORT_COMPLETE` and advance only to Pass 14 academic acceptance.

## Historical maintenance lock
- `E215_BROWSER_SMOKE_ACCEPTED_CURRENT_HEAD` remains accepted.
- Reader Pro extension-panel/fit and E242 richness maintenance remains untouched.
- E235 unchanged; E236/E237/E238 disabled.
