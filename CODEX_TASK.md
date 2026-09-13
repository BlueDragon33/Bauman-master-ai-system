# CODEX_TASK

Task: `THEORY_C01_L06_ACADEMIC_ACCEPTANCE_PASS_14`
Mode: final-academic-cross-check-only, no durable runtime merge.

## Read only what is needed
1. `CODEX_STATE.md`
2. `subjects/math/THEORY_C01_L06_LEARNING_CONTRACT.md`
3. `subjects/math/THEORY_C01_L06_SOURCE_MAP_TERMINOLOGY.md`
4. `subjects/math/THEORY_C01_L06_FORMULA_REGISTRY.md`
5. `subjects/math/THEORY_C01_L06_MISCONCEPTION_MAP.md`
6. `subjects/math/data/theory_case/theory_case_c01_l06.json`
7. `subjects/math/THEORY_C01_L06_CASE_VALIDATION.json`
8. `subjects/math/data/theory_core/theory_core_c01_l06.json`
9. `subjects/math/data/theory_worked_examples/theory_worked_examples_c01_l06.json`
10. `subjects/math/data/theory_lab/theory_lab_c01_l06.json`
11. `subjects/math/data/theory_assessment/theory_assessment_c01_l06.json`
12. `subjects/math/data/theory_reference/theory_reference_c01_l06.json`
13. `subjects/math/data/theory_full_view/theory_full_view_c01_l06.json`
14. `subjects/math/data/theory_normalization/theory_normalization_c01_l06.json`
15. `subjects/math/data/theory_slideshow/theory_slideshow_c01_l06.json`
16. `subjects/math/data/theory_integration/theory_lecture_content_c01_l06_import.json`
17. `subjects/math/THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json` only as structural precedent.

## Goal
Create `subjects/math/THEORY_C01_L06_ACADEMIC_ACCEPTANCE.json` with:
- schema: `bauman_math_academic_acceptance_v1`;
- version: `ACADEMIC_ACCEPTANCE_C01_L06_V1`;
- final academic status `PASS` only if every acceptance condition below is satisfied.

## Required cross-checks
- Lesson ID and lesson title are identical across all §1.6 academic artifacts.
- Academic passes 1–13 have their expected artifacts and locked versions.
- `LO1–LO9` are covered by core, examples, lab and assessment.
- `C01–C24`, `F01–F18`, `M01–M18`, `T01–T40` remain traceable through the package.
- Formula status classes remain intact: CORE, API_EQUIVALENT, PREVIEW, FORBIDDEN_SHORTCUT.
- Canonical convention remains `X in R^(m x n)` with observations as rows and ordered features as columns.
- Row-observation and column-observation conventions remain distinct.
- Mathematical vector orientation remains distinct from NumPy 1D array shape behavior.
- Raw, centred and scaled matrices remain distinct.
- Feature Gram, observation Gram and sample covariance remain distinct.
- Centering, scaling, standardization and vector normalization remain distinct.
- Algebraic rank bound remains distinct from numerical rank, retained dimension and physical mode count.

## Locked case checks
Verify exactly:
- case/version: `UGV_TELEMETRY_8X6` / `CASE_C01_L06_V1_LOCKED`;
- shape: `8 x 6`, observations as rows;
- feature order: `omega_left`, `omega_right`, `a_long`, `a_lat`, `yaw_rate`, `battery_current`;
- units: `rad/s`, `rad/s`, `m/s^2`, `m/s^2`, `rad/s`, `A`;
- observation IDs: `UGV-W01–UGV-W08`;
- timestamp sequence remains 250 ms from `2026-07-09T10:00:00.000Z` through `2026-07-09T10:00:01.750Z`;
- mean: `(8.5, 8.55, 0.03125, 0.02375, 0.01, 12.1625)`;
- extraction: `X_raw[2,4]=0.08 rad/s`, UGV-W03 yaw_rate;
- locked raw/centred/covariance-preview values are not changed.

## Slide/import checks
- Slideshow version: `SLIDESHOW_C01_L06_V1_PASS13`.
- Import candidate version: `C01_L06_E129_IMPORT_V1_22_SLIDES_CANDIDATE`.
- Source slide count: `22`.
- Runtime-import slide count: `22`.
- Source IDs `SL01–SL22` are unique.
- Runtime IDs `MATH-VN-C01-L06-S01–S22` are unique.
- Mapping is exactly one source slide to one runtime-import slide.
- `compression: false`.
- Minimum slide threshold remains `16`, not a target ceiling.
- Import uses supported safe block types only.
- Semantic diagram specs remain source slideshow metadata and are not forced into unsupported runtime blocks.

## Deferred-boundary checks
Pass only if no artifact invents:
- a scale vector;
- numerical-rank tolerance or numerical rank;
- SVD singular values;
- PCA components;
- retained dimension or retained-energy selection rule;
- anomaly threshold;
- physical mode count;
- fault label or physical diagnosis.

## Runtime protection
During Pass 14 do not change:
- durable `theory_lecture_content` records;
- `subjects/math/index.html`;
- runtime readers;
- manifest;
- CSS or JavaScript;
- Reader Pro;
- E235.

Keep E236, E237 and E238 disabled.

## Acceptance artifact
The acceptance JSON must record:
- academic passes complete `14/14`;
- approved artifact paths and versions;
- slide counts `22/22`;
- compression `false`;
- locked case summary;
- explicit acceptance checks;
- import candidate approved or rejected;
- `durableMergePerformed: false`;
- `runtimeIntegrationStarted: false`;
- `runtimeFilesModified: false`.

## Final state
If all checks pass:
- status: `PASS`;
- final academic state: `ACADEMIC_14_OF_14_PASS_RUNTIME_NOT_STARTED`;
- next task: `THEORY_C01_L06_DURABLE_MERGE_RUNTIME_PASS_15`.

If any check fails:
- do not mark Pass 14 complete;
- record the exact blocking artifact/field;
- do not start runtime integration.
